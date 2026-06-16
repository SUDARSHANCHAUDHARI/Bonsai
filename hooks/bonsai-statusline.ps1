# Prints the bonsai statusline badge from the mode flag file.
$dir = if ($env:CLAUDE_CONFIG_DIR) { $env:CLAUDE_CONFIG_DIR } else { Join-Path $HOME ".claude" }
$state = Join-Path $dir ".bonsai-active"
if (-not (Test-Path $state)) { exit 0 }
$mode = (Get-Content $state -Raw).Trim()
if (-not $mode) { exit 0 }
if ($mode -eq "full") { Write-Output "[BONSAI]" }
else { Write-Output ("[BONSAI:" + $mode.ToUpper() + "]") }
