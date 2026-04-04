**Como** administrador, **quiero** crear, editar y eliminar turnos **para** mantener actualizada la oferta disponible para los clientes.

- **Criterios de Aceptación:**
    
    - El administrador debe poder listar todos los turnos en una tabla dentro de `/admin/turnos`.
        
    - Al crear o editar un turno, se deben definir campos de fecha, hora inicio, hora fin y capacidad máxima.
        
    - **Validación Crítica:** El hook `useTurnos` debe impedir la creación de turnos que se solapen en horario con otros existentes en la misma fecha.
        
    - Los cambios deben reflejarse automáticamente en la interfaz mediante `useLiveQuery` de Dexie.js.
        
