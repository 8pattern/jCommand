import CommandUnit from './CommandUnit'

interface CommandCallback {
  (commandUnit: CommandUnit): void
}

interface CommandValidator {
  (commandUnit: CommandUnit): boolean
}

export default class JCommand {
  execPath: string
  filePath: string
  args: string[] = []
  commands: CommandUnit[] = []

  constructor() {
    if (!process) {
      throw new Error('CAN NOT find process, it seems not in command-line mode.')
    }

    const [ execPath, filePath, ...args ] = process.argv
    this.execPath = execPath
    this.filePath = filePath
    this.args = args

    this.commands = this.wrapArgs(args)
  }

  private wrapArgs(args: string[]): CommandUnit[] {
    let lastCommandUnit: CommandUnit | null = null
    return args.map(arg => {
      const commandUnit = new CommandUnit(arg)
      if (lastCommandUnit) {
        commandUnit.pre = lastCommandUnit
        lastCommandUnit.next = commandUnit
      }
      lastCommandUnit = commandUnit
      return commandUnit
    })
  }

  valid(validator: CommandValidator, callback: CommandCallback): JCommand {
    this.commands.forEach(cmd => {
      if(validator(cmd)) {
        callback(cmd)
      }
    })
    return this
  }

  option(command: string | string[], callback: CommandCallback): JCommand {
    const commandNames = command instanceof Array ? command : [command]
    const validator: CommandValidator = (cmd) => commandNames.includes(cmd.command)
    this.valid(validator, callback)
    return this
  }

  match(command: RegExp, callback: CommandCallback): JCommand {
    const validator: CommandValidator = (cmd) => command.test(cmd.command)
    this.valid(validator, callback)
    return this
  }

  fuzzy(command: string | string[], callback: CommandCallback): JCommand
  fuzzy(command: string | string[], prefix: string | string[], callback: CommandCallback): JCommand
  fuzzy(command: string | string[], arg2: string | string[] | CommandCallback, arg3?: CommandCallback) {
    let prefix, callback
    if(!arg3) {
      prefix = ['-', '--']
      callback = arg2 as CommandCallback
    } else {
      prefix = arg2 as string | string[]
      callback = arg3 as CommandCallback
    }
    const commandNames = command instanceof Array ? command : [command]
    const prefixes = prefix instanceof Array ? prefix : [prefix]
    const commands = prefixes.flatMap(pre => {
      return commandNames.map(cmd => pre + cmd.toLowerCase())
    })
    const validator: CommandValidator = (cmd) => commands.includes(cmd.command.toLowerCase()) && prefixes.some(pre => pre === cmd.command.slice(0, pre.length))
    this.valid(validator, callback)
    return this
  }
}
