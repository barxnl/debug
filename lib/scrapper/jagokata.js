const fetch = require('node-fetch'), cheerio = require('cheerio'), fakeUa = require('fake-useragent')

async function katabijak(query,pages) {
  return new Promise(async(resolve, reject) => {
    let result = []
    let base = `https://jagokata.com/kata-bijak/kata-${query}.html`
    pages = pages || Number(cheerio.load(await(await fetch(base,{headers:{"User-Agent":fakeUa()}})).text())('h4 > strong').eq(2).text()) / 10
    pages = pages >= 5 ? 5 : pages
    for (i = 1; i <= pages; i++) {
      let data = await fetch(`${base}?page=${i}`,{headers:{"User-Agent":fakeUa()}})
      let $ = cheerio.load(await data.text())
      $('ul > li').each(function push(a, b) {
        let quote = $(b).find('q.fbquote').text().trim()
if (!quote) return;
        let by = $(b).find('div > div > a').text().trim() || 'Kang Galon'
        let bio = $(b).find('div > div.citajenlijst-auteur > span').text().trim() || 'Tidak Ada'
        let image = $(b).find('div > img').attr('src')
        result.push({
          quote, by, bio, image
        })
      })
    }
    resolve(result)
  })
}