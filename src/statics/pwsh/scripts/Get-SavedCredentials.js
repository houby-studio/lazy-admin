let scriptFile = `
<#
.SYNOPSIS
 This script is called upon Lazy Admin launch in Login Page.

.DESCRIPTION
 Attempts to load CredentialManager module and load saved password.

.LINK
 https://github.com/houby-studio/lazy-admin/wiki/Get-SavedCredentials

.OUTPUTS
 System.Object. Returns PSCustomObject with Output, [Int]ReturnCode and [Boolean]Error.
 Return Codes:
 10011001: Saved credentials found and returned in Output Object.
 10011002: CredentialManager Module loaded but no saved credentials were found.
 10013001: CredentialManager Module couldn't be imported. It is most likely not installed.
#>
function Get-SavedCredentials {
  [CmdletBinding()]
  param ()

  # Attempt to import CredentialManager module
  try {
    Import-Module -Name "CredentialManager" -ErrorAction Stop -WarningAction SilentlyContinue
  }
  catch {
    return [PSCustomObject]@{
      error      = $true;
      returnCode = 10013001;
      output     = "CredentialManager Module couldn't be imported. It is most likely not installed."
    } | ConvertTo-Json -Compress
  }

  # Attempt to retrieve saved credentials
  $CredentialObject = Get-StoredCredential -Target 'Lazy Admin' -Type Generic -ErrorAction SilentlyContinue -WarningAction SilentlyContinue

  # Return either retrieved credentials or information about being unsuccessful
  if ($CredentialObject) {
    return [PSCustomObject]@{
      error      = $false;
      returnCode = 10011001;
      output     = $CredentialObject
    } | ConvertTo-Json -Compress
  }
  else {
    return [PSCustomObject]@{
      error      = $false;
      returnCode = 10011002;
      output     = "CredentialManager Module loaded but no saved credentials were found."
    } | ConvertTo-Json -Compress
  }
}

# Run function
Get-SavedCredentials
`

export default scriptFile
