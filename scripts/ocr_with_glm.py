#!/usr/bin/env python3
"""
OCR all BioChemistry_2026-05_Page_*.png in this folder using a local
LM Studio server (OpenAI-compatible API at http://localhost:1234/v1).

Run on the Mac that has LM Studio running:
    python3 ocr_with_glm.py

Optional overrides:
    MODEL=glm-4v-9b python3 ocr_with_glm.py
    LMS_URL=http://localhost:1234/v1 python3 ocr_with_glm.py

Outputs (written next to this script):
    pages_text/BioChemistry_2026-05_Page_NN.txt   (one per page)
    BioChemistry_2026-05_OCR.md                   (combined Markdown)
"""

import base64
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
PAGES_DIR = HERE / "pages_text"
COMBINED_MD = HERE / "BioChemistry_2026-05_OCR.md"

LMS_URL = os.environ.get("LMS_URL", "http://localhost:1234/v1").rstrip("/")
MODEL_OVERRIDE = os.environ.get("MODEL")
TIMEOUT = int(os.environ.get("TIMEOUT", "300"))  # seconds per page

PROMPT = (
    "You are an expert OCR system. The page below is a scan of biology notes that "
    "may contain a mix of HANDWRITTEN and PRINTED text, plus diagrams.\n\n"
    "Transcribe the page faithfully. Rules:\n"
    "1. Output ONLY the transcribed content as clean Markdown. No preamble, no commentary, "
    "no 'Here is the transcription'.\n"
    "2. Preserve reading order top-to-bottom, left-to-right. Use headings if the page has them.\n"
    "3. For printed text: transcribe exactly.\n"
    "4. For handwriting: transcribe what you can read. Mark unclear words as [?] and "
    "wholly illegible passages as [illegible].\n"
    "5. For diagrams, figures, or sketches: insert an italicized description in brackets, e.g. "
    "*[Diagram: a labeled cell membrane with arrows pointing to the phospholipid bilayer]*.\n"
    "6. Preserve lists, numbering, equations, and any underlining (use **bold** for underlined "
    "text). Keep arrows as -> and approximate symbols (α, β, °, etc.) when present.\n"
    "7. If the page is blank or only shows a page number, output exactly: [blank page]."
)


def http_json(method, url, payload=None, timeout=TIMEOUT):
    data = None
    headers = {"Content-Type": "application/json"}
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, method=method, headers=headers)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def list_models():
    try:
        body = http_json("GET", f"{LMS_URL}/models", timeout=15)
    except Exception as e:
        sys.exit(f"ERROR: could not reach {LMS_URL}/models -- is LM Studio running and the server enabled?\n  {e}")
    return [m.get("id", "") for m in body.get("data", []) if m.get("id")]


def pick_model(models):
    if MODEL_OVERRIDE:
        if MODEL_OVERRIDE not in models:
            print(f"WARN: MODEL='{MODEL_OVERRIDE}' is not in /v1/models. Sending it anyway.")
        return MODEL_OVERRIDE
    # Prefer something that looks vision-capable. LM Studio doesn't always flag it,
    # so we score by name.
    def score(name):
        n = name.lower()
        s = 0
        for kw in ("glm-4v", "glm-4.5v", "glm4v", "glm-vision"):
            if kw in n: s += 100
        for kw in ("vision", "-vl", "vl-", "llava", "qwen2-vl", "qwen-vl", "minicpm-v", "internvl", "cogvlm"):
            if kw in n: s += 30
        if "embed" in n or "embedding" in n: s -= 1000
        return s
    if not models:
        sys.exit("ERROR: LM Studio reports zero loaded models. Load a vision model in LM Studio first.")
    ranked = sorted(models, key=score, reverse=True)
    best = ranked[0]
    if score(best) <= 0:
        print("WARN: no obviously vision-capable model in the list. Falling back to:", best)
        print("      If OCR fails, load a GLM-4V (or other vision) model and retry, or set MODEL=...")
    return best


def encode_image(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode("ascii")


def ocr_page(model, png_path):
    b64 = encode_image(png_path)
    payload = {
        "model": model,
        "messages": [{
            "role": "user",
            "content": [
                {"type": "text", "text": PROMPT},
                {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{b64}"}},
            ],
        }],
        "temperature": 0.1,
        "max_tokens": 4096,
        "stream": False,
    }
    body = http_json("POST", f"{LMS_URL}/chat/completions", payload)
    return body["choices"][0]["message"]["content"].strip()


def main():
    PAGES_DIR.mkdir(exist_ok=True)
    pngs = sorted(HERE.glob("BioChemistry_2026-05_Page_*.png"))
    if not pngs:
        sys.exit(f"ERROR: no BioChemistry_2026-05_Page_*.png in {HERE}")

    print(f"LM Studio URL : {LMS_URL}")
    models = list_models()
    print(f"Models present: {len(models)}")
    for m in models:
        print(f"  - {m}")
    model = pick_model(models)
    print(f"Using model   : {model}")
    print(f"Pages to OCR  : {len(pngs)}")
    print()

    results = []  # list of (page_num, text)
    for png in pngs:
        page_num = int(png.stem.rsplit("_", 1)[-1])
        out_txt = PAGES_DIR / f"{png.stem}.txt"
        if out_txt.exists() and out_txt.stat().st_size > 0:
            print(f"[{page_num:02d}/18] cached -> {out_txt.name}")
            text = out_txt.read_text(encoding="utf-8")
        else:
            t0 = time.time()
            print(f"[{page_num:02d}/18] OCRing {png.name} ...", end="", flush=True)
            try:
                text = ocr_page(model, png)
            except urllib.error.HTTPError as e:
                err_body = e.read().decode("utf-8", errors="replace")
                print(f"\n  HTTP {e.code}: {err_body[:500]}")
                sys.exit(1)
            except Exception as e:
                print(f"\n  ERROR: {e}")
                sys.exit(1)
            dt = time.time() - t0
            print(f" done ({dt:0.1f}s, {len(text)} chars)")
            out_txt.write_text(text, encoding="utf-8")
        results.append((page_num, text))

    # Combined Markdown
    with open(COMBINED_MD, "w", encoding="utf-8") as f:
        f.write("# BioChemistry 2026-05 — OCR Transcript\n\n")
        f.write(f"_Source: 18 scanned pages in `{HERE.name}/`._  \n")
        f.write(f"_Model: `{model}` via LM Studio._\n\n")
        f.write("---\n\n")
        for page_num, text in results:
            f.write(f"## Page {page_num:02d}\n\n")
            f.write(text.strip() + "\n\n")
            f.write("---\n\n")
    print()
    print(f"Wrote combined transcript -> {COMBINED_MD}")
    print(f"Per-page text files       -> {PAGES_DIR}/")


if __name__ == "__main__":
    main()
