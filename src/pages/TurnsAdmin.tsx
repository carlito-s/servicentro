import { useState } from 'react'
import { useTurns } from '@/hooks/useTurns'
import type { ITurn, TurnStatus } from '@/types'

const statusLabels: Record<TurnStatus, string> = {
  active: 'Activo',
  cancelled: 'Cancelado',
  completed: 'Completado',
}

const statusStyles: Record<TurnStatus, string> = {
  active: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-gray-100 text-gray-800',
}

export function TurnsAdmin() {
  const { turns, loading, addTurn, updateTurn, deleteTurn, cancelTurn, completeTurn } = useTurns()
  const [showForm, setShowForm] = useState(false)
  const [editingTurn, setEditingTurn] = useState<ITurn | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    maxCapacity: 10,
    status: 'active' as TurnStatus,
  })

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
    return <div className="text-center py-8">Cargando turnos...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Turnos</h1>
        <button
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Nuevo Turno
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>
      )}
      {success && (
        <div className="p-3 bg-green-100 text-green-700 rounded-lg">{success}</div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">
            {editingTurn ? 'Editar Turno' : 'Nuevo Turno'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Fecha</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Capacidad máxima</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={formData.maxCapacity}
                  onChange={e => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Hora inicio</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Hora fin</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {editingTurn && (
                <div>
                  <label className="block text-sm font-medium mb-1">Estado</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as TurnStatus })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Activo</option>
                    <option value="cancelled">Cancelado</option>
                    <option value="completed">Completado</option>
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                {editingTurn ? 'Actualizar' : 'Crear'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {turns.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No hay turnos. Crea el primero.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Fecha</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Horario</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Capacidad</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Estado</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {turns.map(turn => (
                <tr key={turn.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{turn.date}</td>
                  <td className="px-4 py-3 text-sm">{turn.startTime} - {turn.endTime}</td>
                  <td className="px-4 py-3 text-sm">{turn.maxCapacity}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusStyles[turn.status]}`}>
                      {statusLabels[turn.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right space-x-2">
                    <button
                      onClick={() => handleEdit(turn)}
                      className="text-blue-600 hover:underline"
                    >
                      Editar
                    </button>
                    {turn.status === 'active' && (
                      <>
                        <button
                          onClick={() => handleCancel(turn.id)}
                          className="text-yellow-600 hover:underline"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleComplete(turn.id)}
                          className="text-green-600 hover:underline"
                        >
                          Completar
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(turn.id)}
                      className="text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}