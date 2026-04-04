**Como** encargado del sistema, **quiero** acceder de forma segura al panel de administración **para** gestionar la oferta de turnos y las reservas.

- **Criterios de Aceptación:**
    
    - Debe existir un formulario de login con campos para email y contraseña.
        
    - La autenticación debe realizarse contra una cuenta predefinida en la base de datos local.
        
    - El sistema debe usar un `AuthContext` para gestionar el estado `isAuthenticated`.
        
    - La sesión debe persistir al recargar la página mediante `localStorage`.
        
    - Las rutas de administración (`/admin`) deben estar protegidas y redirigir al login si no hay sesión activa.
        
