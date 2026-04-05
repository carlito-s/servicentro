import { useEffect, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AppRouter from './router'
import './styles.css'
import { db } from './db/database'

interface SeedTurn {
  id: string
  date: string
  startTime: string
  endTime: string
  maxCapacity: number
  status: 'active' | 'cancelled' | 'completed'
}

interface SeedReservation {
  id: string
  turnId: string
  clientName: string
  idCard: string
  reservationDate: string
  status: 'pending' | 'dispatched' | 'cancelled'
}

interface SeedUser {
  id: string
  email: string
  password: string
}

const turns: SeedTurn[] = [
  { id: 'turn-1', date: new Date().toISOString().split('T')[0], startTime: '08:00', endTime: '10:00', maxCapacity: 15, status: 'active' },
  { id: 'turn-2', date: new Date().toISOString().split('T')[0], startTime: '10:00', endTime: '12:00', maxCapacity: 12, status: 'active' },
  { id: 'turn-3', date: new Date().toISOString().split('T')[0], startTime: '14:00', endTime: '16:00', maxCapacity: 10, status: 'active' },
  { id: 'turn-4', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], startTime: '08:00', endTime: '10:00', maxCapacity: 15, status: 'active' },
  { id: 'turn-5', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], startTime: '10:00', endTime: '12:00', maxCapacity: 15, status: 'active' },
  { id: 'turn-6', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], startTime: '14:00', endTime: '16:00', maxCapacity: 15, status: 'active' },
]

const reservations: SeedReservation[] = [
  { id: 'res-1', turnId: 'turn-1', clientName: 'Juan Pérez', idCard: '92081433211', reservationDate: new Date().toISOString(), status: 'pending' },
  { id: 'res-2', turnId: 'turn-1', clientName: 'María López', idCard: '88120511234', reservationDate: new Date().toISOString(), status: 'pending' },
  { id: 'res-3', turnId: 'turn-2', clientName: 'Carlos Rodríguez', idCard: '75031144567', reservationDate: new Date().toISOString(), status: 'pending' },
]

const users: SeedUser[] = [
  { id: 'user-1', email: 'admin@servicentro.cu', password: 'admin123' },
]

function SeedRunner({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    async function runSeed() {
      try {
        const count = await db.turns.count()
        if (count === 0) {
          await db.turns.bulkAdd(turns)
          await db.reservations.bulkAdd(reservations)
          await db.users.bulkAdd(users)
          console.log('Seed completado')
        }
      } catch (e) {
        console.error('Seed error:', e)
      }
    }
    runSeed()
  }, [])

  return <>{children}</>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SeedRunner>
      <AppRouter />
    </SeedRunner>
  </StrictMode>,
)