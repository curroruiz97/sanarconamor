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

```
index.html            Las cinco páginas, los modales y el sistema de reservas
assets/
  css/site.css        Sistema visual: paleta, tipografía, componentes
  js/site.js          Precarga, rutas, revelados, parallax y reservas
  img/                Solo lo que se sirve: loto, iconos y retratos
fuentes/              Originales a tamaño completo, para regenerar recortes
favicon.ico           Icono del sitio (el loto sobre verde)
robots.txt            Directivas para buscadores
vercel.json           Reescrituras, cabeceras de seguridad y caché
_redirects            Lo mismo, para Netlify
.vercelignore         Deja fuera del despliegue las fuentes y la documentación
SITIO.md              Notas de implementación y lo que queda pendiente
```

Las cinco páginas viven en un solo HTML y se muestran u ocultan al navegar, sin
recargar, conservando la transición de cortina. Cada una tiene su propia
dirección y su propio título.

Las imágenes de `assets/img/` están ajustadas al tamaño en que se muestran. Los
originales viven en `fuentes/` y no se publican: si hace falta rehacer un
recorte o un icono, se parte de ahí.

## Antes del dominio definitivo

Sustituir las fotos de stock por fotografías propias de Rosa Elena y confirmar
tarifas, dirección presencial y correo —ahora marcados como provisionales—,
además de la política de privacidad, el aviso legal y los datos del titular.
El detalle está en [`SITIO.md`](SITIO.md).
