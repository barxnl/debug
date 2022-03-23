const {
  spawn,
  exec
} = require('child_process')
const path = require('path')
const fs = require('fs')
var isRunning = false
function start(file) {
  try {
    if (isRunning) return
    isRunning = true
    let pathFile = [path.join(__dirname, file),
      ...process.argv.slice(2)]
    let pgDb = new (require('pg').Pool)(require("./config").pg)
    let run = spawn(process.argv[0], pathFile, {
      stdio: ['inherit', 'inherit', 'inherit', 'ipc']
    })
    run.on('uncaugtException', console.log)
    run.on('message', data => {
      switch (data) {
        case 'reset':
          run.kill()
          isRunning = false
          start.apply(this, arguments)
          break;
        case 'uptime':
          run.send(process.uptime())
          break;
        case 'close':
          run.kill()
          process.kill()
          break;
      }
    })
    run.on('exit', async code => {
      if (require("./config").pg) {
        let db = {}
      for (let a of fs.readdirSync("./src/json/")) {
        db[a.replace(".json", '')] = require(`./src/json/${a}`)
      }
      await pgDb.query(`UPDATE Database SET object='${JSON.stringify(db)}';`)
      console.log(Buffer.from(`G1szODsyOzE5MjsxOTI7MTkybVsgISBdG1szOW0bWzM4OzI7MDsyNTU7MjU1bVNhdmluZyBTZXNzaW9uIFRvIFBnU3FsG1szOW0=`, 'base64').toString())
    }
      isRunning = false
      if (code == 1) return process.kill()
      console.error('Exited with code:', code)
      fs.watchFile(pathFile[0], () => {
        fs.unwatchFile(pathFile[0])
        console.log("Restarting....")
        start(file)
      })
    })
} catch (e) {
  console.log({
    Error: e,
    path: __dirname
  })
}
}

try {
start('main.js')
} catch (e) {
console.log({
Error: e,
path: __dirname
})
}

process.on('uncaugtException',
console.log)