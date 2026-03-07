# PowerShell script to enhance Marche course
\$jsonPath = 'public/courses/level2/L2M2L1.json'
\$json = Get-Content \$jsonPath -Raw | ConvertFrom-Json

# Define the insertion point (before the final review section)
\$reviewSection = "<section class='slide'><h2>🎓 重點回顧</h2>"

# Due to content length, we'll use file_replace tool in steps
Write-Host 'Please use the file editing tools to add content step by step' -ForegroundColor Yellow
