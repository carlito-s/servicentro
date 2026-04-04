import { useState, useEffect } from 'react'
import { useTurns } from '@/hooks/useTurns'
import { useReservations } from '@/hooks/useReservations'
import { ReservationModal } from '@/components/ReservationModal'
import type { ITurn } from '@/types'

export function AvailableTurns() {
  const { loading: turnsLoading, getActiveTurns } = useTurns()
  const { getAvailableCapacity } = useReservations()
  const [selectedTurn, setSelectedTurn] = useState<ITurn | null>(null)
  const [availableCapacities, setAvailableCapacities] = useState<Record<string, number>>({})
  const [showSuccess, setShowSuccess] = useState(false)

  const activeTurns = getActiveTurns()

  useEffect(() => {
    async function loadCapacities() {
      const capacities: Record<string, number> = {}
      for (const turn of activeTurns) {
        capacities[turn.id] = await getAvailableCapacity(turn.id, turn.maxCapacity)
      }
      setAvailableCapacities(capacities)
    }
    if (activeTurns.length > 0) {
      loadCapacities()
    }
  }, [activeTurns, getAvailableCapacity])

  const handleSuccess = () => {
    setSelectedTurn(null)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  if (turnsLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando turnos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Turnos Disponibles</h1>
          <p className="text-gray-600">Seleccione un turno para realizar su reserva</p>
        </div>

        {showSuccess && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg text-center">
            Reserva realizada correctamente. Le esperamos en el turno seleccionado.
          </div>
        )}

        {activeTurns.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <p className="text-gray-500 text-lg">No hay turnos disponibles en este momento.</p>
            <p className="text-gray-400 mt-2">Vuelva a intentar más tarde.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {activeTurns.map(turn => {
              const available = availableCapacities[turn.id] ?? turn.maxCapacity
              const isAvailable = available > 0

              return (
                <div
                  key={turn.id}
                  className={`bg-white rounded-xl shadow-md p-6 transition ${
                    isAvailable ? 'hover:shadow-lg cursor-pointer' : 'opacity-60'
                  }`}
                  onClick={() => isAvailable && setSelectedTurn(turn)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">📅</span>
                        <span className="text-xl font-semibold text-gray-800">
                          {new Date(turn.date).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">🕐</span>
                        <span className="text-lg text-gray-600">
                          {turn.startTime} - {turn.endTime}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-2xl font-bold ${
                          available > 5
                            ? 'text-green-600'
                            : available > 0
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {available}
                      </div>
                      <div className="text-sm text-gray-500">cupos disponibles</div>
                    </div>
                  </div>
                  {isAvailable ? (
                    <div className="mt-4 text-center">
                      <span className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium">
                        Click para reservar
                      </span>
                    </div>
                  ) : (
                    <div className="mt-4 text-center">
                      <span className="inline-block bg-red-100 text-red-700 px-4 py-2 rounded-lg font-medium">
                        Completo
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {selectedTurn && (
        <ReservationModal
          turn={selectedTurn}
          availableCapacity={availableCapacities[selectedTurn.id] ?? 0}
          onClose={() => setSelectedTurn(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}