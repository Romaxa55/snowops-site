#!/usr/bin/env python3
"""Генерация картинок для сайта и сторов через Alibaba Model Studio token plan.

Ключ берётся из ~/.qwen/settings.json (env.BAILIAN_TOKEN_PLAN_API_KEY).
Работает нативный эндпоинт multimodal-generation; OpenAI-style /images/generations
на token plan отдаёт 404 (проверено 2026-09-08).

Использование:
  python3 tools/qwen_image.py                       # всё из tools/image_manifest.json, пропуская готовые
  python3 tools/qwen_image.py --only shot-02 shot-03
  python3 tools/qwen_image.py --force --only og     # перегенерить
  python3 tools/qwen_image.py --dry-run             # только показать, что будет сделано
  python3 tools/qwen_image.py --model wan2.7-image-pro --only shot-02
"""
import argparse
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HOST = "https://token-plan.ap-southeast-1.maas.aliyuncs.com"
ENDPOINT = f"{HOST}/api/v1/services/aigc/multimodal-generation/generation"

STYLE = (
    "Photoreal game key art, cold blue night palette, heavy snowfall and wind, "
    "snowbound military base beyond the Arctic circle, concrete bunkers with frost, "
    "steel radio tower with a blinking red beacon, one warm sodium lamp, "
    "late-90s stealth shooter mood, cinematic 35mm look, film grain, no text, no logos, no watermark"
)
NEGATIVE = "text, letters, logo, watermark, UI, HUD, cartoon, anime, daylight, summer, neon, sci-fi armor, deformed hands, extra limbs, blurry"


def load_key() -> str:
    path = os.path.expanduser("~/.qwen/settings.json")
    with open(path, encoding="utf-8") as fh:
        cfg = json.load(fh)
    key = cfg.get("env", {}).get("BAILIAN_TOKEN_PLAN_API_KEY")
    if not key:
        sys.exit("нет BAILIAN_TOKEN_PLAN_API_KEY в ~/.qwen/settings.json")
    return key


def generate(key: str, model: str, prompt: str, size: str) -> str:
    body = {
        "model": model,
        "input": {"messages": [{"role": "user", "content": [{"text": prompt}]}]},
        "parameters": {"size": size, "n": 1, "prompt_extend": True, "watermark": False,
                       "negative_prompt": NEGATIVE},
    }
    req = urllib.request.Request(
        ENDPOINT,
        data=json.dumps(body).encode(),
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=240) as resp:
            data = json.load(resp)
    except urllib.error.HTTPError as exc:
        raise RuntimeError(f"HTTP {exc.code}: {exc.read().decode('utf-8', 'ignore')[:400]}") from exc
    try:
        return data["output"]["choices"][0]["message"]["content"][0]["image"]
    except (KeyError, IndexError) as exc:
        raise RuntimeError(f"неожиданный ответ: {json.dumps(data)[:400]}") from exc


def postprocess(src_png: str, item: dict) -> None:
    """Конвертирует/кадрирует через ffmpeg согласно полю outputs."""
    for out in item["outputs"]:
        dst = os.path.join(ROOT, out["path"])
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        vf = out.get("vf", "")
        cmd = ["ffmpeg", "-loglevel", "error", "-y", "-i", src_png]
        if vf:
            cmd += ["-vf", vf]
        if dst.endswith(".webp"):
            cmd += ["-c:v", "libwebp", "-quality", str(out.get("quality", 84))]
        elif dst.endswith(".jpg"):
            cmd += ["-q:v", str(out.get("q", 3))]
        cmd.append(dst)
        subprocess.run(cmd, check=True)
        print(f"   -> {out['path']}")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--manifest", default=os.path.join(ROOT, "tools", "image_manifest.json"))
    ap.add_argument("--only", nargs="*", default=None, help="id элементов манифеста")
    ap.add_argument("--model", default="qwen-image-2.0-pro")
    ap.add_argument("--force", action="store_true", help="перегенерить даже если файлы есть")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    with open(args.manifest, encoding="utf-8") as fh:
        manifest = json.load(fh)

    raw_dir = os.path.join(ROOT, "raw")
    os.makedirs(raw_dir, exist_ok=True)
    key = None if args.dry_run else load_key()

    for item in manifest["items"]:
        if args.only and item["id"] not in args.only:
            continue
        done = all(os.path.exists(os.path.join(ROOT, o["path"])) for o in item["outputs"])
        if done and not args.force:
            print(f"[skip] {item['id']}: уже есть")
            continue
        prompt = f"{item['prompt']} {STYLE}"
        print(f"[gen ] {item['id']}  {item['size']}  {args.model}")
        if args.dry_run:
            print("       ", prompt[:160], "...")
            continue
        for attempt in (1, 2):
            try:
                t0 = time.time()
                url = generate(key, args.model, prompt, item["size"])
                raw = os.path.join(raw_dir, f"{item['id']}.png")
                urllib.request.urlretrieve(url, raw)
                print(f"       {time.time() - t0:.0f}s, raw -> raw/{item['id']}.png")
                postprocess(raw, item)
                break
            except Exception as exc:  # noqa: BLE001
                print(f"       попытка {attempt} не удалась: {exc}")
                if attempt == 2:
                    print(f"[fail] {item['id']}")
                time.sleep(3)


if __name__ == "__main__":
    main()
