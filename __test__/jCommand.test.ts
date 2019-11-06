import JCommand from '../src/JCommand'
import CommandUnit from '../src/CommandUnit'

describe('process.argv decode rightly', () => {
  test('without other arguments', () => {
    process.argv = 'node currentFile'.split(' ')
    const jCommand = new JCommand()
    expect(jCommand.execPath).toBe('node')
    expect(jCommand.filePath).toBe('currentFile')
    expect(jCommand.args).toEqual([])
    expect(jCommand.commands).toEqual([])
  })

  test('with some arguments', () => {
    process.argv = 'node currentFile -w -p=123'.split(' ')
    const jCommand = new JCommand()
    expect(jCommand.execPath).toBe('node')
    expect(jCommand.filePath).toBe('currentFile')
    expect(jCommand.args).toEqual(['-w', '-p=123'])
  })

  test('commands link right', () => {
    process.argv = 'node currentFile -w -p=123 -f=tt'.split(' ')
    const jCommand = new JCommand()

    expect(jCommand.commands[0].next).toBe(jCommand.commands[1])
    expect(jCommand.commands[1].next).toBe(jCommand.commands[2])
    expect(jCommand.commands[2].next).toBeNull()

    expect(jCommand.commands[0].pre).toBeNull()
    expect(jCommand.commands[1].pre).toBe(jCommand.commands[0])
    expect(jCommand.commands[2].pre).toBe(jCommand.commands[1])
  })
})

describe('valid works', () => {
  test('without other arguments', () => {
    process.argv = 'node currentFile'.split(' ')
    const jCommand = new JCommand()

    const cb = jest.fn()
    jCommand.valid(() => true, cb)
    expect(cb).toBeCalledTimes(0)
  })

  test('with some arguments', () => {
    process.argv = 'node currentFile -w -p=123'.split(' ')
    const jCommand = new JCommand()

    const cb1 = jest.fn()
    jCommand.valid(() => true, cb1)
    expect(cb1).toBeCalledTimes(2)

    const cb2 = jest.fn()
    jCommand.valid(() => false, cb2)
    expect(cb2).toBeCalledTimes(0)
  })

  test('callback receive match command', () => {
    process.argv = 'node currentFile -w -p=123'.split(' ')
    const jCommand = new JCommand()

    jCommand.valid((cmd) => cmd.command === '-p', (cmd) => {
      expect(cmd.value).toBe('123')
      expect(cmd.pre && cmd.pre.command).toBe('-w')
      expect(cmd.next).toBeNull()
    })
  })

  test('chain call works', () => {
    const jCommand = new JCommand()
    expect(jCommand.valid(() => true, () => {})).toBe(jCommand)
    expect(jCommand.option('', () => {})).toBe(jCommand)
    expect(jCommand.match(/./, () => {})).toBe(jCommand)
    expect(jCommand.fuzzy('', () => {})).toBe(jCommand)
  })
})

describe('option works', () => {
  test('receive a string', () => {
    process.argv = 'node currentFile -w -W -watch -p=123 --Port=1234'.split(' ')
    const jCommand = new JCommand()

    const cb1 = jest.fn()
    jCommand.option('-w', cb1)
    expect(cb1).toBeCalledTimes(1)

    const cb2 = jest.fn()
    jCommand.option('-p', cb2)
    expect(cb2).toBeCalledTimes(1)
  })

  test('receive a string array', () => {
    process.argv = 'node currentFile -w -W -watch -p=123 --Port=1234'.split(' ')
    const jCommand = new JCommand()

    const cb1 = jest.fn()
    jCommand.option(['-w', '-watch'], cb1)
    expect(cb1).toBeCalledTimes(2)

    const cb2 = jest.fn()
    jCommand.option(['-p', '-P', '--port', '-Port'], cb2)
    expect(cb2).toBeCalledTimes(1)

    const cb3 = jest.fn()
    jCommand.option(['-p', '--Port'], cb3)
    expect(cb3).toBeCalledTimes(2)
  })
})

describe('match works', () => {
  test('RegExp', () => {
    process.argv = 'node currentFile -w -W -watch -p=123 --Port=1234'.split(' ')
    const jCommand = new JCommand()

    const cb1 = jest.fn()
    jCommand.match(/w/i, cb1)
    expect(cb1).toBeCalledTimes(3)

    const cb2 = jest.fn()
    jCommand.match(/--/, cb2)
    expect(cb2).toBeCalledTimes(1)

    const cb3 = jest.fn()
    jCommand.match(/-w$/, cb3)
    expect(cb3).toBeCalledTimes(1)
  })
})

describe('fuzzy works', () => {
  test('receive a string', () => {
    process.argv = 'node currentFile -w -W -watch -p=123 --Port=1234'.split(' ')
    const jCommand = new JCommand()

    const cb1 = jest.fn()
    jCommand.fuzzy('w', cb1)
    expect(cb1).toBeCalledTimes(2)

    const cb2 = jest.fn()
    jCommand.fuzzy('P', cb2)
    expect(cb2).toBeCalledTimes(1)
  })

  test('receive a string array', () => {
    process.argv = 'node currentFile -w -W -watch -p=123 --Port=1234'.split(' ')
    const jCommand = new JCommand()

    const cb1 = jest.fn()
    jCommand.fuzzy(['w', 'watch'], cb1)
    expect(cb1).toBeCalledTimes(3)

    const cb2 = jest.fn()
    jCommand.fuzzy(['PORT'], cb2)
    expect(cb2).toBeCalledTimes(1)
  })

  test('asign a prefix', () => {
    process.argv = 'node currentFile -w -W -watch -p=123 --Port=1234'.split(' ')
    const jCommand = new JCommand()

    const cb1 = jest.fn()
    jCommand.fuzzy(['w', 'watch'], '-', cb1)
    expect(cb1).toBeCalledTimes(3)

    const cb2 = jest.fn()
    jCommand.fuzzy(['w', 'watch'], '--', cb2)
    expect(cb2).toBeCalledTimes(0)

    const cb3 = jest.fn()
    jCommand.fuzzy(['p', 'port'], '--', cb3)
    expect(cb3).toBeCalledTimes(1)

    const cb4 = jest.fn()
    jCommand.fuzzy(['p', 'port'], ['-', '--'], cb4)
    expect(cb4).toBeCalledTimes(2)

    const cb5 = jest.fn()
    jCommand.fuzzy(['p', 'port'], [':', ''], cb5)
    expect(cb5).toBeCalledTimes(0)
  })
})
