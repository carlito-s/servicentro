import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/database'
import { useReservations } from '@/hooks/useReservations'
import type { ReservationStatus, IReservation } from '@/types'
import { useState } from 'react'

const statusLabels: Record<ReservationStatus, string> = {
  pending: 'Pendiente',
  dispatched: 'Despachado',
  cancelled: 'Cancelado',
}

const statusStyles: Record<ReservationStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  dispatched: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
}

export function ReservationsAdmin() {
  const reservations = useLiveQuery(() => 
    db.reservations.toArray()
  , [])
  
  const turns = useLiveQuery(() => 
    db.turns.toArray()
  , [])

  const { cancelReservation, dispatchReservation } = useReservations()
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const getTurnInfo = (turnId: string) => {
    return turns?.find(t => t.id === turnId)
  }

  const handleDispatch = async (reservation: IReservation) => {
    try {
      await dispatchReservation(reservation.id)
      setSuccess('Reserva despachada correctamente')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al despachar')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleCancel = async (reservation: IReservation) => {
    if (!confirm('¿Cancelar esta reserva?')) return
    try {
      await cancelReservation(reservation.id)
      setSuccess('Reserva cancelada correctamente')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cancelar')
      setTimeout(() => setError(''), 3000)
    }
  }

  if (!reservations || !turns) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando reservas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Reservas</h1>
        <div className="text-sm text-gray-500">
          {reservations.length} reserva{reservations.length !== 1 ? 's' : ''} registrada{reservations.length !== 1 ? 's' : ''}
        </div>
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {success}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          {error}
        </div>
      )}

      {reservations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg">No hay reservas registradas</p>
          <p className="text-gray-400 mt-1">Las reservas aparecerán aquí cuando los clientes las realicen</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Carnet</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Turno</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha Reserva</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reservations.map(reservation => {
                  const turn = getTurnInfo(reservation.turnId)
                  return (
                    <tr key={reservation.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">
                              {reservation.clientName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-gray-800">{reservation.clientName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-mono text-sm">{reservation.idCard}</td>
                      <td className="px-6 py-4">
                        {turn ? (
                          <div>
                            <div className="text-gray-800 font-medium">{turn.date}</div>
                            <div className="text-gray-500 text-sm">{turn.startTime} - {turn.endTime}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Turno no encontrado</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {new Date(reservation.reservationDate).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusStyles[reservation.status]}`}>
                          {statusLabels[reservation.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {reservation.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleDispatch(reservation)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Despachar
                            </button>
                            <button
                              onClick={() => handleCancel(reservation)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Cancelar
                            </button>
                          </div>
                        )}
                        {reservation.status === 'dispatched' && (
                          <span className="text-green-600 text-sm flex items-center gap-1 justify-end">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Completado
                          </span>
                        )}
                        {reservation.status === 'cancelled' && (
                          <span className="text-gray-400 text-sm flex items-center gap-1 justify-end">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                            Cancelado
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}