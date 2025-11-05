# 🚀 Guía de Deployment en Vercel - TechHub Frontend

## 📋 Pre-requisitos

- ✅ Backend desplegado y funcionando en Vercel
- ✅ CORS configurado en el backend
- ✅ URLs de API actualizadas en `environment.prod.ts`
- ✅ Código sin errores de compilación
- ✅ Cuenta en Vercel (https://vercel.com)

---

## 🌐 Opción 1: Deployment desde GitHub (Recomendado)

### Paso 1: Subir código a GitHub
```bash
git add .
git commit -m "feat: preparar para deployment en Vercel"
git push origin main
```

### Paso 2: Conectar con Vercel

1. Ve a https://vercel.com y haz login
2. Click en **"Add New..."** → **"Project"**
3. Importa tu repositorio de GitHub: `EstebanML03/TechHub`
4. Configura el proyecto:

   **Framework Preset:** Otros (Other)
   
   **Build Command:**
   ```bash
   npm run vercel-build
   ```
   
   **Output Directory:**
   ```
   dist/techhub/browser
   ```
   
   **Install Command:**
   ```bash
   npm install
   ```

### Paso 3: Variables de Entorno (Opcional)

Si usas variables de entorno en Vercel:

```
NODE_ENV=production
```

### Paso 4: Deploy

1. Click en **"Deploy"**
2. Espera 2-3 minutos mientras se construye
3. ¡Tu app estará viva! 🎉

---

## 💻 Opción 2: Deployment con Vercel CLI

### Instalación de Vercel CLI

```bash
npm install -g vercel
```

### Login en Vercel

```bash
vercel login
```

### Deploy en Producción

```bash
# Primero, hacer build local para verificar
npm run build:prod

# Deploy a producción
vercel --prod
```

Sigue las instrucciones en pantalla:
- Set up and deploy? **Y**
- Which scope? Selecciona tu cuenta
- Link to existing project? **N** (primera vez) o **Y** (deployments subsecuentes)
- What's your project's name? **techhub-frontend**
- In which directory is your code located? **./dist/techhub/browser**

---

## ⚙️ Configuración de Vercel (vercel.json)

El proyecto ya incluye `vercel.json` con la configuración optimizada:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist/techhub/browser"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

---

## 🔧 Configuración del Proyecto

### Build Settings en Vercel Dashboard

Si configuras desde el Dashboard:

| Setting | Value |
|---------|-------|
| Framework Preset | Other |
| Build Command | `npm run vercel-build` |
| Output Directory | `dist/techhub/browser` |
| Install Command | `npm install` |
| Node Version | 18.x o 20.x |

---

## 🧪 Verificar Build Local

Antes de desplegar, prueba el build localmente:

```bash
# Build de producción
npm run build:prod

# Verificar que no hay errores
echo $?  # Debe ser 0

# Ver el tamaño del bundle
ls -lh dist/techhub/browser/

# Servir localmente (necesitas un servidor HTTP)
npx http-server dist/techhub/browser -p 8080
```

Abre http://localhost:8080 y verifica que todo funciona.

---

## 🌍 Configurar Dominio Personalizado (Opcional)

### En Vercel Dashboard:

1. Ve a tu proyecto
2. **Settings** → **Domains**
3. Agrega tu dominio: `techhub.com`
4. Sigue las instrucciones para configurar DNS

### Actualizar CORS en Backend

Después de configurar el dominio, actualiza el backend para permitir tu nuevo dominio:

```javascript
// En tu backend
const corsOptions = {
  origin: [
    'http://localhost:4200',
    'https://techhub-frontend.vercel.app',  // Dominio de Vercel
    'https://techhub.com',                  // Tu dominio personalizado
    'https://www.techhub.com'
  ],
  credentials: true
};
```

---

## 📊 URLs de Producción

Una vez desplegado:

- **Frontend:** `https://techhub-frontend.vercel.app` (o tu dominio personalizado)
- **Backend:** `https://tech-hub-proyecto-pedag-gico-integr.vercel.app/api`

---

## 🔄 Redespliegue Automático

Vercel redesplegará automáticamente cuando:
- Hagas push a la rama `main`
- Hagas push a cualquier rama (preview deployments)

### Ver Deployments:

```bash
vercel ls
```

### Ver Logs:

```bash
vercel logs [deployment-url]
```

---

## 🐛 Troubleshooting

### Error: "Build failed"

**Solución:**
```bash
# Limpia cache local
rm -rf node_modules dist
npm install
npm run build:prod
```

Si funciona localmente, el problema puede ser:
- Node version diferente en Vercel
- Variables de entorno faltantes

### Error: "Page not found" al navegar

**Causa:** Angular routing requiere que todas las rutas redirijan a `index.html`

**Solución:** Ya está configurado en `vercel.json`:
```json
{
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Error de CORS en producción

**Solución:** Agrega la URL de Vercel al backend:
```javascript
origin: [
  'https://tu-app.vercel.app',  // ← Agregar esto
  'http://localhost:4200'
]
```

### Bundle size muy grande

**Verificar:**
```bash
npm run build:prod
ls -lh dist/techhub/browser/
```

**Optimizar:**
- Vercel ya hace tree-shaking automático
- Angular hace lazy loading de módulos
- El bundle inicial debe ser ~500KB

---

## ✅ Checklist Pre-Deployment

- [ ] Build local funciona sin errores (`npm run build:prod`)
- [ ] Backend en Vercel funciona y tiene CORS configurado
- [ ] `environment.prod.ts` tiene la URL correcta de la API
- [ ] No hay console.logs innecesarios en producción
- [ ] Todas las imágenes y assets están optimizados
- [ ] README.md actualizado con URLs de producción
- [ ] .gitignore incluye `dist/` y `node_modules/`

---

## 📈 Después del Deployment

### 1. Verificar que funciona:

- [ ] Página principal carga correctamente
- [ ] Login funciona
- [ ] Navegación entre módulos funciona
- [ ] API responde correctamente
- [ ] No hay errores en la consola del navegador (F12)

### 2. Performance:

Verifica el performance con Lighthouse:
```bash
npx lighthouse https://tu-app.vercel.app --view
```

Meta: Score > 90 en Performance

### 3. Monitoreo:

Vercel provee:
- **Analytics**: Estadísticas de visitas
- **Speed Insights**: Performance real de usuarios
- **Logs**: Errores y warnings

---

## 🔗 Links Útiles

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Documentación Vercel**: https://vercel.com/docs
- **Angular Deployment**: https://angular.dev/tools/cli/deployment
- **Vercel CLI**: https://vercel.com/docs/cli

---

## 💡 Tips

1. **Preview Deployments**: Cada branch tiene su propia URL de preview
2. **Rollback**: Puedes volver a deployments anteriores desde el Dashboard
3. **Environment Variables**: Se pueden agregar sin redeployment (Settings → Environment Variables)
4. **Custom Headers**: Ya configurados en `vercel.json` para caching
5. **HTTPS**: Vercel provee HTTPS automático y gratuito

---

## 🎉 ¡Listo!

Tu aplicación TechHub está lista para producción en Vercel.

**Próximos pasos:**
1. Deploy con `vercel --prod`
2. Compartir la URL con tu equipo
3. Monitorear analytics y performance
4. Continuar desarrollando en branches y usar preview deployments

¿Problemas? Revisa `TROUBLESHOOTING.md` o contacta al equipo.
