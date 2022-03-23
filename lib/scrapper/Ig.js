module.exports= async (linknya) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!/instagram.com/gi.test(linknya))
                return resolve({
                    err: 'Link not valid!',
                });
            let post = await require('node-fetch')(`${linknya}?__a=1`, {
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36',
                    cookie: 'mid=YYuQ8wAEAAGUN_xGj2dW2c6-z48S; ig_did=A60D2CD5-10C6-474F-B87A-8D80E3D99D65; ig_nrcb=1; csrftoken=GBPyfROqRHZT6Zuz0JnAHwA0dGESb1Ba; ds_user_id=7951537703; sessionid=7951537703:u5KmHZ0IdJVTYU:15; shbid="6027\0547951537703\0541671795505:01f789aef7370998eb56d2d980ad45e0a42cba706a1423a53a2a190d496b11d76ce8f61a"; shbts="1640259505\0547951537703\0541671795505:01f7acca201f0f7792b70fbe49fdd3557ef6e39ade22b672ba223e33fbe8247a555328f9"; rur="EAG\0547951537703\0541671797024:01f7a491d02921d1866d38038cdc9b72911432df34c1c8c0b4f8a1c1bee064bea5172164',
                },
            });
            let jsnya = await post.json();
            let resultnya = {
                result: {
                    username: jsnya.graphql.shortcode_media.owner.username,
                    description:
                        jsnya.graphql.shortcode_media.edge_media_to_caption.edges[0].node.text,
                    created: require('moment-timezone')(
                        parseInt(`${jsnya.graphql.shortcode_media.taken_at_timestamp}000`),
                    )
                        .locale('id')
                        .format('dddd, DD-MMM-YYYY | HH:mm a'),
                    views: jsnya.graphql.shortcode_media.is_video
                        ? jsnya.graphql.shortcode_media.video_view_count
                        : '-',
                    likes: jsnya.graphql.shortcode_media.edge_media_preview_like.count,
                    comments: jsnya.graphql.shortcode_media.edge_media_to_parent_comment.count,
                    media: [],
                },
            };
            if (Object.keys(jsnya.graphql.shortcode_media).includes('edge_sidecar_to_children')) {
                jsnya.graphql.shortcode_media.edge_sidecar_to_children.edges.filter((v) => {
                    (isVideo = v.node.is_video),
                        (link = isVideo ? v.node.video_url : v.node.display_url);
                    resultnya.result.media.push({
                        isVideo,
                        link,
                    });
                });
            }
            if (Object.keys(jsnya.graphql.shortcode_media).includes('video_url')) {
                resultnya.result.media.push({
                    isVideo: jsnya.graphql.shortcode_media.is_video,
                    link: jsnya.graphql.shortcode_media.video_url,
                });
            }
            if (!Object.keys(jsnya.graphql.shortcode_media).includes('video_url')) {
                resultnya.result.media.push({
                    isVideo: jsnya.graphql.shortcode_media.is_video,
                    link: jsnya.graphql.shortcode_media.display_url,
                });
            }
            resolve(resultnya);
        } catch (e) {
            return reject(e);
        }
    });
};