# 🔧 Configuración de CORS para Backend (Express.js)

## Problema
```
falta la cabecera CORS 'Access-Control-Allow-Origin'
```

## Solución Rápida

### 1. Instalar el paquete CORS
```bash
npm install cors
# o
yarn add cors
```

### 2. Configurar CORS en tu archivo principal (app.js / server.js / index.js)

```javascript
const express = require('express');
const cors = require('cors');

const app = express();

// ========================================
// CONFIGURACIÓN DE CORS (AGREGAR ESTO)
// ========================================

// Opción 1: Permitir TODOS los orígenes (solo para desarrollo/pruebas)
app.use(cors());

// Opción 2: Permitir orígenes específicos (RECOMENDADO para producción)
const corsOptions = {
  origin: [
    'http://localhost:4200',           // Angular development
    'http://localhost:3000',           // Otras apps locales
    'https://tu-frontend.vercel.app',  // Tu frontend en Vercel cuando lo despliegues
  ],
  credentials: true,  // Permitir cookies y headers de autenticación
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// ========================================
// TUS RUTAS NORMALES
// ========================================

app.use(express.json());

// ... resto de tu código
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/eventos', eventosRoutes);
// etc...

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
```

### 3. Si usas rutas separadas, también configura CORS ahí:

```javascript
// En cada archivo de rutas (usuarios.routes.js, eventos.routes.js, etc.)
const router = express.Router();

// Permitir preflight requests (OPTIONS)
router.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// ... tus rutas normales
```

---

## 🚀 Para Vercel específicamente

### Opción 1: Archivo `vercel.json`

Crea o modifica `vercel.json` en la raíz de tu backend:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "index.js"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Credentials", "value": "true" },
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
        { "key": "Access-Control-Allow-Headers", "value": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" }
      ]
    }
  ]
}
```

### Opción 2: Variables de Entorno en Vercel

1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Environment Variables
3. Agrega:
   ```
   ALLOWED_ORIGINS=http://localhost:4200,https://tu-frontend.vercel.app
   ```

4. Úsalo en tu código:
   ```javascript
   const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
   
   const corsOptions = {
     origin: function (origin, callback) {
       if (!origin || allowedOrigins.indexOf(origin) !== -1) {
         callback(null, true);
       } else {
         callback(new Error('Not allowed by CORS'));
       }
     },
     credentials: true
   };
   
   app.use(cors(corsOptions));
   ```

---

## 🧪 Verificar que funciona

### 1. Después de configurar CORS, redespliega en Vercel:

```bash
# Si usas Git
git add .
git commit -m "feat: configurar CORS"
git push

# Vercel detectará el push y redesplegarā automáticamente
```

### 2. Prueba desde el navegador:

Abre la consola (F12) y ejecuta:

```javascript
fetch('https://tech-hub-proyecto-pedag-gico-integrador-td-4ut6csvjf.vercel.app/api/usuarios/login', {
  method: 'OPTIONS',
  headers: {
    'Origin': 'http://localhost:4200',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'Content-Type'
  }
})
.then(response => {
  console.log('Status:', response.status);
  console.log('Headers:', [...response.headers.entries()]);
})
.catch(err => console.error('Error:', err));
```

Deberías ver:
```
Status: 200
Headers: [
  ['access-control-allow-origin', 'http://localhost:4200'],
  ['access-control-allow-methods', 'GET,POST,PUT,DELETE'],
  ...
]
```

---

## 📋 Checklist de Configuración CORS

- [ ] Instalar paquete `cors` en el backend
- [ ] Configurar `app.use(cors(options))` en el archivo principal
- [ ] Agregar `http://localhost:4200` a la lista de orígenes permitidos
- [ ] Configurar `credentials: true` para permitir autenticación
- [ ] Permitir métodos: GET, POST, PUT, DELETE, OPTIONS
- [ ] Permitir headers: Content-Type, Authorization
- [ ] Crear/actualizar `vercel.json` con headers CORS
- [ ] Redeploy en Vercel
- [ ] Probar desde el frontend que funciona

---

## ⚠️ Nota Importante

**NO uses `origin: '*'` en producción** si necesitas autenticación con cookies o tokens en headers, porque no funciona con `credentials: true`.

En producción, siempre especifica los dominios exactos:
```javascript
origin: [
  'https://techhub-frontend.vercel.app',
  'https://www.techhub.com'
]
```

---

## 🔍 Debugging

Si después de configurar CORS sigue sin funcionar:

1. **Revisa los logs de Vercel**:
   - Ve a Vercel Dashboard → Tu proyecto → Deployments
   - Click en el último deployment
   - Ve a "Runtime Logs"

2. **Verifica las variables de entorno**:
   ```bash
   # En el backend, imprime las variables
   console.log('ALLOWED_ORIGINS:', process.env.ALLOWED_ORIGINS);
   ```

3. **Prueba la configuración de CORS**:
   ```bash
   curl -H "Origin: http://localhost:4200" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS \
        https://tech-hub-proyecto-pedag-gico-integrador-td-4ut6csvjf.vercel.app/api/usuarios/login \
        -v
   ```

---

**Resumen**: Tu backend necesita el middleware `cors` configurado para permitir peticiones desde `localhost:4200`. Esto es un problema del **backend**, no del frontend.
