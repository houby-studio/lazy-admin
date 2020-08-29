#https://nsis.sourceforge.io/PowerShell_support

[CmdletBinding()]
param (
  [Parameter()]
  $Ar
)
$Ar | Out-File "C:\share\pwsh.txt" -Append