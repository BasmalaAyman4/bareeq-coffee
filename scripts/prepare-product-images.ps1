param([Parameter(Mandatory=$true)][string]$Archive)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.Drawing
$destination = Join-Path $PSScriptRoot '../public/assets/products'
New-Item -ItemType Directory -Force -Path $destination | Out-Null
$zip = [IO.Compression.ZipFile]::OpenRead($Archive)
try {
  $manifest = @()
  $codec = [Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
  foreach ($entry in $zip.Entries) {
    if ($entry.FullName -notmatch '^images/([^/]+)/([^/]+)\.png$') { continue }
    $category = $Matches[1]
    $name = $Matches[2]
    $slug = ($category + '-' + $name).ToLowerInvariant() -replace '[^a-z0-9]+','-'
    $slug = $slug.Trim('-')
    $path = Join-Path $destination ($slug + '.jpg')
    $stream = $entry.Open()
    $img = [Drawing.Image]::FromStream($stream)
    $parameters = [Drawing.Imaging.EncoderParameters]::new(1)
    $parameters.Param[0] = [Drawing.Imaging.EncoderParameter]::new([Drawing.Imaging.Encoder]::Quality, [long]90)
    try { $img.Save($path, $codec, $parameters) }
    finally { $parameters.Dispose(); $img.Dispose(); $stream.Dispose() }
    $manifest += @{ name=$name; category=$category; file=('assets/products/'+$slug+'.jpg'); source=$entry.FullName }
  }
  $manifest | ConvertTo-Json -Depth 4 | Set-Content -Encoding utf8 (Join-Path $PSScriptRoot '../docs/product-image-manifest.json')
  Write-Output ('Prepared '+$manifest.Count+' images')
} finally { $zip.Dispose() }
