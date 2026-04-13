$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://127.0.0.1:8080/")
$listener.Start()

Write-Output "Serving $root at http://127.0.0.1:8080/"

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $requestPath = [System.Uri]::UnescapeDataString($context.Request.Url.AbsolutePath.TrimStart('/'))

    if ([string]::IsNullOrWhiteSpace($requestPath)) {
      $requestPath = "index.html"
    }

    $fullPath = Join-Path $root $requestPath
    $resolvedRoot = [System.IO.Path]::GetFullPath($root)
    $resolvedPath = [System.IO.Path]::GetFullPath($fullPath)

    if (-not $resolvedPath.StartsWith($resolvedRoot, [System.StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $resolvedPath -PathType Leaf)) {
      $context.Response.StatusCode = 404
      $buffer = [System.Text.Encoding]::UTF8.GetBytes("Not Found")
      $context.Response.OutputStream.Write($buffer, 0, $buffer.Length)
      $context.Response.Close()
      continue
    }

    switch ([System.IO.Path]::GetExtension($resolvedPath).ToLowerInvariant()) {
      ".html" { $context.Response.ContentType = "text/html; charset=utf-8" }
      ".css"  { $context.Response.ContentType = "text/css; charset=utf-8" }
      ".js"   { $context.Response.ContentType = "application/javascript; charset=utf-8" }
      ".json" { $context.Response.ContentType = "application/json; charset=utf-8" }
      ".png"  { $context.Response.ContentType = "image/png" }
      ".jpg"  { $context.Response.ContentType = "image/jpeg" }
      ".jpeg" { $context.Response.ContentType = "image/jpeg" }
      ".svg"  { $context.Response.ContentType = "image/svg+xml" }
      default { $context.Response.ContentType = "application/octet-stream" }
    }

    $bytes = [System.IO.File]::ReadAllBytes($resolvedPath)
    $context.Response.ContentLength64 = $bytes.Length
    $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    $context.Response.Close()
  }
}
finally {
  $listener.Stop()
  $listener.Close()
}
