import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { clearTestDB, testDb } from './testDb';

import type { ITurn, TurnStatus } from '@/types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function timesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  return start1 < end2 && end1 > start2;
}

function validateTurnData(turn: Omit<ITurn, 'id'>): string | null {
  if (!turn.date) return 'La fecha es requerida';
  if (!turn.startTime) return 'La hora de inicio es requerida';
  if (!turn.endTime) return 'La hora de fin es requerida';
  if (turn.startTime >= turn.endTime) return 'La hora de inicio debe ser menor que la de fin';
  if (turn.maxCapacity < 1) return 'La capacidad mínima es 1';
  if (turn.maxCapacity > 50) return 'La capacidad máxima es 50';
  return null;
}

async function checkOverlap(turn: ITurn, excludeId?: string): Promise<boolean> {
  const existingTurns = await testDb.turns
    .where('date')
    .equals(turn.date)
    .and(t => t.id !== excludeId && t.status !== 'cancelled')
    .toArray();
  
  return existingTurns.some(t => 
    timesOverlap(turn.startTime, turn.endTime, t.startTime, t.endTime)
  );
}

async function addTurn(data: Omit<ITurn, 'id'>): Promise<ITurn> {
  const validationError = validateTurnData(data);
  if (validationError) throw new Error(validationError);
  
  const turn: ITurn = {
    ...data,
    id: generateId(),
  };
  
  const hasOverlap = await checkOverlap(turn);
  if (hasOverlap) throw new Error('Ya existe un turno en ese horario para la misma fecha');
  
  await testDb.turns.add(turn);
  return turn;
}

async function updateTurn(id: string, data: Partial<ITurn>): Promise<void> {
  const existing = await testDb.turns.get(id);
  if (!existing) throw new Error('Turno no encontrado');
  
  const updated = { ...existing, ...data };
  
  if (data.startTime || data.endTime || data.date) {
    const validationError = validateTurnData(updated);
    if (validationError) throw new Error(validationError);
    
    const hasOverlap = await checkOverlap(updated, id);
    if (hasOverlap) throw new Error('Ya existe un turno en ese horario para la misma fecha');
  }
  
  await testDb.turns.update(id, updated);
}

async function cancelTurn(id: string): Promise<void> {
  await testDb.turns.update(id, { status: 'cancelled' as TurnStatus });
}

async function completeTurn(id: string): Promise<void> {
  await testDb.turns.update(id, { status: 'completed' as TurnStatus });
}

describe('US-03: Business Logic - Turn Overlap Validation', () => {
  beforeEach(async () => {
    await clearTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  it('should accept turn with no overlapping time slots', async () => {
    await testDb.turns.add({
      id: 'turn-1',
      date: '2025-01-15',
      startTime: '08:00',
      endTime: '10:00',
      maxCapacity: 10,
      status: 'active',
    });

    const newTurn: Omit<ITurn, 'id'> = {
      date: '2025-01-15',
      startTime: '10:00',
      endTime: '12:00',
      maxCapacity: 10,
      status: 'active',
    };

    const result = await addTurn(newTurn);
    expect(result.id).toBeDefined();
  });

  it('should reject turn with overlapping time on same date', async () => {
    await testDb.turns.add({
      id: 'turn-1',
      date: '2025-01-15',
      startTime: '08:00',
      endTime: '10:00',
      maxCapacity: 10,
      status: 'active',
    });

    const newTurn: Omit<ITurn, 'id'> = {
      date: '2025-01-15',
      startTime: '09:00',
      endTime: '11:00',
      maxCapacity: 10,
      status: 'active',
    };

    await expect(addTurn(newTurn)).rejects.toThrow('Ya existe un turno en ese horario para la misma fecha');
  });

  it('should reject turn fully contained within existing slot', async () => {
    await testDb.turns.add({
      id: 'turn-1',
      date: '2025-01-15',
      startTime: '08:00',
      endTime: '12:00',
      maxCapacity: 10,
      status: 'active',
    });

    const newTurn: Omit<ITurn, 'id'> = {
      date: '2025-01-15',
      startTime: '09:00',
      endTime: '11:00',
      maxCapacity: 10,
      status: 'active',
    };

    await expect(addTurn(newTurn)).rejects.toThrow('Ya existe un turno en ese horario para la misma fecha');
  });

  it('should allow turn on different date with same time', async () => {
    await testDb.turns.add({
      id: 'turn-1',
      date: '2025-01-15',
      startTime: '08:00',
      endTime: '10:00',
      maxCapacity: 10,
      status: 'active',
    });

    const newTurn: Omit<ITurn, 'id'> = {
      date: '2025-01-16',
      startTime: '08:00',
      endTime: '10:00',
      maxCapacity: 10,
      status: 'active',
    };

    const result = await addTurn(newTurn);
    expect(result.id).toBeDefined();
  });

  it('should not check overlap against cancelled turns', async () => {
    await testDb.turns.add({
      id: 'turn-1',
      date: '2025-01-15',
      startTime: '08:00',
      endTime: '10:00',
      maxCapacity: 10,
      status: 'cancelled',
    });

    const newTurn: Omit<ITurn, 'id'> = {
      date: '2025-01-15',
      startTime: '08:00',
      endTime: '10:00',
      maxCapacity: 10,
      status: 'active',
    };

    const result = await addTurn(newTurn);
    expect(result.id).toBeDefined();
  });
});

describe('US-03: Business Logic - Turn CRUD Operations', () => {
  beforeEach(async () => {
    await clearTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  it('should create turn with generated ID', async () => {
    const turnData: Omit<ITurn, 'id'> = {
      date: '2025-01-15',
      startTime: '08:00',
      endTime: '10:00',
      maxCapacity: 10,
      status: 'active',
    };

    const result = await addTurn(turnData);
    expect(result.id).toMatch(/^\d+-[a-z0-9]+$/);
  });

  it('should reject turn with missing date', async () => {
    const turnData = {
      startTime: '08:00',
      endTime: '10:00',
      maxCapacity: 10,
      status: 'active',
    } as Omit<ITurn, 'id'>;

    await expect(addTurn(turnData)).rejects.toThrow('La fecha es requerida');
  });

  it('should reject turn with start time >= end time', async () => {
    const turnData: Omit<ITurn, 'id'> = {
      date: '2025-01-15',
      startTime: '12:00',
      endTime: '10:00',
      maxCapacity: 10,
      status: 'active',
    };

    await expect(addTurn(turnData)).rejects.toThrow('La hora de inicio debe ser menor que la de fin');
  });

  it('should reject turn with capacity < 1', async () => {
    const turnData: Omit<ITurn, 'id'> = {
      date: '2025-01-15',
      startTime: '08:00',
      endTime: '10:00',
      maxCapacity: 0,
      status: 'active',
    };

    await expect(addTurn(turnData)).rejects.toThrow('La capacidad mínima es 1');
  });

  it('should reject turn with capacity > 50', async () => {
    const turnData: Omit<ITurn, 'id'> = {
      date: '2025-01-15',
      startTime: '08:00',
      endTime: '10:00',
      maxCapacity: 51,
      status: 'active',
    };

    await expect(addTurn(turnData)).rejects.toThrow('La capacidad máxima es 50');
  });

  it('should update turn successfully', async () => {
    await testDb.turns.add({
      id: 'turn-1',
      date: '2025-01-15',
      startTime: '08:00',
      endTime: '10:00',
      maxCapacity: 10,
      status: 'active',
    });

    await updateTurn('turn-1', { maxCapacity: 20 });
    const updated = await testDb.turns.get('turn-1');
    
    expect(updated?.maxCapacity).toBe(20);
  });

  it('should reject update that creates overlap', async () => {
    await testDb.turns.bulkAdd([
      { id: 't1', date: '2025-01-15', startTime: '08:00', endTime: '10:00', maxCapacity: 10, status: 'active' },
      { id: 't2', date: '2025-01-15', startTime: '10:00', endTime: '12:00', maxCapacity: 10, status: 'active' },
    ]);

    await expect(updateTurn('t2', { startTime: '09:00' })).rejects.toThrow('Ya existe un turno en ese horario para la misma fecha');
  });

  it('should cancel turn status', async () => {
    await testDb.turns.add({
      id: 'turn-1',
      date: '2025-01-15',
      startTime: '08:00',
      endTime: '10:00',
      maxCapacity: 10,
      status: 'active',
    });

    await cancelTurn('turn-1');
    const cancelled = await testDb.turns.get('turn-1');
    
    expect(cancelled?.status).toBe('cancelled');
  });

  it('should complete turn status', async () => {
    await testDb.turns.add({
      id: 'turn-1',
      date: '2025-01-15',
      startTime: '08:00',
      endTime: '10:00',
      maxCapacity: 10,
      status: 'active',
    });

    await completeTurn('turn-1');
    const completed = await testDb.turns.get('turn-1');
    
    expect(completed?.status).toBe('completed');
  });

  it('should throw error when updating non-existent turn', async () => {
    await expect(updateTurn('non-existent', { maxCapacity: 20 })).rejects.toThrow('Turno no encontrado');
  });
});