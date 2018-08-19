var StaticWebArchive = require('static-web-archive');
var Twit = require('twit');
var Mastodon = require('mastodon');
var callNextTick = require('call-next-tick');
var queue = require('d3-queue').queue;
var postImage = require('post-image-to-twitter');

var postFunctionsForTargets = {
  archive: postToArchive,
  mastodon: postToMastodon,
  twitter: postToTwitter
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
        text,
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
  postToTwitterOrMastodon(
    { twitLike: new Twit(config), endpoint: 'statuses/update', text, buffer, altText },
    done
  );
}

function postToMastodon({ text, buffer, altText, config }, done) {
  postToTwitterOrMastodon(
    { twitLike: new Mastodon(config), endpoint: 'statuses', text, buffer, altText },
    done
  );
}

function postToTwitterOrMastodon({ twitLike, endpoint, text, buffer, altText }, done) {
  if (buffer && buffer.length > 0) {
    let postImageOpts = {
      twit: twitLike,
      base64Image: buffer.toString('base64'),
      altText,
      caption: text
    };

    postImage(postImageOpts, wrapUp);
  } else {
    debugger;
    twitLike.post(endpoint, { status: text }, wrapUp);
  }

  function wrapUp(error, data) {
    debugger;
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
}

module.exports = postIt;
