**Propósito:** Gestionar el acceso restringido al panel de administración.

- **Actor:** Administrador.
- **Precondiciones:** Debe existir una cuenta predefinida en la tabla `users` de la base de datos local.

- **Flujo Principal:**

    1. El usuario accede a la ruta `/login`.
    2. Ingresa su **email** y **contraseña** en el formulario.
    3. El componente `Login` utiliza `useAuth.login()` para validar las credenciales contra la base de datos.
    4. Si son correctas, `AuthContext` actualiza el flag `isAuthenticated` a `true`.
    5. El estado se persiste en `localStorage` para mantener la sesión tras recargar.
    6. El sistema redirige al usuario a la ruta protegida `/admin`.

- **Seguridad:** Cualquier intento de acceso a `/admin` sin autenticación redirige automáticamente al login mediante el componente `ProtectedRoute`.