# Sanar con Amor — sitio implementado

Implementación del diseño hecho en Claude Design como sitio estático listo para
publicar. Sin build, sin dependencias: se sube tal cual.

## Estructura

```
index.html              Todas las páginas (inicio + 4 páginas) y las capas superpuestas
assets/css/site.css     Sistema visual completo: paleta, tipografía, componentes
assets/js/site.js       Precarga, rutas, revelados, parallax y sistema de reservas
assets/img/             Imágenes servidas, ya ajustadas a su tamaño de uso
fuentes/                Originales a tamaño completo (no se despliegan)
vercel.json             Reescrituras para las rutas + caché de assets (Vercel)
_redirects              Lo mismo para Netlify
```

## Cómo verlo en local

```bash
python3 -m http.server 4173
# http://localhost:4173
```

Las rutas internas (`/constelaciones`, `/tarot`…) necesitan que el servidor
devuelva `index.html` cuando la ruta no existe como archivo. `vercel.json` y
`_redirects` ya lo hacen; con `http.server` funciona la navegación por enlaces,
pero recargar una ruta directa dará 404 en local.

## Decisiones de implementación

- **Sin framework.** El diseño es una sola pieza con mucho movimiento y poca
  lógica de datos: HTML + CSS + un JS sin dependencias reproduce el resultado
  exacto y se despliega en cualquier hosting.
- **Rutas reales con `history.pushState`.** El cambio de página conserva la
  cortina del diseño, pero ahora `/constelaciones` y compañía son direcciones
  compartibles, con botón atrás funcionando y su propio `<title>`. Las cinco
  páginas viven en el mismo HTML y se muestran u ocultan con `hidden`.
- **Estilos en hojas, no en línea.** Los estilos incrustados del prototipo se
  han trasladado a un sistema de tokens y componentes, conservando cada valor
  (tamaños, `clamp()`, colores, duraciones y retardos de animación).
- **`image-slot` → `<img>`.** El componente del editor se ha sustituido por
  imágenes normales con `object-fit: cover`. Los distintivos de crédito que
  mostraba el prototipo se han retirado: la licencia de Unsplash permite el uso
  comercial sin atribución, así que son opcionales.
- **Tarjetas clicables sin anidar enlaces.** En el prototipo, las tarjetas de
  acompañamiento eran un `<a>` que envolvía otros enlaces, lo que es HTML
  inválido. Ahora la tarjeta es un contenedor y el enlace del título cubre toda
  su superficie. El aviso del círculo sigue el mismo patrón.
- **Accesibilidad.** Enlace para saltar al contenido, `aria-expanded` en el
  desplegable, el menú y las preguntas frecuentes, textos alternativos
  descriptivos, foco visible y respeto por `prefers-reduced-motion`.

## Sistema de reservas

Cuatro pasos dentro de una capa a pantalla completa, igual que el diseño:
acompañamiento → día y hora → datos → confirmación.

- Domingos cerrado, sábados solo por la mañana, nada con menos de 4 h de antelación.
- El calendario navega hasta cuatro meses vista y no ofrece días pasados.
- **Las horas ocupadas son simuladas** con una huella estable por fecha: el mismo
  día muestra siempre los mismos huecos, pero no hay agenda real detrás. Cuando
  haya un Calendly, un Google Calendar o un correo, se sustituye
  `horasDe()` en `assets/js/site.js` por la disponibilidad de verdad.
- La confirmación copia la solicitud al portapapeles, abre Instagram o Facebook
  y permite descargar el `.ics` de la cita.

## Pendiente de contenido

Marcado así en el diseño y conservado tal cual:

- **Precios reales** — hoy dice «tarifa provisional» en la sección «Sesiones».
- **Dirección presencial** — «pendiente de confirmar» en Contacto y en la reserva.
- **Correo electrónico** — «pendiente de confirmar» en la lista de canales.
- **Resto de fotos propias** — el retrato de Rosa Elena ya es suyo; las demás
  imágenes siguen siendo de stock (Unsplash). Para sustituir una, basta con
  cambiar su `src` y su `alt`.
- **Formulario de contacto** — es una maqueta, como en el diseño: el botón lleva
  a Instagram. Para que llegue por correo hace falta un servicio de formularios
  (Formspree, Netlify Forms) o un backend.

## Imágenes

En `assets/img/` solo va lo que se sirve, al tamaño en que se muestra. Los
originales están en `fuentes/`, fuera del despliegue, para poder rehacer
cualquier recorte.

**Retrato de Rosa Elena** — de `fuentes/rosa-elena.jpg` (1200×1600) salen:

- `rosa-elena.jpg` / `.webp` — 1000 px de ancho, para «Sobre mí» y la ficha
  ampliada. Se sirven con `<picture>`: WebP a quien lo admita, JPEG al resto.
- `rosa-elena-avatar.jpg` — recorte cuadrado de 200 px centrado en el rostro,
  para el hueco de 84 px del panel de la reserva. Cargar ahí la foto completa
  era desperdiciar unos 230 KB.

**Loto de la marca** — de `fuentes/lotus-*.png` (884×579) salen las versiones de
120 px de alto que usa la cabecera, que lo pinta a 40 px (29 en móvil). Los
originales pesaban 200 KB cada uno para eso.

**Iconos** — `favicon.ico` y `assets/img/favicon-*.png` se generan componiendo
`fuentes/lotus-claro.png` sobre el verde `#3A4234`.

## Detalles del diseño no incluidos

- La **variante B del hero** (titular partido en dos columnas) era una opción del
  panel de ajustes de Claude Design. El sitio publica la variante A, que es la
  que estaba activa. Su maquetación sigue disponible en el archivo original por
  si quieres cambiarla.
- Los interruptores del editor para ocultar el aviso o las tarifas no tienen
  sentido en producción: ambas secciones están visibles.

## Comprobado

Recorrido automatizado con Chromium sobre las cinco páginas: navegación y botón
atrás, precarga, revelados al hacer scroll, cabecera clara/oscura sobre el hero,
preguntas frecuentes, los dos modales, menú móvil y el flujo de reserva completo
—validación incluida— hasta la descarga del `.ics`. Sin errores de consola ni
desbordes horizontales a 390 px de ancho.
