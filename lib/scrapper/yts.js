module.exports = async(query = '') => {
  return new Promise(async (resolve, reject) => {
    try {
      let get_data = await require('axios').get(`https://www.youtube.com/results?search_query=${encodeURIComponent(
        query.trim(),
      )}`,
      ).catch(reject);
      let $ = require('cheerio').load(get_data.data);
      let get_arry = []
      let parse_search;
      for (let i of $('script')) {
        if (i.children && i.children[0] && i.children[0].data.includes('var ytInitialData = ')) {
          parse_search = JSON.parse(
            i.children[0].data.split('var ytInitialData = ')[1].replace(/;/g, ''),);
        }
      }
      if (parse_search) {
        let get_contents =
        parse_search.contents.twoColumnSearchResultsRenderer.primaryContents
        .sectionListRenderer.contents;
        let data_search = get_contents.length == 2 ? get_contents[0].itemSectionRenderer.contents: get_contents[1].itemSectionRenderer.contents;

        for (let a of data_search) {
          let i = a.videoRenderer;
          if (i) {
            let prepare_push = {
              videoId: i.videoId,
              url: `https://www.youtube.com${i.navigationEndpoint.commandMetadata.webCommandMetadata.url}`,
              title: i.title.runs[0].text,
              description: i.detailedMetadataSnippets?i.detailedMetadataSnippets[0].snippetText.runs[0].text: 'Unknown',
              thumbnail: (i.thumbnail.thumbnails[1] || i.thumbnail.thumbnails[0]).url || 'https://telegra.ph/file/355e8ae7da2299a554eba.jpg',
              duration: i.thumbnailOverlays[0].thumbnailOverlayTimeStatusRenderer ? i.thumbnailOverlays[0].thumbnailOverlayTimeStatusRenderer.text.simpleText.replace(/\./gi, ':'): 'Unknown',
              uploaded: i.publishedTimeText?i.publishedTimeText.simpleText: 'Unknown',
              views: isNaN(parseInt(i.viewCountText.simpleText && i.viewCountText.simpleText.split(' x ')[0].replace(/\./g, ''))) ? 'Unknown': parseInt(i.viewCountText.simpleText.split(' x ')[0].replace(/\./g, '')),
              isLive: Object.keys(i).includes('badges') && /live/i.test(i.badges[0].metadataBadgeRenderer.label),
              author: {
                name: i.ownerText.runs[0].text,
                url: `https://www.youtube.com${i.ownerText.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url}`,
              },
            };
            if (prepare_push.isLive) {
              delete prepare_push.duration,
              delete prepare_push.uploaded,
              delete prepare_push.views;
            }
            get_arry.push(prepare_push);
          }
        }
        resolve(get_arry);
      }
    } catch (e) {
      return reject(e);
    }
  });
};