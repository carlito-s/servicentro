**Como** usuario interesado en un servicio, **quiero** ver los turnos disponibles y realizar una reserva **para** asegurar mi atención en una fecha y hora específica.

- **Criterios de Aceptación:**
    - La pantalla principal debe mostrar una lista de turnos con fecha, hora y cupo restante.
    - Al seleccionar un turno, se debe abrir un formulario que solicite nombre completo y carnet de identidad.
    - El sistema debe usar el hook `useReservations` para validar que el turno tenga cupo disponible antes de confirmar.
    - Una vez confirmada, la reserva debe persistir en IndexedDB.