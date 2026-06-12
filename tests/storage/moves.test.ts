import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllMoves, saveMove, deleteMoveById } from '@/storage/moves';
import { makeMove } from '../helpers/factories';

beforeEach(() => AsyncStorage.clear());

describe('getAllMoves', () => {
  it('returns empty array when storage contains no data', async () => {
    const result = await getAllMoves();

    expect(result).toEqual([]);
  });

  it('returns parsed moves when storage has saved data', async () => {
    const move = makeMove({ name: 'Saved Move' });
    await saveMove(move);

    const result = await getAllMoves();

    expect(result.find((m) => m.id === move.id)?.name).toBe('Saved Move');
  });

  it('adds motionData: null to legacy moves that were saved without that field', async () => {
    const legacyMove = makeMove();
    const { motionData: _omit, ...withoutMotionData } = legacyMove;
    await AsyncStorage.setItem('@moves', JSON.stringify([withoutMotionData]));

    const result = await getAllMoves();

    expect(result[0].motionData).toBeNull();
  });

  it('preserves existing motionData when it is already present', async () => {
    const move = makeMove({ motionData: { frames: [1, 2, 3] } as any });
    await saveMove(move);

    const result = await getAllMoves();

    expect(result.find((m) => m.id === move.id)?.motionData).toEqual({ frames: [1, 2, 3] });
  });
});

describe('saveMove', () => {
  it('inserts a new move when no move with that id exists yet', async () => {
    const move = makeMove();

    await saveMove(move);

    const result = await getAllMoves();
    expect(result.length).toBe(1);
  });

  it('updates an existing move without creating a duplicate when the same id is saved again', async () => {
    const move = makeMove({ name: 'Original' });
    await saveMove(move);

    await saveMove({ ...move, name: 'Updated' });

    const result = await getAllMoves();
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Updated');
  });
});

describe('deleteMoveById', () => {
  it('removes the move with the matching id', async () => {
    const move = makeMove();
    await saveMove(move);

    await deleteMoveById(move.id);

    const result = await getAllMoves();
    expect(result.find((m) => m.id === move.id)).toBeUndefined();
  });

  it('leaves all other moves intact after deletion', async () => {
    const keep1 = makeMove({ name: 'Keep 1' });
    const keep2 = makeMove({ name: 'Keep 2' });
    const remove = makeMove({ name: 'Remove Me' });
    await saveMove(keep1);
    await saveMove(keep2);
    await saveMove(remove);

    await deleteMoveById(remove.id);

    const result = await getAllMoves();
    expect(result.length).toBe(2);
  });

  it('does nothing when the given id does not exist', async () => {
    const move = makeMove();
    await saveMove(move);

    await deleteMoveById('non-existent-id');

    const result = await getAllMoves();
    expect(result.length).toBe(1);
  });
});

describe('write queue', () => {
  it('serializes concurrent saves so no write is lost', async () => {
    const moves = [makeMove(), makeMove(), makeMove(), makeMove(), makeMove()];

    await Promise.all(moves.map(saveMove));

    const result = await getAllMoves();
    expect(result.length).toBe(5);
  });
});
