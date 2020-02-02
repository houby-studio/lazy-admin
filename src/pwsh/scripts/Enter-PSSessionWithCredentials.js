let scriptFile = `
<#
.SYNOPSIS
 This script is called when Login button is clicked.

.DESCRIPTION
 Attempts to create and enter PSSession with provided credentials.

.LINK
 https://github.com/houby-studio/lazy-admin/wiki/Enter-PSSessionWithCredentials

.PARAMETER Credential
 Switch stating that $CredentialObject exists in current session.

.PARAMETER Username
 Pass Username as string when no saved credentials exist.

.PARAMETER Password
 Pass Password as string when no saved credentials exist.

.OUTPUTS
 System.Object. Returns PSCustomObject with Output, [Int]ReturnCode and [Boolean]Error.
 Return Codes:
 10021001: New Powershell session created succesfully.
 10023001: Supplied credential object or username and password failed o other error occured.
#>
  function Enter-PSSessionWithCredentials {
  [CmdletBinding()]
  param (
    [Parameter(ParameterSetName = 'CredentialObject')]
    [switch]$Credential,
    [Parameter(ParameterSetName = 'UsernamePassword')]
    [string]$Username,
    [Parameter(ParameterSetName = 'UsernamePassword')]
    [string]$Password
  )

  $CredentialObject = Get-StoredCredential -Target 'Lazy Admin' -Type Generic -ErrorAction SilentlyContinue

  # If CredentialObject exists, create session with it
  if ($CredentialObject) {
    try {
      New-PSSession -Credential $CredentialObject -Name 'LazyAdminSession' -ErrorAction Stop
      return [PSCustomObject]@{
        error      = $false;
        returnCode = 10021001;
        output     = "New Powershell session created succesfully."
      } | ConvertTo-Json -Compress
    }
    catch {
      return [PSCustomObject]@{
        error      = $true;
        returnCode = 10023001;
        output     = "Supplied credential object or username and password failed or other error occured. Original Error: $_"
      } | ConvertTo-Json -Compress
    }
  }
  else {
    try {
      $NewPassword = ConvertTo-SecureString $Password -AsPlainText -Force
      $NewCredentialObject = New-Object System.Management.Automation.PSCredential ($Username, $NewPassword)
      New-PSSession -Credential $NewCredentialObject -Name 'LazyAdminSession' -ErrorAction Stop
      return [PSCustomObject]@{
        error      = $false;
        returnCode = 10021001;
        output     = "New Powershell session created succesfully."
      } | ConvertTo-Json -Compress
    }
    catch {
      return [PSCustomObject]@{
        error      = $true;
        returnCode = 10023001;
        output     = "Supplied credential object or username and password failed o other error occured. Original Error: $_"
      } | ConvertTo-Json -Compress
    }
  }
}
`

export default scriptFile
