#!/bin/bash
# Script peluncur otomatis WedSnap untuk macOS
cd "$(dirname "$0")"

# Pastikan path Node.js lokal terdeteksi
export PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"

echo "======================================================"
echo "    ✨ MEMULAI APLIKASI WEDSNAP - WEDDING CAMERA ✨    "
echo "======================================================"
echo ""

# Periksa ketersediaan node
if command -v node >/dev/null 2>&1; then
  echo "✔ Node.js terdeteksi ($(node -v))."
  echo "✔ Menjalankan Vite development server..."
  echo "✔ Membuka browser di http://localhost:3000..."
  
  # Buka browser otomatis dalam 1.5 detik
  (sleep 1.5 && open "http://localhost:3000") &
  
  # Jalankan vite
  npx vite --port 3000 --host
else
  echo "⚠ Node.js tidak ditemukan di PATH terminal saat ini."
  echo "✔ Menjalankan web server cadangan via Python 3..."
  echo "✔ Membuka browser di http://localhost:3000/dist/..."
  
  (sleep 1.5 && open "http://localhost:3000/dist/") &
  python3 -m http.server 3000
fi

