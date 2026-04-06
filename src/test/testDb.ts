import Dexie from 'dexie';
import type { ITurn, IReservation, IUser } from '@/types';

export class TestDB extends Dexie {
  turns!: Dexie.Table<ITurn, string>;
  reservations!: Dexie.Table<IReservation, string>;
  users!: Dexie.Table<IUser, string>;

  constructor() {
    super('test-servicentro');
    this.version(1).stores({
      turns: 'id, date, status',
      reservations: 'id, turnId, idCard, status',
      users: 'id, email',
    });
  }
}

export const testDb = new TestDB();

export async function clearTestDB(): Promise<void> {
  await testDb.turns.clear();
  await testDb.reservations.clear();
  await testDb.users.clear();
}

export async function closeTestDB(): Promise<void> {
  await testDb.delete();
}