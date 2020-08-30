; References: https://nsis.sourceforge.io/Docs/AppendixE.html https://nsis.sourceforge.io/Docs/Chapter4.html
!include x64.nsh
!include ${PROJECT_DIR}\build\psexec.nsh

!macro preInit

  !define regkey "Software\LazyAdmin"
  !define masterdefinitionkey "MasterDefinitionUrl"
  !define customlanguagekey "CustomLanguageUrl"

  !define exampleMasterDefinition "https://raw.githubusercontent.com/houby-studio/lazy-admin/master/scripts-definitions/master-definition-example.json"

  ${ifNot} ${isUpdated}
    ; Application is 64-bit, NSIS installer is 32-bit
    ${If} ${RunningX64}
      SetRegView 64
    ${EndIf}
    ; Check if registry key already exists, if not, create with defaults
    ReadRegStr $0 HKLM "${regkey}" "${masterdefinitionkey}"
    ${If} $0 == ""
      WriteRegStr HKLM "${regkey}" "${masterdefinitionkey}" "${exampleMasterDefinition}"
    ${EndIf}    
    ; Launch PowerShell script to process command line arguments
    ${GetParameters} $R0
    InitPluginsDir
    SetOutPath "$PLUGINSDIR\PowerShell"
    File "${PROJECT_DIR}\build\Start-ParamProcess.ps1"
    ${PowerShellExecFile} "$PLUGINSDIR\PowerShell\Start-ParamProcess.ps1" $R0
  ${endIf}
  
!macroend