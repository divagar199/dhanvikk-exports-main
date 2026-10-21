Add-Type -AssemblyName System.Drawing

$srcLogoPath = "c:\Users\divag\Desktop\dhanvikk-2\dhanvikk-brand-logo.png"
if (-not (Test-Path $srcLogoPath)) {
    $srcLogoPath = "c:\Users\divag\Desktop\dhanvikk-2\mobile\assets\logo.png"
}

$logo = [System.Drawing.Image]::FromFile($srcLogoPath)

$resDir = "c:\Users\divag\Desktop\dhanvikk-2\mobile\android\app\src\main\res"

# Densities for standard launcher icons
$densities = @{
    "mipmap-mdpi"    = @{ legacy = 48;  foreground = 108 }
    "mipmap-hdpi"    = @{ legacy = 72;  foreground = 162 }
    "mipmap-xhdpi"   = @{ legacy = 96;  foreground = 216 }
    "mipmap-xxhdpi"  = @{ legacy = 144; foreground = 324 }
    "mipmap-xxxhdpi" = @{ legacy = 192; foreground = 432 }
}

function Create-Square-Icon([System.Drawing.Image]$source, [int]$size) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # Clear with white background
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.FillRectangle($brush, 0, 0, $size, $size)
    $brush.Dispose()

    # Draw logo centered with 12% padding
    $padding = [int]($size * 0.12)
    $availW = $size - ($padding * 2)
    $availH = $size - ($padding * 2)

    $scale = [Math]::Min($availW / $source.Width, $availH / $source.Height)
    $destW = [int]($source.Width * $scale)
    $destH = [int]($source.Height * $scale)
    $destX = [int](($size - $destW) / 2)
    $destY = [int](($size - $destH) / 2)

    $g.DrawImage($source, $destX, $destY, $destW, $destH)
    $g.Dispose()
    return $bmp
}

function Create-Round-Icon([System.Drawing.Image]$source, [int]$size) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # Draw white circle
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddEllipse(1, 1, $size - 2, $size - 2)
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.FillPath($brush, $path)
    $brush.Dispose()

    # Draw logo centered inside round mask with 18% padding
    $padding = [int]($size * 0.18)
    $availW = $size - ($padding * 2)
    $availH = $size - ($padding * 2)

    $scale = [Math]::Min($availW / $source.Width, $availH / $source.Height)
    $destW = [int]($source.Width * $scale)
    $destH = [int]($source.Height * $scale)
    $destX = [int](($size - $destW) / 2)
    $destY = [int](($size - $destH) / 2)

    $g.SetClip($path)
    $g.DrawImage($source, $destX, $destY, $destW, $destH)
    $path.Dispose()
    $g.Dispose()
    return $bmp
}

function Create-Foreground-Icon([System.Drawing.Image]$source, [int]$size) {
    # Transparent background with logo in center 66% (safe zone for adaptive icon)
    $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $availW = [int]($size * 0.65)
    $availH = [int]($size * 0.65)

    $scale = [Math]::Min($availW / $source.Width, $availH / $source.Height)
    $destW = [int]($source.Width * $scale)
    $destH = [int]($source.Height * $scale)
    $destX = [int](($size - $destW) / 2)
    $destY = [int](($size - $destH) / 2)

    $g.DrawImage($source, $destX, $destY, $destW, $destH)
    $g.Dispose()
    return $bmp
}

foreach ($folderName in $densities.Keys) {
    $targetDir = Join-Path $resDir $folderName
    if (-not (Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }

    $info = $densities[$folderName]
    $legacySize = $info.legacy
    $fgSize = $info.foreground

    # 1. ic_launcher.png (also replace .webp so no stale files remain)
    $squareBmp = Create-Square-Icon $logo $legacySize
    $squarePng = Join-Path $targetDir "ic_launcher.png"
    $squareBmp.Save($squarePng, [System.Drawing.Imaging.ImageFormat]::Png)
    $squareWebp = Join-Path $targetDir "ic_launcher.webp"
    $squareBmp.Save($squareWebp, [System.Drawing.Imaging.ImageFormat]::Png) # Android AAPT accepts png encoded in .webp
    $squareBmp.Dispose()

    # 2. ic_launcher_round.png
    $roundBmp = Create-Round-Icon $logo $legacySize
    $roundPng = Join-Path $targetDir "ic_launcher_round.png"
    $roundBmp.Save($roundPng, [System.Drawing.Imaging.ImageFormat]::Png)
    $roundWebp = Join-Path $targetDir "ic_launcher_round.webp"
    $roundBmp.Save($roundWebp, [System.Drawing.Imaging.ImageFormat]::Png)
    $roundBmp.Dispose()

    # 3. ic_launcher_foreground.png (for adaptive icons)
    $fgBmp = Create-Foreground-Icon $logo $fgSize
    $fgPng = Join-Path $targetDir "ic_launcher_foreground.png"
    $fgBmp.Save($fgPng, [System.Drawing.Imaging.ImageFormat]::Png)
    $fgBmp.Dispose()

    Write-Host "Generated icons for $folderName (legacy: $legacySize px, foreground: $fgSize px)"
}

# Create Expo adaptive-icon asset
$expoAdaptive = Create-Foreground-Icon $logo 1024
$expoAdaptive.Save("c:\Users\divag\Desktop\dhanvikk-2\mobile\assets\adaptive-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$expoAdaptive.Dispose()

$logo.Dispose()
Write-Host "All Android icons and Expo assets generated successfully!"
