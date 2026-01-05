# Color replacement script
$files = Get-ChildItem -Path . -Include *.tsx,*.ts -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Replace Maroon shades with Blue shades
    $content = $content -replace '#800020', '#1e40af'
    $content = $content -replace '#400010', '#1e3a8a'
    $content = $content -replace '#600010', '#1d4ed8'
    $content = $content -replace '#a00030', '#3b82f6'
    
    # Replace Yellow shades with Light Blue shades
    $content = $content -replace '#FFD700', '#60a5fa'
    $content = $content -replace '#FFC700', '#3b82f6'
    $content = $content -replace '#FFA500', '#93c5fd'
    
    # Replace Tailwind class colors
    $content = $content -replace '\[#800020\]', '[#1e40af]'
    $content = $content -replace '\[#400010\]', '[#1e3a8a]'
    $content = $content -replace '\[#600010\]', '[#1d4ed8]'
    $content = $content -replace '\[#a00030\]', '[#3b82f6]'
    $content = $content -replace '\[#FFD700\]', '[#60a5fa]'
    $content = $content -replace '\[#FFC700\]', '[#3b82f6]'
    $content = $content -replace '\[#FFA500\]', '[#93c5fd]'
    
    Set-Content -Path $file.FullName -Value $content
}

Write-Host "Color replacement complete!"
