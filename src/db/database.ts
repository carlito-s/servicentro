import Dexie, { type Table } from 'dexie';
import type { ITurn, IReservation, IUser } from '@/types';

export class ServicentroDB extends Dexie {
  turns!: Table<ITurn, string>;
  reservations!: Table<IReservation, string>;
  users!: Table<IUser, string>;

  constructor() {
    super('servicentro');
    this.version(1).stores({
      turns: 'id, date, status',
      reservations: 'id, turnId, idCard, status',
      users: 'id, email',
    });
  }
}

export const db = new ServicentroDB();