import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTurns } from '@/hooks/useTurns'
import { useAuth } from '@/contexts/AuthContext'
import type { ITurn, TurnStatus } from '@/types'

const statusLabels: Record<TurnStatus, string> = {
  active: 'Activo',
  cancelled: 'Cancelado',
  completed: 'Completado',
}

const statusStyles: Record<TurnStatus, string> = {
  active: 'badge-active',
  cancelled: 'badge-cancelled',
  completed: 'badge-completed',
}

export function TurnsAdmin() {
  const { turns, loading, addTurn, updateTurn, deleteTurn, cancelTurn, completeTurn } = useTurns()
  const { logout } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [editingTurn, setEditingTurn] = useState<ITurn | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    maxCapacity: 10,
    status: 'active' as TurnStatus,
  })
  const [errors, setErrors] = useState({
    date: '',
    startTime: '',
    endTime: '',
    maxCapacity: '',
  })

  const validateForm = (): boolean => {
    const newErrors = {
      date: '',
      startTime: '',
      endTime: '',
      maxCapacity: '',
    }
    
    if (!formData.date) newErrors.date = 'La fecha es requerida'
    else {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const turnDate = new Date(formData.date)
      if (turnDate < today) newErrors.date = 'La fecha no puede ser pasada'
    }
    
    if (!formData.startTime) newErrors.startTime = 'La hora de inicio es requerida'
    else if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.startTime)) {
      newErrors.startTime = 'Formato inválido (HH:MM)'
    }
    
    if (!formData.endTime) newErrors.endTime = 'La hora de fin es requerida'
    else if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.endTime)) {
      newErrors.endTime = 'Formato inválido (HH:MM)'
    }
    
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = 'La hora de inicio debe ser menor que la de fin'
    }
    
    if (formData.maxCapacity < 1) newErrors.maxCapacity = 'La capacidad mínima es 1'
    if (formData.maxCapacity > 50) newErrors.maxCapacity = 'La capacidad máxima es 50'
    
    setErrors(newErrors)
    return Object.values(newErrors).every(error => !error)
  }

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      startTime: '',
      endTime: '',
      maxCapacity: 10,
      status: 'active',
    })
    setEditingTurn(null)
    setShowForm(false)
    setError('')
    setErrors({
      date: '',
      startTime: '',
      endTime: '',
      maxCapacity: '',
    })
  }

  const handleEdit = (turn: ITurn) => {
    setFormData({
      date: turn.date,
      startTime: turn.startTime,
      endTime: turn.endTime,
      maxCapacity: turn.maxCapacity,
      status: turn.status,
    })
    setEditingTurn(turn)
    setShowForm(true)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validateForm()) {
      setError('Por favor corrige los errores en el formulario')
      return
    }

    try {
      if (editingTurn) {
        await updateTurn(editingTurn.id, formData)
        setSuccess('Turno actualizado correctamente')
      } else {
        await addTurn(formData)
        setSuccess('Turno creado correctamente')
      }
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este turno?')) return
    try {
      await deleteTurn(id)
      setSuccess('Turno eliminado')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar')
    }
  }

  const handleCancel = async (id: string) => {
    try {
      await cancelTurn(id)
      setSuccess('Turno cancelado')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cancelar')
    }
  }

  const handleComplete = async (id: string) => {
    try {
      await completeTurn(id)
      setSuccess('Turno completado')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    }
  }

  if (loading) {
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
    <div className="min-h-screen bg-surface-dim flex">
      <div className="asphalt-texture"></div>
      
      <aside className="w-72 bg-surface border-r border-outline-variant/20 flex flex-col py-8 pl-6 sticky top-0 h-screen z-20">
        <div className="mb-12">
          <span className="text-primary-container font-black font-headline text-2xl tracking-tighter italic">SERVICENTRO</span>
          <div className="mt-8 flex items-center gap-3">
            <div>
              <p className="font-headline font-bold text-xs uppercase tracking-widest text-white">OPERACIONES</p>
              <p className="text-[10px] text-white/40 uppercase">Terminal Principal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2 pr-6">
          <Link to="/admin/reservations" className="flex items-center gap-4 px-4 py-3 text-white/60 hover:text-primary hover:bg-surface-container font-headline font-bold text-sm uppercase transition-colors group">
            <span>Panel de Reservas</span>
          </Link>
          <div className="flex items-center gap-4 px-4 py-3 bg-primary-container text-on-primary-container rounded-sm font-headline font-bold text-sm uppercase translate-x-1">
            <span>Gestión Turnos</span>
          </div>
        </nav>

        <div className="mt-auto pr-6 space-y-4">
          <button 
            onClick={() => { resetForm(); setShowForm(true); }}
            className="w-full bg-primary-container text-on-primary-container font-headline font-black py-4 text-xs tracking-[0.2em] hover:bg-secondary transition-colors duration-150 active:scale-95"
          >
            NUEVO TURNO
          </button>
          <div className="pt-6 border-t border-outline-variant/20 space-y-1">
            <button onClick={logout} className="flex items-center gap-4 px-4 py-2 text-white/40 hover:text-secondary font-headline text-[10px] tracking-widest uppercase transition-colors w-full">
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 flex justify-between items-center px-10 bg-surface z-10">
          <div className="flex items-center gap-8">
            <h1 className="font-headline font-black text-3xl italic tracking-tighter text-primary">GESTIÓN DE TURNOS</h1>
            <div className="h-8 w-[2px] bg-outline-variant/30 rotate-12"></div>
            <div className="flex flex-col">
              <span className="font-headline font-bold text-2xl text-white">{turns.length}</span>
              <span className="text-[10px] font-headline tracking-widest text-white/40 uppercase">Total Turnos</span>
            </div>
          </div>
        </header>

        <section className="p-10 space-y-8">
          {error && (
            <div className="p-3 bg-error/10 border-l-4 border-error text-error">{error}</div>
          )}
          {success && (
            <div className="p-3 bg-primary/10 border-l-4 border-primary text-primary">{success}</div>
          )}

          {showForm && (
            <div className="bg-surface-container p-6 border-l-4 border-primary">
              <h2 className="font-headline font-black text-xl italic tracking-tighter mb-4 uppercase">
                {editingTurn ? 'Editar Turno' : 'Nuevo Turno'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-label text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Fecha</label>
                    <input
                      type="date"
                      value={formData.date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => setFormData({ ...formData, date: e.target.value })}
                      className={`input-field ${errors.date ? 'border-error' : ''}`}
                      required
                    />
                    {errors.date && (
                      <p className="text-error text-xs mt-1">{errors.date}</p>
                    )}
                  </div>
                  <div>
                    <label className="block font-label text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Capacidad máxima</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={formData.maxCapacity}
                      onChange={e => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) || 1 })}
                      className={`input-field ${errors.maxCapacity ? 'border-error' : ''}`}
                      required
                    />
                    {errors.maxCapacity && (
                      <p className="text-error text-xs mt-1">{errors.maxCapacity}</p>
                    )}
                  </div>
                  <div>
                    <label className="block font-label text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Hora inicio</label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                      className={`input-field ${errors.startTime ? 'border-error' : ''}`}
                      required
                    />
                    {errors.startTime && (
                      <p className="text-error text-xs mt-1">{errors.startTime}</p>
                    )}
                  </div>
                  <div>
                    <label className="block font-label text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Hora fin</label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                      className={`input-field ${errors.endTime ? 'border-error' : ''}`}
                      required
                    />
                    {errors.endTime && (
                      <p className="text-error text-xs mt-1">{errors.endTime}</p>
                    )}
                  </div>
                  {editingTurn && (
                    <div>
                      <label className="block font-label text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Estado</label>
                      <select
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value as TurnStatus })}
                        className="input-field"
                      >
                        <option value="active">Activo</option>
                        <option value="cancelled">Cancelado</option>
                        <option value="completed">Completado</option>
                      </select>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-4">
                  <button type="submit" className="metallic-shine text-on-primary-container font-headline font-black px-6 py-3 text-sm uppercase tracking-widest hover:bg-secondary transition-all">
                    {editingTurn ? 'Actualizar' : 'Crear'}
                  </button>
                  <button type="button" onClick={resetForm} className="btn-secondary">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {turns.length === 0 ? (
            <div className="text-center py-8 text-on-surface-variant bg-surface-container p-8 border-l-4 border-outline-variant/20">
              No hay turnos. Crea el primero.
            </div>
          ) : (
            <div className="bg-surface-container relative overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="font-headline text-[10px] tracking-[0.2em] uppercase text-white/30 border-b border-outline-variant/10">
                      <th className="px-8 py-5 font-bold">Fecha</th>
                      <th className="px-8 py-5 font-bold">Horario</th>
                      <th className="px-8 py-5 font-bold">Capacidad</th>
                      <th className="px-8 py-5 font-bold">Estado</th>
                      <th className="px-8 py-5 font-bold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/5">
                    {turns.map(turn => (
                      <tr key={turn.id} className="hover:bg-surface-bright/30 transition-colors group">
                        <td className="px-8 py-6 font-headline font-bold">{turn.date}</td>
                        <td className="px-8 py-6">{turn.startTime} - {turn.endTime}</td>
                        <td className="px-8 py-6">{turn.maxCapacity}</td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 font-headline text-[10px] font-bold uppercase tracking-widest ${statusStyles[turn.status]}`}>
                            {statusLabels[turn.status]}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleEdit(turn)} className="text-primary hover:underline font-headline text-xs uppercase">Editar</button>
                            {turn.status === 'active' && (
                              <>
                                <button onClick={() => handleCancel(turn.id)} className="text-secondary hover:underline font-headline text-xs uppercase">Cancelar</button>
                                <button onClick={() => handleComplete(turn.id)} className="text-green-500 hover:underline font-headline text-xs uppercase">Completar</button>
                              </>
                            )}
                            <button onClick={() => handleDelete(turn.id)} className="text-error hover:underline font-headline text-xs uppercase">Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    ))}
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