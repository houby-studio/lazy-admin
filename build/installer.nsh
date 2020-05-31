; References: https://nsis.sourceforge.io/Docs/AppendixE.html https://nsis.sourceforge.io/Docs/Chapter4.html

!macro preInit

  !define regkey "Software\LazyAdmin"
  !define masterdefinitionkey "MasterDefinitionUrl"

  !define exampleMasterDefinition "https://raw.githubusercontent.com/houby-studio/lazy-admin/master/scripts-definitions/master-definition-example.json"

  ${ifNot} ${isUpdated}
    ; Application is 64-bit, NSIS installer is 32-bit
    SetRegView 64
    ; Check if registry key already exists, if not, create with defaults
    ReadRegStr $0 HKLM "${regkey}" "${masterdefinitionkey}"
    ${If} $0 == ""
      WriteRegStr HKLM "${regkey}" "${masterdefinitionkey}" "${exampleMasterDefinition}"
    ${EndIf}    
    ; Check if URL parameter was set and write to registry, otherwise skip
    ${GetParameters} $R0
    ${GetOptions} $R0 `/URL=` $R1
    IfErrors 0 +2
    Goto +2
    WriteRegStr HKLM "${regkey}" "${masterdefinitionkey}" $R1
  ${endIf}
  
!macroend