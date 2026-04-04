# Contexto de Negocio: Gestión de Turnos en Servicentro (Combustible)

### 1. Visión General

El sistema está diseñado para gestionar el flujo de vehículos en un Servicentro (CUPET/Oro Negro) ante la alta demanda y baja disponibilidad de combustible. El objetivo primordial es digitalizar la "cola" para que los clientes solo se presenten en el establecimiento cuando tengan un cupo garantizado, optimizando el tiempo del ciudadano y la logística del servicentro.

### 2. Definición de Conceptos

Para que el código y la interfaz sean coherentes, utilizaremos la siguiente nomenclatura:

- **Turno:** Representa un bloque de tiempo (ej. "Mañana: 08:00 - 12:00") en el que el servicentro tiene combustible disponible para habilitar el despacho.
    
- **Cupo (Capacidad):** El número máximo de vehículos que el servicentro puede atender en ese bloque horario basándose en la reserva de litros y la velocidad de los operarios.
    
- **Cliente:** Propietario de vehículo que requiere combustible.
    
- **Identificador:** Se utilizará el **Carnet de Identidad** 
    

### 3. Reglas de Negocio Específicas

- **Validación de Solapamientos:** El administrador no puede crear dos turnos que coincidan en el mismo surtidor a la misma hora para evitar el caos en la pista.
    
- **Garantía de Suministro:** Una reserva exitosa garantiza al cliente que, al llegar en su horario, habrá combustible reservado para él (dentro de los límites de capacidad definidos).
    
- **Transparencia:** El cliente siempre verá cuántos "espacios de despacho" quedan antes de intentar registrarse.
    

### 4. Flujo Operativo en el Sistema

1. **Administrador:** Recibe la notificación de que entrará un camión cisterna. Entra al panel (`/admin/turnos`), crea los turnos para el día siguiente definiendo la capacidad según los litros recibidos y cuida que los horarios no se solapen.
    
2. **Cliente:** Entra a la aplicación desde su teléfono (`/`), observa la disponibilidad de combustible para su municipio y reserva su lugar con su Nombre y CI.
    
3. **Control:** El administrador visualiza en `/admin/reservas` el listado de los vehículos autorizados para ese turno y marca como "Despachado" o "Cancelado" según corresponda.
    
