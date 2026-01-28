# 🚀 Guía de Deployment - Dashboard Responsivo

## Antes de Deployer

### 1. Verificar Compilación
```bash
npm run build
```
✅ Verifica que no haya errores
✅ Comprueba que el tamaño de bundle sea aceptable

### 2. Verificar en Producción Local
```bash
npm run preview
```
✅ Abre http://localhost:4173/
✅ Prueba en DevTools en diferentes resoluciones

### 3. Limpiar Caché
```bash
# Windows
rmdir /s /q node_modules
npm install

# macOS/Linux
rm -rf node_modules
npm install
```

---

## Recomendaciones de Hosting

### Para Vercel (Recomendado)
```bash
npm i -g vercel
vercel
```

**Ventajas:**
- ✅ Despliegue automático desde Git
- ✅ HTTPS automático
- ✅ CDN global
- ✅ Zero-config

### Para Netlify
1. Conecta tu repositorio
2. Build command: `npm run build`
3. Publish directory: `dist`

### Para tu propio servidor
```bash
npm run build
# Copia la carpeta 'dist' a tu servidor web
# Configura tu servidor para servir index.html en todas las rutas
```

---

## Configuración de Headers

### Para Vercel (vercel.json)
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600, s-maxage=3600"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Para Netlify (_redirects)
```
/* /index.html 200
```

### Para Nginx
```nginx
server {
  listen 80;
  server_name tu-dominio.com;

  location / {
    try_files $uri /index.html;
  }

  # Cache estático
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

### Para Apache
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## Optimizaciones de Producción

### 1. Comprimir Assets
```bash
# Verificar tamaño
npm run build
```

### 2. Optimizar Imágenes
- SVG para iconos ✅ (ya hecho)
- WebP para fotos (si aplica)
- Lazy loading para imágenes

### 3. Minificar CSS/JS
```bash
# Vite lo hace automáticamente con npm run build
```

### 4. Código Splitting
```bash
# Vite ya implementa code splitting automático
```

---

## Seguridad

### Headers de Seguridad

1. **Content-Security-Policy**
```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
font-src 'self';
```

2. **X-Content-Type-Options**: nosniff
3. **X-Frame-Options**: SAMEORIGIN
4. **X-XSS-Protection**: 1; mode=block

### Variables de Entorno

Crear archivo `.env.production`:
```
VITE_API_URL=https://tu-api.com
VITE_ENVIRONMENT=production
```

### Validación de Input

✅ Ya implementado en componentes:
- Validación de email en login
- Validación de números en precios
- Trim de strings en productos

---

## Monitoreo en Producción

### Google Analytics
```tsx
import { useEffect } from 'react';

export function useAnalytics() {
  useEffect(() => {
    // Configurar analytics
    window.gtag?.('config', 'GA_ID');
  }, []);
}
```

### Error Tracking (Sentry)
```bash
npm install @sentry/react
```

### Performance Monitoring
```tsx
// Ver Core Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

---

## Checklist Pre-Deployment

- [ ] `npm run build` sin errores
- [ ] `npm run preview` funciona correctamente
- [ ] DevTools - no hay warnings/errors
- [ ] Testing en múltiples navegadores
- [ ] Testing en múltiples dispositivos
- [ ] Performance Audit en Lighthouse ✅
- [ ] SEO Audit en Lighthouse ✅
- [ ] Accessibility Audit ✅
- [ ] Best Practices Audit ✅
- [ ] Variables de entorno configuradas
- [ ] HTTPS habilitado
- [ ] CORS configurado correctamente
- [ ] Rate limiting implementado
- [ ] Backups configurados
- [ ] Monitoreo activo

---

## Lighthouse Audit Expectations

Con esta configuración responsiva esperas:

| Métrica | Target |
|---------|--------|
| Performance | > 90 |
| Accessibility | > 95 |
| Best Practices | > 90 |
| SEO | > 90 |

---

## Estructura de Carpetas para Producción

```
dashboard-heladeria/
├── dist/                 # Compilado (generado por npm run build)
├── src/
│   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── App.tsx
│   ├── styles/
│   └── main.tsx
├── package.json
├── vite.config.ts
├── tsconfig.json
├── RESPONSIVE_DESIGN.md  # Documentación
├── TESTING_GUIDE.md      # Guía de testing
└── DEPLOYMENT_GUIDE.md   # Este archivo
```

---

## Variables de Entorno

### Desarrollo
```
VITE_API_URL=http://localhost:3000
VITE_DEBUG=true
```

### Producción
```
VITE_API_URL=https://api.heladeria.com
VITE_DEBUG=false
```

---

## Versiones Recomendadas

```json
{
  "node": "18.0.0+",
  "npm": "9.0.0+",
  "react": "18.2.0+",
  "typescript": "5.0.0+"
}
```

---

## Rollback Plan

Si algo sale mal:

```bash
# Revert a último commit
git revert HEAD

# O restaurar versión anterior
git checkout <hash-anterior>
npm install
npm run build
```

---

## Post-Deployment Checks

1. ✅ Verificar que el sitio carga
2. ✅ Verificar que todos los assets se cargan
3. ✅ Probar login
4. ✅ Probar navegación
5. ✅ Probar en móvil
6. ✅ Verificar localStorage funciona
7. ✅ Revisar console.log para errores
8. ✅ Verificar performance metrics
9. ✅ Revisar logs de servidor

---

## Performance Optimization Tips

### Para CSS
- ✅ Tailwind purga CSS no usado en `npm run build`
- ✅ Mediaquery CSS está optimizado

### Para JavaScript
- ✅ React lazy loading (si agregas routing)
- ✅ Suspense boundaries para async components
- ✅ Memoization con React.memo si es necesario

### Para Assets
- ✅ SVG icons son pequeños y escalables
- ✅ No hay imágenes sin optimizar
- ✅ Fonts están optimizadas

### Para Network
- ✅ Gzip compression automático en la mayoría de hosts
- ✅ CDN para assets estáticos
- ✅ Cache headers configurados

---

## Troubleshooting

### 404 en refresh
```
Configurar servidor para servir index.html en todas las rutas
```

### CSS/JS no carga
```
Verificar rutas en vite.config.ts
Verificar CORS headers
Limpiar caché del navegador
```

### Mobile view no funciona
```
Verificar que useIsMobile.ts está importado
Verificar meta viewport en index.html
Forzar reload en móvil (Ctrl+Shift+R)
```

### Performance lento
```
Revisar Lighthouse Performance
Revisar Network tab para archivos grandes
Implementar code splitting
Usar CDN para assets
```

---

## Documentación Adicional

- 📖 [RESPONSIVE_DESIGN.md](RESPONSIVE_DESIGN.md) - Cambios técnicos
- 📱 [TESTING_GUIDE.md](TESTING_GUIDE.md) - Guía de testing
- 🎨 [README.md](README.md) - Documentación general

---

**Última actualización:** 28 Enero 2026  
**Versión:** 1.0  
**Estado:** ✅ LISTO PARA PRODUCCIÓN
