var alreadyConnected = false;
database.saveOn = 1

client.ev.on('connection.update', async(update) => {
  if (update.connection == 'open') {
    alreadyConnected = true
  } else if (update.connection == 'close') {
    let updt = update.lastDisconnect?.error?.output?.payload
    if ((updt.statusCode == 401 || updt.statusCode == 410) && updt.error != 'Unauthorized') {
      return process.send('reset')
    } else if (updt.statusCode == 403 || updt.error == 'Unauthorized') {
      delete database.session
      functions.fs.unlinkSync('./src/json/session.json')
      return process.send('reset')
    }
  }
})

client.ev.on ('creds.update', session.saveState)

client.ev.on ('creds.update', async() => {
  console.log(`Progress: `+database.saveOn)
  if ((database.saveOn%100) == 0) {
    if (config.pg) {
      database.saveOn = 1
      database.chats = typeof database.chats == 'object' ? Buffer.from(JSON.stringify(database.chats)).toString('base64'): database.chats
      await pgDb.query(`UPDATE Database SET object='${JSON.stringify(database)}';`)
      console.log(Buffer.from(`G1szODsyOzE5MjsxOTI7MTkybVsgISBdG1szOW0bWzM4OzI7MDsyNTU7MjU1bVNhdmluZyBTZXNzaW9uIFRvIFBnU3FsG1szOW0=`, 'base64').toString())
    }
  }
  database.saveOn = database.saveOn +1
})