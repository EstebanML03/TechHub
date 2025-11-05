# 🔧 Guía de Solución de Problemas (Troubleshooting)

## 📋 Índice
- [Errores HTTP Comunes](#errores-http-comunes)
- [Problemas de Autenticación](#problemas-de-autenticación)
- [Errores de Iconos](#errores-de-iconos)
- [Problemas de Build](#problemas-de-build)
- [Herramientas de Debugging](#herramientas-de-debugging)

---

## 🌐 Errores HTTP Comunes

### Error 400 - Bad Request
**Síntomas:** 
- Formularios no se envían
- Validación de datos falla

**Causas:**
- Datos enviados no cumplen con el formato esperado
- Campos requeridos faltantes
- Tipos de datos incorrectos

**Solución:**
```typescript
// Verificar datos antes de enviar
console.log('Datos a enviar:', eventoData);

// Usar el error handler
try {
  await apiClient.post('/eventos', eventoData);
} catch (error) {
  this.errorHandler.handleError(error, 'crear el evento');
}
```

---

### Error 401 - Unauthorized
**Síntomas:**
- Redirección automática al login
- Mensaje "Sesión expirada"

**Causas:**
- Token JWT expirado
- Token inválido o corrupto
- No hay token en localStorage

**Solución:**
```typescript
// Verificar token en consola del navegador (F12)
import { TokenUtil } from './app/shared/utils/token.util';

// Ver info del token
const userInfo = TokenUtil.getUserFromToken();
console.log('Usuario:', userInfo);

// Ver tiempo de expiración
const timeLeft = TokenUtil.getTimeUntilExpiration();
console.log('Tiempo restante:', timeLeft, 'minutos');

// Verificar si está expirado
const token = localStorage.getItem('token');
const isExpired = TokenUtil.isTokenExpired(token);
console.log('Token expirado?', isExpired);
```

**Prevención:**
- El sistema automáticamente detecta tokens expirados
- Limpia la sesión y redirige al login
- No requiere acción manual

---

### Error 403 - Forbidden
**Síntomas:**
- Mensaje "Acceso denegado"
- Botones/acciones no funcionan
- Console muestra error 403

**Causas:**
- Usuario sin permisos suficientes
- Rol de usuario incorrecto (user vs admin)
- Token válido pero sin autorización para la acción

**Diagnóstico:**
```typescript
// En consola del navegador (F12)
import { TokenUtil } from './app/shared/utils/token.util';

// Ver rol actual
const user = TokenUtil.getUserFromToken();
console.log('Mi rol:', user?.rol);

// Verificar si tienes un rol específico
console.log('¿Soy admin?', TokenUtil.hasRole('admin'));
```

**Solución en el Código:**
```typescript
import { HttpErrorHandlerService } from '../../shared/services/http-error-handler.service';

// Opción 1: Verificar permisos ANTES de la acción
async eliminarEvento(id: number) {
  // Verificar primero
  if (!this.errorHandler.checkPermission('admin', 'eliminar eventos')) {
    return; // No ejecuta si no tiene permisos
  }

  try {
    await apiClient.delete(`/eventos/${id}`);
    this.alertService.success('Evento eliminado');
  } catch (error) {
    this.errorHandler.handleError(error);
  }
}

// Opción 2: Manejar el error 403 específicamente
async crearEvento(evento: any) {
  try {
    await apiClient.post('/eventos', evento);
    this.alertService.success('Evento creado');
  } catch (error: any) {
    if (error.response?.status === 403) {
      this.errorHandler.handle403(error, 'crear eventos');
    } else {
      this.errorHandler.handleError(error);
    }
  }
}
```

**Prevención:**
```typescript
// En el template HTML, ocultar botones según permisos
import { TokenUtil } from '../../shared/utils/token.util';

// En el componente
esAdmin(): boolean {
  return TokenUtil.hasRole('admin');
}

// En el HTML
@if (esAdmin()) {
  <button (click)="eliminarEvento()">
    Eliminar
  </button>
}
```

---

### Error 404 - Not Found
**Síntomas:**
- Recurso no encontrado
- Página en blanco o error

**Causas:**
- URL incorrecta
- ID de recurso inválido
- Recurso fue eliminado

**Solución:**
```typescript
try {
  const response = await apiClient.get(`/eventos/${id}`);
  return response.data;
} catch (error: any) {
  if (error.response?.status === 404) {
    this.alertService.warning('Evento no encontrado', 
      'El evento que buscas ya no existe.');
    this.router.navigate(['/eventos']);
  }
}
```

---

### Error 500 - Internal Server Error
**Síntomas:**
- Error del servidor
- Mensaje "Error inesperado"

**Causas:**
- Bug en el backend
- Base de datos no disponible
- Excepción no controlada en el servidor

**Solución:**
- Verificar logs del backend
- Reportar el error al equipo de desarrollo
- El error handler muestra mensaje automático al usuario

---

## 🔐 Problemas de Autenticación

### Token no se guarda
**Verificar:**
```typescript
// Después del login
const token = localStorage.getItem('token');
console.log('Token guardado:', token ? 'Sí' : 'No');

// Verificar que sea válido
import { TokenUtil } from './app/shared/utils/token.util';
const decoded = TokenUtil.decodeToken(token);
console.log('Token decodificado:', decoded);
```

### Sesión se cierra sola
**Causas:**
- Token expirando demasiado rápido
- Limpieza automática de tokens inválidos

**Verificar expiración:**
```typescript
import { TokenUtil } from './app/shared/utils/token.util';
const timeLeft = TokenUtil.getTimeUntilExpiration();
console.log('Tiempo restante de sesión:', timeLeft, 'minutos');
```

### Token no se envía en peticiones
**Verificar en Network (F12):**
1. Abrir DevTools (F12)
2. Pestaña "Network"
3. Hacer una petición
4. Ver "Request Headers"
5. Buscar `Authorization: Bearer <token>`

**Si no está:**
```typescript
// Verificar que api-client.ts esté importado correctamente
import apiClient from 'src/shared/services/api-client';

// NO usar HttpClient directamente, usar apiClient
```

---

## 🎨 Errores de Iconos

### "Icon has not been provided"
**Ejemplo del error:**
```
ERROR Error: The "database" icon has not been provided by any available icon providers.
```

**Solución:**
1. Identificar el icono faltante (ej: `database`)
2. Ir al módulo correspondiente (ej: `settings.module.ts`)
3. Agregar el import:
```typescript
import { LucideAngularModule, /* otros iconos */, Database } from 'lucide-angular';
```
4. Agregar al pick:
```typescript
LucideAngularModule.pick({
  // ... otros iconos,
  Database
})
```

**Iconos comunes faltantes:**
- `Database` → `import { Database }`
- `Server` → `import { Server }`
- `HardDrive` → `import { HardDrive }`
- `Cpu` → `import { Cpu }`

---

## 🏗️ Problemas de Build

### Error de compilación TypeScript
**Verificar:**
```bash
pnpm run build
```

**Errores comunes:**
- Imports faltantes
- Tipos incorrectos
- Variables no definidas

### Bundle size muy grande
**Verificar:**
```bash
pnpm run analyze
```

**Optimizar:**
- Usar lazy loading
- Tree shaking automático
- Remover dependencias no usadas

---

## 🛠️ Herramientas de Debugging

### Verificar Estado de Autenticación
```typescript
// En consola del navegador (F12)
import { TokenUtil } from './app/shared/utils/token.util';

// Info completa del usuario
const user = TokenUtil.getUserFromToken();
console.table({
  'ID': user?.id,
  'Email': user?.email,
  'Nombre': user?.nombre,
  'Rol': user?.rol,
  'Expiración': new Date(user?.exp * 1000).toLocaleString()
});

// Tiempo restante
const timeLeft = TokenUtil.getTimeUntilExpiration();
console.log(`⏰ Sesión expira en ${timeLeft} minutos`);
```

### Ver Peticiones HTTP en Detalle
```typescript
// api-client.ts ya incluye logs automáticos en desarrollo
// Solo verás los logs si environment.production = false

// Para ver más detalle, ir a:
// DevTools (F12) → Network → Click en petición → Headers/Response
```

### Logs Estructurados del API Client
En modo desarrollo (`environment.production = false`), cada petición HTTP muestra:

```
🔑 Token agregado (expira en 55 min): eyJhbGciOiJIUzI1NiIs...

// Si hay error:
🔴 API Error
├─ Status: 403
├─ URL: /api/eventos/123
├─ Method: POST
├─ Response: { message: "No tienes permisos...", requiredRole: "admin" }
└─ Full Error: [objeto completo]

🚫 Acceso denegado. No tienes permisos para esta acción.
```

---

## 📞 Contacto y Soporte

Si el problema persiste:
1. **Revisar Issues en GitHub**: https://github.com/tu-usuario/TechHub/issues
2. **Crear un nuevo Issue** con:
   - Descripción del problema
   - Pasos para reproducir
   - Screenshots de console (F12)
   - Navegador y versión
3. **Contactar al equipo**: soporte@techhub.com

---

## 🔗 Referencias Útiles

- [Documentación Angular](https://angular.dev)
- [Axios Error Handling](https://axios-http.com/docs/handling_errors)
- [JWT.io](https://jwt.io) - Para decodificar tokens manualmente
- [HTTP Status Codes](https://httpstatuses.com) - Referencia de códigos HTTP

---

**Última actualización:** Noviembre 2024
