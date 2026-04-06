import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { clearTestDB, testDb } from './testDb';
import type { IReservation, ReservationStatus } from '@/types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function validateReservationData(data: { clientName: string; idCard: string; turnId: string }): string | null {
  if (!data.clientName.trim()) return 'El nombre es requerido';
  if (!data.idCard.trim()) return 'El carné es requerido';
  if (!data.turnId) return 'El turno es requerido';
  return null;
}

async function getReservationCount(turnId: string): Promise<number> {
  return testDb.reservations
    .where('turnId')
    .equals(turnId)
    .and(r => r.status !== 'cancelled')
    .count();
}

async function getAvailableCapacity(turnId: string, maxCapacity: number): Promise<number> {
  const count = await getReservationCount(turnId);
  return Math.max(0, maxCapacity - count);
}

async function addReservation(data: { turnId: string; clientName: string; idCard: string }): Promise<IReservation> {
  const validationError = validateReservationData(data);
  if (validationError) throw new Error(validationError);

  const turn = await testDb.turns.get(data.turnId);
  if (!turn) throw new Error('Turno no encontrado');
  if (turn.status !== 'active') throw new Error('El turno no está disponible');

  const available = await getAvailableCapacity(data.turnId, turn.maxCapacity);
  if (available <= 0) throw new Error('No hay cupos disponibles');

  const reservation: IReservation = {
    ...data,
    id: generateId(),
    status: 'pending',
    reservationDate: new Date().toISOString(),
  };

  await testDb.reservations.add(reservation);
  return reservation;
}

async function cancelReservation(id: string): Promise<void> {
  await testDb.reservations.update(id, { status: 'cancelled' as ReservationStatus });
}

async function dispatchReservation(id: string): Promise<void> {
  await testDb.reservations.update(id, { status: 'dispatched' as ReservationStatus });
}

describe('US-01: Business Logic - Reservation Capacity', () => {
  beforeEach(async () => {
    await clearTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  it('should calculate available capacity correctly', async () => {
    await testDb.turns.add({
      id: 'turn-1',
      date: '2025-01-15',
      startTime: '08:00',
      endTime: '10:00',
      maxCapacity: 10,
      status: 'active',
    });

    await testDb.reservations.bulkAdd([
      { id: 'r1', turnId: 'turn-1', clientName: 'A', idCard: '1', reservationDate: '2025-01-14T10:00:00Z', status: 'pending' },
      { id: 'r2', turnId: 'turn-1', clientName: 'B', idCard: '2', reservationDate: '2025-01-14T10:00:00Z', status: 'pending' },
      { id: 'r3', turnId: 'turn-1', clientName: 'C', idCard: '3', reservationDate: '2025-01-14T10:00:00Z', status: 'cancelled' },
    ]);

    const capacity = await getAvailableCapacity('turn-1', 10);
    expect(capacity).toBe(8);
  });

  it('should reject reservation when capacity is full', async () => {
    await testDb.turns.add({
      id: 'turn-1',
      date: '2025-01-15',
      startTime: '08:00',
      endTime: '10:00',
      maxCapacity: 2,
      status: 'active',
    });

    await testDb.reservations.bulkAdd([
      { id: 'r1', turnId: 'turn-1', clientName: 'A', idCard: '1', reservationDate: '2025-01-14T10:00:00Z', status: 'pending' },
      { id: 'r2', turnId: 'turn-1', clientName: 'B', idCard: '2', reservationDate: '2025-01-14T10:00:00Z', status: 'pending' },
    ]);

    await expect(addReservation({
      turnId: 'turn-1',
      clientName: 'C',
      idCard: '3',
    })).rejects.toThrow('No hay cupos disponibles');
  });

  it('should allow reservation when capacity available', async () => {
    await testDb.turns.add({
      id: 'turn-1',
      date: '2025-01-15',
      startTime: '08:00',
      endTime: '10:00',
      maxCapacity: 10,
      status: 'active',
    });

    const result = await addReservation({
      turnId: 'turn-1',
      clientName: 'Juan Pérez',
      idCard: '12345678901',
    });

    expect(result.status).toBe('pending');
    expect(result.clientName).toBe('Juan Pérez');
  });

  it('should reject reservation for non-existent turn', async () => {
    await expect(addReservation({
      turnId: 'non-existent',
      clientName: 'Test',
      idCard: '123',
    })).rejects.toThrow('Turno no encontrado');
  });

  it('should reject reservation for cancelled turn', async () => {
    await testDb.turns.add({
      id: 'turn-1',
      date: '2025-01-15',
      startTime: '08:00',
      endTime: '10:00',
      maxCapacity: 10,
      status: 'cancelled',
    });

    await expect(addReservation({
      turnId: 'turn-1',
      clientName: 'Test',
      idCard: '123',
    })).rejects.toThrow('El turno no está disponible');
  });

  it('should reject reservation for completed turn', async () => {
    await testDb.turns.add({
      id: 'turn-1',
      date: '2025-01-15',
      startTime: '08:00',
      endTime: '10:00',
      maxCapacity: 10,
      status: 'completed',
    });

    await expect(addReservation({
      turnId: 'turn-1',
      clientName: 'Test',
      idCard: '123',
    })).rejects.toThrow('El turno no está disponible');
  });

  it('should exclude cancelled reservations from capacity count', async () => {
    await testDb.turns.add({
      id: 'turn-1',
      date: '2025-01-15',
      startTime: '08:00',
      endTime: '10:00',
      maxCapacity: 2,
      status: 'active',
    });

    await testDb.reservations.bulkAdd([
      { id: 'r1', turnId: 'turn-1', clientName: 'A', idCard: '1', reservationDate: '2025-01-14T10:00:00Z', status: 'cancelled' },
      { id: 'r2', turnId: 'turn-1', clientName: 'B', idCard: '2', reservationDate: '2025-01-14T10:00:00Z', status: 'cancelled' },
    ]);

    const capacity = await getAvailableCapacity('turn-1', 2);
    expect(capacity).toBe(2);
  });
});

describe('US-01: Business Logic - Reservation Validation', () => {
  beforeEach(async () => {
    await clearTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  it('should reject reservation with empty client name', async () => {
    await testDb.turns.add({
      id: 'turn-1',
      date: '2025-01-15',
      startTime: '08:00',
      endTime: '10:00',
      maxCapacity: 10,
      status: 'active',
    });

    await expect(addReservation({
      turnId: 'turn-1',
      clientName: '',
      idCard: '123',
    })).rejects.toThrow('El nombre es requerido');
  });

  it('should reject reservation with empty idCard', async () => {
    await testDb.turns.add({
      id: 'turn-1',
      date: '2025-01-15',
      startTime: '08:00',
      endTime: '10:00',
      maxCapacity: 10,
      status: 'active',
    });

    await expect(addReservation({
      turnId: 'turn-1',
      clientName: 'Test',
      idCard: '',
    })).rejects.toThrow('El carné es requerido');
  });

  it('should reject reservation with whitespace-only name', async () => {
    await testDb.turns.add({
      id: 'turn-1',
      date: '2025-01-15',
      startTime: '08:00',
      endTime: '10:00',
      maxCapacity: 10,
      status: 'active',
    });

    await expect(addReservation({
      turnId: 'turn-1',
      clientName: '   ',
      idCard: '123',
    })).rejects.toThrow('El nombre es requerido');
  });
});

describe('US-04: Business Logic - Reservation Status Transitions', () => {
  beforeEach(async () => {
    await clearTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  it('should cancel reservation successfully', async () => {
    await testDb.reservations.add({
      id: 'res-1',
      turnId: 'turn-1',
      clientName: 'Test',
      idCard: '123',
      reservationDate: '2025-01-14T10:00:00Z',
      status: 'pending',
    });

    await cancelReservation('res-1');
    const cancelled = await testDb.reservations.get('res-1');

    expect(cancelled?.status).toBe('cancelled');
  });

  it('should dispatch reservation successfully', async () => {
    await testDb.reservations.add({
      id: 'res-1',
      turnId: 'turn-1',
      clientName: 'Test',
      idCard: '123',
      reservationDate: '2025-01-14T10:00:00Z',
      status: 'pending',
    });

    await dispatchReservation('res-1');
    const dispatched = await testDb.reservations.get('res-1');

    expect(dispatched?.status).toBe('dispatched');
  });

  it('should allow dispatch after cancelling then reactivating', async () => {
    await testDb.reservations.add({
      id: 'res-1',
      turnId: 'turn-1',
      clientName: 'Test',
      idCard: '123',
      reservationDate: '2025-01-14T10:00:00Z',
      status: 'pending',
    });

    await cancelReservation('res-1');
    await testDb.reservations.update('res-1', { status: 'pending' });
    await dispatchReservation('res-1');
    
    const dispatched = await testDb.reservations.get('res-1');
    expect(dispatched?.status).toBe('dispatched');
  });
});