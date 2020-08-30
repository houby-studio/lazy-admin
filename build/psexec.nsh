; Modified version of https://nsis.sourceforge.io/PowerShell_support allowing PowerShell script to accept params
!include x64.nsh
!ifndef PSEXEC_INCLUDED
!define PSEXEC_INCLUDED

!macro PowerShellExecFileMacro PSFile Args
  !define PSExecID ${__LINE__}
  Push $R0
 
  ${If} ${RunningX64}
    nsExec::ExecToStack '$WINDIR\sysnative\windowspowershell\v1.0\powershell.exe -inputformat none -ExecutionPolicy RemoteSigned -File "${PSFile}" ${Args}'
  ${Else}
    nsExec::ExecToStack 'powershell -inputformat none -ExecutionPolicy Bypass -File "${PSFile}" ${Args}'
  ${EndIf}
 
  Pop $R0 ;return value is first on stack
  ;script output is second on stack, leave on top of it
  IntCmp $R0 0 finish_${PSExecID}
  SetErrorLevel 2
 
finish_${PSExecID}:
  Exch ;now $R0 on top of stack, followed by script output
  Pop $R0
  !undef PSExecID
!macroend

!define PowerShellExecFile `!insertmacro PowerShellExecFileMacro`
 
!endif