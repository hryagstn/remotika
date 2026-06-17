@echo off
:: Batch script untuk push perubahan Remotika secara cepat menggunakan alias SSH hryagstn

echo ====================================================
echo   Remotika Git Push Helper (hryagstn Profile)
echo ====================================================
echo.

:: Cek status Git
echo [1/4] Memeriksa status repositori...
git status -s
echo.

:: Stage all files
echo [2/4] Menambahkan semua perubahan ke staging...
git add .
echo.

:: Masukkan pesan komit
set /p commit_msg="Masukkan pesan komit (kosongkan untuk default 'chore: update'): "
if "%commit_msg%"=="" set commit_msg=chore: update

echo.
echo [3/4] Melakukan komit perubahan...
git commit -m "%commit_msg%"
echo.

:: Ambil remote origin
echo [4/4] Memverifikasi remote dan mengirim ke GitHub...
git remote -v
echo.

echo Mengirim perubahan ke origin main...
git push origin main

echo.
echo ====================================================
echo   Proses Push Selesai!
echo ====================================================
pause
