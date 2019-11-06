# jCommand
 A command-line helper for Node.js



## Install

```shell
npm install -S @8pattern/jcommand
```



## Usage

Demo

```javascript
// cmd.js
const jCommand = require('@8pattern/jcommand')
jCommand.option(['-P', '--port'], (cmd) => console.log(cmd.value))
```

```shell
node cmd.js -P=3000 or node cmd.js --port=3000
# the console will print 3000 
```



+ Attribute
  
  1. **execPath** &lt;string&gt;: the path of the executor. It's Node root path in ordinary.
     
     ```shell
     node cmd.js
     # jCommand.execPath === 'D:\\Node\\node.exe'
     ```
     
  2. **filePath** &lt;string&gt;: the path of the code file.
     
     ```shell
     node cmd.js
     # jCommand.filePath === 'D:\\cmd.js'
     ```
     
  3. args &lt;string[]&gt;: the original arguments in command-line.
  
     ```shell
     node cmd.js -a -b=1 c:2
     # jCommand.args === ['-a', '-b=1', 'c:2']
     ```
  
  5. **commands** &lt;Command[]&gt; the list of argument wraps. *Command* is a wrapper for argument. It has five attributes: **raw**，**command**, **value**, **pre** and **next**.  **raw** represents the original string of the argument. **command** and **value** will be automatically detect the argument to obtain the corresponding results (according to **"="** now). If they can't be detected from the raw, command will equal the raw while the value will be assigned to be null. **pre** and **next** link the previous or next argument wrap instance. For example:
  
     | Argument |   -a   | -b=1 |  c:2   |
     | :------: | :----: | :--: | :----: |
     |   raw    |   -a   | -b=1 |  c:2   |
     | command  |   -a   |  -b  |  c:2   |
     |  value   | *null* |  1   | *null* |
     
     ```shell
     node cmd.js -a -b=1 c:2
     # jCommand.commands[1].raw === '-b=1'
     # jCommand.commands[1].pre.raw === '-a'
     # jCommand.commands[1].next.raw === 'c:2'
     ```

+ Action

  1. **option** (command: string | string[], callback: Function): jCommand
  + exactly match the received commands
  
   ```javascript
     jCommand.option('-P', callback)
     jCommand.option(['-P', '--port'], callback)
   ```
  
  2. **match** (command: RegExp, callback: Function): jCommands
  
   + provide a regular expression to match all valid argument
  
     ```javascript
     jCommand.option(/--?P/i, callback)
     ```
  
  3. **fuzzy** (command: string | string[], callback: Function): jCommand  *or* (command: string | string[], prefix: string | string[], callback: Function): jCommand
  
     + match the arguments in a case insensitive mode
     + the prefix argument represents the prefix chars before the argument, **['-', '--'] by default**
  
     ```javascript
     jCommand.fuzzy('p', callback) // sames as jCommand.fuzzy('p', ['-', '--'], callback)
     jCommand.fuzzy(['p', 'port'], '-', callback)
     ```
  
  4. **valid** (validator: Function, callback: Function): jCommand
  
     + can provide a custom validator to match the expected arguments.
     + validator can receive the only argument —— a **Command** instance. If return **true**, the command will be regarded as selected. And **false** otherwise.
     + In fact, **option**, **match** and **fuzzy** are three particular cases of **valid**.
  
     
  
  The following presents whether the arguments will trigger the corresponding rules.
  
  |                              |  -p  |  -P  | --p  | -p=3000 | --port=3000 |
  | :--------------------------: | :--: | :--: | :--: | :-----: | :---------: |
  |       option('-p', cb)       | Yes  |  No  |  No  |   Yes   |     No      |
  | option(['-p', '--port'], cb) | Yes  |  No  |  No  |   Yes   |     Yes     |
  |       match(/-p/, cb)        | Yes  |  No  | Yes  |   Yes   |     Yes     |
  |      match(/--P/i, cb)       |  No  |  No  | Yes  |   No    |     Yes     |
  |     match(/^--?p$/i, cb)     | Yes  | Yes  | Yes  |   Yes   |     No      |
  |        fuzzy('p', cb)        | Yes  | Yes  | Yes  |   Yes   |     No      |
  |     fuzzy('p', '@', cb)      |  No  |  No  |  No  |   No    |     No      |
  
  **NOTICE**
  
  1. the actions can be called by chains.
  
  ```javascript
  const t = jCommand
      .option('-p',() => {})
      .match(/w/, () => {})
  	.fuzzy('m', () => {})
  	.valud(() => true, () => {})
  
  console.log(t === jCommand) // true
  ```
  
  
  
  2. callback has the only argument of the **Command** instance. If need the previous or rest command-line arguments, they will can be found by **pre** and **next** attributes.
  
  ```javascript
  jCommand.option('-P', (cmd) => {
  	console.log(cmd.next.command)
  })
  // node cmd.js -P 3000  -> print 3000
  ```
  
  3. only if the rule satisfied, the callback will be triggered, even if it was triggered before. In other words, the callback may be triggered **more than once**.
  
  ```javascript
  jCommand
  	.option('-P', (cmd) => console.log('option:', cmd.command))
  	.match(/p/i, (cmd) => console.log('match: ', cmd.command))
  	.fuzzy('p', (cmd) => console.log('fuzzy: ', cmd.command))
  	.valid((cmd) => /p/i.test(cmd.command), (cmd) => console.log('valid: ', cmd.command))
  
  // node cms.js -P
  // print:
  //	option: -P
  //  match: -P
  //  fuzzy: -P
  //  valid: -P
  ```