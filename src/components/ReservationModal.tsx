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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-surface-container-lowest/80 backdrop-blur-sm">
      <div className="asphalt-texture absolute inset-0"></div>
      
      <div className="relative w-full max-w-lg bg-surface border-t-4 border-primary shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="flex justify-between items-center p-6 bg-surface-container-high">
          <h2 className="font-headline font-black text-2xl tracking-tighter uppercase italic">
            RESERVAR TURNO
          </h2>
          <button 
            onClick={onClose} 
            className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-secondary transition-colors duration-150"
          >
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>
        </div>

        <div className="px-6 py-8 grid grid-cols-2 gap-4 border-b border-outline-variant/20">
          <div className="space-y-1">
            <p className="font-label text-[10px] text-primary uppercase font-bold tracking-widest">Fecha del Turno</p>
            <p className="font-headline text-xl font-bold uppercase">
              {new Date(turn.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-label text-[10px] text-primary uppercase font-bold tracking-widest">Horario</p>
            <p className="font-headline text-xl font-bold">{turn.startTime} - {turn.endTime}</p>
          </div>
          <div className="col-span-2 pt-2">
            <div className="flex items-center gap-3 bg-surface-container-low p-4">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: 'FILL 1' }}>event_available</span>
              <div>
                <p className="font-headline font-black text-lg leading-none">
                  {availableCapacity} Libres
                </p>
                <p className="font-body text-xs text-on-surface-variant uppercase tracking-tighter">
                  Cupos disponibles para este bloque
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="px-6 pt-6">
            <div className="p-3 bg-error/10 border border-error/20 text-error text-sm">
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="relative group">
            <label className="block font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 group-focus-within:text-primary transition-colors">
              Nombre completo
            </label>
            <input
              type="text"
              value={formData.clientName}
              onChange={e => setFormData({ ...formData, clientName: e.target.value })}
              className="input-field"
              placeholder="EJ. JUAN PÉREZ"
              required
            />
          </div>
          <div className="relative group">
            <label className="block font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 group-focus-within:text-primary transition-colors">
              Carné de identidad (CI)
            </label>
            <input
              type="text"
              value={formData.idCard}
              onChange={e => setFormData({ ...formData, idCard: e.target.value })}
              className="input-field"
              placeholder="00000000"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6">
            <button
              type="submit"
              disabled={loading || availableCapacity <= 0}
              className="metallic-shine text-on-primary-container font-headline font-black text-sm uppercase tracking-widest hover:bg-secondary transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Reservando...' : 'Confirmar Reserva'}
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </form>

        <div className="h-1 w-full bg-gradient-to-r from-primary via-secondary to-primary-container"></div>
      </div>
    </div>
  )
}