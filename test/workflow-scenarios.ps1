# This script is for testing and playing around various workflow possibilites

# Command can return raw text or objects and either one or multiple

# String
$TestResultString = "Current date is 14/07/2020"
$TestResultStringJson = $TestResultString | ConvertTo-Json -Compress

# Hashtable - similar for object
$TestResultHashtable = @{
  Name = "Alex"
  Age  = 15
}
$TestResultHashtableJson = $TestResultHashtable | ConvertTo-Json -Compress

# Array of strings
$TestResultStringArray = "Current date is 14/07/2020", "This is yet another string result"
$TestResultStringArrayJson = $TestResultStringArray | ConvertTo-Json -Compress

# Array of objects
$TestResultObjectArray = Get-Command -Name "*Path*" | Select-Object Name, Source
$TestResultObjectArrayJson = $TestResultObjectArray | ConvertTo-Json -Compress

# Next commmand may split previous results into parameters, or pass all output as a string



# Theorycrafting

# Multiple same commands with different parameters at once

# One liner, seems to work quite well
Get-Command -Name "Join-Path"; Get-Command -Name "Get-Help"
Get-Command -Name "Join-Path" | Select-Object Name, Version; Get-Command -Name "Get-Help" | Select-Object Name, Version

# One liner with different output parameters
# Returns only values from first object with select
Get-Command -Name "Join-Path" | Select-Object Name, Version; Get-Command -Name "Get-Help" | Select-Object Name
Get-Command -Name "Join-Path" | Select-Object Version; Get-Command -Name "Get-Help" | Select-Object Name, Version
Get-Command -Name "Join-Path" | Select-Object Version; Get-Command -Name "Get-Help" | Select-Object Name
# Returns both values separately (won't really ever happen?)
Get-Command -Name "Join-Path" ; Get-Location

# Two lines, does not work in PSSession and does not return single header
Get-Command -Name "Join-Path"
Get-Command -Name "Get-Help"

# TODO: walk over options with splatting 
# https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_splatting?view=powershell-7

