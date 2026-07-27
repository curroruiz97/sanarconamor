#!/usr/bin/env python3
"""Servidor local que imita el comportamiento de Vercel.

A diferencia de `python3 -m http.server`, aquí sí se pueden recargar o abrir
directamente /constelaciones, /tarot, /meditacion y /contacto: las reescrituras
de vercel.json se aplican igual que en producción.

    python3 dev.py          # http://localhost:4173
    python3 dev.py 8080     # otro puerto
"""

import json
import os
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

RAIZ = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(RAIZ, "vercel.json"), encoding="utf-8") as f:
    CONFIG = json.load(f)

REESCRITURAS = {r["source"]: r["destination"] for r in CONFIG.get("rewrites", [])}


class Handler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        limpio = path.split("?", 1)[0].split("#", 1)[0].rstrip("/") or "/"
        if limpio in REESCRITURAS:
            path = REESCRITURAS[limpio]
        return super().translate_path(path)

    def end_headers(self):
        # Sin caché en local: cada recarga trae la última versión del archivo.
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()

    def log_message(self, formato, *args):
        sys.stderr.write("  %s\n" % (formato % args))


if __name__ == "__main__":
    puerto = int(sys.argv[1]) if len(sys.argv) > 1 else 4173
    handler = partial(Handler, directory=RAIZ)
    servidor = ThreadingHTTPServer(("0.0.0.0", puerto), handler)
    rutas = ", ".join(sorted(REESCRITURAS)) or "ninguna"
    print(f"Sanar con Amor en http://localhost:{puerto}")
    print(f"Rutas reescritas: {rutas}")
    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        print("\nParado.")
