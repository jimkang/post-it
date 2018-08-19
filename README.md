post-it
==================

An abstraction mostly for my projects that posts to multiple targets in one call.

Currently posts to:

- [static-web-archive](https://github.com/jimkang/static-web-archive)
- Mastodon
- Twitter

Installation
------------

    npm install post-it

Usage
-----

    var postIt = require('post-it');

		postIt({
      id: 'hay-8000000',
      text: 'OHAY GUYS here is a pic',
      altText: 'OHAY GUYS here is a pic',
      mediaFilename: 'hay-8000000.jpg',
      buffer: fs.readFileSync(__dirname + '/../fixtures/smidgeo_headshot.jpg', { encoding: null }),
      targets: [
        {
          type: 'archive',
          config: {
            title: 'Test archive',
            homeLink: 'https://smidgeo.com/test',
            rootPath: __dirname + '/../test-archive/',
            maxEntriesPerPage: 25,
            generateRSS: true
          },
        },
        {
          type: 'twitter',
          config: {
						consumer_key: 'something',
						consumer_secret: 'something',
						access_token: 'something',
						access_token_secret: 'something'
					}
        },
        {
          type: 'mastodon',
          config: {
						consumer_key: 'something',
						consumer_secret: 'something',
						access_token: 'something'
					}
        }
      ]
    },
		handleError
	);

Tests
-----

Create a test-config.js in the project root like this:

		module.exports = {
			twitter: {
				consumer_key: 'your stuff',
				consumer_secret: 'your stuff',
				access_token: 'your stuff-NPnDDaC4dcAxXxpJK2rkJW8EUmjUN1i',
				access_token_secret: 'your stuff'
			},
			mastodon: {
				access_token: 'your stuff',
				api_url: 'https://botsin.space/api/v1/',
				timeout_ms: 60 * 1000
			}
		}

Then, run:

		make test

Finally, go look at tests/test-archive to see if the archive HTML is there and the Twitter and Mastodon accounts to see if the posts are there.

License
-------

The MIT License (MIT)

Copyright (c) 2018 Jim Kang

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
