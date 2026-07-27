# Sanar con Amor

Web de **Sanar con Amor** — Rosa Elena Palomino, coach espiritual y consteladora
familiar. Estática, sin build y sin dependencias: se publica desde GitHub en Vercel.

## Desarrollo local

```bash
python3 dev.py
# http://localhost:4173
```

`dev.py` lee las reescrituras de `vercel.json`, así que `/constelaciones`,
`/tarot`, `/meditacion` y `/contacto` también funcionan al recargarlas o al
abrirlas directamente, igual que en producción. Con `python3 -m http.server`
esas rutas dan 404 al recargar.

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

```
index.html            Las cinco páginas, los modales y el sistema de reservas
assets/
  css/site.css        Sistema visual: paleta, tipografía, componentes
  js/site.js          Precarga, rutas, revelados, parallax y reservas
  img/                Solo lo que se sirve: loto, iconos y retratos
fuentes/              Originales a tamaño completo, para regenerar recortes
dev.py                Servidor local con las reescrituras de Vercel
favicon.ico           Icono del sitio (el loto sobre verde)
robots.txt            Directivas para buscadores
vercel.json           Reescrituras, cabeceras de seguridad y caché
_redirects            Lo mismo, para Netlify
.vercelignore         Deja fuera del despliegue las fuentes y la documentación
SITIO.md              Notas de implementación y lo que queda pendiente
```

## Datos de contacto y tarifas

Están en tres sitios y hay que cambiarlos en los tres a la vez:

- **`index.html`** — la sección `#sesiones` (tarifas visibles), el `<script
  type="application/ld+json">` de la cabecera (los mismos precios para Google),
  el pie, la página de contacto y el menú móvil.
- **`assets/js/site.js`** — la tabla `SERVICIOS` y las constantes `WHATSAPP`,
  `CORREO` e `INSTAGRAM`, al principio del bloque de reservas.

El detalle de qué gobierna cada cosa está en [`SITIO.md`](SITIO.md).

Las cinco páginas viven en un solo HTML y se muestran u ocultan al navegar, sin
recargar, conservando la transición de cortina. Cada una tiene su propia
dirección y su propio título.

Las imágenes de `assets/img/` están ajustadas al tamaño en que se muestran. Los
originales viven en `fuentes/` y no se publican: si hace falta rehacer un
recorte o un icono, se parte de ahí.

## Antes del dominio definitivo

Sustituir las fotos de stock por fotografías propias de Rosa Elena, confirmar
la dirección presencial —lo único que sigue marcado como provisional—, redactar
la política de privacidad y el aviso legal, y cambiar la base de las URL de los
datos estructurados y del `<link rel="canonical">`, que hoy apuntan al dominio
de Vercel. El detalle está en [`SITIO.md`](SITIO.md).
