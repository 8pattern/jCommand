import CommandUnit from '../src/CommandUnit'

test('raw is always same as the original string', () => {
  ['-p=123', '-P', 'P=123', 'p']
    .forEach((cmdStr) => {
      const commandUnit = new CommandUnit(cmdStr)
      expect(commandUnit.raw).toBe(cmdStr)
    })
})

test('default split char works', () => {
  const commandUnit1 = new CommandUnit('-p=123')
  expect(commandUnit1.command).toBe('-p')
  expect(commandUnit1.value).toBe('123')

  const commandUnit2 = new CommandUnit('-p')
  expect(commandUnit2.command).toBe('-p')
  expect(commandUnit2.value).toBeNull()
})

test('asign a string to split char', () => {
  const commandUnit1 = new CommandUnit('-p=a123', ':')
  expect(commandUnit1.command).toBe('-p=a123')
  expect(commandUnit1.value).toBeNull()

  const commandUnit2 = new CommandUnit('-p:a123', ':')
  expect(commandUnit2.command).toBe('-p')
  expect(commandUnit2.value).toBe('a123')

  const commandUnit3 = new CommandUnit('-p:a123', ':a')
  expect(commandUnit3.command).toBe('-p')
  expect(commandUnit3.value).toBe('123')

  const commandUnit4 = new CommandUnit('-p:a123', ':A')
  expect(commandUnit4.command).toBe('-p:a123')
  expect(commandUnit4.value).toBeNull()
})

test('asign a RegExp to split char', () => {
  const commandUnit1 = new CommandUnit('-p=a123', /[=|:]/)
  expect(commandUnit1.command).toBe('-p')
  expect(commandUnit1.value).toBe('a123')

  const commandUnit2 = new CommandUnit('-p:a123', /[=|:]/)
  expect(commandUnit2.command).toBe('-p')
  expect(commandUnit2.value).toBe('a123')

  const commandUnit3 = new CommandUnit('-p:a123', /[=|:]./)
  expect(commandUnit3.command).toBe('-p')
  expect(commandUnit3.value).toBe('123')

  const commandUnit4 = new CommandUnit('-p:a123', /a/i)
  expect(commandUnit4.command).toBe('-p:')
  expect(commandUnit4.value).toBe('123')
})
