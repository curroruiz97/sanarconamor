# Grabación de «Mi historia»

La capa de Mi historia enseña un reproductor si encuentra aquí el archivo:

    assets/audio/mi-historia.mp3

Si no existe, el reproductor no se pinta y la capa funciona igual. No hay que
tocar nada en el código para activarlo: basta con dejar el archivo con ese
nombre exacto.

## Lo que hay ahora

Una locución con voz sintética femenina (modelo Seed Audio, voz «Marisol»),
generada a partir del mismo texto que se lee en pantalla. Dura 2:32, mono,
96 kbps, 1,8 MB. Está normalizada a −16 LUFS y montada en siete tramos, uno por
capítulo, con casi un segundo de silencio entre ellos para que respire.

Por eso el rótulo del reproductor dice **«Escucha mi historia»** y no «en mi
voz»: la página no debe dar a entender que esa voz es la de Rosa Elena.

## Lo que debería haber

La voz de Rosa Elena leyendo su propia historia. Es media hora de trabajo y
vale más que cualquier locución: en una web que va de acompañamiento personal,
su voz es parte de lo que se ofrece.

- MP3, mono, 96–128 kbps. Cuatro minutos pesan unos 3 MB, razonable en móvil.
- Grabar con el móvil cerca de la boca en una habitación con cortinas, sofá o
  alfombra suena mejor que un micro caro en una habitación vacía.
- Dejar un segundo de silencio al principio y al final.
- Sustituir este archivo por el suyo y cambiar el rótulo a «Escúchala en mi
  voz» en `index.html` (buscar `player__label`).

## Cómo se montó la locución actual

Siete tramos generados por separado —uno por capítulo— y unidos después:

```bash
ffmpeg -f concat -safe 0 -i lista.txt \
  -af "loudnorm=I=-16:TP=-1.5:LRA=11,adelay=500|500,apad=pad_dur=0.8" \
  -ac 1 -ar 44100 -b:a 96k mi-historia.mp3
```

Los años se escriben con letra en el texto que se manda al modelo («dos mil
veinticuatro»), porque en cifras los leía mal.

`.vercelignore` no excluye esta carpeta: lo que se deje aquí se publica. Este
archivo sí queda fuera del despliegue.
