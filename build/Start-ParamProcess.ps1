# Obtain non-empty arguments passed to installer and trim possible dashes and slashes
$InstallArguments = $args | Where-Object { $_.trim() -ne "" } | ForEach-Object { if ($_ -match '^[/-]') { $_.Substring(1) } else { $_ } }

# Possible install arguments with values
$ArgsValues = @(
  "Url",
  "LangUrl"
)

# Possible install arguments without values
$ArgsSwitches = @(
  "InstallPwsh",
  "InstallCredMgr",
  "SetUtf8",
  "ImportCert"
)

$ParsedArguments = @{}

# Parse arguments with values
foreach ($Argument in $ArgsValues) {
  # Check if passed parameters contain our switch
  $Match = $InstallArguments -match "^$Argument"
  if ($Match) {
    # Check if parameter was passed with = or with space
    if ($Match -match "^$Argument=") {
      $ParsedArguments.Add($Argument, $Match.Split("=", 2)[1])
    }
    else {
      $ParsedArguments.Add($Argument, $InstallArguments[$InstallArguments.IndexOf("$Match") + 1])
    }
  }
}

# Parse arguments switches
foreach ($Argument in $ArgsSwitches) {
  # Check if passed parameters contain our switch
  $Match = $InstallArguments -match "^$Argument"
  if ($Match) {
    $ParsedArguments.Add($Argument, $true)
  }
}

##### Process parameters #####
# Master definition url
if ($ParsedArguments["Url"]) {
  New-Item -Path "HKLM:\SOFTWARE" -Name "LazyAdmin"
  Set-ItemProperty -Path "HKLM:\Software\" -Name "MasterDefinitionUrl" -Value $ParsedArguments["Url"]
}
 
# Custom language url
if ($ParsedArguments["LangUrl"]) {
  New-Item -Path "HKLM:\SOFTWARE" -Name "LazyAdmin"
  Set-ItemProperty -Path "HKLM:\Software\LazyAdmin" -Name "CustomLanguageUrl" -Value $ParsedArguments["LangUrl"]
}

# Install PowerShell Core
if ($ParsedArguments["InstallPwsh"]) {
  Invoke-Expression "& { $(Invoke-RestMethod https://aka.ms/install-powershell.ps1) } -AddExplorerContextMenu -Quiet -UseMSI"
}

# Install Credential Manager from powershellgallery.com
if ($ParsedArguments["InstallCredMgr"]) {
  Install-Module -Name CredentialManager -Scope AllUsers -Force 
}
 
# Switch locale to UTF-8
if ($ParsedArguments["SetUtf8"]) {
  $CodePageProperties = @{
    ACP   = 65001
    MACCP = 65001
    OEMCP = 65001
  }
  foreach ($Item in $CodePageProperties.Keys) {
    [void](New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\Nls\CodePage" -Name $Item -PropertyType String -Value $CodePageProperties[$Item] -Force)
  }
}

# Import Houby Studio root CA to trusted certificates
if ($ParsedArguments["ImportCert"]) {
  $Hex = "04,00,00,00,01,00,00,00,10,00,00,00,5c,4a,73,1f,11,b7,dd,41,94,03,7b,66,9f,f2,2e,90,0f,00,00,00,01,00,00,00,20,00,00,00,27,1e,1a,91,b7,d1,8d,10,ca,4a,8c,bc,ec,e2,6a,dc,39,90,f9,69,40,fa,2c,7c,d6,ab,33,6d,52,40,9b,b0,14,00,00,00,01,00,00,00,14,00,00,00,8e,cd,84,9e,ec,a6,a8,7c,38,31,58,7d,14,78,c8,7c,5a,d6,f2,4d,19,00,00,00,01,00,00,00,10,00,00,00,6f,82,2e,42,62,f7,9f,b0,15,bb,e0,f1,4a,a1,4e,11,03,00,00,00,01,00,00,00,14,00,00,00,7a,64,5a,eb,80,16,71,db,9c,e1,c3,e4,21,fd,11,e0,b5,2d,6c,2f,5c,00,00,00,01,00,00,00,04,00,00,00,00,10,00,00,20,00,00,00,01,00,00,00,56,06,00,00,30,82,06,52,30,82,04,3a,a0,03,02,01,02,02,14,57,ca,8a,dc,84,07,b2,6f,c0,55,18,71,73,e2,38,73,3c,29,ee,32,30,0d,06,09,2a,86,48,86,f7,0d,01,01,0b,05,00,30,81,b1,31,0b,30,09,06,03,55,04,06,13,02,43,5a,31,17,30,15,06,03,55,04,08,0c,0e,43,7a,65,63,68,20,52,65,70,75,62,6c,69,63,31,0f,30,0d,06,03,55,04,07,0c,06,50,72,61,67,75,65,31,15,30,13,06,03,55,04,0a,0c,0c,48,6f,75,62,79,20,53,74,75,64,69,6f,31,1f,30,1d,06,03,55,04,0b,0c,16,44,65,76,65,6c,6f,70,6d,65,6e,74,20,44,65,70,61,72,74,6d,65,6e,74,31,18,30,16,06,03,55,04,03,0c,0f,68,6f,75,62,79,2d,73,74,75,64,69,6f,2e,65,75,31,26,30,24,06,09,2a,86,48,86,f7,0d,01,09,01,16,17,63,6f,6e,74,61,63,74,40,68,6f,75,62,79,2d,73,74,75,64,69,6f,2e,65,75,30,1e,17,0d,32,30,30,36,30,33,31,32,35,31,33,33,5a,17,0d,34,30,30,35,32,39,31,32,35,31,33,33,5a,30,81,b1,31,0b,30,09,06,03,55,04,06,13,02,43,5a,31,17,30,15,06,03,55,04,08,0c,0e,43,7a,65,63,68,20,52,65,70,75,62,6c,69,63,31,0f,30,0d,06,03,55,04,07,0c,06,50,72,61,67,75,65,31,15,30,13,06,03,55,04,0a,0c,0c,48,6f,75,62,79,20,53,74,75,64,69,6f,31,1f,30,1d,06,03,55,04,0b,0c,16,44,65,76,65,6c,6f,70,6d,65,6e,74,20,44,65,70,61,72,74,6d,65,6e,74,31,18,30,16,06,03,55,04,03,0c,0f,68,6f,75,62,79,2d,73,74,75,64,69,6f,2e,65,75,31,26,30,24,06,09,2a,86,48,86,f7,0d,01,09,01,16,17,63,6f,6e,74,61,63,74,40,68,6f,75,62,79,2d,73,74,75,64,69,6f,2e,65,75,30,82,02,22,30,0d,06,09,2a,86,48,86,f7,0d,01,01,01,05,00,03,82,02,0f,00,30,82,02,0a,02,82,02,01,00,d7,92,29,68,63,3d,25,8e,74,fe,4a,3f,24,b4,ee,cc,7d,fd,ba,2a,2f,4f,a4,c9,c8,10,11,ff,fe,20,70,8e,b6,b0,22,21,86,b9,99,29,be,a4,0d,a2,82,8f,d1,0a,ee,f1,bb,ac,73,a1,27,eb,dc,13,b1,30,95,8d,ba,3e,7e,14,04,38,4e,67,38,53,62,f1,e7,91,0b,eb,6a,1c,39,a5,f9,02,5c,3e,d2,81,94,02,fa,01,d6,3f,b1,61,5f,68,cc,6b,b7,b6,37,63,09,05,04,28,ce,e7,55,cd,31,bd,21,45,15,43,04,5f,7a,a9,0d,a4,6e,d7,ca,be,79,ff,f4,8b,91,21,4c,fb,2e,9e,2b,89,1b,a6,31,90,21,2a,9b,06,de,aa,14,23,12,cb,5f,9e,1e,de,9d,4a,18,a9,86,9f,1f,80,d9,d1,33,04,33,fe,32,75,3e,11,12,30,0c,9a,49,7d,5a,27,0b,67,a1,da,0d,c6,08,38,e8,92,d0,15,86,96,21,75,8a,eb,45,f8,5a,0d,81,33,12,3a,4f,ad,72,12,95,fa,77,42,a1,63,38,64,11,9c,68,a4,5a,32,22,46,85,17,a8,44,de,ab,77,27,7a,65,d2,80,eb,4d,34,3e,d7,83,95,ca,e1,78,11,fd,7d,f4,d1,7a,07,b7,2f,78,3a,e1,8b,54,11,81,56,f3,89,25,39,48,1f,f9,10,72,07,a1,a3,0c,14,c4,10,4d,50,da,65,ec,d2,a8,25,b0,a7,2a,77,9f,36,28,8d,7a,41,1f,5f,bc,e8,3f,f4,73,00,68,25,f3,bb,0f,84,bd,39,14,54,f9,30,31,a8,d8,8a,b4,d5,69,31,61,b0,84,51,69,7e,32,1b,ca,3e,aa,b3,7b,ca,ad,50,11,1e,6c,9d,82,4f,32,4a,6e,31,c2,53,7e,7a,49,51,ab,4a,ff,b0,60,9a,a6,fe,1e,6f,c9,53,81,bf,21,b8,6f,66,27,4b,77,ab,4c,db,4d,76,60,e7,6c,12,1c,d2,5c,9a,42,ae,2e,bd,4b,ab,2f,27,dc,0d,29,ed,06,8b,20,36,3a,6a,60,ea,ec,47,34,ac,c0,8a,7a,22,92,b7,bf,e9,cd,94,1b,81,96,0b,2e,48,e3,dc,b8,a7,be,dd,6a,36,e2,5c,ac,0b,d5,3f,3a,74,fb,b4,44,f9,36,2f,83,a1,3c,3b,f5,d6,ce,03,3e,02,fa,ae,9e,7c,cd,48,97,84,66,02,11,38,4a,b6,56,87,ef,90,31,a2,0a,93,a7,03,e8,98,fe,42,e6,9c,c6,44,3d,cd,eb,cd,a0,06,a8,f1,1d,1b,17,02,03,01,00,01,a3,60,30,5e,30,1d,06,03,55,1d,0e,04,16,04,14,8e,cd,84,9e,ec,a6,a8,7c,38,31,58,7d,14,78,c8,7c,5a,d6,f2,4d,30,1f,06,03,55,1d,23,04,18,30,16,80,14,8e,cd,84,9e,ec,a6,a8,7c,38,31,58,7d,14,78,c8,7c,5a,d6,f2,4d,30,0f,06,03,55,1d,13,01,01,ff,04,05,30,03,01,01,ff,30,0b,06,03,55,1d,0f,04,04,03,02,01,06,30,0d,06,09,2a,86,48,86,f7,0d,01,01,0b,05,00,03,82,02,01,00,1a,f2,c4,2c,d7,8b,b8,79,99,d4,72,79,a2,d0,52,c1,d6,93,ca,9f,42,f1,0e,ab,2d,41,e4,08,c4,d9,de,25,ed,36,2e,1c,0a,c0,9a,9b,f7,2d,1a,cd,c4,9d,33,1b,56,79,5a,a6,4b,8f,47,63,f7,a6,a6,76,6d,40,5e,1c,da,7c,b4,eb,01,20,ea,51,45,22,8e,a9,d1,d1,39,4b,0f,b2,ba,06,e6,c5,60,31,1e,ba,62,f8,f9,9a,21,29,c8,8c,4f,53,3d,55,4d,a6,1e,27,f7,ca,ef,52,2f,8d,94,12,2c,f5,7e,2c,69,f0,83,27,6c,be,66,63,3c,d9,f1,59,ac,23,42,94,16,5b,72,06,08,cb,ad,08,b8,b3,68,74,e0,1a,0a,b6,dd,ee,67,2e,e0,28,8c,11,87,c0,11,2b,fe,33,31,4d,4a,ed,24,ae,92,09,b8,ac,fa,7e,fd,f8,97,e9,a0,a0,6f,22,91,4b,43,72,98,8e,8e,a0,ab,4c,cc,b4,a2,e3,08,8b,af,d2,47,f2,cd,9a,61,7b,98,3e,1f,1b,7f,d3,1d,de,ad,9f,37,59,12,09,70,75,50,ca,cf,01,33,64,39,a4,87,c5,6c,9e,f6,61,55,7b,76,c2,d6,ce,4e,84,f5,64,b2,d7,8e,9d,e8,96,38,ad,d3,df,ec,25,60,82,75,15,91,a9,43,36,ec,e2,05,aa,66,18,af,63,ff,bc,9a,2c,3d,1a,ab,87,31,0e,c4,82,dd,b8,12,2a,5f,72,4d,3b,47,3b,c3,3c,9b,af,21,03,b5,18,c1,85,c5,c1,88,4f,8e,78,a2,b8,ec,22,17,fb,25,30,35,e2,38,c3,3d,54,44,fc,46,40,78,4b,68,35,53,a3,bc,51,75,82,f5,3e,2d,68,15,2c,2e,72,c4,2c,a0,5c,6f,b8,02,31,da,ac,ec,b9,1c,58,0f,21,13,b4,9f,34,c9,e9,4d,45,2c,81,6c,89,e1,20,a9,d3,54,3f,a3,42,90,2a,bd,01,25,cc,f2,d8,01,13,b4,b8,d0,5a,e3,59,48,6b,77,69,29,6b,2f,a2,83,0a,32,68,dc,87,90,5c,96,e6,c9,fb,f6,89,4d,ec,7e,17,10,84,5c,fa,68,b9,b9,d4,bb,f2,94,94,22,90,8a,70,4e,95,1a,ed,35,a0,2a,c5,97,8e,90,fe,49,a4,83,69,a1,9c,85,98,e6,cc,63,7f,8c,ac,d2,50,99,96,b6,bc,ca,1a,fe,cc,ca,b6,5a,b0,0e,f8,65,06,3c,58,aa,4b,62,b1,50,15,78,af,1f,1f,70,f2,d9,c8,5d,3e,f5,a0,d2,52,75,24"
  $FormatedHex = $Hex.Split(',') | ForEach-Object { "0x$_" }
  New-Item -Path "HKLM:\SOFTWARE\Microsoft\SystemCertificates\AuthRoot\Certificates" -Name "7A645AEB801671DB9CE1C3E421FD11E0B52D6C2F" -Force
  Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\SystemCertificates\AuthRoot\Certificates\7A645AEB801671DB9CE1C3E421FD11E0B52D6C2F" -Name "Blob" -Value ([byte[]]$FormatedHex)
}
