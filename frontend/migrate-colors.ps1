# PowerShell Script to migrate hardcoded colors to semantic tokens

$replacements = @{
    # Backgrounds
    'bg-background-dark' = 'bg-surface'
    'bg-slate-900' = 'bg-surface'
    'bg-slate-800/50' = 'bg-surface-elevated/50'
    'bg-slate-800/30' = 'bg-surface-elevated/30'
    'bg-slate-800' = 'bg-surface-elevated'
    'bg-slate-700' = 'bg-surface-border'
    
    # Borders
    'border-slate-200/10' = 'border-surface-border-subtle'
    'border-slate-700/50' = 'border-surface-border/50'
    'border-slate-700' = 'border-surface-border'
    'border-slate-600' = 'border-surface-border'
    
    # Text
    'text-slate-500' = 'text-text-tertiary'
    'text-slate-400' = 'text-text-tertiary'
    'text-slate-300' = 'text-text-secondary'
    
    # Hover states
    'hover:bg-slate-800/30' = 'hover:bg-surface-elevated/30'
    'hover:bg-slate-800' = 'hover:bg-surface-elevated'
    'hover:bg-slate-700' = 'hover:bg-surface-elevated-hover'
    'hover:text-white' = 'hover:text-text-primary'
}

# Get all .tsx files in src/features
$files = Get-ChildItem -Path "d:\projects\ldop-demo\frontend\src\features" -Filter *.tsx -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    foreach ($old in $replacements.Keys) {
        if ($content -match [regex]::Escape($old)) {
            $content = $content -replace [regex]::Escape($old), $replacements[$old]
            $modified = $true
        }
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated: $($file.Name)"
    }
}

Write-Host "Migration complete!"
