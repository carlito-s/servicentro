#### **US-01: us-01-client-booking** ✅ COMPLETADO

- **Task 1.1**: Configurar el componente `PublicLayout` con la navegación básica y el contenedor de rutas. ✅
- **Task 1.2**: Crear la página `AvailableTurns` (ruta `/turnos`) que consuma datos del hook `useTurns`. ✅
- **Task 1.3**: Implementar el componente `ReservationModal` y el formulario de reserva que capture `clientName` y `idCard`. ✅
- **Task 1.4**: Desarrollar la lógica en `useReservations` para verificar `maxCapacity` antes de ejecutar `addReservation`. ✅

---

#### **US-02: us-02-admin-auth** ✅ COMPLETADO

- **Task 2.1**: Crear el `AuthContext` para gestionar los estados `user`, `isAuthenticated` y las funciones `login/logout`. ✅
- **Task 2.2**: Implementar la persistencia del estado de autenticación en `localStorage` dentro de un `useEffect`. ✅
- **Task 2.3**: Crear el componente `ProtectedRoute` que verifique el contexto y redirija a `/login` si es necesario. ✅
- **Task 2.4**: Diseñar la página `Login` y conectar el formulario con la función `login` del contexto. ✅

---

#### **US-03: us-03-turn-management** ✅ COMPLETADO

- **Task 3.1**: Definir el esquema de la tabla `turns` en `database.ts` (id, date, startTime, endTime, maxCapacity, status). ✅
- **Task 3.2**: Implementar en `useTurns` la función de validación de **solapamientos horarios** para la misma fecha. ✅
- **Task 3.3**: Crear la página `TurnsAdmin` (ruta `/admin/turns`) con una tabla para listar y un formulario para crear/editar turnos. ✅
- **Task 3.4**: Integrar `useLiveQuery` de Dexie para que la tabla de turnos se actualice en tiempo real tras cada cambio. ✅

---

#### **US-04: us-04-reservation-control** ✅ COMPLETADO

- **Task 4.1**: Crear la página `ReservationsAdmin` (ruta `/admin/reservations`) que muestre los datos del cliente y el turno asociado. ✅
- **Task 4.2**: Implementar en `useReservations` las funciones `cancelReservation` y `dispatchReservation` para cambiar el estado de la reserva y liberar el cupo del turno. ✅
- **Task 4.3**: Configurar el `AdminLayout` con el menú de navegación anidado para `/admin/turns` y `/admin/reservations`. ✅