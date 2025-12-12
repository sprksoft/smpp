@echo off
setlocal enabledelayedexpansion

REM === Create output folder ===
set "outdir=optimized"
if not exist "%outdir%" mkdir "%outdir%"

REM === Loop through all JPG files ===
for %%f in (*.jpg *.jpeg) do (
    echo Processing: %%f

    REM === Convert and compress ===
    magick "%%f" ^
        -resize "2560x1440>" ^
        -strip ^
        -interlace Plane ^
        -quality 85 ^
        "%outdir%\%%~nf.jpg"
)

echo.
echo Done! Optimized images saved in "%outdir%".
pause
