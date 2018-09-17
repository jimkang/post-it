var StaticWebArchive = require('static-web-archive');
var Twit = require('twit');
var Mastodon = require('mastodon');
var callNextTick = require('call-next-tick');
var queue = require('d3-queue').queue;
var postImageToTwitter = require('post-image-to-twitter');
var postImageToMastodon = require('./post-image-to-mastodon');
var curry = require('lodash.curry');
var request = require('request');
var bodyMover = require('request-body-mover');

var postFunctionsForTargets = {
  archive: postToArchive,
  mastodon: postToMastodon,
  twitter: postToTwitter,
  noteTaker: postToNoteTaker
};

function postIt({ id, text, buffer, mediaFilename, altText, targets }, done) {
  if (!targets || targets.length < 1) {
    callNextTick(done);
    return;
  }

  var q = queue();
  targets.forEach(queueTargetPost);
  q.awaitAll(done);

  function queueTargetPost(target) {
    var postFn = postFunctionsForTargets[target.type];
    if (postFn) {
      q.defer(postFn, {
        id,
        text: target.text || text,
        buffer,
        mediaFilename,
        altText,
        config: target.config
      });
    } else {
      console.error('Unknown target type:', target.type);
    }
  }
}

function postToArchive(
  { id, text, buffer, mediaFilename, altText, config },
  done
) {
  var staticWebStream = StaticWebArchive(config);
  staticWebStream.write({
    id,
    date: new Date().toISOString(),
    mediaFilename,
    altText,
    caption: text,
    buffer
  });
  staticWebStream.end(passCompleteMessage);

  function passCompleteMessage() {
    done(null, { message: 'static-web-archive stream ended.' });
  }
}

function postToTwitter({ text, buffer, altText, config }, done) {
  var twit = new Twit(config);
  if (buffer && buffer.length > 0) {
    let postImageToTwitterOpts = {
      twit,
      base64Image: buffer.toString('base64'),
      altText,
      caption: text
    };
    postImageToTwitter(postImageToTwitterOpts, curry(wrapUp)(done));
  } else {
    twit.post('statuses/update', { status: text }, curry(wrapUp)(done));
  }
}

function postToMastodon(
  { text, buffer, mediaFilename, altText, config },
  done
) {
  var twit = new Mastodon(config);
  if (buffer && buffer.length > 0) {
    let postImageOpts = {
      config,
      buffer,
      altText,
      mediaFilename,
      caption: text
    };
    postImageToMastodon(postImageOpts, curry(wrapUp)(done));
  } else {
    twit.post('statuses', { status: text }, curry(wrapUp)(done));
  }
}

function wrapUp(done, error, data) {
  if (error) {
    if (data) {
      console.error('Error posting to Mastodon or Twitter. Data:', data);
    }
    done(error);
  } else {
    if (data) {
      done(null, data);
    } else {
      done(null, { message: 'Post to Twitter or Mastodon completed.' });
    }
  }
}

function postToNoteTaker(
  { config, mediaFilename, buffer, altText, caption },
  allDone
) {
  var reqOpts = {
    url: config.noteTakerURL,
    method: 'POST',
    headers: {
      Authorization: `Key ${config.token}`,
      'X-Note-Archive': config.archive
    }
  };

  if (buffer && buffer.length > 0) {
    let formData = {
      mediaFilename,
      buffer: {
        value: buffer,
        options: {
          filename: mediaFilename
        }
      },
      altText
    };
    if (caption) {
      formData.caption = caption;
    }
    if (mediaFilename.endsWith('.mp4')) {
      formData.isVideo = true;
      formData.buffer.options.contentType = 'video/mp4';
    } else {
      if (mediaFilename.endsWith('.jpg')) {
        formData.buffer.options.contentType = 'image/jpeg';
      } else {
        // TODO: Other image types and file extensions, if necessary.
        formData.buffer.options.contentType = 'image/png';
      }
    }
    console.log('formData', formData);
    reqOpts.formData = formData;
  } else {
    reqOpts.json = true;
    reqOpts.body = caption;
  }
  request(reqOpts, bodyMover(allDone));
}

module.exports = postIt;
