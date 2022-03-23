const fetch = require('node-fetch'), cheerio = require('cheerio'), fakeUa = require('fake-useragent')

module.exports = async function(query) {
  return new Promise(async(resolve, reject) => {
    let base = `https://id.m.wikipedia.org`
    let data = await fetch(`${base}/w/index.php?title=Istimewa:Pencarian&search=${encodeURIComponent(query)}&profile=default&fulltext=1&ns0=1`, {
      headers: {
        'User-Agent': fakeUa()}})
    if (data.status != 200) reject({
      code: data.status, msg: data.statusText
    })
    let $ = cheerio.load(await data.text())
    let result = {}
    result.one = {}
    result.all = []
    result.code = 200
    result.msg = `OK`
    result.results = $("div#mw-search-top-table > div.results-info").attr('data-mw-num-results-total').trim()

    $('ul > li').each(function(a, b) {
      let def = $(b).find("div.mw-search-result-heading > a")
      if (!def.attr('title')) return;
      let title = def.attr('title')
      let link = (base+def.attr('href'))
      let snippet = $(b).find('div.searchresult').text()
      let metadata = $(b).find('div.mw-search-result-data').text()
      result.all.push({
        title, link, snippet, metadata
      })
    })
    let data2 = await fetch(result.all[0].link,
      {
        headers: {
          'User-Agent': fakeUa()}})
    let $$ = cheerio.load(await data2.text())
    result.one.refrence = []
    result.one.images = []
    result.one.body = ``
    $$('section#mf-section-0.mf-section-0').each(function(a, b) {
      $$(b).find('a.image').each(function(g, h) {
        let img = $$(h).find('img').attr('src')
        if (img) result.one.images.push('https'+img);
      })

      $$(b).find('p > a').each(function (c, d) {
        let uri = $$(d)
        if (uri.attr('href')) result.one.refrence.push({
          link: (base+uri.attr('href')).trim(), title: uri.text().trim()});
      })
      result.one.body += $(b).find('p').text().trim()+'\n\n'
    })
    result.one.title = result.all[0].title
    result.one.subtitle = $$(`div.page-heading > div.tagline`).text().trim()
    result.one.link = result.all[0].link
    result.one.metadata = result.all[0].metadata
    if (result.one.images.length == 0) result.one.images.push(`https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Wikipedia-logo-v2-en.svg/892px-Wikipedia-logo-v2-en.svg.png`)
    resolve(result)
  })
}