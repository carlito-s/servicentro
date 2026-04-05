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
      <div className="min-h-screen bg-surface-dim flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-on-surface-variant">Cargando turnos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-dim relative">
      <div className="asphalt-texture"></div>
      
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-surface-dim/80 backdrop-blur-md border-b border-outline-variant/10">
        <div className="text-2xl font-black text-primary italic font-headline tracking-tight uppercase">
          SERVICENTRO
        </div>
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-primary">account_circle</span>
        </div>
      </nav>

      <div className="relative z-10 pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="font-headline font-black text-5xl uppercase tracking-tighter leading-none mb-2">
              Turnos<br/><span className="text-primary">Disponibles</span>
            </h1>
            <p className="font-label text-xs tracking-widest text-on-surface-variant uppercase">
              Terminal Central • Sector A-1
            </p>
          </header>

          {showSuccess && (
            <div className="mb-6 p-4 bg-primary/10 border-l-4 border-primary text-primary">
              Reserva realizada correctamente. Le esperamos en el turno seleccionado.
            </div>
          )}

          {activeTurns.length === 0 ? (
            <div className="text-center py-12 bg-surface-container p-8 border-l-4 border-outline-variant/20">
              <p className="text-on-surface-variant text-lg">No hay turnos disponibles en este momento.</p>
              <p className="text-on-surface-variant/60 mt-2">Vuelva a intentar más tarde.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {activeTurns.map(turn => {
                const available = availableCapacities[turn.id] ?? turn.maxCapacity
                const isAvailable = available > 0

                return (
                  <div
                    key={turn.id}
                    className={`bg-surface-container p-6 border-l-4 transition ${
                      isAvailable 
                        ? 'border-primary hover:bg-surface-container-high cursor-pointer' 
                        : 'border-outline-variant/30 opacity-50'
                    }`}
                    onClick={() => isAvailable && setSelectedTurn(turn)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="material-symbols-outlined text-primary">schedule</span>
                          <span className="font-headline font-bold text-2xl">
                            {turn.startTime} - {turn.endTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-on-surface-variant">calendar_today</span>
                          <span className="text-on-surface-variant">
                            {new Date(turn.date).toLocaleDateString('es-ES', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-3xl font-headline font-black ${
                            available > 5
                              ? 'text-primary'
                              : available > 0
                              ? 'text-secondary'
                              : 'text-on-surface-variant'
                          }`}
                        >
                          {available}
                        </div>
                        <div className="text-xs text-on-surface-variant uppercase tracking-tighter">
                          {available > 0 ? 'Libres' : 'Cupos'}
                        </div>
                        <div className="h-2 w-24 bg-surface-variant mt-2">
                          <div 
                            className="h-full bg-primary transition-all" 
                            style={{ width: `${(available / turn.maxCapacity) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    {isAvailable ? (
                      <div className="mt-4 pt-4 border-t border-outline-variant/10">
                        <span className="inline-block bg-primary-container text-on-primary-container px-4 py-2 text-xs font-headline font-black uppercase tracking-widest">
                          Click para reservar
                        </span>
                      </div>
                    ) : (
                      <div className="mt-4 pt-4 border-t border-outline-variant/10">
                        <span className="inline-block bg-surface-variant text-on-surface-variant/60 px-4 py-2 text-xs font-headline font-black uppercase tracking-widest">
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
      </div>

      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-4 pt-2 bg-surface-dim/95 backdrop-blur-md border-t-2 border-surface-container z-50">
        <div className="flex flex-col items-center justify-center text-primary py-2 font-headline text-[10px] font-bold uppercase">
          <span className="material-symbols-outlined">local_gas_station</span>
          <span>Terminal</span>
        </div>
        <div className="flex flex-col items-center justify-center text-on-surface-variant py-2 font-headline text-[10px] font-bold uppercase hover:text-primary transition-colors">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: 'FILL 1' }}>event_available</span>
          <span>Reservas</span>
        </div>
        <div className="flex flex-col items-center justify-center text-on-surface-variant py-2 font-headline text-[10px] font-bold uppercase hover:text-secondary transition-colors">
          <span className="material-symbols-outlined">admin_panel_settings</span>
          <span>Admin</span>
        </div>
      </nav>

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