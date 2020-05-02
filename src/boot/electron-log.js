import log from 'electron-log'

// Override default console function with electron-log functions
Object.assign(console, log.functions)
