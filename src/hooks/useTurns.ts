import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/database'
import type { ITurn, TurnStatus } from '@/types'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

function timesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  return start1 < end2 && end1 > start2
}

function validateTurnData(turn: Omit<ITurn, 'id'>): string | null {
  if (!turn.date) return 'La fecha es requerida'
  if (!turn.startTime) return 'La hora de inicio es requerida'
  if (!turn.endTime) return 'La hora de fin es requerida'
  if (turn.startTime >= turn.endTime) return 'La hora de inicio debe ser menor que la de fin'
  if (turn.maxCapacity < 1) return 'La capacidad mínima es 1'
  if (turn.maxCapacity > 50) return 'La capacidad máxima es 50'
  
  // Validación de fecha no pasada
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const turnDate = new Date(turn.date)
  if (turnDate < today) return 'La fecha no puede ser pasada'
  
  // Validación de formato hora (HH:MM)
  if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(turn.startTime)) return 'Formato de hora de inicio inválido (HH:MM)'
  if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(turn.endTime)) return 'Formato de hora de fin inválido (HH:MM)'
  
  return null
}

export function useTurns() {
  const turns = useLiveQuery(() => db.turns.toArray(), [])
  
  async function checkOverlap(turn: ITurn, excludeId?: string): Promise<boolean> {
    const existingTurns = await db.turns
      .where('date')
      .equals(turn.date)
      .and(t => t.id !== excludeId && t.status !== 'cancelled')
      .toArray()
    
    return existingTurns.some(t => 
      timesOverlap(turn.startTime, turn.endTime, t.startTime, t.endTime)
    )
  }
  
  async function addTurn(data: Omit<ITurn, 'id'>): Promise<ITurn> {
    const validationError = validateTurnData(data)
    if (validationError) throw new Error(validationError)
    
    const turn: ITurn = {
      ...data,
      id: generateId(),
    }
    
    const hasOverlap = await checkOverlap(turn)
    if (hasOverlap) throw new Error('Ya existe un turno en ese horario para la misma fecha')
    
    await db.turns.add(turn)
    return turn
  }
  
  async function updateTurn(id: string, data: Partial<ITurn>): Promise<void> {
    const existing = await db.turns.get(id)
    if (!existing) throw new Error('Turno no encontrado')
    
    const updated = { ...existing, ...data }
    
    if (data.startTime || data.endTime || data.date) {
      const validationError = validateTurnData(updated)
      if (validationError) throw new Error(validationError)
      
      const hasOverlap = await checkOverlap(updated, id)
      if (hasOverlap) throw new Error('Ya existe un turno en ese horario para la misma fecha')
    }
    
    await db.turns.update(id, updated)
  }
  
  async function deleteTurn(id: string): Promise<void> {
    await db.turns.delete(id)
  }
  
  async function cancelTurn(id: string): Promise<void> {
    await db.turns.update(id, { status: 'cancelled' as TurnStatus })
  }
  
  async function completeTurn(id: string): Promise<void> {
    await db.turns.update(id, { status: 'completed' as TurnStatus })
  }
  
  async function getTurnById(id: string): Promise<ITurn | undefined> {
    return db.turns.get(id)
  }
  
  function getTurnsByDate(date: string): ITurn[] {
    return turns?.filter(t => t.date === date) || []
  }
  
  function getActiveTurns(): ITurn[] {
    return turns?.filter(t => t.status === 'active') || []
  }
  
  return {
    turns: turns || [],
    loading: turns === undefined,
    addTurn,
    updateTurn,
    deleteTurn,
    cancelTurn,
    completeTurn,
    getTurnById,
    getTurnsByDate,
    getActiveTurns,
  }
}