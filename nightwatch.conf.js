const seleniumServer = require("selenium-server");
const chromedriver = require("chromedriver");
const SCREENSHOT_PATH = "./screenshots/";
const BINPATH = './node_modules/nightwatch/bin/';

module.exports = {
  "src_folders": [
    "tests/e2e"
  ],
  "output_folder": "./reports",
  "test_runner" : {
    "type" : "mocha"
  },
  "selenium": {
    "start_process": true,
    "server_path": seleniumServer.path,
    "log_path": "",
    "host": "127.0.0.1",
    "port": 4444,
    "cli_args": {
      "webdriver.chrome.driver" : chromedriver.path
    }
  },
  "test_settings": {
    "default": {
      "selenium_port": 4444,
      "selenium_host": "127.0.0.1",
      "launch_url" : "http://localhost:3003/abe/editor",
      "silent": false,
      "screenshots": {
        "enabled": false,
        "path": ''
      },
      "globals": {
        "waitForConditionTimeout": 3000
      },
      "desiredCapabilities" : {
        "loggingPrefs": {
          "browser":     "ALL",
          "driver":      "ALL",
          "performance": "ALL"
        },
        "browserName" : "chrome",
        "javascriptEnabled" : true,
        "acceptSslCerts" : true,
        "chromeOptions" : {
          "perfLoggingPrefs": {
            "traceCategories": "v8,blink.console,disabled-by-default-devtools.timeline"
          },
          "args" : ["--no-sandbox", "start-fullscreen", "disable-web-security", "allow-running-insecure-content"]
        }
      }
    },
    "chrome": {
      "desiredCapabilities" : {
        "loggingPrefs": {
          "browser":     "ALL",
          "driver":      "ALL",
          "performance": "ALL"
        },
        "browserName" : "chrome",
        "javascriptEnabled" : true,
        "acceptSslCerts" : true,
        "chromeOptions" : {
          "perfLoggingPrefs": {
            "traceCategories": "v8,blink.console,disabled-by-default-devtools.timeline"
          },
          "args" : ["--no-sandbox", "start-fullscreen", "disable-web-security", "allow-running-insecure-content"]
        }
      }
    }
  }
}

/*
// limit tests to one regex
"test_runner" : {
    "type" : "mocha",
    "options" : {
      "grep" : /import/
    }
  },
*/

/*
loggingPrefs: {
  'browser':     'ALL',
  'driver':      'ALL',
  'performance': 'ALL'
},
chromeOptions: {
  perfLoggingPrefs: {
      traceCategories: 'v8,blink.console,disabled-by-default-devtools.timeline'
  },
}
 */
/**
 * selenium-download does exactly what it's name suggests;
 * downloads (or updates) the version of Selenium (& chromedriver)
 * on your localhost where it will be used by Nightwatch.
 /the following code checks for the existence of `selenium.jar` before trying to run our tests.
 */

// require('fs').stat(BINPATH + 'selenium.jar', function (err, stat) { // got it?
//   if (err || !stat || stat.size < 1) {
//     require('selenium-download').ensure(BINPATH, function(error) {
//       if (error) throw new Error(error); // no point continuing so exit!
//       console.log('✔ Selenium & Chromedriver downloaded to:', BINPATH);
//     });
//   }
// });

function padLeft (count) {
  return count < 10 ? '0' + count : count.toString();
}

var FILECOUNT = 0;
/**
 * The default is to save screenshots to the root of your project even though
 * there is a screenshots path in the config object above! ... so we need a
 * function that returns the correct path for storing our screenshots.
 * While we're at it, we are adding some meta-data to the filename, specifically
 * the Platform/Browser where the test was run and the test (file) name.
 */
function imgpath (browser) {
  var a = browser.options.desiredCapabilities;
  var meta = [a.platform];
  meta.push(a.browserName ? a.browserName : 'any');
  meta.push(a.version ? a.version : 'any');
  meta.push(a.name); // this is the test filename so always exists.
  var metadata = meta.join('~').toLowerCase().replace(/ /g, '');
  return SCREENSHOT_PATH + metadata + '_' + padLeft(FILECOUNT++) + '_';
}

module.exports.imgpath = imgpath;
module.exports.SCREENSHOT_PATH = SCREENSHOT_PATH;