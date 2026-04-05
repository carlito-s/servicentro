import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { db } from '@/db/database'
import { useReservations } from '@/hooks/useReservations'
import { useAuth } from '@/contexts/AuthContext'
import type { ReservationStatus, IReservation } from '@/types'
import { useState } from 'react'

const statusLabels: Record<ReservationStatus, string> = {
  pending: 'Pendiente',
  dispatched: 'Despachado',
  cancelled: 'Cancelado',
}

const statusStyles: Record<ReservationStatus, string> = {
  pending: 'badge-pending',
  dispatched: 'badge-dispatched',
  cancelled: 'badge-cancelled',
}

export function ReservationsAdmin() {
  const reservations = useLiveQuery(() => db.reservations.toArray(), [])
  const turns = useLiveQuery(() => db.turns.toArray(), [])
  const { cancelReservation, dispatchReservation } = useReservations()
  const { logout } = useAuth()
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
      <div className="min-h-screen bg-surface-dim flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-on-surface-variant">Cargando reservas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-dim flex">
      <div className="asphalt-texture"></div>
      
      <aside className="w-72 bg-surface border-r border-outline-variant/20 flex flex-col py-8 pl-6 sticky top-0 h-screen z-20">
        <div className="mb-12">
          <span className="text-primary-container font-black font-headline text-2xl tracking-tighter italic">SERVICENTRO</span>
          <div className="mt-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-surface-variant rounded-sm flex items-center justify-center border border-outline-variant/30">
              <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
            </div>
            <div>
              <p className="font-headline font-bold text-xs uppercase tracking-widest text-white">OPERACIONES</p>
              <p className="text-[10px] text-white/40 uppercase">Terminal Principal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2 pr-6">
          <div className="flex items-center gap-4 px-4 py-3 bg-primary-container text-on-primary-container rounded-sm font-headline font-bold text-sm uppercase translate-x-1">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: 'FILL 1' }}>dashboard</span>
            <span>Panel Control</span>
          </div>
          <Link to="/admin/turns" className="flex items-center gap-4 px-4 py-3 text-white/60 hover:text-primary hover:bg-surface-container font-headline font-bold text-sm uppercase transition-colors group">
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">ev_station</span>
            <span>Gestión Turnos</span>
          </Link>
        </nav>

        <div className="mt-auto pr-6 space-y-4">
          <button onClick={logout} className="w-full bg-primary-container text-on-primary-container font-headline font-black py-4 text-xs tracking-[0.2em] hover:bg-secondary transition-colors duration-150 active:scale-95">
            CERRAR SESIÓN
          </button>
          <div className="pt-6 border-t border-outline-variant/20 space-y-1">
            <button className="flex items-center gap-4 px-4 py-2 text-white/40 hover:text-secondary font-headline text-[10px] tracking-widest uppercase transition-colors w-full">
              <span className="material-symbols-outlined text-sm">settings</span>
              <span>Ajustes</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 flex justify-between items-center px-10 bg-surface z-10">
          <div className="flex items-center gap-8">
            <h1 className="font-headline font-black text-3xl italic tracking-tighter text-primary">GESTIÓN DE RESERVAS</h1>
            <div className="h-8 w-[2px] bg-outline-variant/30 rotate-12"></div>
            <div className="flex flex-col">
              <span className="font-headline font-bold text-2xl text-white">{reservations.length}</span>
              <span className="text-[10px] font-headline tracking-widest text-white/40 uppercase">Total Reservations</span>
            </div>
          </div>
        </header>

        <section className="p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-surface-container p-6 border-l-4 border-primary">
              <p className="font-headline text-[10px] tracking-widest text-white/40 uppercase mb-2">En Espera</p>
              <h3 className="text-3xl font-headline font-black text-white">
                {reservations.filter(r => r.status === 'pending').length}
              </h3>
            </div>
            <div className="bg-surface-container p-6 border-l-4 border-secondary">
              <p className="font-headline text-[10px] tracking-widest text-white/40 uppercase mb-2">Despachadas</p>
              <h3 className="text-3xl font-headline font-black text-white">
                {reservations.filter(r => r.status === 'dispatched').length}
              </h3>
            </div>
            <div className="bg-surface-container p-6 border-l-4 border-white/10">
              <p className="font-headline text-[10px] tracking-widest text-white/40 uppercase mb-2">Canceladas</p>
              <h3 className="text-3xl font-headline font-black text-white">
                {reservations.filter(r => r.status === 'cancelled').length}
              </h3>
            </div>
            <div className="bg-surface-container p-6 overflow-hidden relative group">
              <div className="absolute inset-0 opacity-20 group-hover:scale-110 transition-transform duration-700">
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20"></div>
              </div>
              <div className="relative z-10">
                <p className="font-headline text-[10px] tracking-widest text-primary uppercase mb-2">Estado Sistema</p>
                <h3 className="text-lg font-headline font-black text-white uppercase italic tracking-tight">Optimizado</h3>
              </div>
            </div>
          </div>

          {success && (
            <div className="p-4 bg-primary/10 border-l-4 border-primary text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">check_circle</span>
              {success}
            </div>
          )}
          {error && (
            <div className="p-4 bg-error/10 border-l-4 border-error text-error flex items-center gap-2">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}

          {reservations.length === 0 ? (
            <div className="text-center py-16 bg-surface-container border-l-4 border-outline-variant/20">
              <div className="w-16 h-16 bg-surface-variant rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-on-surface-variant text-4xl">inbox</span>
              </div>
              <p className="text-on-surface-variant text-lg">No hay reservas registradas</p>
              <p className="text-on-surface-variant/60 mt-1">Las reservas aparecerán aquí cuando los clientes las realicen</p>
            </div>
          ) : (
            <div className="bg-surface-container relative overflow-hidden">
              <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-high/50">
                <h2 className="font-headline font-bold text-sm tracking-widest uppercase text-white/80">Listado de Reservas</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="font-headline text-[10px] tracking-[0.2em] uppercase text-white/30 border-b border-outline-variant/10">
                      <th className="px-8 py-5 font-bold">Cliente</th>
                      <th className="px-8 py-5 font-bold">Carné de Identidad</th>
                      <th className="px-8 py-5 font-bold">Turno</th>
                      <th className="px-8 py-5 font-bold">Fecha Reserva</th>
                      <th className="px-8 py-5 font-bold text-center">Estado</th>
                      <th className="px-8 py-5 font-bold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/5">
                    {reservations.map(reservation => {
                      const turn = getTurnInfo(reservation.turnId)
                      return (
                        <tr key={reservation.id} className="hover:bg-surface-bright/30 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary-container text-on-primary-container font-headline font-black flex items-center justify-center text-xs">
                                {reservation.clientName.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-bold text-white">{reservation.clientName}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="font-mono text-sm tracking-wider text-primary/80">{reservation.idCard}</span>
                          </td>
                          <td className="px-8 py-6">
                            {turn ? (
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-secondary text-sm">schedule</span>
                                <span className="text-white/90">{turn.date} {turn.startTime}-{turn.endTime}</span>
                              </div>
                            ) : (
                              <span className="text-on-surface-variant/40">Turno no encontrado</span>
                            )}
                          </td>
                          <td className="px-8 py-6 text-on-surface-variant">
                            {new Date(reservation.reservationDate).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="px-8 py-6 text-center">
                            <span className={`px-3 py-1 font-headline text-[10px] font-bold uppercase tracking-widest ${statusStyles[reservation.status]}`}>
                              {statusLabels[reservation.status]}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            {reservation.status === 'pending' && (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleDispatch(reservation)}
                                  className="bg-green-500 hover:bg-green-600 text-white font-headline text-[10px] font-black px-4 py-2 uppercase tracking-tighter transition-transform active:scale-95"
                                >
                                  Despachar
                                </button>
                                <button
                                  onClick={() => handleCancel(reservation)}
                                  className="bg-red-500 hover:bg-red-600 text-white font-headline text-[10px] font-black px-4 py-2 uppercase tracking-tighter transition-transform active:scale-95"
                                >
                                  Cancelar
                                </button>
                              </div>
                            )}
                            {reservation.status === 'dispatched' && (
                              <span className="text-green-500 text-sm flex items-center gap-1 justify-end">
                                <span className="material-symbols-outlined text-lg">check_circle</span>
                                Completado
                              </span>
                            )}
                            {reservation.status === 'cancelled' && (
                              <span className="text-on-surface-variant/40 text-sm flex items-center gap-1 justify-end">
                                <span className="material-symbols-outlined text-lg">cancel</span>
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
        </section>
      </main>
    </div>
  )
}