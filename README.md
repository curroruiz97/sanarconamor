# Sanar con Amor

Web de **Sanar con Amor** — Rosa Elena Palomino, coach espiritual y consteladora
familiar. Estática, sin build y sin dependencias: se publica desde GitHub en Vercel.

## Desarrollo local

```bash
npx serve .
# o bien
python3 -m http.server 4173
```

Abrir `index.html` con doble clic no funciona: las rutas de los archivos son
absolutas (`/assets/…`). Hay que servir la carpeta.

## Despliegue en Vercel

1. Importa el repositorio `curroruiz97/sanarconamor` en Vercel.
2. Selecciona **Other** como framework preset.
3. Deja vacíos Build Command y Output Directory.
4. Pulsa **Deploy**.

No necesita variables de entorno. `vercel.json` ya incluye las cabeceras de
seguridad, la caché de los assets y las reescrituras que hacen falta para que
`/constelaciones`, `/tarot`, `/meditacion` y `/contacto` funcionen al recargar o
al abrirlas directamente. En Netlify, eso mismo lo cubre `_redirects`.

## Estructura

- `index.html`: las cinco páginas, los modales y el sistema de reservas.
- `assets/css/site.css`: sistema visual completo (paleta, tipografía, componentes).
- `assets/js/site.js`: precarga, rutas, revelados, parallax y reservas.
- `assets/img/`: logotipo de loto, en tinta oscura y en crema.
- `favicon.ico` y `assets/img/favicon-*.png`: icono del sitio (el loto sobre verde).
- `robots.txt`: directivas para buscadores.
- `vercel.json`, `_redirects`: configuración de despliegue.
- `SITIO.md`: notas de implementación, decisiones y lo que queda pendiente.

Las cinco páginas viven en un solo HTML y se muestran u ocultan al navegar, sin
recargar, conservando la transición de cortina. Cada una tiene su propia
dirección y su propio título.

## Antes del dominio definitivo

Sustituir las fotos de stock por fotografías propias de Rosa Elena y confirmar
tarifas, dirección presencial y correo —ahora marcados como provisionales—,
además de la política de privacidad, el aviso legal y los datos del titular.
El detalle está en [`SITIO.md`](SITIO.md).
