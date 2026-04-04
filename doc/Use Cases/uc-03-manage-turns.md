**Propósito:** Permitir al administrador la gestión total de la oferta de turnos y sus validaciones.

- **Actor:** Administrador.
- **Precondiciones:** El administrador debe haber iniciado sesión correctamente.

- **Flujo Principal (Creación):**

    1. El administrador accede a la sección `/admin/turns`.
    2. Completa el formulario con **fecha**, **hora inicio**, **hora fin** y **capacidad máxima**.
    3. El componente invoca a `useTurns.addTurn()`.
    4. **Validación Crítica:** El hook comprueba que no existan otros turnos en la misma fecha cuyos rangos horarios se solapen mediante `checkOverlap()`.
    5. Si la validación es exitosa, se guarda el registro en IndexedDB.

- **Gestión de Reservas:** El administrador puede visualizar todas las reservas en `/admin/reservations` y:
    - **Despachar**: Cambiar estado a "dispatched" cuando el cliente es atendido.
    - **Cancelar**: Cambiar estado a "cancelled" si el cliente no asiste o solicita cancelación.
    - Ambas acciones actualizan el estado en tiempo real mediante `useLiveQuery`.