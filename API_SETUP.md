# 🔌 Configuración de API - TechHub

## ⚠️ ¡IMPORTANTE! Error de CORS Detectado

**Si ves este error:**
```
falta la cabecera CORS 'Access-Control-Allow-Origin'
```

**👉 El backend en Vercel necesita configurar CORS. Ver `CORS_SETUP.md` para instrucciones completas.**

Tu frontend está configurado correctamente. El problema está en el **backend** que no permite peticiones desde `http://localhost:4200`.

---

## 📡 URLs de la API

### API en Vercel (Producción)
```
https://tech-hub-proyecto-pedag-gico-integrador-td-4ut6csvjf.vercel.app/api
```

### API Local (Desarrollo)
```
http://localhost:5000/api
```

---

## ⚙️ Cómo Cambiar entre APIs

### Opción 1: Modificar `environment.ts` (Recomendado para desarrollo)

**Para usar API de Vercel:**
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  API_BASE_URL: 'https://tech-hub-proyecto-pedag-gico-integrador-td-4ut6csvjf.vercel.app/api'
};
```

**Para usar API Local:**
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  API_BASE_URL: 'http://localhost:5000/api'
};
```

### Opción 2: Archivo `.env` (Si usas variables de entorno)

**Para usar API de Vercel:**
```bash
API_BASE_URL=https://tech-hub-proyecto-pedag-gico-integrador-td-4ut6csvjf.vercel.app/api
```

**Para usar API Local:**
```bash
API_BASE_URL=http://localhost:5000/api
```

---

## 🧪 Probar la API

### Método 1: Script de Node.js
```bash
node test-api.js
```

Este script prueba automáticamente todos los endpoints principales:
- ✅ Health check
- ✅ Eventos
- ✅ Emprendimientos
- ✅ Publicaciones
- ✅ Grupos
- ✅ Usuarios

### Método 2: cURL (Terminal)
```bash
# Probar endpoint base
curl https://tech-hub-proyecto-pedag-gico-integrador-td-4ut6csvjf.vercel.app/api

# Probar eventos
curl https://tech-hub-proyecto-pedag-gico-integrador-td-4ut6csvjf.vercel.app/api/eventos

# Probar con headers
curl -H "Content-Type: application/json" \
  https://tech-hub-proyecto-pedag-gico-integrador-td-4ut6csvjf.vercel.app/api/eventos
```

### Método 3: Navegador
Abre directamente en el navegador:
```
https://tech-hub-proyecto-pedag-gico-integrador-td-4ut6csvjf.vercel.app/api/eventos
```

### Método 4: Desde la App Angular
1. Inicia el servidor de desarrollo:
   ```bash
   pnpm start
   ```
2. Abre la aplicación en `http://localhost:4200`
3. Abre DevTools (F12) → Console
4. Intenta hacer login o cargar datos
5. Verás los logs de las peticiones HTTP

---

## 🔍 Verificar Conexión

### En la Consola del Navegador (F12):

```javascript
// Probar fetch directo
fetch('https://tech-hub-proyecto-pedag-gico-integrador-td-4ut6csvjf.vercel.app/api/eventos')
  .then(res => res.json())
  .then(data => console.log('Eventos:', data))
  .catch(err => console.error('Error:', err));
```

### Ver los logs automáticos en desarrollo:

Con `environment.production = false`, la aplicación mostrará logs automáticos:

```
🔑 Token agregado (expira en 55 min): eyJhbGciOiJIUzI1NiIs...
📡 GET https://tech-hub-proyecto-pedag-gico-integrador-td-4ut6csvjf.vercel.app/api/eventos
✅ 200 OK - 15 eventos encontrados
```

---

## 🚨 Problemas Comunes

### Error: CORS (Cross-Origin Resource Sharing)

**Síntoma:**
```
Access to fetch at '...' from origin 'http://localhost:4200' has been blocked by CORS policy
```

**Solución:**
El backend en Vercel debe tener configurado CORS. Verifica que tu API tenga:

```javascript
// En el backend (Express.js)
const cors = require('cors');
app.use(cors({
  origin: ['http://localhost:4200', 'https://tu-frontend.vercel.app'],
  credentials: true
}));
```

### Error: 404 Not Found

**Síntoma:**
```
404 - Cannot GET /api/eventos
```

**Verificar:**
1. ¿La URL es correcta? (debe incluir `/api`)
2. ¿El endpoint existe en el backend?
3. ¿Vercel desplegó correctamente el backend?

**Probar en navegador:**
```
https://tech-hub-proyecto-pedag-gico-integrador-td-4ut6csvjf.vercel.app/api/eventos
```

### Error: 401 Unauthorized

**Síntoma:**
```
401 - Unauthorized
```

**Solución:**
- Verifica que el token JWT sea válido
- Revisa que el backend acepte el formato del token
- Usa TokenUtil para verificar el token:

```typescript
import { TokenUtil } from './app/shared/utils/token.util';
const user = TokenUtil.getUserFromToken();
console.log('Usuario:', user);
```

### Error: 500 Internal Server Error

**Síntoma:**
```
500 - Internal Server Error
```

**Solución:**
- Revisa los logs de Vercel
- Verifica que la base de datos esté conectada
- Confirma que todas las variables de entorno estén configuradas en Vercel

---

## 📊 Endpoints Disponibles

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/verify` - Verificar token

### Eventos
- `GET /api/eventos` - Listar eventos
- `GET /api/eventos/:id` - Detalle de evento
- `POST /api/eventos` - Crear evento (requiere auth)
- `PUT /api/eventos/:id` - Actualizar evento (requiere auth)
- `DELETE /api/eventos/:id` - Eliminar evento (requiere auth)
- `POST /api/eventos/:id/inscribirse` - Inscribirse a evento

### Emprendimientos
- `GET /api/emprendimientos` - Listar emprendimientos
- `GET /api/emprendimientos/:id` - Detalle
- `POST /api/emprendimientos` - Crear (requiere auth)
- `PUT /api/emprendimientos/:id` - Actualizar (requiere auth)
- `DELETE /api/emprendimientos/:id` - Eliminar (requiere auth)

### Blog/Publicaciones
- `GET /api/publicaciones` - Listar publicaciones
- `GET /api/publicaciones/:id` - Detalle con comentarios
- `POST /api/publicaciones` - Crear publicación (requiere auth)
- `PUT /api/publicaciones/:id` - Actualizar (requiere auth)
- `DELETE /api/publicaciones/:id` - Eliminar (requiere auth)

### Grupos
- `GET /api/grupos` - Listar grupos
- `GET /api/grupos/:id` - Detalle de grupo
- `POST /api/grupos` - Crear grupo (requiere auth)
- `PUT /api/grupos/:id` - Actualizar (requiere auth)
- `DELETE /api/grupos/:id` - Eliminar (requiere auth)
- `POST /api/grupos/:id/unirse` - Unirse a grupo

### Comunidad
- `GET /api/usuarios` - Listar miembros
- `GET /api/usuarios/:id` - Ver perfil

### Perfil
- `GET /api/perfil` - Obtener perfil (requiere auth)
- `PUT /api/perfil` - Actualizar perfil (requiere auth)
- `PUT /api/perfil/password` - Cambiar contraseña (requiere auth)

---

## 🔐 Autenticación

Todas las peticiones autenticadas deben incluir el header:
```
Authorization: Bearer <tu-token-jwt>
```

El sistema lo hace automáticamente si tienes un token guardado en localStorage.

---

## 📝 Notas Importantes

1. **Cambios no requieren rebuild**: Solo reinicia el servidor de desarrollo
   ```bash
   # Ctrl+C para detener
   pnpm start  # Reiniciar
   ```

2. **CORS debe estar configurado** en el backend de Vercel

3. **Verifica que tu API en Vercel esté activa**: Abre la URL en el navegador

4. **Los logs solo aparecen en desarrollo** (`environment.production = false`)

5. **Para producción**, usa `environment.prod.ts`

---

## ✅ Checklist de Configuración

- [ ] API desplegada en Vercel
- [ ] CORS configurado en el backend
- [ ] Variables de entorno actualizadas
- [ ] Script de prueba ejecutado (`node test-api.js`)
- [ ] Endpoints probados en navegador
- [ ] Login funciona desde la app
- [ ] Tokens JWT se guardan correctamente

---

**¿Dudas?** Revisa `TROUBLESHOOTING.md` para más ayuda.
