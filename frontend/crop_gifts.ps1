Add-Type -AssemblyName System.Drawing

$big = [System.Drawing.Bitmap]::FromFile("C:\Users\divag\.gemini\antigravity-ide\brain\a4a72bfc-5ef2-423e-8d4a-a2a2df353a7e\fnp_gifts_everyone_section_1791070078635.png")
$destDir = "c:\Users\divag\Desktop\dhanvikk\frontend\public\images\gifts"

$cards = @(
    @{ Name = "him.png"; X = 63 },
    @{ Name = "her.png"; X = 393 },
    @{ Name = "kids.png"; X = 723 },
    @{ Name = "friend.png"; X = 1053 },
    @{ Name = "wife.png"; X = 1383 }
)

foreach ($c in $cards) {
    $rect = New-Object System.Drawing.Rectangle($c.X, 267, 294, 196)
    $cropped = $big.Clone($rect, $big.PixelFormat)
    $outPath = Join-Path $destDir $c.Name
    $cropped.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $cropped.Dispose()
    Write-Output "Successfully saved $($c.Name) from x=$($c.X)"
}

# Husband from exact element capture
Copy-Item "C:\Users\divag\.gemini\antigravity-ide\brain\a4a72bfc-5ef2-423e-8d4a-a2a2df353a7e\element_husband_img_1791070154748.png" -Destination (Join-Path $destDir "husband.png") -Force
Write-Output "Successfully saved husband.png"

$big.Dispose()
