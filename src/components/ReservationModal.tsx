import { useState } from 'react'
import { useReservations } from '@/hooks/useReservations'
import type { ITurn } from '@/types'

interface ReservationModalProps {
  turn: ITurn
  availableCapacity: number
  onClose: () => void
  onSuccess: () => void
}

export function ReservationModal({ turn, availableCapacity, onClose, onSuccess }: ReservationModalProps) {
  const { addReservation } = useReservations()
  const [formData, setFormData] = useState({
    clientName: '',
    idCard: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await addReservation({
        turnId: turn.id,
        clientName: formData.clientName.trim(),
        idCard: formData.idCard.trim(),
      })
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al realizar la reserva')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Reservar Turno</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            &times;
          </button>
        </div>

        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Fecha:</strong> {turn.date}
          </p>
          <p className="text-sm text-blue-800">
            <strong>Horario:</strong> {turn.startTime} - {turn.endTime}
          </p>
          <p className="text-sm text-blue-800">
            <strong>Cupos disponibles:</strong> {availableCapacity}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre completo</label>
            <input
              type="text"
              value={formData.clientName}
              onChange={e => setFormData({ ...formData, clientName: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ingrese su nombre"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Carné de identidad</label>
            <input
              type="text"
              value={formData.idCard}
              onChange={e => setFormData({ ...formData, idCard: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ingrese su carné"
              required
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading || availableCapacity <= 0}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Reservando...' : 'Confirmar Reserva'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}