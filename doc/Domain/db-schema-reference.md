| **Tabla (Store)** | **Campos y Tipos sugeridos**                                                              | **Descripción**                                                |
| ----------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **turns**         | `id` (primary key), `date`, `startTime`, `endTime`, `maxCapacity`, `status`               | Almacena la oferta de turnos creada por el admin.              |
| **reservations**  | `id` (primary key), `turnId` (index), `clientName`, `idCard`, `reservationDate`, `status` | Registra las citas de los clientes asociadas a un turno.       |
| **users**         | `id`, `email` (index), `password`                                                         | Almacena las credenciales del administrador (fijas o creadas). |
