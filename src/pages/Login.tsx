import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin/turns'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const success = await login(email, password)
    
    if (success) {
      navigate(from, { replace: true })
    } else {
      setError('Credenciales incorrectas')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-surface-dim relative overflow-hidden">
      <div className="asphalt-texture"></div>
      
      <div className="fixed -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed -bottom-24 -right-24 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-12 text-center">
            <div className="inline-block px-4 py-1 mb-6 bg-surface-container-highest border border-outline-variant/30 text-primary-dim font-headline text-xs tracking-[0.2em] uppercase italic">
              Restricted Access
            </div>
            <h1 className="font-headline font-black italic text-5xl md:text-6xl text-primary tracking-tighter leading-none uppercase">
              SERVICENTRO
            </h1>
            <div className="w-16 h-1 bg-primary mx-auto mt-4 mb-2"></div>
            <p className="font-body text-on-surface-variant text-sm tracking-widest uppercase">Admin Terminal v2.4</p>
          </div>

          <div className="bg-surface-container/60 backdrop-blur-xl border-l border-t border-outline-variant/20 p-8 md:p-10 shadow-[0_0_40px_-10px_rgba(255,231,146,0.15)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2">
              <span className="material-symbols-outlined text-primary/20 text-4xl">precision_manufacturing</span>
            </div>
            <div className="absolute bottom-0 left-0 w-1 h-12 bg-primary"></div>

            <header className="mb-8">
              <h2 className="font-headline font-bold text-2xl text-on-surface uppercase italic tracking-tight">
                INICIAR SESIÓN
              </h2>
              <p className="text-on-surface-variant text-xs mt-1 font-medium">Autenticación de seguridad requerida.</p>
            </header>

            {error && (
              <div className="mb-6 p-3 bg-error/10 border border-error/20 text-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="relative">
                <label className="block font-headline text-[10px] font-bold text-primary uppercase tracking-widest mb-2 px-1" htmlFor="email">
                  Correo electrónico
                </label>
                <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-lg">alternate_email</span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-8"
                    placeholder="USUARIO@SERVICENTRO.CU"
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block font-headline text-[10px] font-bold text-primary uppercase tracking-widest mb-2 px-1" htmlFor="password">
                  Contraseña
                </label>
                <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-lg">lock</span>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-8"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="metallic-shine text-on-primary-container font-headline font-black italic py-5 tracking-tighter text-lg uppercase transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 w-full disabled:opacity-50"
                >
                  <span>{loading ? 'Autenticando...' : 'ACCEDER AL PANEL'}</span>
                  <span className="material-symbols-outlined">bolt</span>
                </button>
              </div>
            </form>

            <footer className="mt-10 flex flex-col items-center gap-4 border-t border-outline-variant/10 pt-6">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                <span className="text-[9px] font-headline text-on-surface-variant uppercase tracking-widest">Server Status: Online</span>
              </div>
              <p className="text-[10px] text-on-surface-variant/50 font-headline">
                Usuario: admin@servicentro.cu / admin123
              </p>
            </footer>
          </div>

          <div className="mt-8 flex justify-between items-center px-2">
            <span className="text-[10px] font-headline text-outline/30 uppercase italic">© 2024 Servicentro Industries</span>
            <div className="flex gap-4">
              <div className="w-8 h-px bg-outline/20"></div>
              <div className="w-4 h-px bg-outline/20"></div>
            </div>
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