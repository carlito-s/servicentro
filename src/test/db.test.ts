import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { testDb, clearTestDB } from './testDb';
import type { ITurn, IReservation, IUser } from '@/types';

describe('US-03: DB Layer - Turn Schema', () => {
  beforeEach(async () => {
    await clearTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  it('should create a turn with all required fields', async () => {
    const turn: ITurn = {
      id: 'turn-1',
      date: '2025-01-15',
      startTime: '08:00',
      endTime: '10:00',
      maxCapacity: 10,
      status: 'active',
    };

    await testDb.turns.add(turn);
    const stored = await testDb.turns.get('turn-1');

    expect(stored).toBeDefined();
    expect(stored?.id).toBe('turn-1');
    expect(stored?.date).toBe('2025-01-15');
    expect(stored?.startTime).toBe('08:00');
    expect(stored?.endTime).toBe('10:00');
    expect(stored?.maxCapacity).toBe(10);
    expect(stored?.status).toBe('active');
  });

  it('should query turns by date index', async () => {
    const turns: ITurn[] = [
      { id: 't1', date: '2025-01-15', startTime: '08:00', endTime: '10:00', maxCapacity: 10, status: 'active' },
      { id: 't2', date: '2025-01-15', startTime: '10:00', endTime: '12:00', maxCapacity: 10, status: 'active' },
      { id: 't3', date: '2025-01-16', startTime: '08:00', endTime: '10:00', maxCapacity: 10, status: 'active' },
    ];

    await testDb.turns.bulkAdd(turns);
    const jan15Turns = await testDb.turns.where('date').equals('2025-01-15').toArray();

    expect(jan15Turns).toHaveLength(2);
    expect(jan15Turns.map(t => t.id)).toContain('t1');
    expect(jan15Turns.map(t => t.id)).toContain('t2');
  });

  it('should query turns by status index', async () => {
    const turns: ITurn[] = [
      { id: 't1', date: '2025-01-15', startTime: '08:00', endTime: '10:00', maxCapacity: 10, status: 'active' },
      { id: 't2', date: '2025-01-15', startTime: '10:00', endTime: '12:00', maxCapacity: 10, status: 'cancelled' },
      { id: 't3', date: '2025-01-16', startTime: '08:00', endTime: '10:00', maxCapacity: 10, status: 'completed' },
    ];

    await testDb.turns.bulkAdd(turns);
    const activeTurns = await testDb.turns.where('status').equals('active').toArray();

    expect(activeTurns).toHaveLength(1);
    expect(activeTurns[0]?.id).toBe('t1');
  });
});

describe('US-03: DB Layer - Reservation Schema', () => {
  beforeEach(async () => {
    await clearTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  it('should create a reservation with all required fields', async () => {
    const reservation: IReservation = {
      id: 'res-1',
      turnId: 'turn-1',
      clientName: 'Juan Pérez',
      idCard: '12345678901',
      reservationDate: '2025-01-14T10:00:00.000Z',
      status: 'pending',
    };

    await testDb.reservations.add(reservation);
    const stored = await testDb.reservations.get('res-1');

    expect(stored).toBeDefined();
    expect(stored?.clientName).toBe('Juan Pérez');
    expect(stored?.idCard).toBe('12345678901');
    expect(stored?.turnId).toBe('turn-1');
    expect(stored?.status).toBe('pending');
  });

  it('should query reservations by turnId index', async () => {
    const reservations: IReservation[] = [
      { id: 'r1', turnId: 'turn-1', clientName: 'A', idCard: '1', reservationDate: '2025-01-14T10:00:00Z', status: 'pending' },
      { id: 'r2', turnId: 'turn-1', clientName: 'B', idCard: '2', reservationDate: '2025-01-14T10:00:00Z', status: 'pending' },
      { id: 'r3', turnId: 'turn-2', clientName: 'C', idCard: '3', reservationDate: '2025-01-14T10:00:00Z', status: 'pending' },
    ];

    await testDb.reservations.bulkAdd(reservations);
    const turn1Reservations = await testDb.reservations.where('turnId').equals('turn-1').toArray();

    expect(turn1Reservations).toHaveLength(2);
  });

  it('should exclude cancelled reservations from count query', async () => {
    const reservations: IReservation[] = [
      { id: 'r1', turnId: 'turn-1', clientName: 'A', idCard: '1', reservationDate: '2025-01-14T10:00:00Z', status: 'pending' },
      { id: 'r2', turnId: 'turn-1', clientName: 'B', idCard: '2', reservationDate: '2025-01-14T10:00:00Z', status: 'cancelled' },
      { id: 'r3', turnId: 'turn-1', clientName: 'C', idCard: '3', reservationDate: '2025-01-14T10:00:00Z', status: 'pending' },
    ];

    await testDb.reservations.bulkAdd(reservations);
    const activeReservations = await testDb.reservations
      .where('turnId')
      .equals('turn-1')
      .and(r => r.status !== 'cancelled')
      .toArray();

    expect(activeReservations).toHaveLength(2);
  });
});

describe('US-02: DB Layer - User Schema', () => {
  beforeEach(async () => {
    await clearTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  it('should create a user with email index', async () => {
    const user: IUser = {
      id: 'user-1',
      email: 'admin@servicentro.cu',
      password: 'hashed-password',
    };

    await testDb.users.add(user);
    const stored = await testDb.users.where('email').equals('admin@servicentro.cu').first();

    expect(stored).toBeDefined();
    expect(stored?.email).toBe('admin@servicentro.cu');
  });
});