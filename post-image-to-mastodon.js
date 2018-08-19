var waterfall = require('async-waterfall');
var callNextTick = require('call-next-tick');
var request = require('request');

function postImageToMastodon(
  { config, dryRun, mediaFilename, buffer, altText, caption },
  allDone
) {
  const mediaEndpoint = 'media';
  const textEndpoint = 'statuses';

  waterfall([postMedia, postToot, passBody], allDone);

  function postMedia(done) {
    var reqOpts = {
      method: 'POST',
      url: `${config.api_url}${mediaEndpoint}`,
      formData: {
        description: altText,
        file: {
          value: buffer,
          options: {
            filename: mediaFilename, // form-data uses this to infer content disposition for this part, so it's critical that it's named correctly. Mastodon will 500 with no other info if content disposition is wrong.
            contentType: 'image/jpeg'
          }
        }
      },
      headers: {
        Authorization: `Bearer ${config.access_token}`
      },
      json: true
    };
    request(reqOpts, done);
  }

  function postToot(res, mediaPostData, done) {
    var body = {
      status: caption,
      media_ids: [mediaPostData.id]
    };

    if (dryRun) {
      console.log('Would have tooted: using', JSON.stringify(body, null, '  '));
      callNextTick(done);
    } else {
      let reqOpts = {
        method: 'POST',
        url: `${config.api_url}${textEndpoint}`,
        body,
        headers: {
          Authorization: `Bearer ${config.access_token}`
        },
        json: true
      };
      request(reqOpts, done);
    }
  }

  function passBody(res, body, done) {
    callNextTick(done, null, body);
  }
}

module.exports = postImageToMastodon;
