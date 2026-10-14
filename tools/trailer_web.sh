#!/bin/sh
# Трейлер для сайта из мастера: два ролика (ru, en) и заставка.
#
#   sh tools/trailer_web.sh <мастер_ru.mp4> <мастер_en.mp4> <номер_кадра_заставки>
#
# Пишет trailer/snowops-trailer-{ru,en}.mp4 и
# assets/img/real/trailer-poster-v5-{1600,800}.webp, в конце печатает размеры
# для ссылки «скачать трейлер (MP4, N МБ)» в index.html и en/index.html.
#
# Ролик: картинка мастера как есть (1920x804, 2.39:1), H.264 High@4.0 в два
# прохода на 3.5 Мбит/с (~28 МБ на 61 с), AAC 160k, faststart — играет в
# Safari/iOS. Перед кодированием — лёгкий hqdn3d: зерно грейда иначе съедает
# битрейт, а с шумодавом лица и мелкие детали резче при том же размере
# (сравнение кадров 2026-10-14: мастер / без шумодава / с ним / 1600x670).
#
# Кадр заставки — номер кадра в русском мастере (30 к/с: секунды x 30), без
# титров: картинка ru и en одна и та же. Сменился кадр — поправить
# aria-label у <video> в обоих index.html.
set -eu

RU="$1"; EN="$2"; FRAME="$3"
ROOT=$(cd "$(dirname "$0")/.." && pwd)
WORK=$(mktemp -d /tmp/snowops-trailer-web.XXXXXX)
VF="hqdn3d=1.5:1.5:6:6"
X264="-c:v libx264 -preset slow -profile:v high -level:v 4.0 -pix_fmt yuv420p -b:v 3500k -maxrate 7000k -bufsize 10000k -g 60 -keyint_min 30 -x264-params aq-mode=3"

enc() {
  log="$WORK/$(basename "$2" .mp4)"
  # shellcheck disable=SC2086
  ffmpeg -hide_banner -loglevel error -y -i "$1" -vf "$VF" $X264 -pass 1 -passlogfile "$log" -an -f mp4 /dev/null
  # shellcheck disable=SC2086
  ffmpeg -hide_banner -loglevel error -y -i "$1" -vf "$VF" $X264 -pass 2 -passlogfile "$log" \
    -c:a aac -b:a 160k -ar 48000 -movflags +faststart "$2"
}

enc "$RU" "$ROOT/trailer/snowops-trailer-ru.mp4" & PID_RU=$!
enc "$EN" "$ROOT/trailer/snowops-trailer-en.mp4" & PID_EN=$!
wait "$PID_RU"
wait "$PID_EN"

ffmpeg -hide_banner -loglevel error -y -i "$RU" -vf "select=eq(n\,$FRAME)" -frames:v 1 -fps_mode passthrough "$WORK/poster.png"
for W in 1600 800; do
  ffmpeg -hide_banner -loglevel error -y -i "$WORK/poster.png" -vf "scale=$W:-1:flags=lanczos" "$WORK/poster-$W.png"
  cwebp -quiet -q 80 -m 6 "$WORK/poster-$W.png" -o "$ROOT/assets/img/real/trailer-poster-v5-$W.webp"
done

for L in ru en; do
  F="$ROOT/trailer/snowops-trailer-$L.mp4"
  B=$(wc -c < "$F" | tr -d ' ')
  echo "$L: $B байт = $(( (B + 500000) / 1000000 )) МБ, $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$F") с"
done
ls -l "$ROOT"/assets/img/real/trailer-poster-v5-*.webp
rm -rf "$WORK"
