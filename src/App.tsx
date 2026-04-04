import { Link } from 'react-router-dom'

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-center mb-8">
          Servicentro
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Sistema de Gestión de Turnos para Combustible
        </p>
        
        <div className="flex justify-center gap-4">
          <Link
            to="/turnos"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Ver Turnos Disponibles
          </Link>
          <Link
            to="/login"
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition"
          >
            Acceso Admin
          </Link>
        </div>
      </div>
    </div>
  )
}

export default App