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
dev.py                  Servidor local que aplica las reescrituras de vercel.json
vercel.json             Reescrituras para las rutas + caché de assets (Vercel)
_redirects              Lo mismo para Netlify
```

## Cómo verlo en local

```bash
python3 dev.py
# http://localhost:4173
```

Las rutas internas (`/constelaciones`, `/tarot`…) necesitan que el servidor
devuelva `index.html` cuando la ruta no existe como archivo. `vercel.json` y
`_redirects` ya lo hacen en producción; `dev.py` lee ese mismo `vercel.json`
para reproducirlo en local. Con `python3 -m http.server` la navegación por
enlaces funciona, pero recargar una ruta directa da 404.

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

## Servicios y tarifas

Son cuatro, con los precios de España que dio Rosa Elena:

| Acompañamiento | Duración | Modalidad | Precio |
| --- | --- | --- | --- |
| Constelaciones familiares | 90 min | Individual, online o presencial | 90 € |
| Tarot evolutivo | 90 min | Online o presencial | 80 € |
| Meditación guiada | 45–60 min | Solo online | 35 € |
| Acompañamiento de crecimiento personal | 90 min | Online o presencial | 95 € |

Los cuatro tienen página propia y aparecen como tarjetas iguales en
«Acompañamientos», en una rejilla de dos por dos. Hubo una versión intermedia en
la que el cuarto ocupaba una banda ancha bajo los otros tres, por aquello de que
es un proceso y no una disciplina; se descartó porque rompía la simetría sin
ganar nada. Lo que lo distingue ahora es su etiqueta —«Proceso»— en la lista de
tarifas.

Al añadir una página hay que tocar cinco sitios: el `<main data-page="…">` en
`index.html`, `ROUTES` en `assets/js/site.js`, `vercel.json`, `_redirects` y los
enlaces (desplegable de la cabecera, menú móvil y pie).

**Las reescrituras de `vercel.json` van a `/`, no a `/index.html`.** Con
`cleanUrls: true`, Vercel responde 308 en `/index.html` y redirige a `/`, así
que una reescritura cuyo destino sea `/index.html` no resuelve y la ruta acaba
en 404. Estuvo así desde el primer despliegue: en producción, abrir o recargar
`/tarot` daba 404 y solo funcionaba la navegación desde dentro del sitio. En
`_redirects` (Netlify) sí se apunta a `/index.html`, que es lo que espera.

Merece la pena comprobarlo después de cada despliegue, porque en local no se
reproduce:

```bash
for r in / /constelaciones /tarot /meditacion /acompanamiento /contacto; do
  echo "$r $(curl -s -o /dev/null -w '%{http_code}' https://sanarconamor.vercel.app$r)"
done
```

Ella habló de «precio España», lo que da a entender que hay otra tarifa para
Argentina. Como no la tenemos, la sección lo dice en una nota y ofrece
confirmarla por mensaje.

**Los precios viven en tres sitios y hay que cambiarlos en los tres**: la
sección `#sesiones` de `index.html`, el `application/ld+json` de la cabecera
(que es lo que lee Google) y la tabla `SERVICIOS` de `assets/js/site.js`, que
gobierna el paso 1 de la reserva. La clave de esa tabla es el `data-svc` del
botón y el texto que viaja en la solicitud, así que tiene que coincidir
literalmente con el HTML.

## Sistema de reservas

Cuatro pasos dentro de una capa a pantalla completa, igual que el diseño:
acompañamiento → día y hora → datos → confirmación.

- Domingos cerrado, sábados solo por la mañana, nada con menos de 4 h de antelación.
- El calendario navega hasta cuatro meses vista y no ofrece días pasados.
- **La duración y el precio los fija el acompañamiento**, no la persona. Antes
  había un selector de 60/90 minutos: se ha quitado porque cada servicio tiene
  su duración y dejaba elegir combinaciones que no existen. La meditación
  guiada, además, desactiva el botón de «presencial» y explica por qué.
- **Las horas ocupadas son simuladas** con una huella estable por fecha: el mismo
  día muestra siempre los mismos huecos, pero no hay agenda real detrás. Cuando
  haya un Calendly, un Google Calendar o un correo, se sustituye
  `horasDe()` en `assets/js/site.js` por la disponibilidad de verdad.
- **WhatsApp y correo llevan el mensaje ya escrito** en la propia dirección
  (`wa.me/...?text=` y `mailto:...?body=`), así que la persona solo tiene que
  pulsar enviar. Instagram no admite texto en la URL: para ese canal se sigue
  copiando al portapapeles y avisando de que hay que pegarlo.
- Sigue pudiendo descargarse el `.ics` de la cita, con la duración del servicio.

## Pendiente de contenido

- **Dirección presencial** — «pendiente de confirmar» en Contacto y en la
  reserva. Es lo único que queda sin dato.
- **Tarifa para Argentina** — la sección de sesiones dice que se confirma por
  mensaje. Si nos la pasa, entra como segunda columna o como nota por servicio.
- **Resto de fotos propias** — el retrato de Rosa Elena ya es suyo; las demás
  imágenes siguen siendo de stock (Unsplash). Para sustituir una, basta con
  cambiar su `src` y su `alt`.
- **Círculo de constelaciones en grupo** — el aviso de la portada dice «en
  preparación» y recoge interesadas por WhatsApp. Cuando haya fecha, hay que
  ponerla ahí y en el modal.
- **Datos fiscales de Rosa Elena** — ver el apartado siguiente. Es lo que
  bloquea publicar el aviso legal y la privacidad.

## Caché de los recursos

`vercel.json` sirve `/assets` con `Cache-Control: immutable` y un año de
validez, y los archivos no llevan huella en el nombre. **Por eso el `<link>` y
el `<script>` de `index.html` acaban en `?v=` y hay que subir ese número en cada
cambio de `site.css` o `site.js`.** Si no, quien ya haya visitado la web se
queda con la versión vieja durante un año y no ve ningún cambio de estilos. Pasó
una vez y cuesta de diagnosticar, porque el servidor sirve el archivo nuevo
correctamente y el fallo solo se ve en el navegador de quien ya había entrado.

## Mi historia

La capa de «Mi historia» ocupa la pantalla entera (`.historia`), no es un modal
pequeño: retrato fijo a la izquierda con la identidad, el reproductor y el
índice; a la derecha el relato en seis capítulos, con barra de progreso de
lectura arriba y el capítulo en curso iluminado en el índice. Por debajo de
980 px el retrato pasa a ser la portada y el índice se retira.

El reproductor **solo se pinta si existe `assets/audio/mi-historia.mp3`**. El
`<audio>` sale del HTML sin `src`: lo pone el JS la primera vez que se abre la
capa, para no pedir el archivo en cada carga ni dejar un 404 mientras no esté.
Las instrucciones para grabarlo están en `assets/audio/LEEME.md`.

La onda del reproductor son 56 barras de altura fija, calculadas con senos: no
es la forma real del audio, es un dibujo estable. El progreso se ve tapando por
la izquierda con una máscara del color del fondo, así no hay que repintar nada
en cada fotograma.

## Aviso legal y privacidad

Las dos páginas están escritas (`/aviso-legal` y `/privacidad`) pero **no se
enlazan todavía**: faltan tres datos y quedan marcados en rojo con la clase
`.pendiente`.

- Nombre fiscal completo
- NIF o NIE
- Domicilio fiscal

Aparecen seis veces, tres en cada página. En cuanto estén, se sustituyen y se
descomenta el bloque `.footer__legal` del pie, que ya está escrito justo
debajo del copyright.

Son textos estándar de LSSI-CE y RGPD adaptados a este sitio, no un dictamen
jurídico: conviene que los revise alguien de derecho antes de publicarlos. Lo
que sí es exacto es la parte técnica —el sitio no tiene servidor, no usa
cookies ni analítica, y lo único que guarda es el borrador de la reserva en el
almacenamiento local del navegador—, así que la política de privacidad puede
permitirse ser corta y decir la verdad.

## Formularios

No hay backend y no se guarda nada en ningún servidor. Tanto el formulario de
contacto como el paso 4 de la reserva componen el mensaje y lo abren en
WhatsApp o en el gestor de correo con el texto ya puesto. Si algún día se quiere
recibirlos por correo sin salir de la web, hace falta un servicio de formularios
(Formspree, Netlify Forms) o un backend.

## Datos estructurados

La cabecera lleva un `application/ld+json` con el negocio, Rosa Elena y los
cuatro servicios con su precio, para que Google pueda mostrarlos. **Las URL de
ese bloque y la del `<link rel="canonical">` apuntan al dominio de Vercel**: al
contratar el definitivo hay que cambiarlas.

## Imágenes

En `assets/img/` solo va lo que se sirve, al tamaño en que se muestra. Los
originales están en `fuentes/`, fuera del despliegue, para poder rehacer
cualquier recorte.

**Foto del hero** — se sirve con `<picture>` y tres juegos de recortes del
mismo original: 4:5 hasta 700 px, 16:10 hasta 1100 y 16:9 por encima. En
vertical el hueco del hero es casi cuadrado, y con un solo panorámico solo se
vería una franja del centro. El `srcset` evita además que un móvil descargue la
versión de escritorio.

Ojo con una cosa: el contenedor del hero es `.hero-a__media`, no `.media`, así
que necesita su propia línea en la regla que aplica `object-fit: cover`. Sin
ella la imagen se pinta a tamaño natural y solo se ve un trozo ampliado de la
esquina —y no se nota en local si las fotos remotas están bloqueadas, porque
entonces el hueco queda vacío.

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

**Loto de la precarga** — `lotus-mark.png` es solo un canal alfa: sirve de
máscara CSS a las tres capas que rellenan el loto mientras sube el contador. Al
generarlo hay que dejar el fondo en alfa 0 exacto; si el redondeo lo deja en 4,
la máscara deja pasar un rectángulo tenue alrededor del dibujo. Por lo mismo,
esas capas no llevan `filter`: conviene comprobarlas sobre fondo oscuro.

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
