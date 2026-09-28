Add-Type -AssemblyName System.Drawing

$srcPath = "d:\Projects\Flovera\frontend\public\images\MyFloveeraLogo.jpeg"
$dstPath = "d:\Projects\Flovera\frontend\public\images\floveera_logo_clean.png"

$src = [System.Drawing.Bitmap]::FromFile($srcPath)
# Create a square bitmap so it doesn't distort or letterbox
$maxDim = [Math]::Max($src.Width, $src.Height)
$dst = New-Object System.Drawing.Bitmap($src.Width, $src.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

# Background blue in MyFloveeraLogo is ~ R:31, G:56, B:136
# Red emblem is ~ R:242, G:80, B:78
for ($y = 0; $y -lt $src.Height; $y++) {
    for ($x = 0; $x -lt $src.Width; $x++) {
        $c = $src.GetPixel($x, $y)
        $diff = [double]$c.R - [double]$c.B
        if ($diff -lt 10) {
            # Background blue pixel -> fully transparent
            $dst.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        } elseif ($diff -gt 70) {
            # Foreground red emblem -> fully opaque
            $dst.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $c.R, $c.G, $c.B))
        } else {
            # Smooth antialiased edge
            $alpha = [int]((($diff - 10.0) / 60.0) * 255.0)
            if ($alpha -gt 255) { $alpha = 255 }
            if ($alpha -lt 0) { $alpha = 0 }
            # To prevent dark halo from blue background, adjust color towards red
            $dst.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, [Math]::Min(255, $c.R + 20), $c.G, $c.B))
        }
    }
}

# Trim transparent borders to tight bounding box and make it square
$minX = $src.Width; $maxX = 0; $minY = $src.Height; $maxY = 0;
for ($y = 0; $y -lt $dst.Height; $y++) {
    for ($x = 0; $x -lt $dst.Width; $x++) {
        $p = $dst.GetPixel($x, $y)
        if ($p.A -gt 20) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

$w = $maxX - $minX + 1
$h = $maxY - $minY + 1
$size = [Math]::Max($w, $h) + 16

$finalSquare = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($finalSquare)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

$offsetX = [int](($size - $w) / 2)
$offsetY = [int](($size - $h) / 2)

$srcRect = New-Object System.Drawing.Rectangle($minX, $minY, $w, $h)
$dstRect = New-Object System.Drawing.Rectangle($offsetX, $offsetY, $w, $h)

$g.DrawImage($dst, $dstRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()

$finalSquare.Save($dstPath, [System.Drawing.Imaging.ImageFormat]::Png)

$src.Dispose()
$dst.Dispose()
$finalSquare.Dispose()

Write-Host "Success: floveera_logo_clean.png created with size $size x $size"
