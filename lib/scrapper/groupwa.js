const fetch = require('node-fetch'), cheerio = require('cheerio'), fakeUa = require('fake-useragent')

module.exports = async function(nama) {
  return new Promise(async(resolve, reject) => {
    let data = await fetch('http://ngarang.com/link-grup-wa/daftar-link-grup-wa.php?search='+ nama +'&searchby=name', {
      headers: {
        'User-Agent': fakeUa()}})
    if (data.status != 200) reject({
      status: data.status, msg: data.statusText
    })
    let $ = cheerio.load(await data.text())
    let result = [];
    $('div.wa-chat-title-container').each(function(a, b) {
      let v = $(b).find('a')
      let title = v.text().split('.').slice(1).join('').trim()
      title = title.slice(0, title.length-1)
      result.push({
        title, 
        url: v.attr('href').trim()
      })
    })
    resolve(result)
  })
}