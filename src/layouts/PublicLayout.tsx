import { Outlet, Link } from 'react-router-dom'

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link to="/" className="text-xl font-bold text-gray-800">
            Servicentro
          </Link>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}