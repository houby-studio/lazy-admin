let scriptFile = `
<#
.SYNOPSIS
 This script is called when Login button is clicked.

.DESCRIPTION
 Attempts to create PSSession with provided credentials.

.LINK
 https://github.com/houby-studio/lazy-admin/wiki/New-PSSessionWithCredentials

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
function New-PSSessionWithCredentials {
  [CmdletBinding()]
  param (
    [Parameter(ParameterSetName = 'CredentialObject')]
    [switch]$Credential,
    [Parameter(ParameterSetName = 'UsernamePassword')]
    [string]$Username,
    [Parameter(ParameterSetName = 'UsernamePassword')]
    [string]$Password
  )

  # If credential object should be used, attempt to retrieve it.
  if ($Credential) {
    $Global:CredentialObject = Get-StoredCredential -Target 'Lazy Admin' -Type Generic -ErrorAction SilentlyContinue
  }

  # If CredentialObject exists, create session with it
  try {
    if ((!$Global:CredentialObject) -or ($Username -and $Password)) {
      $NewPassword = ConvertTo-SecureString $Password -AsPlainText -Force
      $Global:CredentialObject = New-Object System.Management.Automation.PSCredential ($Username, $NewPassword)
    }
    # Set encoding
    $OutputEncoding = [console]::InputEncoding = [console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
    $PSDefaultParameterValues['*:Encoding'] = 'utf8'
    # Try to create new PSSession with Credssp, which allows for credential delegation to within session, otherwise, fallback to standard authentication method
    try {
      $Global:LazyAdminPSSession = New-PSSession -Credential $Global:CredentialObject -Name 'LazyAdminSession' -Authentication Credssp -ErrorAction Stop
    } catch {
      $Global:LazyAdminPSSession = New-PSSession -Credential $Global:CredentialObject -Name 'LazyAdminSession' -ErrorAction Stop
    }
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
`

export default scriptFile
