export default class CommandUnit {
  raw: string
  command: string
  value: string | null = null
  pre: CommandUnit | null = null
  next: CommandUnit | null = null
  
  constructor(commandStr: string, splitChar: string | RegExp = '=') {
    this.raw = commandStr

    const [ command, value = null ] = commandStr.split(splitChar)
    this.command = command
    this.value = value
  }
}