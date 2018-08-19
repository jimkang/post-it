/* global __dirname */

var test = require('tape');
var assertNoError = require('assert-no-error');
var config = require('../../test-config');
var postIt = require('../../index');
var fs = require('fs');

var testCases = [
  {
    name: 'Just text',
    opts: {
      id: 'hay-0',
      text: 'OHAY GUYS',
      targets: [
        {
          type: 'archive',
          config: {
            title: 'Test archive',
            homeLink: 'https://smidgeo.com/test',
            rootPath: __dirname + '/../test-archive/',
            maxEntriesPerPage: 25,
            generateRSS: true
          }
        },
        {
          type: 'twitter',
          config: config.twitter
        },
        {
          type: 'mastodon',
          config: config.mastodon
        }
      ]
    }
  },
  {
    name: 'Image',
    opts: {
      id: 'hay-8000000',
      text: 'OHAY GUYS here is a pic',
      altText: 'OHAY GUYS here is a pic',
      mediaFilename: 'hay-8000000.jpg',
      buffer: fs.readFileSync(__dirname + '/../fixtures/smidgeo_headshot.jpg', {
        encoding: null
      }),
      targets: [
        {
          type: 'archive',
          config: {
            title: 'Test archive',
            homeLink: 'https://smidgeo.com/test',
            rootPath: __dirname + '/../test-archive/',
            maxEntriesPerPage: 25,
            generateRSS: true
          }
        },
        {
          type: 'twitter',
          config: config.twitter
        },
        {
          type: 'mastodon',
          config: config.mastodon
        }
      ]
    }
  }
];

testCases.forEach(runTestCase);

function runTestCase(testCase) {
  test(testCase.name, runTest);

  function runTest(t) {
    postIt(testCase.opts, checkResult);

    function checkResult(error, results) {
      assertNoError(t.ok, error, 'No error while posting.');
      t.ok(results, 'Results are passed.');
      console.log('results', results);
      console.log('Check each target to see if the post is there.');
      t.end();
    }
  }
}
