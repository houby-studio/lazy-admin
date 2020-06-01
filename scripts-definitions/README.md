# Script definitions

This folder contains sample definitions, serving as example for how you should setup your definitions for application.

## How to test

You can run Lazy Admin with provided sample definitions for testing purposes, before you create your own definitions.  

1. Create following registry key:
```
Path: HKEY_LOCAL_MACHINE\SOFTWARE\LazyAdmin
Key: MasterDefinitionUrl
Type: REG_SZ
Value: https://raw.githubusercontent.com/houby-studio/lazy-admin/master/scripts-definitions/master-definition-example.json
```
2. Launch Lazy Admin and log in
3. Lazy Admin will automatically download master definitions file, which contains multiple scripts definitions URLs
4. Lazy Admin will download definitions from each URL and lists them on main page, allowing you to choose and run any script from Lazy Admin

## Create custom definitions

Every environment has its own needs, their own modules, scripts and functions. Lazy Admin has no ambition to provide all or any functions for all environments. It is just a GUI, which you can bend to your own needs and quite easily import your scripts and functions.

All you need to do is create definitions for each command and point Lazy Admin to your definitions file.

### Master definition file

This is simple JSON file, which contains following keys and values:

* version: Very important, Lazy Admin compares this value when checking for updates. So when you release newer version of master definition file, you have to increment version to trigger update
* releaseDate: Informative key, may be omitted
* definitionsUrl: Array of URLs, where Lazy Admin should download scripts definitions for each set of commands or modules

#### Example file 
[master-definitions-example.json](master-definition-example.json)

#### Syntax

```
{
  "version": "{version}",
  "releaseDate": "{YYYY-MM-DD}",
  "definitionsUrl": [
    "{https://URL/file.json}",
    "{\\Path\To\JSON\file.json}"
  ]
}
```

### Scripts definitions file

All the magic happens here. Detailed explanation can be found on [wiki](https://github.com/houby-studio/lazy-admin/wiki/Definitions-files).

Possible values for definitions file:

* **unique-definitions-key**: Unique name, preferably kebab-case, but is really up to you, just don't break javascript, various functions access specific definitions module by associative array names. 
**IMPORTANT**: All other keys are children of this one
* version: Very important, Lazy Admin compares this value when checking for updates. So when you release newer version of scripts definition file, you have to increment version to trigger update
* icon: name of icon, if omitted, powershell icon is used
* displayName: provided in languages you want to support, this is what user sees on side panel when filtering commands based on definitions/modules
* description: provided in languages you want to support, this is what user sees on side panel below displayName when filtering commands based on definitions/modules
* definition: array of definitions for each command you want to define
    * commandName: Preferably name of the Cmdlet or function, which this definition uses, displayed to user to get the idea what the command might do
    * type: defines what type of command is it. Determines how application should treat it
    * icon: name of icon, if omitted, powershell icon is used
    * returns: type of the result, which application should expect after command is executed
    * insidePsSession: whether command should be run in Remote PSSession or locally
    * friendlyName: provided in languages you want to support, this is displayed to user to get better idea what the command might do
    * description: provided in languages you want to support, this is displayed to user to best describe what the command might do
    * parameters: array of parameters, which user is supposed to fill
    * commandBlock: String containing Cmdlet or function and parameters enclosed in {{ double curly braces }}
    * workflow: array of commands, when you need to run multiple commands sequentially, passing results from previous ones or asking for another user input in between
        * passedParameters: array of parameters obtained from previous command, referred by the property name
        * parameters: array of parameters, which user is supposed to fill
        * commandBlock: String containing Cmdlet or function and parameters enclosed in {{ double curly braces }}
        * passthru: display table of results and allow user to choose single or multiple results to be passed to another command, similar to `Out-GridView -Passthru`
        * confirm: before proceeding to another command, ask user for confirmation

#### Example file 
[base-module-example.json](base-module-example.json)

#### Syntax

This is only example, there are many possibilities how to write definitions.

```

{
  "{unique-definitions-key}": {
    "version": "{version}",
    "icon": "{icon-name}",
    "displayName": "{DisplayName}",
    "description": "{Description}",
    "definition": [
      {
        "commandName": "{Verb-Noun}",
        "type": "{type}",
        "icon": "{icon-name}",
        "returns": "{returnType}",
        "insidePsSession": {Boolean},
        "friendlyName": "{friendlyName}",
        "description": "{Description}",
        "parameters": [
          {
            "parameter": "{parameterName}",
            "format": "some format {parameterName}",
            "required": {Boolean},
            "type": "{inputType}",
            "hint": "{hint}"
          }
        ],
        "commandBlock": "{Verb-Noun {{parameterName}}}"
      },
      {
        "commandName": "{Verb-Noun}",
        "type": "workflow",
        "icon": "{icon-name}",
        "returns": "{returnType}",
        "friendlyName": "{friendlyName}",
        "description": "{Description}",
        "parameters": [
          {
            "parameter": "{parameterName}",
            "required": {Boolean},
            "type": "{inputType}",
            "hint": "{hint}"
          }
        ],
        "commandBlock": "{Verb-Noun {{parameterName}}}",
        "workflow": [
          {
            "passedParameters": [
              "parameter": "{parameterName}",
              "propertyName": "{propertyName}"
            ],
            "parameters": [
              {
                "parameter": "{parameterName}",
                "required": {Boolean},
                "type": "{inputType}",
                "hint": "{hint}"
              }
            ],
            "commandBlock": "{Verb-Noun {{parameterName}}}",
            "passthru": {Boolean},
            "confirm": {Boolean}
          },
          {
            "commandBlock": "{Verb-Noun {{parameterName}}}",
            "passthru": {Boolean},
            "confirm": {Boolean}
          }
        ]
      }
    ]
  }
}
```