if (require("./config").pg) {
  let pgDb = new (require('pg').Pool)(require("./config").pg)
  new Promise(async()=> {
    let query = (await pgDb.query("CREATE TABLE IF NOT EXISTS Database(object json);SELECT * FROM Database"))[1].rows[0]
    if (!query || !("object" in query)) {
      await pgDb.query(`INSERT INTO Database(object) VALUES('{}');`)
    } else {
      delete query.session
      await pgDb.query(`UPDATE Database SET object='${JSON.stringify(query)}';`)
    }
    console.log('Success Restart Session....')
  })
} else {
  require('fs').unlinkSync('./src/json/session.json')
  console.log('Success Restart Session....')
}