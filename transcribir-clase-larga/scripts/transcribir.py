#!/usr/bin/env python3
"""Transcribe una clase larga (video o audio) en bloques, con progreso reanudable.

Uso:
  python transcribir.py ENTRADA --out CARPETA [--model small] [--lang es] [--chunk-min 10]

Genera en CARPETA:
  audio.mp3            audio mono 16 kHz (el video no se usa más)
  chunks/NNN.mp3       bloques cortados en silencios
  chunks/NNN.json      transcripción de cada bloque (permite reanudar)
  transcripcion.md     texto con marcas de tiempo [HH:MM:SS]
  transcripcion.txt    texto corrido sin marcas
  transcripcion.srt    subtítulos
  info.json            duración, nº de bloques, modelo, idioma
"""
import argparse, json, re, subprocess, sys
from pathlib import Path


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def duration(path):
    r = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "default=nw=1:nk=1", str(path)])
    return float(r.stdout.strip())


def extract_audio(src, dst):
    if dst.exists():
        return
    r = run(["ffmpeg", "-y", "-i", str(src), "-vn", "-ac", "1", "-ar", "16000",
             "-c:a", "libmp3lame", "-b:a", "48k", str(dst)])
    if r.returncode:
        sys.exit("ffmpeg falló al extraer audio:\n" + r.stderr[-800:])


def silences(audio):
    r = run(["ffmpeg", "-i", str(audio), "-af", "silencedetect=noise=-35dB:d=0.6",
             "-f", "null", "-"])
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", r.stderr)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", r.stderr)]
    return [(s + e) / 2 for s, e in zip(starts, ends)]  # punto medio de cada silencio


def cut_points(total, target, sil):
    """Corta cerca de cada `target` s, en el silencio más próximo (±60 s)."""
    pts, t = [0.0], target
    while t < total - 30:
        near = [s for s in sil if abs(s - t) <= 60]
        c = min(near, key=lambda s: abs(s - t)) if near else t
        pts.append(c)
        t = c + target
    pts.append(total)
    return pts


def split(audio, pts, outdir):
    outdir.mkdir(exist_ok=True)
    files = []
    for i in range(len(pts) - 1):
        f = outdir / f"{i:03d}.mp3"
        files.append((f, pts[i]))
        if f.exists():
            continue
        r = run(["ffmpeg", "-y", "-ss", str(pts[i]), "-to", str(pts[i + 1]),
                 "-i", str(audio), "-c", "copy", str(f)])
        if r.returncode:
            sys.exit("ffmpeg falló al cortar:\n" + r.stderr[-800:])
    return files


def ts(sec, srt=False):
    h, m, s = int(sec // 3600), int(sec % 3600 // 60), sec % 60
    return f"{h:02d}:{m:02d}:{int(s):02d},{int(s % 1 * 1000):03d}" if srt else f"{h:02d}:{m:02d}:{int(s):02d}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("entrada")
    ap.add_argument("--out", required=True)
    ap.add_argument("--model", default="small")
    ap.add_argument("--lang", default="es")
    ap.add_argument("--chunk-min", type=float, default=10)
    a = ap.parse_args()

    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    audio = out / "audio.mp3"
    print("1/4 extrayendo audio...", flush=True)
    extract_audio(Path(a.entrada), audio)
    total = duration(audio)

    print("2/4 dividiendo en bloques...", flush=True)
    pts = cut_points(total, a.chunk_min * 60, silences(audio))
    files = split(audio, pts, out / "chunks")

    print(f"3/4 transcribiendo {len(files)} bloques ({a.model})...", flush=True)
    from faster_whisper import WhisperModel
    model = None
    for n, (f, offset) in enumerate(files, 1):
        j = f.with_suffix(".json")
        if j.exists():
            print(f"  bloque {n}/{len(files)}: ya hecho", flush=True)
            continue
        if model is None:
            try:
                model = WhisperModel(a.model, device="cpu", compute_type="int8")
            except Exception as e:
                sys.exit(f"No se pudo cargar el modelo '{a.model}' (¿sin acceso a huggingface.co?): {e}\n"
                         "Corre el script en un equipo con internet; el audio y los bloques ya quedaron en la carpeta de salida.")
        segs, _ = model.transcribe(str(f), language=a.lang, vad_filter=True,
                                   condition_on_previous_text=False)
        data = [{"start": offset + s.start, "end": offset + s.end, "text": s.text.strip()}
                for s in segs]
        j.write_text(json.dumps(data, ensure_ascii=False))
        print(f"  bloque {n}/{len(files)} listo", flush=True)

    print("4/4 uniendo...", flush=True)
    segs = []
    for f, _ in files:
        segs += json.loads(f.with_suffix(".json").read_text())
    md, txt, srt = [], [], []
    for i, s in enumerate(segs, 1):
        md.append(f"[{ts(s['start'])}] {s['text']}")
        txt.append(s["text"])
        srt.append(f"{i}\n{ts(s['start'], True)} --> {ts(s['end'], True)}\n{s['text']}\n")
    (out / "transcripcion.md").write_text("\n\n".join(md), encoding="utf-8")
    (out / "transcripcion.txt").write_text(" ".join(txt), encoding="utf-8")
    (out / "transcripcion.srt").write_text("\n".join(srt), encoding="utf-8")
    (out / "info.json").write_text(json.dumps(
        {"duracion_s": total, "bloques": len(files), "modelo": a.model,
         "idioma": a.lang, "segmentos": len(segs)}, indent=2))
    print(f"Listo: {out}/transcripcion.md ({len(segs)} segmentos, {ts(total)})")


if __name__ == "__main__":
    main()
