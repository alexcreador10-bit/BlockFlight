---
name: transcribir-clase-larga
description: Transcribe clases, conferencias o videos largos (de 30 min a varias horas) trabajando solo con el audio, en bloques reanudables, y entrega un documento con la transcripción y marcas de tiempo. Úsala siempre que el usuario pida transcribir, pasar a texto, sacar apuntes o subtitular un video/audio largo (mp4, mkv, mov, mp3, m4a, wav), aunque no diga "skill" ni "Whisper". No es para videos de YouTube con subtítulos disponibles (ahí basta la herramienta de transcripción de vidIQ).
---

# Transcribir clase larga

Una clase de horas no cabe en el contexto ni se transcribe de una sola pasada. La solución es hacer el trabajo pesado con un script y leer solo lo necesario. Así el contexto no se llena y, si el proceso se corta, se retoma sin repetir lo hecho.

## Protocolo

1. **Revisa el entorno** (una sola vez): `ffmpeg`, `ffprobe` y `faster-whisper`. Si falta este último, `pip install faster-whisper`. Si la red bloquea la descarga del modelo, díselo al usuario y propón correrlo en su equipo con `scripts/transcribir.py`.
2. **Lanza el script en segundo plano** (una clase larga tarda mucho; no bloquees la sesión):
   ```bash
   python scripts/transcribir.py "<archivo>" --out "<carpeta>" --model small --lang es
   ```
   - El script extrae solo el audio (mono, 16 kHz), lo corta en bloques de ~10 min en los silencios, transcribe cada bloque y guarda un JSON por bloque.
   - Si se interrumpe, vuelve a lanzar el mismo comando: salta los bloques ya hechos.
   - `--model medium` mejora la precisión con vocabulario técnico, pero es más lento. Usa `small` por defecto.
3. **Vigila el progreso** con la salida del script. No relistes ni releas bloques mientras tanto.
4. **Lee solo lo relevante** de `transcripcion.md`, no el archivo entero:
   - `info.json` (duración, bloques, segmentos).
   - Unas pocas líneas del inicio y del final, y una muestra de la mitad, para comprobar idioma, calidad y nombres propios o términos mal escuchados.
   - Los pasajes concretos que el usuario pida (búscalos con grep por palabra clave o por marca de tiempo).
5. **Entrega el documento.** La transcripción completa va en el archivo, no en el chat. Usa el formato que el usuario pida; por defecto, un `.docx` o doc con:
   - Título, fecha, duración y modelo usado.
   - Transcripción con marcas `[HH:MM:SS]`, en párrafos de ~1 minuto.
   - Nota de calidad: términos dudosos que detectaste en la muestra.
   Entrega también `transcripcion.srt` y `.txt` si pueden servirle.
6. **Responde corto**: dónde está el documento, duración total y qué dudas de calidad hay. No pegues la transcripción.

## Reglas de calidad

- Si el usuario no indica idioma, detéctalo con la muestra y repite solo si fue incorrecto.
- No inventes ni "arregles" contenido: corrige solo erratas evidentes y marca lo dudoso con `[¿?]`.
- Si el audio es muy malo o hay varios hablantes, avísalo; Whisper no separa hablantes.
- Un resumen o apuntes de la clase solo si el usuario los pide, y en un documento aparte de la transcripción.
