import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/database'
import type { IReservation, ReservationStatus } from '@/types'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export interface ReservationInput {
  turnId: string
  clientName: string
  idCard: string
}

function validateReservationData(data: ReservationInput): string | null {
  if (!data.clientName.trim()) return 'El nombre es requerido'
  if (!data.idCard.trim()) return 'El carné es requerido'
  if (!data.turnId) return 'El turno es requerido'
  
  // Validación de nombre completo
  const nameTrimmed = data.clientName.trim()
  if (nameTrimmed.length < 3) return 'El nombre debe tener al menos 3 caracteres'
  if (nameTrimmed.length > 100) return 'El nombre no puede exceder 100 caracteres'
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]+$/.test(nameTrimmed)) return 'El nombre solo puede contener letras, espacios, acentos y puntos'
  
  // Validación de carné de identidad (formato cubano: 11 dígitos)
  const idCardTrimmed = data.idCard.trim()
  if (!/^\d{11}$/.test(idCardTrimmed)) return 'El carné debe tener exactamente 11 dígitos'
  if (idCardTrimmed === '00000000000') return 'El carné no puede ser todo ceros'
  
  return null
}

export function useReservations() {
  const reservations = useLiveQuery(() => db.reservations.toArray(), [])

  async function getReservationCount(turnId: string): Promise<number> {
    return db.reservations
      .where('turnId')
      .equals(turnId)
      .and(r => r.status !== 'cancelled')
      .count()
  }

  async function getAvailableCapacity(turnId: string, maxCapacity: number): Promise<number> {
    const count = await getReservationCount(turnId)
    return Math.max(0, maxCapacity - count)
  }

  async function addReservation(data: ReservationInput): Promise<IReservation> {
    const validationError = validateReservationData(data)
    if (validationError) throw new Error(validationError)

    const turn = await db.turns.get(data.turnId)
    if (!turn) throw new Error('Turno no encontrado')
    if (turn.status !== 'active') throw new Error('El turno no está disponible')

    const available = await getAvailableCapacity(data.turnId, turn.maxCapacity)
    if (available <= 0) throw new Error('No hay cupos disponibles')

    const reservation: IReservation = {
      ...data,
      id: generateId(),
      status: 'pending',
      reservationDate: new Date().toISOString(),
    }

    await db.reservations.add(reservation)
    return reservation
  }

  async function updateReservation(id: string, data: Partial<IReservation>): Promise<void> {
    const existing = await db.reservations.get(id)
    if (!existing) throw new Error('Reserva no encontrada')
    await db.reservations.update(id, data)
  }

  async function cancelReservation(id: string): Promise<void> {
    await db.reservations.update(id, { status: 'cancelled' as ReservationStatus })
  }

  async function dispatchReservation(id: string): Promise<void> {
    await db.reservations.update(id, { status: 'dispatched' as ReservationStatus })
  }

  async function deleteReservation(id: string): Promise<void> {
    await db.reservations.delete(id)
  }

  function getReservationsByTurn(turnId: string): IReservation[] {
    return reservations?.filter(r => r.turnId === turnId) || []
  }

  return {
    reservations: reservations || [],
    loading: reservations === undefined,
    addReservation,
    updateReservation,
    cancelReservation,
    dispatchReservation,
    deleteReservation,
    getReservationCount,
    getAvailableCapacity,
    getReservationsByTurn,
  }
}