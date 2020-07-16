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

# One command, multiple same arguments - for commands which accept arrays
# Works
Get-Command -Name "Get-Help", "Get-Acl"
# Does not work
Get-Date -Year 2019, 2018

$Array = "Get-Help", "Get-Acl"
$Array.GetType()
# Does not work
Get-Command -Name @Array
# Does work
Get-Command -Name $Array

# TODO: walk over options with splatting 
# https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_splatting?view=powershell-7

# Storing output to variable
$OutputArray = @()
$OutputHash = @{}

foreach ($i in (1..10)) {
  $OutputArray += (Get-Process)[$i]
  $OutputHash.Add($i, (Get-Process)[$i])
}

$OutputArray[1]



# Possible scenarios to be integrated to Lazy Admin

<#

1. No arguments passed

Example:
- First command creates AD User - no output, or text stating that user was succesfully created.
- Second command queries AAD to check when last sync was executed, again, returning date.

New-ADUser -DisplayName "John Smith"
Get-ADSyncScheduler

In that example, only choice admin gets is whether to run second command after the first or not.

2. Single choice from data table is passed

Example:
- Query AD Users to get users named 'John'.
- Choose single account 'John Smith' from all results and that account gets disabled.

Get-ADUser -Filter "GivenName -eq 'John'"
Disable-ADAccount -Identity "John.Smith@domain.local"

In that example, admin can choose to not run second command, possibly searching for another name, or select single user which gets linked via definition to second command and that gets executed.

3. Array is passed to single command

Example:
- Query running processes.
- Choose multiple processes, which get passed to Stop-Process separated by commas to kill all.

Get-Process
Stop-Process -Id 12345, 12500, 666

Note: Need to solve formatting for that, some input may be in "", '' or in array @() etc.

4. Array is passed and for each, command is run with other parameters being the same

5. Array is passed and for each, command is run with other parameters being unique for each value

4 and 5 could possibly be same type - dialog with either arrows to navigate between passed parameters and checkbox, which makes all input values same for eachchosen result.

Example:
- Query AD Users to get users named 'John'.
- Choose multiple account which get e-mail containing congratulations because it is their name day!

Get-ADUser -Filter "GivenName -eq 'John'" -Properties mail
Send-MailMessage -From system@contoso.com -To john.smith@contoso.com -SmtpServer mail.contoso.local -Body "Congratulations!"; Send-MailMessage -From system@contoso.com -To john.jack@contoso.com -SmtpServer mail.contoso.local -Body "Congratulations!"; Send-MailMessage -From system@contoso.com -To john.tooth@contoso.com -SmtpServer mail.contoso.local -Body "Congratulations!"

#>