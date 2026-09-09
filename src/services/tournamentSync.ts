import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { TournamentData } from '../types';

export const TOURNAMENT_DOC_ID = 'kdtoernooi_live';

export type SyncState = 'connecting' | 'synced' | 'saving' | 'offline' | 'error';

/**
 * Listens for realtime updates from Firestore across all devices.
 */
export function subscribeToTournament(
  onUpdate: (data: TournamentData) => void,
  onInitNeeded: () => void,
  onStatusChange?: (status: SyncState) => void
): () => void {
  onStatusChange?.('connecting');
  const docRef = doc(db, 'tournaments', TOURNAMENT_DOC_ID);

  const unsubscribe = onSnapshot(
    docRef,
    (snapshot) => {
      onStatusChange?.('synced');
      if (snapshot.exists()) {
        const data = snapshot.data() as TournamentData;
        if (data && Array.isArray(data.teams) && Array.isArray(data.matches)) {
          onUpdate(data);
        }
      } else {
        // Document does not exist yet on cloud, signal initialization
        onInitNeeded();
      }
    },
    (error) => {
      onStatusChange?.('error');
      handleFirestoreError(error, OperationType.GET, `tournaments/${TOURNAMENT_DOC_ID}`);
    }
  );

  return unsubscribe;
}

/**
 * Pushes updated tournament state (matches, scores, teams) to Firestore so all devices update instantly.
 */
export async function pushTournamentToFirestore(
  tournament: TournamentData,
  onStatusChange?: (status: SyncState) => void
): Promise<void> {
  onStatusChange?.('saving');
  const docRef = doc(db, 'tournaments', TOURNAMENT_DOC_ID);
  try {
    const payload = {
      id: TOURNAMENT_DOC_ID,
      ...tournament,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(docRef, payload);
    onStatusChange?.('synced');
  } catch (error) {
    onStatusChange?.('error');
    handleFirestoreError(error, OperationType.WRITE, `tournaments/${TOURNAMENT_DOC_ID}`);
  }
}
