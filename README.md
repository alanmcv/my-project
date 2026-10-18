# my-project – Frontend de productos

Frontend en Next.js (exportación estática) desplegado en Firebase Hosting. Consume la API de productos desplegada en Render.

- **Frontend en producción:** https://test2-9f047.web.app
- **API (backend):** https://backendupbtest-gp4v.onrender.com ([repositorio](https://github.com/alanmcv/backendUpbtest))

> El backend está en el plan gratis de Render: si estaba dormido, la primera carga puede tardar ~1 minuto.

## Funcionalidades

- Tarjetas con el resumen del inventario: productos, unidades, valor total y agotados.
- Tabla de productos con búsqueda por nombre, filtro por categoría y "solo agotados" (combinables).
- Crear y editar productos en una ventana modal (nombre, descripción, precio, stock, categoría).
- Gestión de categorías: agregar, renombrar y eliminar.
- Indicador de conexión con la API, notificaciones, modo oscuro automático y diseño adaptable a celular.

| Archivo | Qué hace |
|---|---|
| `app/api.ts` | URL de la API, tipos y función `api()` para hacer las peticiones |
| `app/productos.tsx` | Panel principal: resumen, filtros y tabla |
| `app/producto-form.tsx` | Modal para crear/editar un producto |
| `app/categorias-dialog.tsx` | Modal para gestionar categorías |
| `app/ui.tsx` | Estilos e iconos compartidos |

## Correr en local

```bash
npm install
npm run dev
```

Por defecto usa la API de Render. Para usar el backend local, crea `.env.local` con:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

(Si el backend ya ocupa el puerto 3000, Next.js levanta el frontend en el 3001.)

## Despliegue

Cada push a `main` ejecuta `.github/workflows/firebase-hosting-merge.yml`: construye el sitio (`out/`) y lo publica en Firebase Hosting.
