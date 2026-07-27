# Grabación de «Mi historia»

La capa de Mi historia enseña un reproductor si encuentra aquí el archivo:

    assets/audio/mi-historia.mp3

Si no existe, el reproductor no se pinta y la capa funciona igual. No hay que
tocar nada en el código para activarlo: basta con dejar el archivo con ese
nombre exacto.

## Lo que hay ahora

La grabación definitiva, subida por el cliente y procesada aquí: 2:24, mono,
44,1 kHz, 96 kbps, 1,7 MB.

Venía a −24,9 LUFS, unos ocho decibelios por debajo de lo habitual, y empezaba
y terminaba de golpe. Lo que se le hizo:

- Normalizado a −16 LUFS con pico real en −1,8 dBTP, que es el estándar de voz
  hablada en web. Sin esto se oía flojo en el móvil.
- Filtro de graves por debajo de 75 Hz, para el retumbe de sala.
- 0,4 s de silencio al principio y 0,8 s al final, para que no arranque ni
  corte en seco.
- Reencodado a 96 kbps mono: venía a 130 y se ahorran 600 KB sin diferencia
  audible en voz hablada.

El original sin tocar está en el historial de git, en el commit «Add files via
upload».

## Si hay que rehacerlo

Con el archivo nuevo en `/tmp/original.mp3`:

```bash
# 1. Medir
ffmpeg -i original.mp3 -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json -f null -

# 2. Aplicar (sustituyendo los measured_* por lo que devuelva el paso 1),
#    pasando por WAV: encadenar adelay detrás de loudnorm sobre MP3 rompe las
#    marcas de tiempo del primer bloque.
ffmpeg -i original.mp3 -ac 1 -ar 44100 -c:a pcm_s16le crudo.wav
ffmpeg -i crudo.wav -af "highpass=f=75,loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=…:measured_TP=…:measured_LRA=…:measured_thresh=…:linear=true" \
  -ac 1 -ar 44100 -c:a pcm_s16le norm.wav

# 3. Aire al principio y al final, y a MP3
ffmpeg -f lavfi -t 0.4 -i anullsrc=r=44100:cl=mono -c:a pcm_s16le sil_ini.wav
ffmpeg -f lavfi -t 0.8 -i anullsrc=r=44100:cl=mono -c:a pcm_s16le sil_fin.wav
printf "file 'sil_ini.wav'\nfile 'norm.wav'\nfile 'sil_fin.wav'\n" > l.txt
ffmpeg -f concat -safe 0 -i l.txt -ac 1 -ar 44100 -b:a 96k mi-historia.mp3
```

Y después, sin falta, **subir dos versiones**:

- el `?v=` de `AUDIO_HISTORIA`, al principio del bloque de reservas de
  `assets/js/site.js`;
- el `?v=` del `<link>` y el `<script>` de `index.html`, para que llegue ese JS.

`/assets` se sirve con un año de caché inmutable. Sin cambiar la dirección del
MP3, quien ya haya escuchado una versión se queda con ella para siempre por
mucho que el archivo del servidor sea otro. Pasó al sustituir la locución
sintética por la grabación real: el servidor daba la nueva y los navegadores
seguían reproduciendo la vieja.

## Locución sintética anterior

Antes de la grabación real hubo una locución con voz sintética femenina
(Seed Audio, voz «Marisol»): siete tramos generados por separado, uno por
capítulo, y unidos después.

```bash
ffmpeg -f concat -safe 0 -i lista.txt \
  -af "loudnorm=I=-16:TP=-1.5:LRA=11,adelay=500|500,apad=pad_dur=0.8" \
  -ac 1 -ar 44100 -b:a 96k mi-historia.mp3
```

Los años se escriben con letra en el texto que se manda al modelo («dos mil
veinticuatro»), porque en cifras los leía mal.

`.vercelignore` no excluye esta carpeta: lo que se deje aquí se publica. Este
archivo sí queda fuera del despliegue.
