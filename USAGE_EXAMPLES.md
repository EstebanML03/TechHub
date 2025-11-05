# 📘 Ejemplos de Uso - Manejo de Errores y Autenticación

## Índice
- [Uso de TokenUtil](#uso-de-tokenutil)
- [Uso de HttpErrorHandlerService](#uso-de-httperrorhandlerservice)
- [Ejemplos por Módulo](#ejemplos-por-módulo)
- [Patrones Comunes](#patrones-comunes)

---

## 🔑 Uso de TokenUtil

### Importación
```typescript
import { TokenUtil } from './app/shared/utils/token.util';
```

### Verificar Token Válido
```typescript
// En cualquier servicio o componente
const token = TokenUtil.getValidToken();
if (!token) {
  console.log('No hay token válido, redirigir al login');
  this.router.navigate(['/auth']);
  return;
}
```

### Obtener Información del Usuario
```typescript
// Obtener datos del usuario desde el token
const userInfo = TokenUtil.getUserFromToken();
console.log('Usuario actual:', userInfo);
// Output: { id: 1, email: "user@mail.com", nombre: "Juan", rol: "user", exp: 1699... }
```

### Verificar Rol del Usuario
```typescript
// Verificar si el usuario es admin
if (TokenUtil.hasRole('admin')) {
  console.log('El usuario es administrador');
  // Mostrar opciones de admin
}

// En el componente
export class EventosComponent {
  esAdmin(): boolean {
    return TokenUtil.hasRole('admin');
  }
  
  esModerador(): boolean {
    return TokenUtil.hasRole('moderador');
  }
}
```

### Uso en Templates (HTML)
```html
<!-- eventos.html -->
@if (esAdmin()) {
  <button class="btn-danger" (click)="eliminarEvento(evento.id)">
    <lucide-icon name="trash-2"></lucide-icon>
    Eliminar
  </button>
}

@if (esAdmin() || esModerador()) {
  <button class="btn-primary" (click)="editarEvento(evento.id)">
    <lucide-icon name="edit"></lucide-icon>
    Editar
  </button>
}
```

### Verificar Tiempo de Expiración
```typescript
// Verificar cuánto tiempo queda de sesión
const timeLeft = TokenUtil.getTimeUntilExpiration();
console.log(`Sesión expira en ${timeLeft} minutos`);

// Mostrar advertencia si queda poco tiempo
if (timeLeft !== null && timeLeft < 5) {
  this.alertService.warning(
    'Tu sesión está por expirar',
    `Guarda tus cambios. La sesión expira en ${timeLeft} minutos.`
  );
}
```

### Limpiar Sesión Manualmente
```typescript
// En el logout o cuando sea necesario
logout() {
  TokenUtil.clearSession();
  this.alertService.success('Sesión cerrada exitosamente');
  this.router.navigate(['/auth']);
}
```

---

## 🛠️ Uso de HttpErrorHandlerService

### Configuración en el Servicio
```typescript
import { Injectable } from '@angular/core';
import apiClient from 'src/shared/services/api-client';
import { AlertService } from '../../shared/services/alert.service';
import { HttpErrorHandlerService } from '../../shared/services/http-error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class EventosService {
  constructor(
    private alertService: AlertService,
    private errorHandler: HttpErrorHandlerService
  ) {}
  
  // ... métodos del servicio
}
```

### Manejo Básico de Errores
```typescript
async obtenerEventos(): Promise<any[]> {
  try {
    const response = await apiClient.get('/eventos');
    return response.data;
  } catch (error) {
    // El error handler muestra el mensaje apropiado automáticamente
    this.errorHandler.handleError(error, 'obtener los eventos');
    return [];
  }
}
```

### Verificar Permisos Antes de Acción
```typescript
async eliminarEvento(id: number): Promise<boolean> {
  // Verificar permisos primero
  if (!this.errorHandler.checkPermission('admin', 'eliminar eventos')) {
    return false; // Sale sin ejecutar
  }

  try {
    await apiClient.delete(`/eventos/${id}`);
    this.alertService.success('Evento eliminado exitosamente');
    return true;
  } catch (error) {
    this.errorHandler.handleError(error, 'eliminar el evento');
    return false;
  }
}
```

### Manejo Específico de Error 403
```typescript
async crearEvento(evento: Evento): Promise<Evento | null> {
  try {
    const response = await apiClient.post('/eventos', evento);
    this.alertService.success('Evento creado exitosamente');
    return response.data;
  } catch (error: any) {
    // Manejo especial para error 403
    if (error.response?.status === 403) {
      this.errorHandler.handle403(error, 'crear eventos');
    } else {
      this.errorHandler.handleError(error, 'crear el evento');
    }
    return null;
  }
}
```

### Manejo de Diferentes Errores
```typescript
async actualizarEvento(id: number, datos: Partial<Evento>): Promise<boolean> {
  try {
    const response = await apiClient.put(`/eventos/${id}`, datos);
    this.alertService.success('Evento actualizado');
    return true;
  } catch (error: any) {
    const status = error.response?.status;
    
    switch (status) {
      case 403:
        this.errorHandler.handle403(error, 'actualizar eventos');
        break;
      case 404:
        this.alertService.error('Evento no encontrado', 
          'El evento que intentas actualizar ya no existe.');
        break;
      default:
        this.errorHandler.handleError(error, 'actualizar el evento');
    }
    
    return false;
  }
}
```

---

## 📦 Ejemplos por Módulo

### Módulo Eventos

```typescript
// eventos.service.ts
import { Injectable } from '@angular/core';
import apiClient from 'src/shared/services/api-client';
import { AlertService } from '../../shared/services/alert.service';
import { HttpErrorHandlerService } from '../../shared/services/http-error-handler.service';
import { TokenUtil } from '../../shared/utils/token.util';

@Injectable({
  providedIn: 'root'
})
export class EventosService {
  constructor(
    private alertService: AlertService,
    private errorHandler: HttpErrorHandlerService
  ) {}

  async obtenerEventos(filtros?: any): Promise<any> {
    try {
      const response = await apiClient.get('/eventos', { params: filtros });
      return response.data;
    } catch (error) {
      this.errorHandler.handleError(error);
      return { data: [], total: 0 };
    }
  }

  async crearEvento(evento: any): Promise<any> {
    // Verificar permisos primero
    if (!this.errorHandler.checkPermission('admin', 'crear eventos')) {
      return null;
    }

    try {
      const response = await apiClient.post('/eventos', evento);
      this.alertService.success('Evento creado exitosamente');
      return response.data;
    } catch (error) {
      this.errorHandler.handleError(error, 'crear el evento');
      return null;
    }
  }

  async inscribirseEvento(id: number): Promise<boolean> {
    try {
      await apiClient.post(`/eventos/${id}/inscribirse`);
      this.alertService.success('Te has inscrito al evento');
      return true;
    } catch (error: any) {
      if (error.response?.status === 409) {
        this.alertService.warning('Ya inscrito', 
          'Ya estás inscrito en este evento');
      } else {
        this.errorHandler.handleError(error, 'inscribirte al evento');
      }
      return false;
    }
  }

  async eliminarEvento(id: number): Promise<boolean> {
    if (!this.errorHandler.checkPermission('admin', 'eliminar eventos')) {
      return false;
    }

    // Confirmación
    const result = await this.alertService.confirm(
      '¿Eliminar evento?',
      'Esta acción no se puede deshacer',
      'Sí, eliminar'
    );

    if (!result.isConfirmed) return false;

    try {
      await apiClient.delete(`/eventos/${id}`);
      this.alertService.success('Evento eliminado');
      return true;
    } catch (error) {
      this.errorHandler.handleError(error, 'eliminar el evento');
      return false;
    }
  }
}
```

### Módulo Grupos

```typescript
// grupos.service.ts
import { Injectable } from '@angular/core';
import apiClient from 'src/shared/services/api-client';
import { AlertService } from '../../shared/services/alert.service';
import { HttpErrorHandlerService } from '../../shared/services/http-error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class GruposService {
  constructor(
    private alertService: AlertService,
    private errorHandler: HttpErrorHandlerService
  ) {}

  async crearGrupo(grupo: any): Promise<any> {
    try {
      const response = await apiClient.post('/grupos', grupo);
      this.alertService.success('Grupo creado exitosamente');
      return response.data;
    } catch (error) {
      this.errorHandler.handleError(error, 'crear el grupo');
      return null;
    }
  }

  async agregarMiembro(grupoId: number, usuarioId: number, rol: string): Promise<boolean> {
    // Verificar que sea admin o moderador del grupo
    if (!this.errorHandler.checkPermission('admin', 'gestionar miembros')) {
      // También podría ser moderador del grupo específico
      // Esta lógica adicional iría aquí
    }

    try {
      await apiClient.post(`/grupos/${grupoId}/miembros`, { usuarioId, rol });
      this.alertService.success('Miembro agregado al grupo');
      return true;
    } catch (error: any) {
      if (error.response?.status === 403) {
        this.alertService.error(
          'Sin permisos',
          'Solo administradores y moderadores pueden agregar miembros'
        );
      } else if (error.response?.status === 409) {
        this.alertService.warning(
          'Ya es miembro',
          'Este usuario ya pertenece al grupo'
        );
      } else {
        this.errorHandler.handleError(error, 'agregar el miembro');
      }
      return false;
    }
  }

  async cambiarRol(grupoId: number, usuarioId: number, nuevoRol: string): Promise<boolean> {
    if (!this.errorHandler.checkPermission('admin', 'cambiar roles')) {
      return false;
    }

    try {
      await apiClient.put(`/grupos/${grupoId}/miembros/${usuarioId}/rol`, { rol: nuevoRol });
      this.alertService.success('Rol actualizado');
      return true;
    } catch (error: any) {
      if (error.response?.status === 403) {
        this.errorHandler.handle403(error, 'cambiar roles de miembros');
      } else {
        this.errorHandler.handleError(error, 'cambiar el rol');
      }
      return false;
    }
  }
}
```

### Módulo Settings

```typescript
// perfil.service.ts
import { Injectable } from '@angular/core';
import apiClient from 'src/shared/services/api-client';
import { AlertService } from '../../shared/services/alert.service';
import { HttpErrorHandlerService } from '../../shared/services/http-error-handler.service';
import { TokenUtil } from '../../shared/utils/token.util';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  constructor(
    private alertService: AlertService,
    private errorHandler: HttpErrorHandlerService
  ) {}

  async actualizarPerfil(datos: any): Promise<boolean> {
    try {
      const response = await apiClient.put('/perfil', datos);
      this.alertService.success('Perfil actualizado exitosamente');
      
      // Actualizar el currentUser en localStorage si es necesario
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      localStorage.setItem('currentUser', JSON.stringify({
        ...currentUser,
        ...datos
      }));
      
      return true;
    } catch (error) {
      this.errorHandler.handleError(error, 'actualizar el perfil');
      return false;
    }
  }

  async cambiarPassword(data: any): Promise<boolean> {
    try {
      await apiClient.put('/perfil/password', data);
      this.alertService.success(
        'Contraseña actualizada',
        'Tu contraseña ha sido cambiada exitosamente'
      );
      return true;
    } catch (error: any) {
      const status = error.response?.status;
      
      if (status === 400) {
        this.alertService.error(
          'Contraseña actual incorrecta',
          'La contraseña que ingresaste no es correcta'
        );
      } else if (status === 422) {
        this.alertService.error(
          'Contraseña débil',
          'La nueva contraseña no cumple con los requisitos de seguridad'
        );
      } else {
        this.errorHandler.handleError(error, 'cambiar la contraseña');
      }
      
      return false;
    }
  }
}
```

---

## 🎯 Patrones Comunes

### Patrón 1: Verificar Permisos + Confirmar + Ejecutar
```typescript
async eliminarRecurso(id: number): Promise<boolean> {
  // 1. Verificar permisos
  if (!this.errorHandler.checkPermission('admin', 'eliminar recursos')) {
    return false;
  }

  // 2. Confirmar acción
  const result = await this.alertService.confirm(
    '¿Estás seguro?',
    'Esta acción no se puede deshacer',
    'Sí, eliminar'
  );

  if (!result.isConfirmed) return false;

  // 3. Ejecutar
  try {
    await apiClient.delete(`/recursos/${id}`);
    this.alertService.success('Recurso eliminado');
    return true;
  } catch (error) {
    this.errorHandler.handleError(error, 'eliminar el recurso');
    return false;
  }
}
```

### Patrón 2: Loading State + Error Handling
```typescript
// En el componente
async cargarEventos() {
  this.cargando = true;
  
  try {
    this.eventos = await this.eventosService.obtenerEventos(this.filtros);
  } catch (error) {
    this.errorHandler.handleError(error);
    this.eventos = [];
  } finally {
    this.cargando = false;
  }
}
```

### Patrón 3: Validación + API Call + UI Update
```typescript
async guardarCambios() {
  // 1. Validar formulario
  if (this.formulario.invalid) {
    this.alertService.warning('Formulario incompleto', 
      'Por favor completa todos los campos requeridos');
    return;
  }

  this.guardando = true;

  // 2. Llamada a API
  try {
    const resultado = await this.perfilService.actualizarPerfil(this.formulario.value);
    
    if (resultado) {
      // 3. Actualizar UI
      this.modoEdicion = false;
      this.cargarPerfil(); // Recargar datos
    }
  } catch (error) {
    this.errorHandler.handleError(error);
  } finally {
    this.guardando = false;
  }
}
```

### Patrón 4: Retry Logic
```typescript
async obtenerDatosConRetry(intentos = 3): Promise<any> {
  for (let i = 0; i < intentos; i++) {
    try {
      const response = await apiClient.get('/datos-importantes');
      return response.data;
    } catch (error: any) {
      if (i === intentos - 1) {
        // Último intento falló
        this.errorHandler.handleError(error, 'obtener los datos');
        throw error;
      }
      
      // Esperar antes de reintentar
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

---

## 🔍 Debugging en Desarrollo

### Console Logs Automáticos
Con `environment.production = false`, verás logs automáticos:

```typescript
// Cada petición muestra:
🔑 Token agregado (expira en 55 min): eyJhbGciOiJIUzI1NiIs...

// Cada error muestra:
🔴 API Error
├─ Status: 403
├─ URL: /api/eventos/123
├─ Method: POST
├─ Response: { message: "...", requiredRole: "admin" }
└─ Full Error: [objeto completo]
```

### Verificar Estado en Cualquier Momento
```typescript
// Pegar en consola del navegador (F12)
import { TokenUtil } from './app/shared/utils/token.util';

console.table({
  'Token válido': TokenUtil.getValidToken() ? 'Sí' : 'No',
  'Usuario': TokenUtil.getUserFromToken()?.nombre,
  'Email': TokenUtil.getUserFromToken()?.email,
  'Rol': TokenUtil.getUserFromToken()?.rol,
  'Expira en': TokenUtil.getTimeUntilExpiration() + ' min'
});
```

---

**¿Necesitas más ejemplos? Revisa el archivo TROUBLESHOOTING.md**
