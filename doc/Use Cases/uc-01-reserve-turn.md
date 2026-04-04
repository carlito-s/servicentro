**Propósito:** Describir el proceso por el cual un cliente solicita un cupo en un turno disponible.

- **Actor:** Cliente (Usuario Público).
- **Precondiciones:** Debe existir al menos un turno creado con cupo disponible en la base de datos.
- **Flujo Principal:**

    1. El sistema muestra la lista de turnos mediante la página `AvailableTurns` (ruta `/turnos`).
    2. El cliente selecciona un turno con estado "active" y disponibilidad.
    3. Se despliega el componente `ReservationModal` solicitando **Nombre Completo** y **Carnet de Identidad**.
    4. Al confirmar, el componente invoca a `useReservations.addReservation()`.
    5. El hook verifica que el turno aún tenga capacidad máxima disponible mediante `getAvailableCapacity()`.
    6. Se registra la reserva en la tabla `reservations` de IndexedDB.

- **Regla de Negocio:** Si el cupo está agotado, el sistema debe impedir la reserva y mostrar "Completo" en la tarjeta del turno.