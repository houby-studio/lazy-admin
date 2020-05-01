# Policy object

To simplify deployment in corporate environment, you can simply silently deploy application and take advantage of our ADM and AMDX templates to take care of settings for application.

# How to deploy ADM template

Open Group Policy console (or Local policy) and right-click **Administrative templates** and choose **Add or remove templates**, then navigate to .adm file and add it. You can then find settings under Computer Policies/Classic Administrative Templates/Lazy Admin

# How to deploy ADMX template

Assuming you have central store on your DC, copy **LazyAdmin.admx** and **en-US** folder to:  
\\\\{DOMAIN}\SYSVOL\{DOMAIN.FQDN}\policies\PolicyDefinitions\

Alternatively if installing on local computer copy to C:\Windows\PolicyDefinitions

## For developers

Yes, we are lazy admins too, so we store command to migrate ADM to ADMX in git repo to save time.  
It may be useful to you if you need to modify our policies.

`"%PROGRAMFILES(x86)%\FullArmor\ADMX Migrator\faAdmxConv.exe" "C:\git\lazy-admin\admx\adm\LazyAdmin.adm" "C:\git\lazy-admin\admx"`