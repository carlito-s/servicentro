import { Link } from 'react-router-dom'

function App() {
  return (
    <div className="min-h-screen bg-surface relative overflow-hidden">
      <div className="asphalt-texture"></div>
      
      <div className="fixed -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed -bottom-24 -right-24 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl text-center">
          <div className="mb-8">
            <div className="inline-block px-4 py-1 mb-6 bg-surface-container-highest border border-outline-variant/30 text-primary-dim font-headline text-xs tracking-[0.2em] uppercase italic">
              Sistema de Gestión de Combustible
            </div>
            <h1 className="font-headline font-black italic text-6xl md:text-7xl text-primary tracking-tighter leading-none uppercase mb-4">
              SERVICENTRO
            </h1>
            <div className="w-24 h-1 bg-primary mx-auto mb-4"></div>
            <p className="font-body text-on-surface-variant text-sm tracking-widest uppercase">
              Fuel Management System v2.4
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-12">
            <Link
              to="/turnos"
              className="metallic-shine text-on-primary-container font-headline font-black italic py-5 px-8 tracking-tighter text-lg uppercase transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">local_gas_station</span>
              <span>Turnos Disponibles</span>
            </Link>
            <Link
              to="/login"
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">admin_panel_settings</span>
              <span>Acceso Admin</span>
            </Link>
          </div>
        </div>

        <div className="mt-16 flex justify-between items-center px-2 w-full max-w-lg">
          <span className="text-[10px] font-headline text-outline/30 uppercase italic">
            © 2024 Servicentro Fuel System
          </span>
          <div className="flex gap-4">
            <div className="w-8 h-px bg-outline/20"></div>
            <div className="w-4 h-px bg-outline/20"></div>
          </div>
        </div>
      </div>

      <aside className="fixed right-0 top-0 h-screen w-1/4 hidden lg:flex flex-col items-end justify-center pointer-events-none p-12">
        <div className="rotate-90 origin-right translate-x-1/2 opacity-5 select-none">
          <h3 className="text-[200px] font-headline font-black italic tracking-tighter leading-none uppercase whitespace-nowrap">
            PERFORMANCE
          </h3>
        </div>
      </aside>
    </div>
  )
}

export default App