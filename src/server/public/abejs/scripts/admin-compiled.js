(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function(str, regex, map) {
    if (arguments.length === 2) {
        map = regex;
        regex = new RegExp(Object.keys(map).join("|"), "ig");
    }

    return str.replace(regex, function(all) {
        if (all in map) {
            return map[all];
        }

        return all;
    });
};

},{}],2:[function(require,module,exports){
/*jslint node: true */
'use strict';

var bulkReplace = require("bulk-replace");

var hiraganaMonographs = {
  "あ": "A", "い": "I", "う": "U", "え": "E", "お": "O",
  "か": "KA", "き": "KI", "く": "KU", "け": "KE", "こ": "KO",
  "さ": "SA", "し": "SHI", "す": "SU", "せ": "SE", "そ": "SO",
  "た": "TA", "ち": "CHI", "つ": "TSU", "て": "TE", "と": "TO",
  "な": "NA", "に": "NI", "ぬ": "NU", "ね": "NE", "の": "NO",
  "は": "HA", "ひ": "HI", "ふ": "FU", "へ": "HE", "ほ": "HO",
  "ま": "MA", "み": "MI", "む": "MU", "め": "ME", "も": "MO",
  "や": "YA", "ゆ": "YU", "よ": "YO",
  "ら": "RA", "り": "RI", "る": "RU", "れ": "RE", "ろ": "RO",
  "わ": "WA", "ゐ": "WI", "ゑ": "WE", "を": "WO", "ん": "N'",
  "が": "GA", "ぎ": "GI", "ぐ": "GU", "げ": "GE", "ご": "GO",
  "ざ": "ZA", "じ": "JI", "ず": "ZU", "ぜ": "ZE", "ぞ": "ZO",
  "だ": "DA", "ぢ": "DJI", "づ": "DZU", "で": "DE", "ど": "DO",
  "ば": "BA", "び": "BI", "ぶ": "BU", "べ": "BE", "ぼ": "BO",
  "ぱ": "PA", "ぴ": "PI", "ぷ": "PU", "ぺ": "PE", "ぽ": "PO"
};

var hiraganaDigraphs = {
  "きゃ": "KYA", "きゅ": "KYU", "きょ": "KYO",
  "しゃ": "SHA", "しゅ": "SHU", "しょ": "SHO",
  "ちゃ": "CHA", "ちゅ": "CHU", "ちょ": "CHO",
  "にゃ": "NYA", "にゅ": "NYU", "にょ": "NYO",
  "ひゃ": "HYA", "ひゅ": "HYU", "ひょ": "HYO",
  "みゃ": "MYA", "みゅ": "MYU", "みょ": "MYO",
  "りゃ": "RYA", "りゅ": "RYU", "りょ": "RYO",
  "ぎゃ": "GYA", "ぎゅ": "GYU", "ぎょ": "GYO",
  "じゃ": "JA", "じゅ": "JU", "じょ": "JO",
  "びゃ": "BYA", "びゅ": "BYU", "びょ": "BYO",
  "ぴゃ": "PYA", "ぴゅ": "PYU", "ぴょ": "PYO"
};

var katakanaMonographs = {
  "ア": "A", "イ": "I", "ウ": "U", "エ": "E", "オ": "O",
  "カ": "KA", "キ": "KI", "ク": "KU", "ケ": "KE", "コ": "KO",
  "サ": "SA", "シ": "SHI", "ス": "SU", "セ": "SE", "ソ": "SO",
  "タ": "TA", "チ": "CHI", "ツ": "TSU", "テ": "TE", "ト": "TO",
  "ナ": "NA", "ニ": "NI", "ヌ": "NU", "ネ": "NE", "ノ": "NO",
  "ハ": "HA", "ヒ": "HI", "フ": "FU", "ヘ": "HE", "ホ": "HO",
  "マ": "MA", "ミ": "MI", "ム": "MU", "メ": "ME", "モ": "MO",
  "ヤ": "YA", "ユ": "YU", "ヨ": "YO",
  "ラ": "RA", "リ": "RI", "ル": "RU", "レ": "RE", "ロ": "RO",
  "ワ": "WA", "ヰ": "WI", "ヱ": "WE",  "ヲ": "WO", "ン": "N",
  "ガ": "GA", "ギ": "GI", "グ": "GU", "ゲ": "GE", "ゴ": "GO",
  "ザ": "ZA", "ジ": "JI", "ズ": "ZU", "ゼ": "ZE", "ゾ": "ZO",
  "ダ": "DA", "ヂ": "DJI", "ヅ": "DZU", "デ": "DE", "ド": "DO",
  "バ": "BA", "ビ": "BI", "ブ": "BU", "ベ": "BE", "ボ": "BO",
  "パ": "PA", "ピ": "PI", "プ": "PU", "ペ": "PE", "ポ": "PO"
};

var katakanaDigraphs = {
  "アー": "Ā", "イー": "Ī", "ウー": "Ū", "エー": "Ē", "オー": "Ō",
  "カー": "KĀ", "キー": "KĪ", "クー": "KŪ", "ケー": "KĒ", "コー": "KŌ",
  "サー": "SĀ", "シー": "SHĪ", "スー": "SŪ", "セー": "SĒ", "ソー": "SŌ",
  "ター": "TĀ", "チー": "CHĪ", "ツー": "TSŪ", "テー": "TĒ", "トー": "TŌ",
  "ナー": "NĀ", "ニー": "NĪ", "ヌー": "NŪ", "ネー": "NĒ", "ノー": "NŌ",
  "ハー": "HĀ", "ヒー": "HĪ", "フー": "FŪ", "ヘー": "HĒ", "ホー": "HŌ",
  "マー": "MĀ", "ミー": "MĪ", "ムー": "MŪ", "メー": "MĒ", "モー": "MŌ",
  "ヤー": "YĀ", "ユー": "YŪ", "ヨー": "YŌ",
  "ラー": "RĀ", "リー": "RĪ", "ルー": "RŪ", "レー": "RĒ", "ロー": "RŌ",
  "ワー": "WĀ", "ヰー": "WĪ", "ヱー": "WĒ",  "ヲー": "WŌ", "ンー": "N",
  "ガー": "GĀ", "ギー": "GĪ", "グー": "GŪ", "ゲー": "GĒ", "ゴー": "GŌ",
  "ザー": "ZĀ", "ジー": "JĪ", "ズー": "ZŪ", "ゼー": "ZĒ", "ゾー": "ZŌ",
  "ダー": "DĀ", "ヂー": "DJĪ", "ヅー": "DZŪ", "デー": "DĒ", "ドー": "DŌ",
  "バー": "BĀ", "ビー": "BĪ", "ブー": "BŪ", "ベー": "BĒ", "ボー": "BŌ",
  "パー": "PĀ", "ピー": "PĪ", "プー": "PŪ", "ペー": "PĒ", "ポー": "PŌ",
  "キャ": "KYA", "キュ": "KYU", "キョ": "KYO",
  "シャ": "SHA", "シュ": "SHU", "ショ": "SHO",
  "チャ": "CHA", "チュ": "CHU", "チョ": "CHO",
  "ニャ": "NYA", "ニュ": "NYU", "ニョ": "NYO",
  "ヒャ": "HYA", "ヒュ": "HYU", "ヒョ": "HYO",
  "ミャ": "MYA", "ミュ": "MYU", "ミョ": "MYO",
  "リャ": "RYA", "リュ": "RYU", "リョ": "RYO",
  "ギャ": "GYA", "ギュ": "GYU", "ギョ": "GYO",
  "ジャ": "JA", "ジュ": "JU", "ジョ": "JO",
  "ビャ": "BYA", "ビュ": "BYU", "ビョ": "BYO",
  "ピャ": "PYA", "ピュ": "PYU", "ピョ": "PYO"
};

var katakanaTrigraphs = {
  "キャー": "KYĀ", "キュー": "KYŪ", "キョー": "KYŌ",
  "シャー": "SHĀ", "シュー": "SHŪ", "ショー": "SHŌ",
  "チャー": "CHĀ", "チュー": "CHŪ", "チョー": "CHŌ",
  "ニャー": "NYĀ", "ニュー": "NYŪ", "ニョー": "NYŌ",
  "ヒャー": "HYĀ", "ヒュー": "HYŪ", "ヒョー": "HYŌ",
  "ミャー": "MYĀ", "ミュー": "MYŪ", "ミョー": "MYŌ",
  "リャー": "RYĀ", "リュー": "RYŪ", "リョー": "RYŌ",
  "ギャー": "GYĀ", "ギュー": "GYŪ", "ギョー": "GYŌ",
  "ジャー": "JĀ", "ジュー": "JŪ", "ジョー": "JŌ",
  "ビャー": "BYĀ", "ビュー": "BYŪ", "ビョー": "BYŌ",
  "ピャー": "PYĀ", "ピュー": "PYŪ", "ピョー": "PYŌ"
};

// Used to convert old Nihon-Shiki style romaji into the modern Hepburn form.
// Source: http://nayuki.eigenstate.org/page/variations-on-japanese-romanization
var nihonShiki = {
    "SI": "SHI",
    "ZI": "JI",
    "TI": "CHI",
    "DI": "JI",
    "TU": "TSU",
    "DU": "ZU",
    "SHU": "SHU", // Prevent HU from accidentally converting
    "CHU": "CHU",
    "HU": "FU",
    "CYA": "CHA",
    "CYO": "CHO",
    "CYU": "CHU",
    "SYA": "SHA",
    "SYU": "SHU",
    "SYO": "SHO",
    "ZYA": "JA",
    "ZYU": "JU",
    "ZYO": "JO",
    "TYA": "CHA",
    "TYU": "CHU",
    "TYO": "CHO",
    "DYA": "JA",
    "DYU": "JU",
    "DYO": "JO"
};

// For use with toHiragana
var hiraganaMap = {};

Object.keys(hiraganaMonographs).forEach(function(key) {
  var value = hiraganaMonographs[key];
  if (!(value in hiraganaMap)) {
    hiraganaMap[value] = key;
  }
});

Object.keys(hiraganaDigraphs).forEach(function(key) {
  var value = hiraganaDigraphs[key];
  if (!(value in hiraganaMap)) {
    hiraganaMap[value] = key;
  }
});

var hiraganaRegex = new RegExp(Object.keys(hiraganaMap).sort(function(a, b) {
  return b.length - a.length;
}).join("|"), "g");

// For use with toKatakana
var katakanaMap = {};

Object.keys(katakanaMonographs).forEach(function(key) {
  var value = katakanaMonographs[key];
  if (!(value in katakanaMap)) {
    katakanaMap[value] = key;
  }
});

Object.keys(katakanaDigraphs).forEach(function(key) {
  var value = katakanaDigraphs[key];
  if (!(value in katakanaMap)) {
    katakanaMap[value] = key;
  }
});

Object.keys(katakanaTrigraphs).forEach(function(key) {
  var value = katakanaTrigraphs[key];
  if (!(value in katakanaMap)) {
    katakanaMap[value] = key;
  }
});

var katakanaRegex = new RegExp(Object.keys(katakanaMap).sort(function(a, b) {
  return b.length - a.length;
}).join("|"), "g");

// API

exports.fromKana = function(str) {
  // Initial transliteration
  str = bulkReplace(str, hiraganaDigraphs);
  str = bulkReplace(str, katakanaDigraphs);
  str = bulkReplace(str, hiraganaMonographs);
  str = bulkReplace(str, katakanaMonographs);

  // Correct use of sokuon
  str = str.replace(/っC/g, "TC").replace(/っ(.)/g, "$1$1");
  str = str.replace(/ッC/g, "TC").replace(/ッ(.)/g, "$1$1");

  // Correct usage of N' (M' is a common mistake)
  str = str.replace(/[NM]'([^YAEIOU]|$)/g, "N$1");

  // Correct use of choonpu
  str = str.replace(/Aー/g, "Ā");
  str = str.replace(/Iー/g, "Ī");
  str = str.replace(/Uー/g, "Ū");
  str = str.replace(/Eー/g, "Ē");
  str = str.replace(/Oー/g, "Ō");

  return str;
};

exports.toHiragana = function(str) {
  // All conversion is done in upper-case
  str = str.toUpperCase();

  // Correct use of sokuon
  str = str.replace(/TC/g, "っC");
  str = str.replace(/([^AEIOUN])\1/g, "っ$1");

  // Transliteration
  str = bulkReplace(str, hiraganaRegex, hiraganaMap);

  // Fix any remaining N/M usage (that isn't a N' usage)
  str = str.replace(/N|M/g, "ん");

  return str;
};

exports.toKatakana = function(str) {
  // All conversion is done in upper-case
  str = str.toUpperCase();

  // Correct use of sokuon
  str = str.replace(/TC/g, "ッC");
  str = str.replace(/([^AEIOUN])\1/g, "ッ$1");

  // Transliteration
  str = bulkReplace(str, katakanaRegex, katakanaMap);

  // Fix any remaining N/M usage (that isn't a N' usage)
  str = str.replace(/N|M/g, "ン");

  return str;
};

exports.cleanRomaji = function(str) {
  // Follows many of the suggestions from:
  // http://nayuki.eigenstate.org/page/variations-on-japanese-romanization

  // All conversion is done in upper-case
  str = str.toUpperCase();

  // Should be using N instead of M
  str = str.replace(/(\w)M([^AEIOUY]|$)/g, "$1N$2");

  // Convert the NN form into the more common N'
  str = str.replace(/NN/g, "N'");

  // Convert usage of OU into the more common OO
  // Handle cases like Toukyou
  str = str.replace(/OU/g, "OO");

  // Fix antiquated usage of OH to mean OO
  // (handle ambiguous cases like 'Kohusai' vs. 'Tohkyoh')
  str = str.replace(/OH([^AIEO]|$)/g, "OO$1");

  // Replace old Nihon-shiki usage with modern Hepburn form
  str = bulkReplace(str, nihonShiki);

  return str;
};

exports.containsHiragana = function(str) {
  return new RegExp(Object.keys(hiraganaMonographs).join('|')).test(str);
};

exports.containsKatakana = function(str) {
  return new RegExp(Object.keys(katakanaMonographs).join('|')).test(str);
};

exports.containsKana = function(str){
  return (exports.containsHiragana(str) || exports.containsKatakana(str));
};

},{"bulk-replace":1}],3:[function(require,module,exports){
'use strict';

var speakingurl = require('speakingurl');
var pinyin = require('pinyin');
var hepburn = require('hepburn');

module.exports = function(text, opt) {
  var options = opt || {};
  var separateNumbers = true;

  if (typeof options === 'string') {
    options = {separator: options};
  }

  if (typeof options.separateNumbers !== 'undefined') {
    separateNumbers = options.separateNumbers;
  }

  // Remove apostrophes contained within a word
  text = text.replace(/(\S)['\u2018\u2019\u201A\u201B\u2032\u2035\u0301](\S)/g, '$1$2');

  // Break out any numbers contained within a word
  if (separateNumbers) {
    text = text.replace(/([^\d\s])([0-9]+)([^\d\s])/g, '$1 $2 $3');
  }

  // Should we remove the separator before a digit where previous word does not end in a digit?
  var mergeDigitSuffixes = false;

  // Language-specific behaviour
  var lang = options.lang;
  if (typeof lang === 'undefined') {
    if (hepburn.containsKana(text)) {
      // Convert from Japanese Kana using Hepburn romanisation
      text = hepburn.fromKana(text);
      // Remove any remaining non-Kana, e.g. Kanji
      text = text.replace(/([^A-Za-z0-9\- ]+)/g, '');
    } else if (/[\u4e00-\u9fa5]+/.test(text)) {
      // Convert Mandarin Chinese to Pinyin with numeric tones
      mergeDigitSuffixes = true;
      // Should we use tone numbers? (default is true)
      var tone = (typeof options.tone === 'boolean') ? options.tone : true;
      text = pinyin(text, {
        'style': tone ? pinyin.STYLE_TONE2 : pinyin.STYLE_NORMAL
      }).join(' ');
      // Remove punctuation symbols
      text = text.replace(/([^0-9A-Za-z ]+)/g, '');
      // Remove space around single character words, caused by non-Mandarin symbols in otherwise Mandarin text
      text = text.replace(/([^1-4]) ([A-Za-z]) /g, '$1$2');
    }
  }
  // Convert to slug using speakingurl
  var separator = options.replacement || options.separator;
  if (typeof separator !== 'string') {
    separator = '-';
  }
  var slug = speakingurl(text, {
    lang: lang || 'en',
    separator: separator
  });
  // Remove separator before a digit where previous word does not end in a digit
  if (mergeDigitSuffixes) {
    slug = slug.replace(/([^0-9])-([0-9])/g, '$1$2');
  }
  return slug;
};

},{"hepburn":2,"pinyin":5,"speakingurl":15}],4:[function(require,module,exports){
(function (global){
// Best place to find information on XHR features is:
// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest

var reqfields = [
  'responseType', 'withCredentials', 'timeout', 'onprogress'
]

// Simple and small ajax function
// Takes a parameters object and a callback function
// Parameters:
//  - url: string, required
//  - headers: object of `{header_name: header_value, ...}`
//  - body:
//      + string (sets content type to 'application/x-www-form-urlencoded' if not set in headers)
//      + FormData (doesn't set content type so that browser will set as appropriate)
//  - method: 'GET', 'POST', etc. Defaults to 'GET' or 'POST' based on body
//  - cors: If your using cross-origin, you will need this true for IE8-9
//
// The following parameters are passed onto the xhr object.
// IMPORTANT NOTE: The caller is responsible for compatibility checking.
//  - responseType: string, various compatability, see xhr docs for enum options
//  - withCredentials: boolean, IE10+, CORS only
//  - timeout: long, ms timeout, IE8+
//  - onprogress: callback, IE10+
//
// Callback function prototype:
//  - statusCode from request
//  - response
//    + if responseType set and supported by browser, this is an object of some type (see docs)
//    + otherwise if request completed, this is the string text of the response
//    + if request is aborted, this is "Abort"
//    + if request times out, this is "Timeout"
//    + if request errors before completing (probably a CORS issue), this is "Error"
//  - request object
//
// Returns the request object. So you can call .abort() or other methods
//
// DEPRECATIONS:
//  - Passing a string instead of the params object has been removed!
//
exports.ajax = function (params, callback) {
  // Any variable used more than once is var'd here because
  // minification will munge the variables whereas it can't munge
  // the object access.
  var headers = params.headers || {}
    , body = params.body
    , method = params.method || (body ? 'POST' : 'GET')
    , called = false

  var req = getRequest(params.cors)

  function cb(statusCode, responseText) {
    return function () {
      if (!called) {
        callback(req.status === undefined ? statusCode : req.status,
                 req.status === 0 ? "Error" : (req.response || req.responseText || responseText),
                 req)
        called = true
      }
    }
  }

  req.open(method, params.url, true)

  var success = req.onload = cb(200)
  req.onreadystatechange = function () {
    if (req.readyState === 4) success()
  }
  req.onerror = cb(null, 'Error')
  req.ontimeout = cb(null, 'Timeout')
  req.onabort = cb(null, 'Abort')

  if (body) {
    setDefault(headers, 'X-Requested-With', 'XMLHttpRequest')

    if (!global.FormData || !(body instanceof global.FormData)) {
      setDefault(headers, 'Content-Type', 'application/x-www-form-urlencoded')
    }
  }

  for (var i = 0, len = reqfields.length, field; i < len; i++) {
    field = reqfields[i]
    if (params[field] !== undefined)
      req[field] = params[field]
  }

  for (var field in headers)
    req.setRequestHeader(field, headers[field])

  req.send(body)

  return req
}

function getRequest(cors) {
  // XDomainRequest is only way to do CORS in IE 8 and 9
  // But XDomainRequest isn't standards-compatible
  // Notably, it doesn't allow cookies to be sent or set by servers
  // IE 10+ is standards-compatible in its XMLHttpRequest
  // but IE 10 can still have an XDomainRequest object, so we don't want to use it
  if (cors && global.XDomainRequest && !/MSIE 1/.test(navigator.userAgent))
    return new XDomainRequest
  if (global.XMLHttpRequest)
    return new XMLHttpRequest
}

function setDefault(obj, key, value) {
  obj[key] = obj[key] || value
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],5:[function(require,module,exports){

module.exports = require("./src/pinyin");

},{"./src/pinyin":8}],6:[function(require,module,exports){
module.exports = {
"èr":"二贰",
"shí":"十时实蚀",
"yǐ":"乙已以蚁倚",
"yī":"一衣医依伊揖壹",
"chǎng,ān,hàn":"厂",
"dīng,zhēng":"丁",
"qī":"七戚欺漆柒凄嘁",
"bǔ,bo":"卜",
"rén":"人仁",
"rù":"入褥",
"jiǔ":"九久酒玖灸韭",
"ér":"儿而",
"bā":"八巴疤叭芭捌笆",
"jǐ,jī":"几",
"le,liǎo":"了",
"lì":"力历厉立励利例栗粒吏沥荔俐莉砾雳痢",
"dāo":"刀",
"nǎi":"乃奶",
"sān":"三叁",
"yòu":"又右幼诱佑",
"yú":"于余鱼娱渔榆愚隅逾舆",
"shì":"士示世市式势事侍饰试视柿是适室逝释誓拭恃嗜",
"gān,gàn":"干",
"gōng":"工弓公功攻宫恭躬",
"kuī":"亏盔窥",
"tǔ":"土",
"cùn":"寸",
"dà,dài,tài":"大",
"cái":"才材财裁",
"xià":"下夏",
"zhàng":"丈仗帐胀障杖账",
"yǔ,yù,yú":"与",
"shàng,shǎng":"上",
"wàn,mò":"万",
"kǒu":"口",
"xiǎo":"小晓",
"jīn":"巾斤今金津筋襟",
"shān":"山删衫珊",
"qiān":"千迁牵谦签",
"qǐ":"乞企启起",
"chuān":"川穿",
"gè,gě":"个各",
"sháo":"勺芍",
"yì":"亿义艺忆议亦异役译易疫益谊意毅翼屹抑邑绎奕逸肄溢",
"jí":"及吉级极即急疾集籍棘辑嫉",
"fán":"凡烦矾樊",
"xī":"夕西吸希析牺息悉惜稀锡溪熄膝昔晰犀熙嬉蟋",
"wán":"丸完玩顽",
"me,mó,ma,yāo":"么",
"guǎng,ān":"广",
"wáng,wú":"亡",
"mén":"门们",
"shī":"尸失师诗狮施湿虱",
"zhī":"之支汁芝肢脂蜘",
"jǐ":"己挤脊",
"zǐ":"子紫姊籽滓",
"wèi":"卫未位味畏胃喂慰谓猬蔚魏",
"yě":"也冶野",
"nǚ,rǔ":"女",
"rèn":"刃认韧纫",
"fēi":"飞非啡",
"xí":"习席袭媳",
"mǎ":"马码玛",
"chā,chá,chǎ":"叉",
"fēng":"丰封疯峰锋蜂枫",
"xiāng":"乡香箱厢湘镶",
"jǐng":"井警阱",
"wáng,wàng":"王",
"kāi":"开揩",
"tiān":"天添",
"wú":"无吴芜梧蜈",
"fū,fú":"夫",
"zhuān":"专砖",
"yuán":"元园原圆援缘源袁猿辕",
"yún":"云匀耘",
"zhā,zā,zhá":"扎",
"mù":"木目牧墓幕暮慕沐募睦穆",
"wǔ":"五午伍武侮舞捂鹉",
"tīng":"厅听",
"bù,fǒu":"不",
"qū,ōu":"区",
"quǎn":"犬",
"tài":"太态泰汰",
"yǒu":"友",
"chē,jū":"车",
"pǐ":"匹",
"yóu":"尤由邮犹油游",
"jù":"巨拒具俱剧距惧锯聚炬",
"yá":"牙芽崖蚜涯衙",
"bǐ":"比彼笔鄙匕秕",
"jiē":"皆阶接街秸",
"hù":"互户护沪",
"qiè,qiē":"切",
"wǎ,wà":"瓦",
"zhǐ":"止旨址纸指趾",
"tún,zhūn":"屯",
"shǎo,shào":"少",
"rì":"日",
"zhōng,zhòng":"中",
"gāng":"冈刚纲缸肛",
"nèi,nà":"内",
"bèi":"贝备倍辈狈惫焙",
"shuǐ":"水",
"jiàn,xiàn":"见",
"niú":"牛",
"shǒu":"手守首",
"máo":"毛矛茅锚",
"qì":"气弃汽器迄泣",
"shēng":"升生声牲笙甥",
"cháng,zhǎng":"长",
"shén,shí":"什",
"piàn,piān":"片",
"pú,pū":"仆",
"huà,huā":"化",
"bì":"币必毕闭毙碧蔽弊避壁庇蓖痹璧",
"chóu,qiú":"仇",
"zhuǎ,zhǎo":"爪",
"jǐn,jìn":"仅",
"réng":"仍",
"fù,fǔ":"父",
"cóng,zòng":"从",
"fǎn":"反返",
"jiè":"介戒届界借诫",
"xiōng":"凶兄胸匈汹",
"fēn,fèn":"分",
"fá":"乏伐罚阀筏",
"cāng":"仓苍舱沧",
"yuè":"月阅悦跃越岳粤",
"shì,zhī":"氏",
"wù":"勿务物误悟雾坞晤",
"qiàn":"欠歉",
"fēng,fěng":"风",
"dān":"丹耽",
"wū":"乌污呜屋巫诬",
"fèng":"凤奉",
"gōu,gòu":"勾",
"wén":"文闻蚊",
"liù,lù":"六",
"huǒ":"火伙",
"fāng":"方芳",
"dǒu,dòu":"斗",
"wèi,wéi":"为",
"dìng":"订定锭",
"jì":"计记技忌际季剂迹既继寄绩妓荠寂鲫冀",
"xīn":"心辛欣新薪锌",
"chǐ,chě":"尺",
"yǐn":"引饮蚓瘾",
"chǒu":"丑",
"kǒng":"孔恐",
"duì":"队对",
"bàn":"办半扮伴瓣绊",
"yǔ,yú":"予",
"yǔn":"允陨",
"quàn":"劝",
"shū":"书叔殊梳舒疏输蔬抒枢淑",
"shuāng":"双霜",
"yù":"玉育狱浴预域欲遇御裕愈誉芋郁喻寓豫",
"huàn":"幻换唤患宦涣焕痪",
"kān":"刊堪勘",
"mò":"末沫漠墨默茉陌寞",
"jī":"击饥圾机肌鸡积基激讥叽唧畸箕",
"dǎ,dá":"打",
"qiǎo":"巧",
"zhèng,zhēng":"正症挣",
"pū":"扑",
"bā,pá":"扒",
"gān":"甘肝竿柑",
"qù":"去",
"rēng":"扔",
"gǔ":"古谷股鼓",
"běn":"本",
"jié,jiē":"节结",
"shù,shú,zhú":"术",
"bǐng":"丙柄饼秉禀",
"kě,kè":"可",
"zuǒ":"左",
"bù":"布步怖部埠",
"shí,dàn":"石",
"lóng":"龙聋隆咙胧窿",
"yà":"轧亚讶",
"miè":"灭蔑",
"píng":"平评凭瓶萍坪",
"dōng":"东冬",
"kǎ,qiǎ":"卡",
"běi,bèi":"北",
"yè":"业页夜液谒腋",
"jiù":"旧救就舅臼疚",
"shuài":"帅蟀",
"guī":"归规闺硅瑰",
"zhàn,zhān":"占",
"dàn":"旦但诞淡蛋氮",
"qiě,jū":"且",
"yè,xié":"叶",
"jiǎ":"甲钾",
"dīng":"叮盯",
"shēn":"申伸身深呻绅",
"hào,háo":"号",
"diàn":"电店垫殿玷淀惦奠",
"tián":"田甜恬",
"shǐ":"史使始驶矢屎",
"zhī,zhǐ":"只",
"yāng":"央殃秧鸯",
"diāo":"叼雕刁碉",
"jiào":"叫轿较窖酵",
"lìng":"另",
"dāo,tāo":"叨",
"sì":"四寺饲肆",
"tàn":"叹炭探碳",
"qiū":"丘秋蚯",
"hé":"禾河荷盒",
"fù":"付负妇附咐赴复傅富腹覆赋缚",
"dài":"代带贷怠袋逮戴",
"xiān":"仙先掀锨",
"yí":"仪宜姨移遗夷胰",
"bái":"白",
"zǎi,zǐ,zī":"仔",
"chì":"斥赤翅",
"tā":"他它塌",
"guā":"瓜刮",
"hū":"乎呼忽",
"cóng":"丛",
"lìng,líng,lǐng":"令",
"yòng":"用",
"shuǎi":"甩",
"yìn":"印",
"lè,yuè":"乐",
"jù,gōu":"句",
"cōng":"匆葱聪囱",
"fàn":"犯饭泛范贩",
"cè":"册厕测策",
"wài":"外",
"chù,chǔ":"处",
"niǎo":"鸟",
"bāo":"包胞苞褒",
"zhǔ":"主煮嘱拄",
"shǎn":"闪陕",
"lán":"兰拦栏蓝篮澜",
"tóu,tou":"头",
"huì":"汇绘贿惠慧讳诲晦秽",
"hàn":"汉旱捍悍焊撼翰憾",
"tǎo":"讨",
"xué":"穴学",
"xiě":"写",
"níng,nìng,zhù":"宁",
"ràng":"让",
"lǐ":"礼李里理鲤",
"xùn":"训讯迅汛驯逊殉",
"yǒng":"永咏泳勇蛹踊",
"mín":"民",
"chū":"出初",
"ní":"尼",
"sī":"司丝私斯撕嘶",
"liáo":"辽疗僚聊寥嘹缭",
"jiā":"加佳嘉枷",
"nú":"奴",
"zhào,shào":"召",
"biān":"边编鞭蝙",
"pí":"皮疲脾啤",
"yùn":"孕运韵酝蕴",
"fā,fà":"发",
"shèng":"圣胜剩",
"tái,tāi":"台苔",
"jiū":"纠究揪鸠",
"mǔ":"母亩牡拇姆",
"káng,gāng":"扛",
"xíng":"刑形型邢",
"dòng":"动冻栋洞",
"kǎo":"考烤拷",
"kòu":"扣寇",
"tuō":"托拖脱",
"lǎo":"老",
"gǒng":"巩汞拱",
"zhí":"执直侄值职植",
"kuò":"扩阔廓",
"yáng":"扬阳杨洋",
"dì,de":"地",
"sǎo,sào":"扫",
"chǎng,cháng":"场",
"ěr":"耳尔饵",
"máng":"芒忙盲茫",
"xiǔ":"朽",
"pǔ,pò,pō,piáo":"朴",
"quán":"权全泉拳痊",
"guò,guo,guō":"过",
"chén":"臣尘辰沉陈晨忱",
"zài":"再在",
"xié":"协胁斜携鞋谐",
"yā,yà":"压",
"yàn":"厌艳宴验雁焰砚唁谚堰",
"yǒu,yòu":"有",
"cún":"存",
"bǎi":"百摆",
"kuā,kuà":"夸",
"jiàng":"匠酱",
"duó":"夺踱",
"huī":"灰挥恢辉徽",
"dá":"达",
"sǐ":"死",
"liè":"列劣烈猎",
"guǐ":"轨鬼诡",
"xié,yá,yé,yú,xú":"邪",
"jiá,jiā,gā,xiá":"夹",
"chéng":"成呈诚承城程惩橙",
"mài":"迈麦卖",
"huà,huá":"划",
"zhì":"至志帜制质治致秩智置挚掷窒滞稚",
"cǐ":"此",
"zhēn":"贞针侦珍真斟榛",
"jiān":"尖奸歼坚肩艰兼煎",
"guāng":"光",
"dāng,dàng":"当",
"zǎo":"早枣澡蚤藻",
"tù,tǔ":"吐",
"xià,hè":"吓",
"chóng":"虫崇",
"tuán":"团",
"tóng,tòng":"同",
"qū,qǔ":"曲",
"diào":"吊钓掉",
"yīn":"因阴音姻茵",
"chī":"吃嗤痴",
"ma,má,mǎ":"吗",
"yǔ":"屿宇羽",
"fān":"帆翻",
"huí":"回茴蛔",
"qǐ,kǎi":"岂",
"zé":"则责",
"suì":"岁碎穗祟遂隧",
"ròu":"肉",
"zhū,shú":"朱",
"wǎng":"网往枉",
"nián":"年",
"diū":"丢",
"shé":"舌",
"zhú":"竹逐烛",
"qiáo":"乔侨桥瞧荞憔",
"wěi":"伟伪苇纬萎",
"chuán,zhuàn":"传",
"pāng":"乓",
"pīng":"乒",
"xiū,xǔ":"休",
"fú":"伏扶俘浮符幅福凫芙袱辐蝠",
"yōu":"优忧悠幽",
"yán":"延严言岩炎沿盐颜阎蜒檐",
"jiàn":"件建荐贱剑健舰践鉴键箭涧",
"rèn,rén":"任",
"huá,huà,huā":"华",
"jià,jiè,jie":"价",
"shāng":"伤商",
"fèn,bīn":"份",
"fǎng":"仿访纺",
"yǎng,áng":"仰",
"zì":"自字",
"xiě,xuè":"血",
"xiàng":"向项象像橡",
"sì,shì":"似",
"hòu":"后厚候",
"zhōu":"舟州周洲",
"háng,xíng":"行",
"huì,kuài":"会",
"shā":"杀纱杉砂",
"hé,gě":"合",
"zhào":"兆赵照罩",
"zhòng":"众仲",
"yé":"爷",
"sǎn":"伞",
"chuàng,chuāng":"创",
"duǒ":"朵躲",
"wēi":"危威微偎薇巍",
"xún":"旬寻巡询循",
"zá":"杂砸",
"míng":"名明鸣铭螟",
"duō":"多哆",
"zhēng":"争征睁筝蒸怔狰",
"sè":"色涩瑟",
"zhuàng":"壮状撞",
"chōng,chòng":"冲",
"bīng":"冰兵",
"zhuāng":"庄装妆桩",
"qìng":"庆",
"liú":"刘留流榴琉硫瘤",
"qí,jì,zī,zhāi":"齐",
"cì":"次赐",
"jiāo":"交郊浇娇骄胶椒焦蕉礁",
"chǎn":"产铲阐",
"wàng":"妄忘旺望",
"chōng":"充",
"wèn":"问",
"chuǎng":"闯",
"yáng,xiáng":"羊",
"bìng,bīng":"并",
"dēng":"灯登蹬",
"mǐ":"米",
"guān":"关官棺",
"hàn,hán":"汗",
"jué":"决绝掘诀爵",
"jiāng":"江姜僵缰",
"tāng,shāng":"汤",
"chí":"池驰迟持弛",
"xīng,xìng":"兴",
"zhái":"宅",
"ān":"安氨庵鞍",
"jiǎng":"讲奖桨蒋",
"jūn":"军均君钧",
"xǔ,hǔ":"许",
"fěng":"讽",
"lùn,lún":"论",
"nóng":"农浓脓",
"shè":"设社舍涉赦",
"nà,nǎ,nèi,nā":"那",
"jìn,jǐn":"尽",
"dǎo":"导岛蹈捣祷",
"sūn,xùn":"孙",
"zhèn":"阵振震镇",
"shōu":"收",
"fáng":"防妨房肪",
"rú":"如儒蠕",
"mā":"妈",
"xì,hū":"戏",
"hǎo,hào":"好",
"tā,jiě":"她",
"guān,guàn":"观冠",
"huān":"欢",
"hóng,gōng":"红",
"mǎi":"买",
"xiān,qiàn":"纤",
"jì,jǐ":"纪济",
"yuē,yāo":"约",
"shòu":"寿受授售兽瘦",
"nòng,lòng":"弄",
"jìn":"进近晋浸",
"wéi":"违围唯维桅",
"yuǎn,yuàn":"远",
"tūn":"吞",
"tán":"坛谈痰昙谭潭檀",
"fǔ":"抚斧府俯辅腐甫脯",
"huài,pēi,pī,péi":"坏",
"rǎo":"扰",
"pī":"批披坯霹",
"zhǎo":"找沼",
"chě":"扯",
"zǒu":"走",
"chāo":"抄钞超",
"bà":"坝爸霸",
"gòng":"贡",
"zhé,shé,zhē":"折",
"qiǎng,qiāng,chēng":"抢",
"zhuā":"抓",
"xiào":"孝笑效哮啸",
"pāo":"抛",
"tóu":"投",
"kàng":"抗炕",
"fén":"坟焚",
"kēng":"坑",
"dǒu":"抖陡蚪",
"ké,qiào":"壳",
"fāng,fáng":"坊",
"niǔ":"扭纽钮",
"kuài":"块快筷",
"bǎ,bà":"把",
"bào":"报抱爆豹",
"jié":"劫杰洁捷截竭",
"què":"却确鹊",
"huā":"花",
"fēn":"芬吩纷氛",
"qín":"芹琴禽勤秦擒",
"láo":"劳牢",
"lú":"芦炉卢庐颅",
"gān,gǎn":"杆",
"kè":"克刻客课",
"sū,sù":"苏",
"dù":"杜渡妒镀",
"gàng,gāng":"杠",
"cūn":"村",
"qiú":"求球囚",
"xìng":"杏幸性姓",
"gèng,gēng":"更",
"liǎng":"两",
"lì,lí":"丽",
"shù":"束述树竖恕庶墅漱",
"dòu":"豆逗痘",
"hái,huán":"还",
"fǒu,pǐ":"否",
"lái":"来莱",
"lián":"连怜帘莲联廉镰",
"xiàn,xuán":"县",
"zhù,chú":"助",
"dāi":"呆",
"kuàng":"旷况矿框眶",
"ya,yā":"呀",
"zú":"足族",
"dūn":"吨蹲墩",
"kùn":"困",
"nán":"男",
"chǎo,chāo":"吵",
"yuán,yún,yùn":"员",
"chuàn":"串",
"chuī":"吹炊",
"ba,bā":"吧",
"hǒu":"吼",
"gǎng":"岗",
"bié,biè":"别",
"dīng,dìng":"钉",
"gào":"告",
"wǒ":"我",
"luàn":"乱",
"tū":"秃突凸",
"xiù":"秀袖绣锈嗅",
"gū,gù":"估",
"měi":"每美",
"hé,hē,hè":"何",
"tǐ,tī,bèn":"体",
"bó,bǎi,bà":"伯",
"zuò":"作坐座做",
"líng":"伶灵铃陵零龄玲凌菱蛉翎",
"dī":"低堤滴",
"yòng,yōng":"佣",
"nǐ":"你拟",
"zhù":"住注驻柱祝铸贮蛀",
"zào":"皂灶造燥躁噪",
"fó,fú,bì,bó":"佛",
"chè":"彻撤澈",
"tuǒ":"妥椭",
"lín":"邻林临琳磷鳞",
"hán":"含寒函涵韩",
"chà":"岔衩",
"cháng":"肠尝常偿",
"dù,dǔ":"肚",
"guī,jūn,qiū":"龟",
"miǎn":"免勉娩冕缅",
"jiǎo,jué":"角",
"kuáng":"狂",
"tiáo,tiāo":"条",
"luǎn":"卵",
"yíng":"迎盈营蝇赢荧莹萤",
"xì,jì":"系",
"chuáng":"床",
"kù":"库裤酷",
"yìng,yīng":"应",
"lěng":"冷",
"zhè,zhèi":"这",
"xù":"序叙绪续絮蓄旭恤酗婿",
"xián":"闲贤弦咸衔嫌涎舷",
"jiān,jiàn":"间监",
"pàn":"判盼叛畔",
"mēn,mèn":"闷",
"wāng":"汪",
"dì,tì,tuí":"弟",
"shā,shà":"沙",
"shà,shā":"煞",
"càn":"灿",
"wò":"沃卧握",
"méi,mò":"没",
"gōu":"沟钩",
"shěn,chén":"沈",
"huái":"怀槐徊淮",
"sòng":"宋送诵颂讼",
"hóng":"宏虹洪鸿",
"qióng":"穷琼",
"zāi":"灾栽",
"liáng":"良梁粮粱",
"zhèng":"证郑政",
"bǔ":"补捕哺",
"sù":"诉肃素速塑粟溯",
"shí,zhì":"识",
"cí":"词辞慈磁祠瓷雌",
"zhěn":"诊枕疹",
"niào,suī":"尿",
"céng":"层",
"jú":"局菊橘",
"wěi,yǐ":"尾",
"zhāng":"张章彰樟",
"gǎi":"改",
"lù":"陆录鹿路赂",
"ē,ā":"阿",
"zǔ":"阻组祖诅",
"miào":"妙庙",
"yāo":"妖腰邀夭吆",
"nǔ":"努",
"jìn,jìng":"劲",
"rěn":"忍",
"qū":"驱屈岖蛆躯",
"chún":"纯唇醇",
"nà":"纳钠捺",
"bó":"驳脖博搏膊舶渤",
"zòng,zǒng":"纵",
"wén,wèn":"纹",
"lǘ":"驴",
"huán":"环",
"qīng":"青轻倾清蜻氢卿",
"xiàn":"现限线宪陷馅羡献腺",
"biǎo":"表",
"mǒ,mò,mā":"抹",
"lǒng":"拢垄",
"dān,dàn,dǎn":"担",
"bá":"拔跋",
"jiǎn":"拣茧俭捡检减剪简柬碱",
"tǎn":"坦毯袒",
"chōu":"抽",
"yā":"押鸦鸭",
"guǎi":"拐",
"pāi":"拍",
"zhě":"者",
"dǐng":"顶鼎",
"yōng":"拥庸",
"chāi,cā":"拆",
"dǐ":"抵",
"jū,gōu":"拘",
"lā":"垃",
"lā,lá":"拉",
"bàn,pàn":"拌",
"zhāo":"招昭",
"pō":"坡泼颇",
"bō":"拨波玻菠播",
"zé,zhái":"择",
"tái":"抬",
"qí,jī":"其奇",
"qǔ":"取娶",
"kǔ":"苦",
"mào":"茂贸帽貌",
"ruò,rě":"若",
"miáo":"苗描瞄",
"píng,pēng":"苹",
"yīng":"英樱鹰莺婴缨鹦",
"qié":"茄",
"jīng":"茎京经惊晶睛精荆兢鲸",
"zhī,qí":"枝",
"bēi":"杯悲碑卑",
"guì,jǔ":"柜",
"bǎn":"板版",
"sōng":"松",
"qiāng":"枪腔",
"gòu":"构购够垢",
"sàng,sāng":"丧",
"huà":"画话桦",
"huò":"或货获祸惑霍",
"cì,cī":"刺",
"yǔ,yù":"雨语",
"bēn,bèn":"奔",
"fèn":"奋粪愤忿",
"hōng":"轰烘",
"qī,qì":"妻",
"ōu":"欧殴鸥",
"qǐng":"顷请",
"zhuǎn,zhuàn,zhuǎi":"转",
"zhǎn":"斩盏展",
"ruǎn":"软",
"lún":"轮仑伦沦",
"dào":"到盗悼道稻",
"chǐ":"齿耻侈",
"kěn":"肯垦恳啃",
"hǔ":"虎",
"xiē,suò":"些",
"lǔ":"虏鲁卤",
"shèn":"肾渗慎",
"shàng":"尚",
"guǒ":"果裹",
"kūn":"昆坤",
"guó":"国",
"chāng":"昌猖",
"chàng":"畅唱",
"diǎn":"典点碘",
"gù":"固故顾雇",
"áng":"昂",
"zhōng":"忠终钟盅衷",
"ne,ní":"呢",
"àn":"岸按案暗",
"tiě,tiē,tiè,":"帖",
"luó":"罗萝锣箩骡螺逻",
"kǎi":"凯慨",
"lǐng,líng":"岭",
"bài":"败拜",
"tú":"图徒途涂屠",
"chuí":"垂锤捶",
"zhī,zhì":"知织",
"guāi":"乖",
"gǎn":"秆赶敢感橄",
"hé,hè,huó,huò,hú":"和",
"gòng,gōng":"供共",
"wěi,wēi":"委",
"cè,zè,zhāi":"侧",
"pèi":"佩配沛",
"pò,pǎi":"迫",
"de,dì,dí":"的",
"pá":"爬",
"suǒ":"所索锁琐",
"jìng":"径竞竟敬静境镜靖",
"mìng":"命",
"cǎi,cài":"采",
"niàn":"念",
"tān":"贪摊滩瘫",
"rǔ":"乳辱",
"pín":"贫",
"fū":"肤麸孵敷",
"fèi":"肺废沸费吠",
"zhǒng":"肿",
"péng":"朋棚蓬膨硼鹏澎篷",
"fú,fù":"服",
"féi":"肥",
"hūn":"昏婚荤",
"tù":"兔",
"hú":"狐胡壶湖蝴弧葫",
"gǒu":"狗苟",
"bǎo":"饱宝保",
"xiǎng":"享响想",
"biàn":"变遍辨辩辫",
"dǐ,de":"底",
"jìng,chēng":"净",
"fàng":"放",
"nào":"闹",
"zhá":"闸铡",
"juàn,juǎn":"卷",
"quàn,xuàn":"券",
"dān,shàn,chán":"单",
"chǎo":"炒",
"qiǎn,jiān":"浅",
"fǎ":"法",
"xiè,yì":"泄",
"lèi":"泪类",
"zhān":"沾粘毡瞻",
"pō,bó":"泊",
"pào,pāo":"泡",
"xiè":"泻卸屑械谢懈蟹",
"ní,nì":"泥",
"zé,shì":"泽",
"pà":"怕帕",
"guài":"怪",
"zōng":"宗棕踪",
"shěn":"审婶",
"zhòu":"宙昼皱骤咒",
"kōng,kòng,kǒng":"空",
"láng,làng":"郎",
"chèn":"衬趁",
"gāi":"该",
"xiáng,yáng":"详",
"lì,dài":"隶",
"jū":"居鞠驹",
"shuā,shuà":"刷",
"mèng":"孟梦",
"gū":"孤姑辜咕沽菇箍",
"jiàng,xiáng":"降",
"mèi":"妹昧媚",
"jiě":"姐",
"jià":"驾架嫁稼",
"cān,shēn,cēn,sān":"参",
"liàn":"练炼恋链",
"xì":"细隙",
"shào":"绍哨",
"tuó":"驼驮鸵",
"guàn":"贯惯灌罐",
"zòu":"奏揍",
"chūn":"春椿",
"bāng":"帮邦梆",
"dú,dài":"毒",
"guà":"挂卦褂",
"kuǎ":"垮",
"kuà,kū":"挎",
"náo":"挠",
"dǎng,dàng":"挡",
"shuān":"拴栓",
"tǐng":"挺艇",
"kuò,guā":"括",
"shí,shè":"拾",
"tiāo,tiǎo":"挑",
"wā":"挖蛙洼",
"pīn":"拼",
"shèn,shén":"甚",
"mǒu":"某",
"nuó":"挪",
"gé":"革阁格隔",
"xiàng,hàng":"巷",
"cǎo":"草",
"chá":"茶察茬",
"dàng":"荡档",
"huāng":"荒慌",
"róng":"荣绒容熔融茸蓉溶榕",
"nán,nā":"南",
"biāo":"标彪膘",
"yào":"药耀",
"kū":"枯哭窟",
"xiāng,xiàng":"相",
"chá,zhā":"查",
"liǔ":"柳",
"bǎi,bó,bò":"柏",
"yào,yāo":"要",
"wāi":"歪",
"yán,yàn":"研",
"lí":"厘狸离犁梨璃黎漓篱",
"qì,qiè":"砌",
"miàn":"面",
"kǎn":"砍坎",
"shuǎ":"耍",
"nài":"耐奈",
"cán":"残蚕惭",
"zhàn":"战站栈绽蘸",
"bèi,bēi":"背",
"lǎn":"览懒揽缆榄",
"shěng,xǐng":"省",
"xiāo,xuē":"削",
"zhǎ":"眨",
"hǒng,hōng,hòng":"哄",
"xiǎn":"显险",
"mào,mò":"冒",
"yǎ,yā":"哑",
"yìng":"映硬",
"zuó":"昨",
"xīng":"星腥猩",
"pā":"趴",
"guì":"贵桂跪刽",
"sī,sāi":"思",
"xiā":"虾瞎",
"mǎ,mā,mà":"蚂",
"suī":"虽",
"pǐn":"品",
"mà":"骂",
"huá,huā":"哗",
"yè,yàn,yān":"咽",
"zán,zǎ":"咱",
"hā,hǎ,hà":"哈",
"yǎo":"咬舀",
"nǎ,něi,na,né":"哪",
"hāi,ké":"咳",
"xiá":"峡狭霞匣侠暇辖",
"gǔ,gū":"骨",
"gāng,gàng":"钢",
"tiē":"贴",
"yào,yuè":"钥",
"kàn,kān":"看",
"jǔ":"矩举",
"zěn":"怎",
"xuǎn":"选癣",
"zhòng,zhǒng,chóng":"种",
"miǎo":"秒渺藐",
"kē":"科棵颗磕蝌",
"biàn,pián":"便",
"zhòng,chóng":"重",
"liǎ":"俩",
"duàn":"段断缎锻",
"cù":"促醋簇",
"shùn":"顺瞬",
"xiū":"修羞",
"sú":"俗",
"qīn":"侵钦",
"xìn,shēn":"信",
"huáng":"皇黄煌凰惶蝗蟥",
"zhuī,duī":"追",
"jùn":"俊峻骏竣",
"dài,dāi":"待",
"xū":"须虚需",
"hěn":"很狠",
"dùn":"盾顿钝",
"lǜ":"律虑滤氯",
"pén":"盆",
"shí,sì,yì":"食",
"dǎn":"胆",
"táo":"逃桃陶萄淘",
"pàng":"胖",
"mài,mò":"脉",
"dú":"独牍",
"jiǎo":"狡饺绞脚搅",
"yuàn":"怨院愿",
"ráo":"饶",
"wān":"弯湾豌",
"āi":"哀哎埃",
"jiāng,jiàng":"将浆",
"tíng":"亭庭停蜓廷",
"liàng":"亮谅辆晾",
"dù,duó":"度",
"chuāng":"疮窗",
"qīn,qìng":"亲",
"zī":"姿资滋咨",
"dì":"帝递第蒂缔",
"chà,chā,chāi,cī":"差",
"yǎng":"养氧痒",
"qián":"前钱钳潜黔",
"mí":"迷谜靡",
"nì":"逆昵匿腻",
"zhà,zhá":"炸",
"zǒng":"总",
"làn":"烂滥",
"pào,páo,bāo":"炮",
"tì":"剃惕替屉涕",
"sǎ,xǐ":"洒",
"zhuó":"浊啄灼茁卓酌",
"xǐ,xiǎn":"洗",
"qià":"洽恰",
"pài":"派湃",
"huó":"活",
"rǎn":"染",
"héng":"恒衡",
"hún":"浑魂",
"nǎo":"恼脑",
"jué,jiào":"觉",
"hèn":"恨",
"xuān":"宣轩喧",
"qiè":"窃怯",
"biǎn,piān":"扁",
"ǎo":"袄",
"shén":"神",
"shuō,shuì,yuè":"说",
"tuì":"退蜕",
"chú":"除厨锄雏橱",
"méi":"眉梅煤霉玫枚媒楣",
"hái":"孩",
"wá":"娃",
"lǎo,mǔ":"姥",
"nù":"怒",
"hè":"贺赫褐鹤",
"róu":"柔揉蹂",
"bǎng":"绑膀",
"lěi":"垒蕾儡",
"rào":"绕",
"gěi,jǐ":"给",
"luò":"骆洛",
"luò,lào":"络",
"tǒng":"统桶筒捅",
"gēng":"耕羹",
"hào":"耗浩",
"bān":"班般斑搬扳颁",
"zhū":"珠株诸猪蛛",
"lāo":"捞",
"fěi":"匪诽",
"zǎi,zài":"载",
"mái,mán":"埋",
"shāo,shào":"捎稍",
"zhuō":"捉桌拙",
"niē":"捏",
"kǔn":"捆",
"dū,dōu":"都",
"sǔn":"损笋",
"juān":"捐鹃",
"zhé":"哲辙",
"rè":"热",
"wǎn":"挽晚碗惋婉",
"ái,āi":"挨",
"mò,mù":"莫",
"è,wù,ě,wū":"恶",
"tóng":"桐铜童彤瞳",
"xiào,jiào":"校",
"hé,hú":"核",
"yàng":"样漾",
"gēn":"根跟",
"gē":"哥鸽割歌戈",
"chǔ":"础储楚",
"pò":"破魄",
"tào":"套",
"chái":"柴豺",
"dǎng":"党",
"mián":"眠绵棉",
"shài":"晒",
"jǐn":"紧锦谨",
"yūn,yùn":"晕",
"huàng,huǎng":"晃",
"shǎng":"晌赏",
"ēn":"恩",
"ài,āi":"唉",
"ā,á,ǎ,à,a":"啊",
"bà,ba,pí":"罢",
"zéi":"贼",
"tiě":"铁",
"zuàn,zuān":"钻",
"qiān,yán":"铅",
"quē":"缺",
"tè":"特",
"chéng,shèng":"乘",
"dí":"敌笛涤嘀嫡",
"zū":"租",
"chèng":"秤",
"mì,bì":"秘泌",
"chēng,chèn,chèng":"称",
"tòu":"透",
"zhài":"债寨",
"dào,dǎo":"倒",
"tǎng,cháng":"倘",
"chàng,chāng":"倡",
"juàn":"倦绢眷",
"chòu,xiù":"臭",
"shè,yè,yì":"射",
"xú":"徐",
"háng":"航杭",
"ná":"拿",
"wēng":"翁嗡",
"diē":"爹跌",
"ài":"爱碍艾隘",
"gē,gé":"胳搁",
"cuì":"脆翠悴粹",
"zàng":"脏葬",
"láng":"狼廊琅榔",
"féng":"逢",
"è":"饿扼遏愕噩鳄",
"shuāi,cuī":"衰",
"gāo":"高糕羔篙",
"zhǔn":"准",
"bìng":"病",
"téng":"疼腾誊藤",
"liáng,liàng":"凉量",
"táng":"唐堂塘膛糖棠搪",
"pōu":"剖",
"chù,xù":"畜",
"páng,bàng":"旁磅",
"lǚ":"旅屡吕侣铝缕履",
"fěn":"粉",
"liào":"料镣",
"shāo":"烧",
"yān":"烟淹",
"tāo":"涛掏滔",
"lào":"涝酪",
"zhè":"浙蔗",
"xiāo":"消宵销萧硝箫嚣",
"hǎi":"海",
"zhǎng,zhàng":"涨",
"làng":"浪",
"rùn":"润闰",
"tàng":"烫",
"yǒng,chōng":"涌",
"huǐ":"悔毁",
"qiāo,qiǎo":"悄",
"hài":"害亥骇",
"jiā,jia,jie":"家",
"kuān":"宽",
"bīn":"宾滨彬缤濒",
"zhǎi":"窄",
"lǎng":"朗",
"dú,dòu":"读",
"zǎi":"宰",
"shàn,shān":"扇",
"shān,shàn":"苫",
"wà":"袜",
"xiáng":"祥翔",
"shuí":"谁",
"páo":"袍咆",
"bèi,pī":"被",
"tiáo,diào,zhōu":"调",
"yuān":"冤鸳渊",
"bō,bāo":"剥",
"ruò":"弱",
"péi":"陪培赔",
"niáng":"娘",
"tōng":"通",
"néng,nài":"能",
"nán,nàn,nuó":"难",
"sāng":"桑",
"pěng":"捧",
"dǔ":"堵赌睹",
"yǎn":"掩眼演衍",
"duī":"堆",
"pái,pǎi":"排",
"tuī":"推",
"jiào,jiāo":"教",
"lüè":"掠略",
"jù,jū":"据",
"kòng":"控",
"zhù,zhuó,zhe":"著",
"jūn,jùn":"菌",
"lè,lēi":"勒",
"méng":"萌盟檬朦",
"cài":"菜",
"tī":"梯踢剔",
"shāo,sào":"梢",
"fù,pì":"副",
"piào,piāo":"票",
"shuǎng":"爽",
"shèng,chéng":"盛",
"què,qiāo,qiǎo":"雀",
"xuě":"雪",
"chí,shi":"匙",
"xuán":"悬玄漩",
"mī,mí":"眯",
"la,lā":"啦",
"shé,yí":"蛇",
"lèi,léi,lěi":"累",
"zhǎn,chán":"崭",
"quān,juàn,juān":"圈",
"yín":"银吟淫",
"bèn":"笨",
"lóng,lǒng":"笼",
"mǐn":"敏皿闽悯",
"nín":"您",
"ǒu":"偶藕",
"tōu":"偷",
"piān":"偏篇翩",
"dé,děi,de":"得",
"jiǎ,jià":"假",
"pán":"盘",
"chuán":"船",
"cǎi":"彩睬踩",
"lǐng":"领",
"liǎn":"脸敛",
"māo,máo":"猫",
"měng":"猛锰",
"cāi":"猜",
"háo":"毫豪壕嚎",
"má":"麻",
"guǎn":"馆管",
"còu":"凑",
"hén":"痕",
"kāng":"康糠慷",
"xuán,xuàn":"旋",
"zhe,zhuó,zháo,zhāo":"着",
"lǜ,shuài":"率",
"gài,gě,hé":"盖",
"cū":"粗",
"lín,lìn":"淋",
"qú,jù":"渠",
"jiàn,jiān":"渐溅",
"hùn,hún":"混",
"pó":"婆",
"qíng":"情晴擎",
"cǎn":"惨",
"sù,xiǔ,xiù":"宿",
"yáo":"窑谣摇遥肴姚",
"móu":"谋",
"mì":"密蜜觅",
"huǎng":"谎恍幌",
"tán,dàn":"弹",
"suí":"随",
"yǐn,yìn":"隐",
"jǐng,gěng":"颈",
"shéng":"绳",
"qí":"骑棋旗歧祈脐畦崎鳍",
"chóu":"绸酬筹稠愁畴",
"lǜ,lù":"绿",
"dā":"搭",
"kuǎn":"款",
"tǎ":"塔",
"qū,cù":"趋",
"tí,dī,dǐ":"提",
"jiē,qì":"揭",
"xǐ":"喜徙",
"sōu":"搜艘",
"chā":"插",
"lǒu,lōu":"搂",
"qī,jī":"期",
"rě":"惹",
"sàn,sǎn":"散",
"dǒng":"董懂",
"gě,gé":"葛",
"pú":"葡菩蒲",
"zhāo,cháo":"朝",
"luò,là,lào":"落",
"kuí":"葵魁",
"bàng":"棒傍谤",
"yǐ,yī":"椅",
"sēn":"森",
"gùn,hùn":"棍",
"bī":"逼",
"zhí,shi":"殖",
"xià,shà":"厦",
"liè,liě":"裂",
"xióng":"雄熊",
"zàn":"暂赞",
"yǎ":"雅",
"chǎng":"敞",
"zhǎng":"掌",
"shǔ":"暑鼠薯黍蜀署曙",
"zuì":"最罪醉",
"hǎn":"喊罕",
"jǐng,yǐng":"景",
"lǎ":"喇",
"pēn,pèn":"喷",
"pǎo,páo":"跑",
"chuǎn":"喘",
"hē,hè,yè":"喝",
"hóu":"喉猴",
"pù,pū":"铺",
"hēi":"黑",
"guō":"锅郭",
"ruì":"锐瑞",
"duǎn":"短",
"é":"鹅额讹俄",
"děng":"等",
"kuāng":"筐",
"shuì":"税睡",
"zhù,zhú":"筑",
"shāi":"筛",
"dá,dā":"答",
"ào":"傲澳懊",
"pái":"牌徘",
"bǎo,bǔ,pù":"堡",
"ào,yù":"奥",
"fān,pān":"番",
"là,xī":"腊",
"huá":"猾滑",
"rán":"然燃",
"chán":"馋缠蝉",
"mán":"蛮馒",
"tòng":"痛",
"shàn":"善擅膳赡",
"zūn":"尊遵",
"pǔ":"普谱圃浦",
"gǎng,jiǎng":"港",
"céng,zēng":"曾",
"wēn":"温瘟",
"kě":"渴",
"zhā":"渣",
"duò":"惰舵跺",
"gài":"溉概丐钙",
"kuì":"愧",
"yú,tōu":"愉",
"wō":"窝蜗",
"cuàn":"窜篡",
"qún":"裙群",
"qiáng,qiǎng,jiàng":"强",
"shǔ,zhǔ":"属",
"zhōu,yù":"粥",
"sǎo":"嫂",
"huǎn":"缓",
"piàn":"骗",
"mō":"摸",
"shè,niè":"摄",
"tián,zhèn":"填",
"gǎo":"搞稿镐",
"suàn":"蒜算",
"méng,mēng,měng":"蒙",
"jìn,jīn":"禁",
"lóu":"楼娄",
"lài":"赖癞",
"lù,liù":"碌",
"pèng":"碰",
"léi":"雷",
"báo":"雹",
"dū":"督",
"nuǎn":"暖",
"xiē":"歇楔蝎",
"kuà":"跨胯",
"tiào,táo":"跳",
"é,yǐ":"蛾",
"sǎng":"嗓",
"qiǎn":"遣谴",
"cuò":"错挫措锉",
"ǎi":"矮蔼",
"shǎ":"傻",
"cuī":"催摧崔",
"tuǐ":"腿",
"chù":"触矗",
"jiě,jiè,xiè":"解",
"shù,shǔ,shuò":"数",
"mǎn":"满",
"liū,liù":"溜",
"gǔn":"滚",
"sāi,sài,sè":"塞",
"pì,bì":"辟",
"dié":"叠蝶谍碟",
"fèng,féng":"缝",
"qiáng":"墙",
"piě,piē":"撇",
"zhāi":"摘斋",
"shuāi":"摔",
"mó,mú":"模",
"bǎng,bàng":"榜",
"zhà":"榨乍诈",
"niàng":"酿",
"zāo":"遭糟",
"suān":"酸",
"shang,cháng":"裳",
"sòu":"嗽",
"là":"蜡辣",
"qiāo":"锹敲跷",
"zhuàn":"赚撰",
"wěn":"稳吻紊",
"bí":"鼻荸",
"mó":"膜魔馍摹蘑",
"xiān,xiǎn":"鲜",
"yí,nǐ":"疑",
"gāo,gào":"膏",
"zhē":"遮",
"duān":"端",
"màn":"漫慢曼幔",
"piāo,piào,piǎo":"漂",
"lòu":"漏陋",
"sài":"赛",
"nèn":"嫩",
"dèng":"凳邓瞪",
"suō,sù":"缩",
"qù,cù":"趣",
"sā,sǎ":"撒",
"tàng,tāng":"趟",
"chēng":"撑",
"zēng":"增憎",
"cáo":"槽曹",
"héng,hèng":"横",
"piāo":"飘",
"mán,mén":"瞒",
"tí":"题蹄啼",
"yǐng":"影颖",
"bào,pù":"暴",
"tà":"踏蹋",
"kào":"靠铐",
"pì":"僻屁譬",
"tǎng":"躺",
"dé":"德",
"mó,mā":"摩",
"shú":"熟秫赎",
"hú,hū,hù":"糊",
"pī,pǐ":"劈",
"cháo":"潮巢",
"cāo":"操糙",
"yàn,yān":"燕",
"diān":"颠掂",
"báo,bó,bò":"薄",
"cān":"餐",
"xǐng":"醒",
"zhěng":"整拯",
"zuǐ":"嘴",
"zèng":"赠",
"mó,mò":"磨",
"níng":"凝狞柠",
"jiǎo,zhuó":"缴",
"cā":"擦",
"cáng,zàng":"藏",
"fán,pó":"繁",
"bì,bei":"臂",
"bèng":"蹦泵",
"pān":"攀潘",
"chàn,zhàn":"颤",
"jiāng,qiáng":"疆",
"rǎng":"壤攘",
"jiáo,jué,jiào":"嚼",
"rǎng,rāng":"嚷",
"chǔn":"蠢",
"lù,lòu":"露",
"náng,nāng":"囊",
"dǎi":"歹",
"rǒng":"冗",
"hāng,bèn":"夯",
"āo,wā":"凹",
"féng,píng":"冯",
"yū":"迂淤",
"xū,yù":"吁",
"lèi,lē":"肋",
"kōu":"抠",
"lūn,lún":"抡",
"jiè,gài":"芥",
"xīn,xìn":"芯",
"chā,chà":"杈",
"xiāo,xiào":"肖",
"zhī,zī":"吱",
"ǒu,ōu,òu":"呕",
"nà,nè":"呐",
"qiàng,qiāng":"呛",
"tún,dùn":"囤",
"kēng,háng":"吭",
"shǔn":"吮",
"diàn,tián":"佃",
"sì,cì":"伺",
"zhǒu":"肘帚",
"diàn,tián,shèng":"甸",
"páo,bào":"刨",
"lìn":"吝赁躏",
"duì,ruì,yuè":"兑",
"zhuì":"坠缀赘",
"kē,kě":"坷",
"tuò,tà,zhí":"拓",
"fú,bì":"拂",
"nǐng,níng,nìng":"拧",
"ào,ǎo,niù":"拗",
"kē,hē":"苛",
"yān,yǎn":"奄",
"hē,a,kē":"呵",
"gā,kā":"咖",
"biǎn":"贬匾",
"jiǎo,yáo":"侥",
"chà,shā":"刹",
"āng":"肮",
"wèng":"瓮",
"nüè,yào":"疟",
"páng":"庞螃",
"máng,méng":"氓",
"gē,yì":"疙",
"jǔ,jù":"沮",
"zú,cù":"卒",
"nìng":"泞",
"chǒng":"宠",
"wǎn,yuān":"宛",
"mí,mǐ":"弥",
"qì,qiè,xiè":"契",
"xié,jiā":"挟",
"duò,duǒ":"垛",
"jiá":"荚颊",
"zhà,shān,shi,cè":"栅",
"bó,bèi":"勃",
"zhóu,zhòu":"轴",
"nüè":"虐",
"liē,liě,lié,lie":"咧",
"dǔn":"盹",
"xūn":"勋",
"yo,yō":"哟",
"mī":"咪",
"qiào,xiào":"俏",
"hóu,hòu":"侯",
"pēi":"胚",
"tāi":"胎",
"luán":"峦",
"sà":"飒萨",
"shuò":"烁",
"xuàn":"炫",
"píng,bǐng":"屏",
"nà,nuó":"娜",
"pá,bà":"耙",
"gěng":"埂耿梗",
"niè":"聂镊孽",
"mǎng":"莽",
"qī,xī":"栖",
"jiǎ,gǔ":"贾",
"chěng":"逞",
"pēng":"砰烹",
"láo,lào":"唠",
"bàng,bèng":"蚌",
"gōng,zhōng":"蚣",
"li,lǐ,lī":"哩",
"suō":"唆梭嗦",
"hēng":"哼",
"zāng":"赃",
"qiào":"峭窍撬",
"mǎo":"铆",
"ǎn":"俺",
"sǒng":"耸",
"juè,jué":"倔",
"yīn,yān,yǐn":"殷",
"guàng":"逛",
"něi":"馁",
"wō,guō":"涡",
"lào,luò":"烙",
"nuò":"诺懦糯",
"zhūn":"谆",
"niǎn,niē":"捻",
"qiā":"掐",
"yè,yē":"掖",
"chān,xiān,càn,shǎn":"掺",
"dǎn,shàn":"掸",
"fēi,fěi":"菲",
"qián,gān":"乾",
"shē":"奢赊",
"shuò,shí":"硕",
"luō,luó,luo":"啰",
"shá":"啥",
"hǔ,xià":"唬",
"tuò":"唾",
"bēng":"崩",
"dāng,chēng":"铛",
"xiǎn,xǐ":"铣",
"jiǎo,jiáo":"矫",
"tiáo":"笤",
"kuǐ,guī":"傀",
"xìn":"衅",
"dōu":"兜",
"jì,zhài":"祭",
"xiáo":"淆",
"tǎng,chǎng":"淌",
"chún,zhūn":"淳",
"shuàn":"涮",
"dāng":"裆",
"wèi,yù":"尉",
"duò,huī":"堕",
"chuò,chāo":"绰",
"bēng,běng,bèng":"绷",
"zōng,zèng":"综",
"zhuó,zuó":"琢",
"chuǎi,chuài,chuāi,tuán,zhuī":"揣",
"péng,bāng":"彭",
"chān":"搀",
"cuō":"搓",
"sāo":"搔",
"yē":"椰",
"zhuī,chuí":"椎",
"léng,lēng,líng":"棱",
"hān":"酣憨",
"sū":"酥",
"záo":"凿",
"qiào,qiáo":"翘",
"zhā,chā":"喳",
"bǒ":"跛",
"há,gé":"蛤",
"qiàn,kàn":"嵌",
"bāi":"掰",
"yān,ā":"腌",
"wàn":"腕",
"dūn,duì":"敦",
"kuì,huì":"溃",
"jiǒng":"窘",
"sāo,sǎo":"骚",
"pìn":"聘",
"bǎ":"靶",
"xuē":"靴薛",
"hāo":"蒿",
"léng":"楞",
"kǎi,jiē":"楷",
"pín,bīn":"频",
"zhuī":"锥",
"tuí":"颓",
"sāi":"腮",
"liú,liù":"馏",
"nì,niào":"溺",
"qǐn":"寝",
"luǒ":"裸",
"miù":"谬",
"jiǎo,chāo":"剿",
"áo,āo":"熬",
"niān":"蔫",
"màn,wàn":"蔓",
"chá,chā":"碴",
"xūn,xùn":"熏",
"tiǎn":"舔",
"sēng":"僧",
"da,dá":"瘩",
"guǎ":"寡",
"tuì,tùn":"褪",
"niǎn":"撵碾",
"liáo,liāo":"撩",
"cuō,zuǒ":"撮",
"ruǐ":"蕊",
"cháo,zhāo":"嘲",
"biē":"憋鳖",
"hēi,mò":"嘿",
"zhuàng,chuáng":"幢",
"jī,qǐ":"稽",
"lǒu":"篓",
"lǐn":"凛檩",
"biě,biē":"瘪",
"liáo,lào,lǎo":"潦",
"chéng,dèng":"澄",
"lèi,léi":"擂",
"piáo":"瓢",
"shà":"霎",
"mò,má":"蟆",
"qué":"瘸",
"liáo,liǎo":"燎",
"liào,liǎo":"瞭",
"sào,sāo":"臊",
"mí,méi":"糜",
"ái":"癌",
"tún":"臀",
"huò,huō,huá":"豁",
"pù,bào":"瀑",
"chuō":"戳",
"zǎn,cuán":"攒",
"cèng":"蹭",
"bò,bǒ":"簸",
"bó,bù":"簿",
"bìn":"鬓",
"suǐ":"髓",
"ráng":"瓤",
};

},{}],7:[function(require,module,exports){
// 带音标字符。
module.exports = {
  "ā": "a1",
  "á": "a2",
  "ǎ": "a3",
  "à": "a4",
  "ē": "e1",
  "é": "e2",
  "ě": "e3",
  "è": "e4",
  "ō": "o1",
  "ó": "o2",
  "ǒ": "o3",
  "ò": "o4",
  "ī": "i1",
  "í": "i2",
  "ǐ": "i3",
  "ì": "i4",
  "ū": "u1",
  "ú": "u2",
  "ǔ": "u3",
  "ù": "u4",
  "ü": "v0",
  "ǘ": "v2",
  "ǚ": "v3",
  "ǜ": "v4",
  "ń": "n2",
  "ň": "n3",
  "": "m2",
};

},{}],8:[function(require,module,exports){
(function (process){
"use strict";

var isNode = typeof process === "object" &&
  process.toString() === "[object process]";

// 分词模块
var jieba;
var PHRASES_DICT;
var PINYIN_DICT;


// 解压拼音库。
// @param {Object} dict_combo, 压缩的拼音库。
// @param {Object} 解压的拼音库。
function buildPinyinCache(dict_combo){
  var hans;
  var uncomboed = {};

  for(var py in dict_combo){
    hans = dict_combo[py];
    for(var i = 0, han, l = hans.length; i < l; i++){
      han = hans.charCodeAt(i);
      if(!uncomboed.hasOwnProperty(han)){
        uncomboed[han] = py;
      }else{
        uncomboed[han] += "," + py;
      }
    }
  }

  return uncomboed;
}

function segment(hans) {
  try {
    jieba = jieba || module["require"]("nodejieba");
  } catch (ex) {
    console.error();
    console.error("    Segment need nodejieba, please run '$ npm install nodejieba'.");
    console.error("    分词需要使用 nodejieba 模块，请运行 '$ npm install nodejieba' 并确保安装完成。");
    console.error();
    throw ex;
  }
  // 词语拼音库。
  PHRASES_DICT = PHRASES_DICT || module["require"]("./phrases-dict");
  return jieba.cut(hans);
}
if(isNode){
  // 拼音词库，node 版无需使用压缩合并的拼音库。
  PINYIN_DICT = module["require"]("./dict-zi");
}else{
  PINYIN_DICT = buildPinyinCache(require("./dict-zi-web"));
}


// 声母表。
var INITIALS = "b,p,m,f,d,t,n,l,g,k,h,j,q,x,r,zh,ch,sh,z,c,s".split(",");
// 韵母表。
//var FINALS = "ang,eng,ing,ong,an,en,in,un,er,ai,ei,ui,ao,ou,iu,ie,ve,a,o,e,i,u,v".split(",");
var PINYIN_STYLE = {
  NORMAL: 0,  // 普通风格，不带音标。
  TONE: 1,    // 标准风格，音标在韵母的第一个字母上。
  TONE2: 2,   // 声调中拼音之后，使用数字 1~4 标识。
  INITIALS: 3,// 仅需要声母部分。
  FIRST_LETTER: 4, // 仅保留首字母。
};
// 带音标字符。
var PHONETIC_SYMBOL = require("./phonetic-symbol.js");
var re_phonetic_symbol_source = "";
for(var k in PHONETIC_SYMBOL){
    re_phonetic_symbol_source += k;
}
var RE_PHONETIC_SYMBOL = new RegExp("([" + re_phonetic_symbol_source + "])", "g");
var RE_TONE2 = /([aeoiuvnm])([0-4])$/;
var DEFAULT_OPTIONS = {
  style: PINYIN_STYLE.TONE, // 风格
  segment: false, // 分词。
  heteronym: false, // 多音字
};


// 将 more 的属性值，覆盖 origin 中已有的属性。
// @param {Object} origin.
// @param {Object} more.
// @return 返回新的对象。
function extend(origin, more){
  var obj = {};
  for(var k in origin){
    if(more.hasOwnProperty(k)){
      obj[k] = more[k];
    }else{
      obj[k] = origin[k];
    }
  }
  return obj;
}

// 修改拼音词库表中的格式。
// @param {String} pinyin, 单个拼音。
// @param {PINYIN_STYLE} style, 拼音风格。
// @return {String}
function toFixed(pinyin, style){
  var tone = ""; // 声调。
  switch(style){
  case PINYIN_STYLE.INITIALS:
    return initials(pinyin);

  case PINYIN_STYLE.FIRST_LETTER:
    var first_letter = pinyin.charAt(0);
    if(PHONETIC_SYMBOL.hasOwnProperty(first_letter)){
      first_letter = PHONETIC_SYMBOL[first_letter].charAt(0);
    }
    return first_letter;

  case PINYIN_STYLE.NORMAL:
    return pinyin.replace(RE_PHONETIC_SYMBOL, function($0, $1_phonetic){
      return PHONETIC_SYMBOL[$1_phonetic].replace(RE_TONE2, "$1");
    });

  case PINYIN_STYLE.TONE2:
    var py = pinyin.replace(RE_PHONETIC_SYMBOL, function($0, $1){
      // 声调数值。
      tone = PHONETIC_SYMBOL[$1].replace(RE_TONE2, "$2");

      return PHONETIC_SYMBOL[$1].replace(RE_TONE2, "$1");
    });
    return py + tone;

  case PINYIN_STYLE.TONE:
  default:
    return pinyin;
  }
}

// 单字拼音转换。
// @param {String} han, 单个汉字
// @return {Array} 返回拼音列表，多音字会有多个拼音项。
function single_pinyin(han, options){

  if(typeof han !== "string"){
    return [];
  }
  if(han.length !== 1){
    return single_pinyin(han.charAt(0), options);
  }

  var hanCode = han.charCodeAt(0);

  if(!PINYIN_DICT[hanCode]){
    return [han];
  }

  var pys = PINYIN_DICT[hanCode].split(",");
  if(!options.heteronym){
    return [toFixed(pys[0], options.style)];
  }

  // 临时存储已存在的拼音，避免多音字拼音转换为非注音风格出现重复。
  var py_cached = {};
  var pinyins = [];
  for(var i = 0, py, l = pys.length; i < l; i++){
    py = toFixed(pys[i], options.style);
    if(py_cached.hasOwnProperty(py)){
      continue;
    }
    py_cached[py] = py;

    pinyins.push(py);
  }
  return pinyins;
}

// 词语注音
// @param {String} phrases, 指定的词组。
// @param {Object} options, 选项。
// @return {Array}
function phrases_pinyin(phrases, options){
  var py = [];
  if(PHRASES_DICT.hasOwnProperty(phrases)){
    //! copy pinyin result.
    PHRASES_DICT[phrases].forEach(function(item, idx){
      py[idx] = [];
      if (options.heteronym){
        item.forEach(function(py_item, py_index){
          py[idx][py_index] = toFixed(py_item, options.style);
        });
      } else {
        py[idx][0] = toFixed(item[0], options.style);
      }
    });
  }else{
    for(var i = 0, l = phrases.length; i < l; i++){
      py.push(single_pinyin(phrases[i], options));
    }
  }
  return py;
}

// @param {String} hans 要转为拼音的目标字符串（汉字）。
// @param {Object} options, 可选，用于指定拼音风格，是否启用多音字。
// @return {Array} 返回的拼音列表。
function pinyin(hans, options){

  if(typeof hans !== "string"){
    return [];
  }

  options = extend(DEFAULT_OPTIONS, options || {});

  var phrases = isNode && options.segment ? segment(hans) : hans;
  var pys = [];

  for(var i = 0, nohans = "", firstCharCode, words, l = phrases.length; i < l; i++){

    words = phrases[i];
    firstCharCode = words.charCodeAt(0);

    if(PINYIN_DICT[firstCharCode]){

      // ends of non-chinese words.
      if(nohans.length > 0){
        pys.push([nohans]);
        nohans = ""; // reset non-chinese words.
      }

      if(words.length === 1){
          pys.push(single_pinyin(words, options));
      }else{
        pys = pys.concat(phrases_pinyin(words, options));
      }

    }else{
      nohans += words;
    }
  }

  // 清理最后的非中文字符串。
  if(nohans.length > 0){
    pys.push([nohans]);
    nohans = ""; // reset non-chinese words.
  }
  return pys;
}


// 格式化为声母(Initials)、韵母(Finals)。
// @param {String}
// @return {String}
function initials(pinyin) {
  for (var i = 0, l = INITIALS.length; i < l; i++){
    if (pinyin.indexOf(INITIALS[i]) === 0) {
      return INITIALS[i];
    }
  }
  return "";
}

pinyin.STYLE_NORMAL = PINYIN_STYLE.NORMAL;
pinyin.STYLE_TONE = PINYIN_STYLE.TONE;
pinyin.STYLE_TONE2 = PINYIN_STYLE.TONE2;
pinyin.STYLE_INITIALS = PINYIN_STYLE.INITIALS;
pinyin.STYLE_FIRST_LETTER = PINYIN_STYLE.FIRST_LETTER;

module.exports = pinyin;

}).call(this,require('_process'))
},{"./dict-zi-web":6,"./phonetic-symbol.js":7,"_process":9}],9:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],10:[function(require,module,exports){
'use strict';

var replace = String.prototype.replace;
var percentTwenties = /%20/g;

module.exports = {
    'default': 'RFC3986',
    formatters: {
        RFC1738: function (value) {
            return replace.call(value, percentTwenties, '+');
        },
        RFC3986: function (value) {
            return value;
        }
    },
    RFC1738: 'RFC1738',
    RFC3986: 'RFC3986'
};

},{}],11:[function(require,module,exports){
'use strict';

var stringify = require('./stringify');
var parse = require('./parse');
var formats = require('./formats');

module.exports = {
    formats: formats,
    parse: parse,
    stringify: stringify
};

},{"./formats":10,"./parse":12,"./stringify":13}],12:[function(require,module,exports){
'use strict';

var utils = require('./utils');

var has = Object.prototype.hasOwnProperty;

var defaults = {
    allowDots: false,
    allowPrototypes: false,
    arrayLimit: 20,
    decoder: utils.decode,
    delimiter: '&',
    depth: 5,
    parameterLimit: 1000,
    plainObjects: false,
    strictNullHandling: false
};

var parseValues = function parseValues(str, options) {
    var obj = {};
    var parts = str.split(options.delimiter, options.parameterLimit === Infinity ? undefined : options.parameterLimit);

    for (var i = 0; i < parts.length; ++i) {
        var part = parts[i];
        var pos = part.indexOf(']=') === -1 ? part.indexOf('=') : part.indexOf(']=') + 1;

        var key, val;
        if (pos === -1) {
            key = options.decoder(part);
            val = options.strictNullHandling ? null : '';
        } else {
            key = options.decoder(part.slice(0, pos));
            val = options.decoder(part.slice(pos + 1));
        }
        if (has.call(obj, key)) {
            obj[key] = [].concat(obj[key]).concat(val);
        } else {
            obj[key] = val;
        }
    }

    return obj;
};

var parseObject = function parseObject(chain, val, options) {
    if (!chain.length) {
        return val;
    }

    var root = chain.shift();

    var obj;
    if (root === '[]') {
        obj = [];
        obj = obj.concat(parseObject(chain, val, options));
    } else {
        obj = options.plainObjects ? Object.create(null) : {};
        var cleanRoot = root[0] === '[' && root[root.length - 1] === ']' ? root.slice(1, root.length - 1) : root;
        var index = parseInt(cleanRoot, 10);
        if (
            !isNaN(index) &&
            root !== cleanRoot &&
            String(index) === cleanRoot &&
            index >= 0 &&
            (options.parseArrays && index <= options.arrayLimit)
        ) {
            obj = [];
            obj[index] = parseObject(chain, val, options);
        } else {
            obj[cleanRoot] = parseObject(chain, val, options);
        }
    }

    return obj;
};

var parseKeys = function parseKeys(givenKey, val, options) {
    if (!givenKey) {
        return;
    }

    // Transform dot notation to bracket notation
    var key = options.allowDots ? givenKey.replace(/\.([^\.\[]+)/g, '[$1]') : givenKey;

    // The regex chunks

    var parent = /^([^\[\]]*)/;
    var child = /(\[[^\[\]]*\])/g;

    // Get the parent

    var segment = parent.exec(key);

    // Stash the parent if it exists

    var keys = [];
    if (segment[1]) {
        // If we aren't using plain objects, optionally prefix keys
        // that would overwrite object prototype properties
        if (!options.plainObjects && has.call(Object.prototype, segment[1])) {
            if (!options.allowPrototypes) {
                return;
            }
        }

        keys.push(segment[1]);
    }

    // Loop through children appending to the array until we hit depth

    var i = 0;
    while ((segment = child.exec(key)) !== null && i < options.depth) {
        i += 1;
        if (!options.plainObjects && has.call(Object.prototype, segment[1].replace(/\[|\]/g, ''))) {
            if (!options.allowPrototypes) {
                continue;
            }
        }
        keys.push(segment[1]);
    }

    // If there's a remainder, just add whatever is left

    if (segment) {
        keys.push('[' + key.slice(segment.index) + ']');
    }

    return parseObject(keys, val, options);
};

module.exports = function (str, opts) {
    var options = opts || {};

    if (options.decoder !== null && options.decoder !== undefined && typeof options.decoder !== 'function') {
        throw new TypeError('Decoder has to be a function.');
    }

    options.delimiter = typeof options.delimiter === 'string' || utils.isRegExp(options.delimiter) ? options.delimiter : defaults.delimiter;
    options.depth = typeof options.depth === 'number' ? options.depth : defaults.depth;
    options.arrayLimit = typeof options.arrayLimit === 'number' ? options.arrayLimit : defaults.arrayLimit;
    options.parseArrays = options.parseArrays !== false;
    options.decoder = typeof options.decoder === 'function' ? options.decoder : defaults.decoder;
    options.allowDots = typeof options.allowDots === 'boolean' ? options.allowDots : defaults.allowDots;
    options.plainObjects = typeof options.plainObjects === 'boolean' ? options.plainObjects : defaults.plainObjects;
    options.allowPrototypes = typeof options.allowPrototypes === 'boolean' ? options.allowPrototypes : defaults.allowPrototypes;
    options.parameterLimit = typeof options.parameterLimit === 'number' ? options.parameterLimit : defaults.parameterLimit;
    options.strictNullHandling = typeof options.strictNullHandling === 'boolean' ? options.strictNullHandling : defaults.strictNullHandling;

    if (str === '' || str === null || typeof str === 'undefined') {
        return options.plainObjects ? Object.create(null) : {};
    }

    var tempObj = typeof str === 'string' ? parseValues(str, options) : str;
    var obj = options.plainObjects ? Object.create(null) : {};

    // Iterate over the keys and setup the new object

    var keys = Object.keys(tempObj);
    for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        var newObj = parseKeys(key, tempObj[key], options);
        obj = utils.merge(obj, newObj, options);
    }

    return utils.compact(obj);
};

},{"./utils":14}],13:[function(require,module,exports){
'use strict';

var utils = require('./utils');
var formats = require('./formats');

var arrayPrefixGenerators = {
    brackets: function brackets(prefix) {
        return prefix + '[]';
    },
    indices: function indices(prefix, key) {
        return prefix + '[' + key + ']';
    },
    repeat: function repeat(prefix) {
        return prefix;
    }
};

var toISO = Date.prototype.toISOString;

var defaults = {
    delimiter: '&',
    encode: true,
    encoder: utils.encode,
    serializeDate: function serializeDate(date) {
        return toISO.call(date);
    },
    skipNulls: false,
    strictNullHandling: false
};

var stringify = function stringify(object, prefix, generateArrayPrefix, strictNullHandling, skipNulls, encoder, filter, sort, allowDots, serializeDate, formatter) {
    var obj = object;
    if (typeof filter === 'function') {
        obj = filter(prefix, obj);
    } else if (obj instanceof Date) {
        obj = serializeDate(obj);
    } else if (obj === null) {
        if (strictNullHandling) {
            return encoder ? encoder(prefix) : prefix;
        }

        obj = '';
    }

    if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean' || utils.isBuffer(obj)) {
        if (encoder) {
            return [formatter(encoder(prefix)) + '=' + formatter(encoder(obj))];
        }
        return [formatter(prefix) + '=' + formatter(String(obj))];
    }

    var values = [];

    if (typeof obj === 'undefined') {
        return values;
    }

    var objKeys;
    if (Array.isArray(filter)) {
        objKeys = filter;
    } else {
        var keys = Object.keys(obj);
        objKeys = sort ? keys.sort(sort) : keys;
    }

    for (var i = 0; i < objKeys.length; ++i) {
        var key = objKeys[i];

        if (skipNulls && obj[key] === null) {
            continue;
        }

        if (Array.isArray(obj)) {
            values = values.concat(stringify(
                obj[key],
                generateArrayPrefix(prefix, key),
                generateArrayPrefix,
                strictNullHandling,
                skipNulls,
                encoder,
                filter,
                sort,
                allowDots,
                serializeDate,
                formatter
            ));
        } else {
            values = values.concat(stringify(
                obj[key],
                prefix + (allowDots ? '.' + key : '[' + key + ']'),
                generateArrayPrefix,
                strictNullHandling,
                skipNulls,
                encoder,
                filter,
                sort,
                allowDots,
                serializeDate,
                formatter
            ));
        }
    }

    return values;
};

module.exports = function (object, opts) {
    var obj = object;
    var options = opts || {};
    var delimiter = typeof options.delimiter === 'undefined' ? defaults.delimiter : options.delimiter;
    var strictNullHandling = typeof options.strictNullHandling === 'boolean' ? options.strictNullHandling : defaults.strictNullHandling;
    var skipNulls = typeof options.skipNulls === 'boolean' ? options.skipNulls : defaults.skipNulls;
    var encode = typeof options.encode === 'boolean' ? options.encode : defaults.encode;
    var encoder = encode ? (typeof options.encoder === 'function' ? options.encoder : defaults.encoder) : null;
    var sort = typeof options.sort === 'function' ? options.sort : null;
    var allowDots = typeof options.allowDots === 'undefined' ? false : options.allowDots;
    var serializeDate = typeof options.serializeDate === 'function' ? options.serializeDate : defaults.serializeDate;
    if (typeof options.format === 'undefined') {
        options.format = formats.default;
    } else if (!Object.prototype.hasOwnProperty.call(formats.formatters, options.format)) {
        throw new TypeError('Unknown format option provided.');
    }
    var formatter = formats.formatters[options.format];
    var objKeys;
    var filter;

    if (options.encoder !== null && options.encoder !== undefined && typeof options.encoder !== 'function') {
        throw new TypeError('Encoder has to be a function.');
    }

    if (typeof options.filter === 'function') {
        filter = options.filter;
        obj = filter('', obj);
    } else if (Array.isArray(options.filter)) {
        filter = options.filter;
        objKeys = filter;
    }

    var keys = [];

    if (typeof obj !== 'object' || obj === null) {
        return '';
    }

    var arrayFormat;
    if (options.arrayFormat in arrayPrefixGenerators) {
        arrayFormat = options.arrayFormat;
    } else if ('indices' in options) {
        arrayFormat = options.indices ? 'indices' : 'repeat';
    } else {
        arrayFormat = 'indices';
    }

    var generateArrayPrefix = arrayPrefixGenerators[arrayFormat];

    if (!objKeys) {
        objKeys = Object.keys(obj);
    }

    if (sort) {
        objKeys.sort(sort);
    }

    for (var i = 0; i < objKeys.length; ++i) {
        var key = objKeys[i];

        if (skipNulls && obj[key] === null) {
            continue;
        }

        keys = keys.concat(stringify(
            obj[key],
            key,
            generateArrayPrefix,
            strictNullHandling,
            skipNulls,
            encoder,
            filter,
            sort,
            allowDots,
            serializeDate,
            formatter
        ));
    }

    return keys.join(delimiter);
};

},{"./formats":10,"./utils":14}],14:[function(require,module,exports){
'use strict';

var has = Object.prototype.hasOwnProperty;

var hexTable = (function () {
    var array = [];
    for (var i = 0; i < 256; ++i) {
        array.push('%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase());
    }

    return array;
}());

exports.arrayToObject = function (source, options) {
    var obj = options && options.plainObjects ? Object.create(null) : {};
    for (var i = 0; i < source.length; ++i) {
        if (typeof source[i] !== 'undefined') {
            obj[i] = source[i];
        }
    }

    return obj;
};

exports.merge = function (target, source, options) {
    if (!source) {
        return target;
    }

    if (typeof source !== 'object') {
        if (Array.isArray(target)) {
            target.push(source);
        } else if (typeof target === 'object') {
            target[source] = true;
        } else {
            return [target, source];
        }

        return target;
    }

    if (typeof target !== 'object') {
        return [target].concat(source);
    }

    var mergeTarget = target;
    if (Array.isArray(target) && !Array.isArray(source)) {
        mergeTarget = exports.arrayToObject(target, options);
    }

    if (Array.isArray(target) && Array.isArray(source)) {
        source.forEach(function (item, i) {
            if (has.call(target, i)) {
                if (target[i] && typeof target[i] === 'object') {
                    target[i] = exports.merge(target[i], item, options);
                } else {
                    target.push(item);
                }
            } else {
                target[i] = item;
            }
        });
        return target;
    }

    return Object.keys(source).reduce(function (acc, key) {
        var value = source[key];

        if (Object.prototype.hasOwnProperty.call(acc, key)) {
            acc[key] = exports.merge(acc[key], value, options);
        } else {
            acc[key] = value;
        }
        return acc;
    }, mergeTarget);
};

exports.decode = function (str) {
    try {
        return decodeURIComponent(str.replace(/\+/g, ' '));
    } catch (e) {
        return str;
    }
};

exports.encode = function (str) {
    // This code was originally written by Brian White (mscdex) for the io.js core querystring library.
    // It has been adapted here for stricter adherence to RFC 3986
    if (str.length === 0) {
        return str;
    }

    var string = typeof str === 'string' ? str : String(str);

    var out = '';
    for (var i = 0; i < string.length; ++i) {
        var c = string.charCodeAt(i);

        if (
            c === 0x2D || // -
            c === 0x2E || // .
            c === 0x5F || // _
            c === 0x7E || // ~
            (c >= 0x30 && c <= 0x39) || // 0-9
            (c >= 0x41 && c <= 0x5A) || // a-z
            (c >= 0x61 && c <= 0x7A) // A-Z
        ) {
            out += string.charAt(i);
            continue;
        }

        if (c < 0x80) {
            out = out + hexTable[c];
            continue;
        }

        if (c < 0x800) {
            out = out + (hexTable[0xC0 | (c >> 6)] + hexTable[0x80 | (c & 0x3F)]);
            continue;
        }

        if (c < 0xD800 || c >= 0xE000) {
            out = out + (hexTable[0xE0 | (c >> 12)] + hexTable[0x80 | ((c >> 6) & 0x3F)] + hexTable[0x80 | (c & 0x3F)]);
            continue;
        }

        i += 1;
        c = 0x10000 + (((c & 0x3FF) << 10) | (string.charCodeAt(i) & 0x3FF));
        out += hexTable[0xF0 | (c >> 18)] + hexTable[0x80 | ((c >> 12) & 0x3F)] + hexTable[0x80 | ((c >> 6) & 0x3F)] + hexTable[0x80 | (c & 0x3F)];
    }

    return out;
};

exports.compact = function (obj, references) {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    var refs = references || [];
    var lookup = refs.indexOf(obj);
    if (lookup !== -1) {
        return refs[lookup];
    }

    refs.push(obj);

    if (Array.isArray(obj)) {
        var compacted = [];

        for (var i = 0; i < obj.length; ++i) {
            if (obj[i] && typeof obj[i] === 'object') {
                compacted.push(exports.compact(obj[i], refs));
            } else if (typeof obj[i] !== 'undefined') {
                compacted.push(obj[i]);
            }
        }

        return compacted;
    }

    var keys = Object.keys(obj);
    keys.forEach(function (key) {
        obj[key] = exports.compact(obj[key], refs);
    });

    return obj;
};

exports.isRegExp = function (obj) {
    return Object.prototype.toString.call(obj) === '[object RegExp]';
};

exports.isBuffer = function (obj) {
    if (obj === null || typeof obj === 'undefined') {
        return false;
    }

    return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
};

},{}],15:[function(require,module,exports){
module.exports = require('./lib/speakingurl');

},{"./lib/speakingurl":16}],16:[function(require,module,exports){
(function (root, undefined) {
    'use strict';

    /**
     * getSlug
     * @param  {string} input input string
     * @param  {object|string} opts config object or separator string/char
     * @api    public
     * @return {string}  sluggified string
     */
    var getSlug = function getSlug(input, opts) {

        var separator = '-';
        var uricChars = [';', '?', ':', '@', '&', '=', '+', '$', ',', '/'];
        var uricNoSlashChars = [';', '?', ':', '@', '&', '=', '+', '$', ','];
        var markChars = ['.', '!', '~', '*', '\'', '(', ')'];
        var result = '';
        var diatricString = '';
        var convertSymbols = true;
        var customReplacements = {};
        var maintainCase;
        var titleCase;
        var truncate;
        var uricFlag;
        var uricNoSlashFlag;
        var markFlag;
        var symbol;
        var langChar;
        var lucky;
        var i;
        var ch;
        var l;
        var lastCharWasSymbol;
        var lastCharWasDiatric;
        var allowedChars;

        /**
         * charMap
         * @type {Object}
         */
        var charMap = {

            // latin
            'À': 'A',
            'Á': 'A',
            'Â': 'A',
            'Ã': 'A',
            'Ä': 'Ae',
            'Å': 'A',
            'Æ': 'AE',
            'Ç': 'C',
            'È': 'E',
            'É': 'E',
            'Ê': 'E',
            'Ë': 'E',
            'Ì': 'I',
            'Í': 'I',
            'Î': 'I',
            'Ï': 'I',
            'Ð': 'D',
            'Ñ': 'N',
            'Ò': 'O',
            'Ó': 'O',
            'Ô': 'O',
            'Õ': 'O',
            'Ö': 'Oe',
            'Ő': 'O',
            'Ø': 'O',
            'Ù': 'U',
            'Ú': 'U',
            'Û': 'U',
            'Ü': 'Ue',
            'Ű': 'U',
            'Ý': 'Y',
            'Þ': 'TH',
            'ß': 'ss',
            'à': 'a',
            'á': 'a',
            'â': 'a',
            'ã': 'a',
            'ä': 'ae',
            'å': 'a',
            'æ': 'ae',
            'ç': 'c',
            'è': 'e',
            'é': 'e',
            'ê': 'e',
            'ë': 'e',
            'ì': 'i',
            'í': 'i',
            'î': 'i',
            'ï': 'i',
            'ð': 'd',
            'ñ': 'n',
            'ò': 'o',
            'ó': 'o',
            'ô': 'o',
            'õ': 'o',
            'ö': 'oe',
            'ő': 'o',
            'ø': 'o',
            'ù': 'u',
            'ú': 'u',
            'û': 'u',
            'ü': 'ue',
            'ű': 'u',
            'ý': 'y',
            'þ': 'th',
            'ÿ': 'y',
            'ẞ': 'SS',

            // language specific

            // Arabic
            'ا': 'a',
            'أ': 'a',
            'إ': 'i',
            'آ': 'aa',
            'ؤ': 'u',
            'ئ': 'e',
            'ء': 'a',
            'ب': 'b',
            'ت': 't',
            'ث': 'th',
            'ج': 'j',
            'ح': 'h',
            'خ': 'kh',
            'د': 'd',
            'ذ': 'th',
            'ر': 'r',
            'ز': 'z',
            'س': 's',
            'ش': 'sh',
            'ص': 's',
            'ض': 'dh',
            'ط': 't',
            'ظ': 'z',
            'ع': 'a',
            'غ': 'gh',
            'ف': 'f',
            'ق': 'q',
            'ك': 'k',
            'ل': 'l',
            'م': 'm',
            'ن': 'n',
            'ه': 'h',
            'و': 'w',
            'ي': 'y',
            'ى': 'a',
            'ة': 'h',
            'ﻻ': 'la',
            'ﻷ': 'laa',
            'ﻹ': 'lai',
            'ﻵ': 'laa',

            // Persian additional characters than Arabic
            'گ': 'g',
            'چ': 'ch',
            'پ': 'p',
            'ژ': 'zh',
            'ک': 'k',
            'ی': 'y',

            // Arabic diactrics
            'َ': 'a',
            'ً': 'an',
            'ِ': 'e',
            'ٍ': 'en',
            'ُ': 'u',
            'ٌ': 'on',
            'ْ': '',

            // Arabic numbers
            '٠': '0',
            '١': '1',
            '٢': '2',
            '٣': '3',
            '٤': '4',
            '٥': '5',
            '٦': '6',
            '٧': '7',
            '٨': '8',
            '٩': '9',

            // Persian numbers
            '۰': '0',
            '۱': '1',
            '۲': '2',
            '۳': '3',
            '۴': '4',
            '۵': '5',
            '۶': '6',
            '۷': '7',
            '۸': '8',
            '۹': '9',

            // Burmese consonants
            'က': 'k',
            'ခ': 'kh',
            'ဂ': 'g',
            'ဃ': 'ga',
            'င': 'ng',
            'စ': 's',
            'ဆ': 'sa',
            'ဇ': 'z',
            'စျ': 'za',
            'ည': 'ny',
            'ဋ': 't',
            'ဌ': 'ta',
            'ဍ': 'd',
            'ဎ': 'da',
            'ဏ': 'na',
            'တ': 't',
            'ထ': 'ta',
            'ဒ': 'd',
            'ဓ': 'da',
            'န': 'n',
            'ပ': 'p',
            'ဖ': 'pa',
            'ဗ': 'b',
            'ဘ': 'ba',
            'မ': 'm',
            'ယ': 'y',
            'ရ': 'ya',
            'လ': 'l',
            'ဝ': 'w',
            'သ': 'th',
            'ဟ': 'h',
            'ဠ': 'la',
            'အ': 'a',
            // consonant character combos
            'ြ': 'y',
            'ျ': 'ya',
            'ွ': 'w',
            'ြွ': 'yw',
            'ျွ': 'ywa',
            'ှ': 'h',
            // independent vowels
            'ဧ': 'e',
            '၏': '-e',
            'ဣ': 'i',
            'ဤ': '-i',
            'ဉ': 'u',
            'ဦ': '-u',
            'ဩ': 'aw',
            'သြော': 'aw',
            'ဪ': 'aw',
            // numbers
            '၀': '0',
            '၁': '1',
            '၂': '2',
            '၃': '3',
            '၄': '4',
            '၅': '5',
            '၆': '6',
            '၇': '7',
            '၈': '8',
            '၉': '9',
            // virama and tone marks which are silent in transliteration
            '္': '',
            '့': '',
            'း': '',

            // Czech
            'č': 'c',
            'ď': 'd',
            'ě': 'e',
            'ň': 'n',
            'ř': 'r',
            'š': 's',
            'ť': 't',
            'ů': 'u',
            'ž': 'z',
            'Č': 'C',
            'Ď': 'D',
            'Ě': 'E',
            'Ň': 'N',
            'Ř': 'R',
            'Š': 'S',
            'Ť': 'T',
            'Ů': 'U',
            'Ž': 'Z',

            // Dhivehi
            'ހ': 'h',
            'ށ': 'sh',
            'ނ': 'n',
            'ރ': 'r',
            'ބ': 'b',
            'ޅ': 'lh',
            'ކ': 'k',
            'އ': 'a',
            'ވ': 'v',
            'މ': 'm',
            'ފ': 'f',
            'ދ': 'dh',
            'ތ': 'th',
            'ލ': 'l',
            'ގ': 'g',
            'ޏ': 'gn',
            'ސ': 's',
            'ޑ': 'd',
            'ޒ': 'z',
            'ޓ': 't',
            'ޔ': 'y',
            'ޕ': 'p',
            'ޖ': 'j',
            'ޗ': 'ch',
            'ޘ': 'tt',
            'ޙ': 'hh',
            'ޚ': 'kh',
            'ޛ': 'th',
            'ޜ': 'z',
            'ޝ': 'sh',
            'ޞ': 's',
            'ޟ': 'd',
            'ޠ': 't',
            'ޡ': 'z',
            'ޢ': 'a',
            'ޣ': 'gh',
            'ޤ': 'q',
            'ޥ': 'w',
            'ަ': 'a',
            'ާ': 'aa',
            'ި': 'i',
            'ީ': 'ee',
            'ު': 'u',
            'ޫ': 'oo',
            'ެ': 'e',
            'ޭ': 'ey',
            'ޮ': 'o',
            'ޯ': 'oa',
            'ް': '',

            // Greek
            'α': 'a',
            'β': 'v',
            'γ': 'g',
            'δ': 'd',
            'ε': 'e',
            'ζ': 'z',
            'η': 'i',
            'θ': 'th',
            'ι': 'i',
            'κ': 'k',
            'λ': 'l',
            'μ': 'm',
            'ν': 'n',
            'ξ': 'ks',
            'ο': 'o',
            'π': 'p',
            'ρ': 'r',
            'σ': 's',
            'τ': 't',
            'υ': 'y',
            'φ': 'f',
            'χ': 'x',
            'ψ': 'ps',
            'ω': 'o',
            'ά': 'a',
            'έ': 'e',
            'ί': 'i',
            'ό': 'o',
            'ύ': 'y',
            'ή': 'i',
            'ώ': 'o',
            'ς': 's',
            'ϊ': 'i',
            'ΰ': 'y',
            'ϋ': 'y',
            'ΐ': 'i',
            'Α': 'A',
            'Β': 'B',
            'Γ': 'G',
            'Δ': 'D',
            'Ε': 'E',
            'Ζ': 'Z',
            'Η': 'I',
            'Θ': 'TH',
            'Ι': 'I',
            'Κ': 'K',
            'Λ': 'L',
            'Μ': 'M',
            'Ν': 'N',
            'Ξ': 'KS',
            'Ο': 'O',
            'Π': 'P',
            'Ρ': 'R',
            'Σ': 'S',
            'Τ': 'T',
            'Υ': 'Y',
            'Φ': 'F',
            'Χ': 'X',
            'Ψ': 'PS',
            'Ω': 'W',
            'Ά': 'A',
            'Έ': 'E',
            'Ί': 'I',
            'Ό': 'O',
            'Ύ': 'Y',
            'Ή': 'I',
            'Ώ': 'O',
            'Ϊ': 'I',
            'Ϋ': 'Y',

            // Latvian
            'ā': 'a',
            // 'č': 'c', // duplicate
            'ē': 'e',
            'ģ': 'g',
            'ī': 'i',
            'ķ': 'k',
            'ļ': 'l',
            'ņ': 'n',
            // 'š': 's', // duplicate
            'ū': 'u',
            // 'ž': 'z', // duplicate
            'Ā': 'A',
            // 'Č': 'C', // duplicate
            'Ē': 'E',
            'Ģ': 'G',
            'Ī': 'I',
            'Ķ': 'k',
            'Ļ': 'L',
            'Ņ': 'N',
            // 'Š': 'S', // duplicate
            'Ū': 'U',
            // 'Ž': 'Z', // duplicate

            // Macedonian
            'Ќ': 'Kj',
            'ќ': 'kj',
            'Љ': 'Lj',
            'љ': 'lj',
            'Њ': 'Nj',
            'њ': 'nj',
            'Тс': 'Ts',
            'тс': 'ts',

            // Polish
            'ą': 'a',
            'ć': 'c',
            'ę': 'e',
            'ł': 'l',
            'ń': 'n',
            // 'ó': 'o', // duplicate
            'ś': 's',
            'ź': 'z',
            'ż': 'z',
            'Ą': 'A',
            'Ć': 'C',
            'Ę': 'E',
            'Ł': 'L',
            'Ń': 'N',
            'Ś': 'S',
            'Ź': 'Z',
            'Ż': 'Z',

            // Ukranian
            'Є': 'Ye',
            'І': 'I',
            'Ї': 'Yi',
            'Ґ': 'G',
            'є': 'ye',
            'і': 'i',
            'ї': 'yi',
            'ґ': 'g',

            // Romanian
            'ă': 'a',
            'Ă': 'A',
            'ș': 's',
            'Ș': 'S',
            // 'ş': 's', // duplicate
            // 'Ş': 'S', // duplicate
            'ț': 't',
            'Ț': 'T',
            'ţ': 't',
            'Ţ': 'T',

            // Russian https://en.wikipedia.org/wiki/Romanization_of_Russian
            // ICAO

            'а': 'a',
            'б': 'b',
            'в': 'v',
            'г': 'g',
            'д': 'd',
            'е': 'e',
            'ё': 'yo',
            'ж': 'zh',
            'з': 'z',
            'и': 'i',
            'й': 'i',
            'к': 'k',
            'л': 'l',
            'м': 'm',
            'н': 'n',
            'о': 'o',
            'п': 'p',
            'р': 'r',
            'с': 's',
            'т': 't',
            'у': 'u',
            'ф': 'f',
            'х': 'kh',
            'ц': 'c',
            'ч': 'ch',
            'ш': 'sh',
            'щ': 'sh',
            'ъ': '',
            'ы': 'y',
            'ь': '',
            'э': 'e',
            'ю': 'yu',
            'я': 'ya',
            'А': 'A',
            'Б': 'B',
            'В': 'V',
            'Г': 'G',
            'Д': 'D',
            'Е': 'E',
            'Ё': 'Yo',
            'Ж': 'Zh',
            'З': 'Z',
            'И': 'I',
            'Й': 'I',
            'К': 'K',
            'Л': 'L',
            'М': 'M',
            'Н': 'N',
            'О': 'O',
            'П': 'P',
            'Р': 'R',
            'С': 'S',
            'Т': 'T',
            'У': 'U',
            'Ф': 'F',
            'Х': 'Kh',
            'Ц': 'C',
            'Ч': 'Ch',
            'Ш': 'Sh',
            'Щ': 'Sh',
            'Ъ': '',
            'Ы': 'Y',
            'Ь': '',
            'Э': 'E',
            'Ю': 'Yu',
            'Я': 'Ya',

            // Serbian
            'ђ': 'dj',
            'ј': 'j',
            // 'љ': 'lj',  // duplicate
            // 'њ': 'nj', // duplicate
            'ћ': 'c',
            'џ': 'dz',
            'Ђ': 'Dj',
            'Ј': 'j',
            // 'Љ': 'Lj', // duplicate
            // 'Њ': 'Nj', // duplicate
            'Ћ': 'C',
            'Џ': 'Dz',

            // Slovak
            'ľ': 'l',
            'ĺ': 'l',
            'ŕ': 'r',
            'Ľ': 'L',
            'Ĺ': 'L',
            'Ŕ': 'R',

            // Turkish
            'ş': 's',
            'Ş': 'S',
            'ı': 'i',
            'İ': 'I',
            // 'ç': 'c', // duplicate
            // 'Ç': 'C', // duplicate
            // 'ü': 'u', // duplicate, see langCharMap
            // 'Ü': 'U', // duplicate, see langCharMap
            // 'ö': 'o', // duplicate, see langCharMap
            // 'Ö': 'O', // duplicate, see langCharMap
            'ğ': 'g',
            'Ğ': 'G',

            // Vietnamese
            'ả': 'a',
            'Ả': 'A',
            'ẳ': 'a',
            'Ẳ': 'A',
            'ẩ': 'a',
            'Ẩ': 'A',
            'đ': 'd',
            'Đ': 'D',
            'ẹ': 'e',
            'Ẹ': 'E',
            'ẽ': 'e',
            'Ẽ': 'E',
            'ẻ': 'e',
            'Ẻ': 'E',
            'ế': 'e',
            'Ế': 'E',
            'ề': 'e',
            'Ề': 'E',
            'ệ': 'e',
            'Ệ': 'E',
            'ễ': 'e',
            'Ễ': 'E',
            'ể': 'e',
            'Ể': 'E',
            'ọ': 'o',
            'Ọ': 'o',
            'ố': 'o',
            'Ố': 'O',
            'ồ': 'o',
            'Ồ': 'O',
            'ổ': 'o',
            'Ổ': 'O',
            'ộ': 'o',
            'Ộ': 'O',
            'ỗ': 'o',
            'Ỗ': 'O',
            'ơ': 'o',
            'Ơ': 'O',
            'ớ': 'o',
            'Ớ': 'O',
            'ờ': 'o',
            'Ờ': 'O',
            'ợ': 'o',
            'Ợ': 'O',
            'ỡ': 'o',
            'Ỡ': 'O',
            'Ở': 'o',
            'ở': 'o',
            'ị': 'i',
            'Ị': 'I',
            'ĩ': 'i',
            'Ĩ': 'I',
            'ỉ': 'i',
            'Ỉ': 'i',
            'ủ': 'u',
            'Ủ': 'U',
            'ụ': 'u',
            'Ụ': 'U',
            'ũ': 'u',
            'Ũ': 'U',
            'ư': 'u',
            'Ư': 'U',
            'ứ': 'u',
            'Ứ': 'U',
            'ừ': 'u',
            'Ừ': 'U',
            'ự': 'u',
            'Ự': 'U',
            'ữ': 'u',
            'Ữ': 'U',
            'ử': 'u',
            'Ử': 'ư',
            'ỷ': 'y',
            'Ỷ': 'y',
            'ỳ': 'y',
            'Ỳ': 'Y',
            'ỵ': 'y',
            'Ỵ': 'Y',
            'ỹ': 'y',
            'Ỹ': 'Y',
            'ạ': 'a',
            'Ạ': 'A',
            'ấ': 'a',
            'Ấ': 'A',
            'ầ': 'a',
            'Ầ': 'A',
            'ậ': 'a',
            'Ậ': 'A',
            'ẫ': 'a',
            'Ẫ': 'A',
            // 'ă': 'a', // duplicate
            // 'Ă': 'A', // duplicate
            'ắ': 'a',
            'Ắ': 'A',
            'ằ': 'a',
            'Ằ': 'A',
            'ặ': 'a',
            'Ặ': 'A',
            'ẵ': 'a',
            'Ẵ': 'A',

            // symbols
            '“': '"',
            '”': '"',
            '‘': '\'',
            '’': '\'',
            '∂': 'd',
            'ƒ': 'f',
            '™': '(TM)',
            '©': '(C)',
            'œ': 'oe',
            'Œ': 'OE',
            '®': '(R)',
            '†': '+',
            '℠': '(SM)',
            '…': '...',
            '˚': 'o',
            'º': 'o',
            'ª': 'a',
            '•': '*',
            '၊': ',',
            '။': '.',

            // currency
            '$': 'USD',
            '€': 'EUR',
            '₢': 'BRN',
            '₣': 'FRF',
            '£': 'GBP',
            '₤': 'ITL',
            '₦': 'NGN',
            '₧': 'ESP',
            '₩': 'KRW',
            '₪': 'ILS',
            '₫': 'VND',
            '₭': 'LAK',
            '₮': 'MNT',
            '₯': 'GRD',
            '₱': 'ARS',
            '₲': 'PYG',
            '₳': 'ARA',
            '₴': 'UAH',
            '₵': 'GHS',
            '¢': 'cent',
            '¥': 'CNY',
            '元': 'CNY',
            '円': 'YEN',
            '﷼': 'IRR',
            '₠': 'EWE',
            '฿': 'THB',
            '₨': 'INR',
            '₹': 'INR',
            '₰': 'PF'

        };

        /**
         * special look ahead character array
         * These characters form with consonants to become 'single'/consonant combo
         * @type [Array]
         */
        var lookAheadCharArray = [
            // burmese
            '်',

            // Dhivehi
            'ް'
        ];

        /**
         * diatricMap for languages where transliteration changes entirely as more diatrics are added
         * @type {Object}
         */
        var diatricMap = {
            // Burmese
            // dependent vowels
            'ာ': 'a',
            'ါ': 'a',
            'ေ': 'e',
            'ဲ': 'e',
            'ိ': 'i',
            'ီ': 'i',
            'ို': 'o',
            'ု': 'u',
            'ူ': 'u',
            'ေါင်': 'aung',
            'ော': 'aw',
            'ော်': 'aw',
            'ေါ': 'aw',
            'ေါ်': 'aw',
            '်': '်', // this is special case but the character will be converted to latin in the code
            'က်': 'et',
            'ိုက်': 'aik',
            'ောက်': 'auk',
            'င်': 'in',
            'ိုင်': 'aing',
            'ောင်': 'aung',
            'စ်': 'it',
            'ည်': 'i',
            'တ်': 'at',
            'ိတ်': 'eik',
            'ုတ်': 'ok',
            'ွတ်': 'ut',
            'ေတ်': 'it',
            'ဒ်': 'd',
            'ိုဒ်': 'ok',
            'ုဒ်': 'ait',
            'န်': 'an',
            'ာန်': 'an',
            'ိန်': 'ein',
            'ုန်': 'on',
            'ွန်': 'un',
            'ပ်': 'at',
            'ိပ်': 'eik',
            'ုပ်': 'ok',
            'ွပ်': 'ut',
            'န်ုပ်': 'nub',
            'မ်': 'an',
            'ိမ်': 'ein',
            'ုမ်': 'on',
            'ွမ်': 'un',
            'ယ်': 'e',
            'ိုလ်': 'ol',
            'ဉ်': 'in',
            'ံ': 'an',
            'ိံ': 'ein',
            'ုံ': 'on',

            // Dhivehi
            'ައް': 'ah',
            'ަށް': 'ah',
        };

        /**
         * langCharMap language specific characters translations
         * @type   {Object}
         */
        var langCharMap = {

            'en': {}, // default language

            'az': { // Azerbaijani
                'ç': 'c',
                'ə': 'e',
                'ğ': 'g',
                'ı': 'i',
                'ö': 'o',
                'ş': 's',
                'ü': 'u',
                'Ç': 'C',
                'Ə': 'E',
                'Ğ': 'G',
                'İ': 'I',
                'Ö': 'O',
                'Ş': 'S',
                'Ü': 'U'
            },

            'cs': { // Czech
                'č': 'c',
                'ď': 'd',
                'ě': 'e',
                'ň': 'n',
                'ř': 'r',
                'š': 's',
                'ť': 't',
                'ů': 'u',
                'ž': 'z',
                'Č': 'C',
                'Ď': 'D',
                'Ě': 'E',
                'Ň': 'N',
                'Ř': 'R',
                'Š': 'S',
                'Ť': 'T',
                'Ů': 'U',
                'Ž': 'Z'
            },

            'fi': { // Finnish
                // 'å': 'a', duplicate see charMap/latin
                // 'Å': 'A', duplicate see charMap/latin
                'ä': 'a', // ok
                'Ä': 'A', // ok
                'ö': 'o', // ok
                'Ö': 'O' // ok
            },

            'hu': { // Hungarian
                'ä': 'a', // ok
                'Ä': 'A', // ok
                // 'á': 'a', duplicate see charMap/latin
                // 'Á': 'A', duplicate see charMap/latin
                'ö': 'o', // ok
                'Ö': 'O', // ok
                // 'ő': 'o', duplicate see charMap/latin
                // 'Ő': 'O', duplicate see charMap/latin
                'ü': 'u',
                'Ü': 'U',
                'ű': 'u',
                'Ű': 'U'
            },

            'lt': { // Lithuanian
                'ą': 'a',
                'č': 'c',
                'ę': 'e',
                'ė': 'e',
                'į': 'i',
                'š': 's',
                'ų': 'u',
                'ū': 'u',
                'ž': 'z',
                'Ą': 'A',
                'Č': 'C',
                'Ę': 'E',
                'Ė': 'E',
                'Į': 'I',
                'Š': 'S',
                'Ų': 'U',
                'Ū': 'U'
            },

            'lv': { // Latvian
                'ā': 'a',
                'č': 'c',
                'ē': 'e',
                'ģ': 'g',
                'ī': 'i',
                'ķ': 'k',
                'ļ': 'l',
                'ņ': 'n',
                'š': 's',
                'ū': 'u',
                'ž': 'z',
                'Ā': 'A',
                'Č': 'C',
                'Ē': 'E',
                'Ģ': 'G',
                'Ī': 'i',
                'Ķ': 'k',
                'Ļ': 'L',
                'Ņ': 'N',
                'Š': 'S',
                'Ū': 'u',
                'Ž': 'Z'
            },

            'pl': { // Polish
                'ą': 'a',
                'ć': 'c',
                'ę': 'e',
                'ł': 'l',
                'ń': 'n',
                'ó': 'o',
                'ś': 's',
                'ź': 'z',
                'ż': 'z',
                'Ą': 'A',
                'Ć': 'C',
                'Ę': 'e',
                'Ł': 'L',
                'Ń': 'N',
                'Ó': 'O',
                'Ś': 'S',
                'Ź': 'Z',
                'Ż': 'Z'
            },

            'sk': { // Slovak
                'ä': 'a',
                'Ä': 'A'
            },

            'sr': { // Serbian
                'љ': 'lj',
                'њ': 'nj',
                'Љ': 'Lj',
                'Њ': 'Nj',
                'đ': 'dj',
                'Đ': 'Dj'
            },

            'tr': { // Turkish
                'Ü': 'U',
                'Ö': 'O',
                'ü': 'u',
                'ö': 'o'
            }
        };

        /**
         * symbolMap language specific symbol translations
         * translations must be transliterated already
         * @type   {Object}
         */
        var symbolMap = {

            'ar': {
                '∆': 'delta',
                '∞': 'la-nihaya',
                '♥': 'hob',
                '&': 'wa',
                '|': 'aw',
                '<': 'aqal-men',
                '>': 'akbar-men',
                '∑': 'majmou',
                '¤': 'omla'
            },

            'az': {},

            'ca': {
                '∆': 'delta',
                '∞': 'infinit',
                '♥': 'amor',
                '&': 'i',
                '|': 'o',
                '<': 'menys que',
                '>': 'mes que',
                '∑': 'suma dels',
                '¤': 'moneda'
            },

            'cz': {
                '∆': 'delta',
                '∞': 'nekonecno',
                '♥': 'laska',
                '&': 'a',
                '|': 'nebo',
                '<': 'mene jako',
                '>': 'vice jako',
                '∑': 'soucet',
                '¤': 'mena'
            },

            'de': {
                '∆': 'delta',
                '∞': 'unendlich',
                '♥': 'Liebe',
                '&': 'und',
                '|': 'oder',
                '<': 'kleiner als',
                '>': 'groesser als',
                '∑': 'Summe von',
                '¤': 'Waehrung'
            },

            'dv': {
                '∆': 'delta',
                '∞': 'kolunulaa',
                '♥': 'loabi',
                '&': 'aai',
                '|': 'noonee',
                '<': 'ah vure kuda',
                '>': 'ah vure bodu',
                '∑': 'jumula',
                '¤': 'faisaa'
            },

            'en': {
                '∆': 'delta',
                '∞': 'infinity',
                '♥': 'love',
                '&': 'and',
                '|': 'or',
                '<': 'less than',
                '>': 'greater than',
                '∑': 'sum',
                '¤': 'currency'
            },

            'es': {
                '∆': 'delta',
                '∞': 'infinito',
                '♥': 'amor',
                '&': 'y',
                '|': 'u',
                '<': 'menos que',
                '>': 'mas que',
                '∑': 'suma de los',
                '¤': 'moneda'
            },

            'fa': {
                '∆': 'delta',
                '∞': 'bi-nahayat',
                '♥': 'eshgh',
                '&': 'va',
                '|': 'ya',
                '<': 'kamtar-az',
                '>': 'bishtar-az',
                '∑': 'majmooe',
                '¤': 'vahed'
            },

            'fr': {
                '∆': 'delta',
                '∞': 'infiniment',
                '♥': 'Amour',
                '&': 'et',
                '|': 'ou',
                '<': 'moins que',
                '>': 'superieure a',
                '∑': 'somme des',
                '¤': 'monnaie'
            },

            'gr': {},

            'hu': {
                '∆': 'delta',
                '∞': 'vegtelen',
                '♥': 'szerelem',
                '&': 'es',
                '|': 'vagy',
                '<': 'kisebb mint',
                '>': 'nagyobb mint',
                '∑': 'szumma',
                '¤': 'penznem'
            },

            'it': {
                '∆': 'delta',
                '∞': 'infinito',
                '♥': 'amore',
                '&': 'e',
                '|': 'o',
                '<': 'minore di',
                '>': 'maggiore di',
                '∑': 'somma',
                '¤': 'moneta'
            },

            'lt': {},

            'lv': {
                '∆': 'delta',
                '∞': 'bezgaliba',
                '♥': 'milestiba',
                '&': 'un',
                '|': 'vai',
                '<': 'mazak neka',
                '>': 'lielaks neka',
                '∑': 'summa',
                '¤': 'valuta'
            },

            'my': {
                '∆': 'kwahkhyaet',
                '∞': 'asaonasme',
                '♥': 'akhyait',
                '&': 'nhin',
                '|': 'tho',
                '<': 'ngethaw',
                '>': 'kyithaw',
                '∑': 'paungld',
                '¤': 'ngwekye'
            },

            'mk': {},

            'nl': {
                '∆': 'delta',
                '∞': 'oneindig',
                '♥': 'liefde',
                '&': 'en',
                '|': 'of',
                '<': 'kleiner dan',
                '>': 'groter dan',
                '∑': 'som',
                '¤': 'valuta'
            },

            'pl': {
                '∆': 'delta',
                '∞': 'nieskonczonosc',
                '♥': 'milosc',
                '&': 'i',
                '|': 'lub',
                '<': 'mniejsze niz',
                '>': 'wieksze niz',
                '∑': 'suma',
                '¤': 'waluta'
            },

            'pt': {
                '∆': 'delta',
                '∞': 'infinito',
                '♥': 'amor',
                '&': 'e',
                '|': 'ou',
                '<': 'menor que',
                '>': 'maior que',
                '∑': 'soma',
                '¤': 'moeda'
            },

            'ro': {
                '∆': 'delta',
                '∞': 'infinit',
                '♥': 'dragoste',
                '&': 'si',
                '|': 'sau',
                '<': 'mai mic ca',
                '>': 'mai mare ca',
                '∑': 'suma',
                '¤': 'valuta'
            },

            'ru': {
                '∆': 'delta',
                '∞': 'beskonechno',
                '♥': 'lubov',
                '&': 'i',
                '|': 'ili',
                '<': 'menshe',
                '>': 'bolshe',
                '∑': 'summa',
                '¤': 'valjuta'
            },

            'sk': {
                '∆': 'delta',
                '∞': 'nekonecno',
                '♥': 'laska',
                '&': 'a',
                '|': 'alebo',
                '<': 'menej ako',
                '>': 'viac ako',
                '∑': 'sucet',
                '¤': 'mena'
            },

            'sr': {},

            'tr': {
                '∆': 'delta',
                '∞': 'sonsuzluk',
                '♥': 'ask',
                '&': 've',
                '|': 'veya',
                '<': 'kucuktur',
                '>': 'buyuktur',
                '∑': 'toplam',
                '¤': 'para birimi'
            },

            'uk': {
                '∆': 'delta',
                '∞': 'bezkinechnist',
                '♥': 'lubov',
                '&': 'i',
                '|': 'abo',
                '<': 'menshe',
                '>': 'bilshe',
                '∑': 'suma',
                '¤': 'valjuta'
            },

            'vn': {
                '∆': 'delta',
                '∞': 'vo cuc',
                '♥': 'yeu',
                '&': 'va',
                '|': 'hoac',
                '<': 'nho hon',
                '>': 'lon hon',
                '∑': 'tong',
                '¤': 'tien te'
            }
        };

        if (typeof input !== 'string') {
            return '';
        }

        if (typeof opts === 'string') {
            separator = opts;
        }

        symbol = symbolMap.en;
        langChar = langCharMap.en;

        if (typeof opts === 'object') {

            maintainCase = opts.maintainCase || false;
            customReplacements = (opts.custom && typeof opts.custom === 'object') ? opts.custom : customReplacements;
            truncate = (+opts.truncate > 1 && opts.truncate) || false;
            uricFlag = opts.uric || false;
            uricNoSlashFlag = opts.uricNoSlash || false;
            markFlag = opts.mark || false;
            convertSymbols = (opts.symbols === false || opts.lang === false) ? false : true;
            separator = opts.separator || separator;

            if (uricFlag) {
                allowedChars += uricChars.join('');
            }

            if (uricNoSlashFlag) {
                allowedChars += uricNoSlashChars.join('');
            }

            if (markFlag) {
                allowedChars += markChars.join('');
            }

            symbol = (opts.lang && symbolMap[opts.lang] && convertSymbols) ?
                symbolMap[opts.lang] : (convertSymbols ? symbolMap.en : {});

            langChar = (opts.lang && langCharMap[opts.lang]) ?
                langCharMap[opts.lang] :
                opts.lang === false || opts.lang === true ? {} : langCharMap.en;

            // if titleCase config is an Array, rewrite to object format
            if (opts.titleCase && typeof opts.titleCase.length === "number" && Array.prototype.toString.call(opts.titleCase)) {

                opts.titleCase.forEach(function (v) {
                    customReplacements[v + ""] = v + "";
                });

                titleCase = true;
            } else {
                titleCase = !!opts.titleCase;
            }

            // if custom config is an Array, rewrite to object format
            if (opts.custom && typeof opts.custom.length === "number" && Array.prototype.toString.call(opts.custom)) {

                opts.custom.forEach(function (v) {
                    customReplacements[v + ""] = v + "";
                });
            }

            // custom replacements
            Object.keys(customReplacements).forEach(function (v) {

                var r;

                if (v.length > 1) {
                    r = new RegExp('\\b' + escapeChars(v) + '\\b', 'gi');
                } else {
                    r = new RegExp(escapeChars(v), 'gi');
                }

                input = input.replace(r, customReplacements[v]);
            });

            // add all custom replacement to allowed charlist
            for (ch in customReplacements) {
                allowedChars += ch;
            }

        }

        allowedChars += separator;

        // escape all necessary chars
        allowedChars = escapeChars(allowedChars);

        // trim whitespaces
        input = input.replace(/(^\s+|\s+$)/g, '');

        lastCharWasSymbol = false;
        lastCharWasDiatric = false;

        for (i = 0, l = input.length; i < l; i++) {

            ch = input[i];

            if (isReplacedCustomChar(ch, customReplacements)) {
                // don't convert a already converted char
                lastCharWasSymbol = false;
            } else if (langChar[ch]) {
                // process language specific diactrics chars conversion
                ch = lastCharWasSymbol && langChar[ch].match(/[A-Za-z0-9]/) ? ' ' + langChar[ch] : langChar[ch];

                lastCharWasSymbol = false;
            } else if (ch in charMap) {
                // the transliteration changes entirely when some special characters are added
                if (i + 1 < l && lookAheadCharArray.indexOf(input[i + 1]) >= 0) {
                    diatricString += ch;
                    ch = '';
                } else if (lastCharWasDiatric === true) {
                    ch = diatricMap[diatricString] + charMap[ch];
                    diatricString = '';
                } else {
                    // process diactrics chars
                    ch = lastCharWasSymbol && charMap[ch].match(/[A-Za-z0-9]/) ? ' ' + charMap[ch] : charMap[ch];
                }

                lastCharWasSymbol = false;
                lastCharWasDiatric = false;
            } else
            if (ch in diatricMap) {
                diatricString += ch;
                ch = '';
                // end of string, put the whole meaningful word
                if (i === l - 1) {
                    ch = diatricMap[diatricString];
                }
                lastCharWasDiatric = true;
            } else if (
                // process symbol chars
                symbol[ch] && !(uricFlag && uricChars.join('')
                    .indexOf(ch) !== -1) && !(uricNoSlashFlag && uricNoSlashChars.join('')
                    //.indexOf(ch) !== -1) && !(markFlag && markChars.join('')
                    .indexOf(ch) !== -1)) {

                ch = lastCharWasSymbol || result.substr(-1).match(/[A-Za-z0-9]/) ? separator + symbol[ch] : symbol[ch];
                ch += input[i + 1] !== void 0 && input[i + 1].match(/[A-Za-z0-9]/) ? separator : '';

                lastCharWasSymbol = true;
            } else {
                if (lastCharWasDiatric === true) {
                    ch = diatricMap[diatricString] + ch;
                    diatricString = '';
                    lastCharWasDiatric = false;
                } else if (lastCharWasSymbol && (/[A-Za-z0-9]/.test(ch) || result.substr(-1).match(/A-Za-z0-9]/))) {
                    // process latin chars
                    ch = ' ' + ch;
                }
                lastCharWasSymbol = false;
            }

            // add allowed chars
            result += ch.replace(new RegExp('[^\\w\\s' + allowedChars + '_-]', 'g'), separator);
        }

        if (titleCase) {
            result = result.replace(/(\w)(\S*)/g, function (_, i, r) {
                var j = i.toUpperCase() + (r !== null ? r : "");
                return (Object.keys(customReplacements).indexOf(j.toLowerCase()) < 0) ? j : j.toLowerCase();
            });
        }

        // eliminate duplicate separators
        // add separator
        // trim separators from start and end
        result = result.replace(/\s+/g, separator)
            .replace(new RegExp('\\' + separator + '+', 'g'), separator)
            .replace(new RegExp('(^\\' + separator + '+|\\' + separator + '+$)', 'g'), '');

        if (truncate && result.length > truncate) {

            lucky = result.charAt(truncate) === separator;
            result = result.slice(0, truncate);

            if (!lucky) {
                result = result.slice(0, result.lastIndexOf(separator));
            }
        }

        if (!maintainCase && !titleCase) {
            result = result.toLowerCase();
        }

        return result;
    };

    /**
     * createSlug curried(opts)(input)
     * @param   {object|string} opts config object or input string
     * @return  {Function} function getSlugWithConfig()
     **/
    var createSlug = function createSlug(opts) {

        /**
         * getSlugWithConfig
         * @param   {string} input string
         * @return  {string} slug string
         */
        return function getSlugWithConfig(input) {
            return getSlug(input, opts);
        };
    };

    /**
     * escape Chars
     * @param   {string} input string
     */
    var escapeChars = function escapeChars(input) {

        return input.replace(/[-\\^$*+?.()|[\]{}\/]/g, '\\$&');
    };

    /**
     * check if the char is an already converted char from custom list
     * @param   {char} ch character to check
     * @param   {object} customReplacements custom translation map
     */
    var isReplacedCustomChar = function (ch, customReplacements) {

        for (var c in customReplacements) {
            if (customReplacements[c] === ch) {
                return true;
            }
        }
    };

    if (typeof module !== 'undefined' && module.exports) {

        // export functions for use in Node
        module.exports = getSlug;
        module.exports.createSlug = createSlug;

    } else if (typeof define !== 'undefined' && define.amd) {

        // export function for use in AMD
        define([], function () {
            return getSlug;
        });

    } else {

        // don't overwrite global if exists
        try {
            if (root.getSlug || root.createSlug) {
                throw 'speakingurl: globals exists /(getSlug|createSlug)/';
            } else {
                root.getSlug = getSlug;
                root.createSlug = createSlug;
            }
        } catch (e) {}

    }
})(this);
},{}],17:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*global document */

var _FormCreate = require('./modules/FormCreate');

var _FormCreate2 = _interopRequireDefault(_FormCreate);

var _FormList = require('./modules/FormList');

var _FormList2 = _interopRequireDefault(_FormList);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Admin = function () {
  function Admin() {
    _classCallCheck(this, Admin);

    this._page = document.querySelector('body').getAttribute('data-page');
    // this._formCreate = document.querySelector('.form-create')
    var forms = document.querySelectorAll('[data-form-abe-create]');
    Array.prototype.forEach.call(forms, function (form) {
      new _FormCreate2.default(form);
    });

    this._bindEvents();
  }

  /**
   * _bindEvents for admin pages
   * @return {null}
   */


  _createClass(Admin, [{
    key: '_bindEvents',
    value: function _bindEvents() {
      if (typeof this._formCreate !== 'undefined' && this._formCreate !== null) {} else if (this._page === 'list') {
        new _FormList2.default();
      }
    }
  }]);

  return Admin;
}();

new Admin();

},{"./modules/FormCreate":19,"./modules/FormList":20}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FolderSelect = function () {
  function FolderSelect(form) {
    _classCallCheck(this, FolderSelect);

    this._form = form;
    // constante variable
    this._selectTemplate = this._form.querySelector('#selectTemplate');
    this._selectsWebsite = this._form.querySelector('#level-1');
    this._selectsCreate = [].slice.call(this._form.querySelectorAll('select[id*="level-"]'));

    // constante methode
    this._handleChangeSelectsCreate = this._changeSelectsCreate.bind(this);

    this._bindEvents();
  }

  _createClass(FolderSelect, [{
    key: '_bindEvents',
    value: function _bindEvents() {
      var _this = this;

      this._selectsCreate.forEach(function (select) {
        select.addEventListener('change', _this._handleChangeSelectsCreate);
      });
    }

    /**
     * bind event for select page create
     * @param  {[type]} e [description]
     * @return {[type]}   [description]
     */

  }, {
    key: '_changeSelectsCreate',
    value: function _changeSelectsCreate(e) {
      var selectedOption = e.currentTarget.querySelector('option:checked');

      var dataShow = selectedOption.getAttribute('data-show'),
          levelShow = selectedOption.getAttribute('data-level-show'),
          levelHide = selectedOption.getAttribute('data-level-hide');

      if (typeof levelShow !== 'undefined' && levelShow !== null && levelShow !== '') {
        this._showSubLevels(levelShow, dataShow);
      }
      if (typeof levelHide !== 'undefined' && levelHide !== null && levelHide !== '') {
        this._hideSubLevels(levelHide);
      }
    }
  }, {
    key: '_hideSubLevels',
    value: function _hideSubLevels(i) {
      var levels = [].slice.call(this._form.querySelectorAll('.level-' + i));
      while (levels.length > 0) {
        levels.forEach(function (level) {
          var options = [].slice.call(level.querySelectorAll('option'));
          Array.prototype.forEach.call(options, function (option) {
            option.selected = null;
            option.removeAttribute('selected');
          });
          level.classList.add('hidden');
        });
        levels = [].slice.call(this._form.querySelectorAll('.level-' + i++));
      }
    }
  }, {
    key: '_showSubLevels',
    value: function _showSubLevels(i, dataShow) {
      var _this2 = this;

      var levels = [].slice.call(this._form.querySelectorAll('.level-' + i));
      levels.forEach(function (level) {
        level.classList.add('hidden');

        var childs = [].slice.call(_this2._form.querySelectorAll('[data-shown=' + dataShow + ']'));
        if (childs) {
          childs.forEach(function (child) {
            var options = [].slice.call(child.querySelectorAll('option'));
            Array.prototype.forEach.call(options, function (option) {
              option.selected = null;
              option.removeAttribute('selected');
            });

            child.classList.remove('hidden');
          });
        }
      });
    }
  }]);

  return FolderSelect;
}();

exports.default = FolderSelect;

},{}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*global document, window, alert, slugs, CONFIG */

var _limax = require('limax');

var _limax2 = _interopRequireDefault(_limax);

var _nanoajax = require('nanoajax');

var _nanoajax2 = _interopRequireDefault(_nanoajax);

var _qs = require('qs');

var _qs2 = _interopRequireDefault(_qs);

var _FolderSelect = require('./FolderSelect');

var _FolderSelect2 = _interopRequireDefault(_FolderSelect);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FormCreate = function () {
  function FormCreate(parentForm) {
    _classCallCheck(this, FormCreate);

    this._form = parentForm;
    if (typeof this._form !== 'undefined' && this._form !== null) {
      this._isSaving = false;

      // constantes variables
      this._ajax = _nanoajax2.default.ajax;

      // constantes variables DOM elements
      this._previewPostPath = this._form.querySelector('[data-post-path-preview]');

      this._formInputs = [].slice.call(this._form.querySelectorAll('input, select'));
      this._precontribTemplate = [].slice.call(this._form.querySelectorAll('[data-precontrib-templates]'));

      this._selectTemplate = this._form.querySelector('[data-id="selectTemplate"]');
      this._showHideSelect(this._selectTemplate);
      this._handleBtnSelectTemplate = this._btnSelectTemplate.bind(this);

      // // manager update btn
      this._btnCreate = this._form.querySelector('[date-abe-create]');
      this._btnUpdate = this._form.querySelector('[date-abe-update]');
      this._btnDuplicate = this._form.querySelector('[date-abe-duplicate]');
      this._handleBtnDuplicateManagerClick = this._btnDuplicateManagerClick.bind(this);
      this._handleBtnUpdateManagerClick = this._btnUpdateManagerClick.bind(this);
      this._handleBtnCreateManagerClick = this._btnCreateManagerClick.bind(this);
      this._handleBlurEvent = this._blurEvent.bind(this);

      // // init modules
      new _FolderSelect2.default(this._form);

      this._bindEvents();

      this._setSlug(false);
    }
  }

  _createClass(FormCreate, [{
    key: '_bindEvents',
    value: function _bindEvents() {
      if (typeof this._btnUpdate !== 'undefined' && this._btnUpdate !== null) {
        this._btnUpdate.addEventListener('click', this._handleBtnUpdateManagerClick); // click update metadata
      }
      if (typeof this._btnCreate !== 'undefined' && this._btnCreate !== null) {
        this._btnCreate.addEventListener('click', this._handleBtnCreateManagerClick); // click update metadata
      }
      if (typeof this._btnDuplicate !== 'undefined' && this._btnDuplicate !== null) {
        this._btnDuplicate.addEventListener('click', this._handleBtnDuplicateManagerClick); // click duplicate content
      }
      if (typeof this._form !== 'undefined' && this._form !== null) {
        this._form.addEventListener('submit', this._handleSubmit);
      }
      if (typeof this._selectTemplate !== 'undefined' && this._selectTemplate !== null) {
        this._selectTemplate.addEventListener('change', this._handleBtnSelectTemplate);
      }

      Array.prototype.forEach.call(this._formInputs, function (input) {
        input.addEventListener('blur', this._handleBlurEvent);
      }.bind(this));
    }
  }, {
    key: '_blurEvent',
    value: function _blurEvent() {
      this._setSlug(false);
    }
  }, {
    key: '_showHideSelect',
    value: function _showHideSelect(target) {
      this._selectedTemplate = target.value;
      Array.prototype.forEach.call(this._precontribTemplate, function (input) {
        var linkedTpl = input.getAttribute('data-precontrib-templates').split(',');
        var found = false;
        Array.prototype.forEach.call(linkedTpl, function (tpl) {
          if (tpl === this._selectedTemplate) {
            found = true;
          }
        }.bind(this));

        if (found) {
          input.style.display = 'block';
        } else {
          input.style.display = 'none';
        }
      }.bind(this));
    }
  }, {
    key: '_btnSelectTemplate',
    value: function _btnSelectTemplate(e) {
      this._showHideSelect(e.currentTarget);
    }
  }, {
    key: '_setSlug',
    value: function _setSlug(showErrors) {
      var values = {};
      var postPath = '';
      var isValid = true;
      if (this._selectedTemplate != null && this._selectedTemplate != '') {

        Array.prototype.forEach.call(this._formInputs, function (input) {
          if (input.getAttribute('data-slug-type') == 'path') {
            if (input.parentNode.classList.contains('hidden')) {
              return;
            }
          }

          var parentNode = input.parentNode;
          if (parentNode.getAttribute('data-precontrib-templates') == null) {
            parentNode = input.parentNode.parentNode;
          }
          parentNode.classList.remove('has-error');
          var linkedTpl = parentNode.getAttribute('data-precontrib-templates');
          input.parentNode.classList.remove('error');
          if (linkedTpl == null || linkedTpl == this._selectedTemplate) {
            var id = input.getAttribute('data-id');
            if (id !== null) {
              var autocomplete = input.getAttribute('data-autocomplete') == 'true' ? true : false;
              var required = input.getAttribute('data-required') == 'true' ? true : false;
              var value = input.value;

              if (autocomplete) {
                var results = input.parentNode.querySelectorAll('.autocomplete-result');
                values[id] = [];
                Array.prototype.forEach.call(results, function (result) {
                  var resultValue = result.getAttribute('value');
                  if (resultValue.indexOf('{') > -1) {
                    try {
                      var jsonValue = JSON.parse(resultValue);
                      values[id].push(jsonValue);
                    } catch (e) {
                      // values[id].push(value)
                    }
                  }
                }.bind(this));
                if (required && values[id].length == 0) {
                  isValid = false;
                  if (showErrors) parentNode.classList.add('has-error');
                }
              } else {
                if (value.indexOf('{') > -1) {
                  try {
                    var jsonValue = JSON.parse(value);
                    values[id] = [jsonValue];

                    if (required && values[id].length == 0) {
                      isValid = false;
                      if (showErrors) parentNode.classList.add('has-error');
                    }
                  } catch (e) {
                    // values[id].push(value)
                  }
                } else {
                  values[id] = value;
                  if (required && values[id] == '') {
                    isValid = false;
                    if (showErrors) parentNode.classList.add('has-error');
                  }
                }
              }
            }
          }
        }.bind(this));

        var slug = slugs[this._selectedTemplate];
        var slugMatches = slug.match(/{{.*?}}/g);
        if (slugMatches !== null) {
          Array.prototype.forEach.call(slugMatches, function (slugMatch) {
            var cleanSlugMath = slugMatch.replace('{{', '').replace('}}', '');
            try {
              var valueSlug = eval('values.' + cleanSlugMath) + '';
              valueSlug = (0, _limax2.default)(valueSlug, { separateNumbers: false });
              slug = slug.replace(slugMatch, valueSlug);
            } catch (e) {
              slug = slug.replace(slugMatch, '');
              isValid = false;
              // console.error('error on create', e.stack)
            }
          }.bind(this));
        }

        var slugPaths = this._form.querySelectorAll('[data-slug-type=path]');
        Array.prototype.forEach.call(slugPaths, function (slugPath) {
          var isStructureFolder = slugPath.parentNode.getAttribute('data-shown') != null;
          if (slugPath.value != null && slugPath.value != '' && isStructureFolder && !slugPath.parentNode.classList.contains('hidden')) {
            postPath += slugPath.value + '/';
          }
        });
        postPath += slug.replace(/^\//, '');
      } else {
        isValid = false;
      }

      var breadcrumbs = postPath.split('/');
      var breadcrumbsHtml = '';
      Array.prototype.forEach.call(breadcrumbs, function (breadcrumb) {
        var breadcrumbNames = breadcrumb.split('-');
        breadcrumbsHtml += '<li>';
        Array.prototype.forEach.call(breadcrumbNames, function (breadcrumbName) {
          if (breadcrumbName == '' && showErrors) {
            breadcrumbsHtml += '<span class="btn-danger">...</span>-';
          } else {
            breadcrumbsHtml += '<span>' + breadcrumbName + '</span>-';
          }
        }.bind(this));
        breadcrumbsHtml = breadcrumbsHtml.replace(/-$/, '');
        breadcrumbsHtml += '</li>';
      });
      breadcrumbsHtml += '<span>.' + CONFIG.EXTENSION + '</span>';
      this._previewPostPath.innerHTML = '<span>URL : </span>' + breadcrumbsHtml;

      return {
        isValid: isValid,
        postPath: postPath,
        values: values
      };
    }
  }, {
    key: '_submit',
    value: function _submit(type) {
      var _this = this;

      var res = this._setSlug(true);
      var toSave = _qs2.default.stringify(res.values);

      if (res.isValid && !this._isSaving) {
        this._isSaving = true;
        this._ajax({
          url: document.location.origin + '/abe/' + type + '/' + res.postPath,
          body: toSave,
          headers: {},
          method: 'post'
        }, function (code, responseText) {
          _this._isSaving = false;
          var jsonRes = JSON.parse(responseText);
          if (jsonRes.success == 1 && jsonRes.json != null && jsonRes.json.abe_meta != null) {
            window.location.href = window.location.origin + '/abe/editor' + jsonRes.json.abe_meta.link;
          } else {
            console.log(responseText);
            alert('error');
          }
        });
      }
    }
  }, {
    key: '_btnDuplicateManagerClick',
    value: function _btnDuplicateManagerClick(e) {
      e.preventDefault();
      this._submit('duplicate');
    }
  }, {
    key: '_btnUpdateManagerClick',
    value: function _btnUpdateManagerClick(e) {
      e.preventDefault();
      this._submit('update');
    }
  }, {
    key: '_btnCreateManagerClick',
    value: function _btnCreateManagerClick(e) {
      e.preventDefault();
      this._submit('create');
    }
  }]);

  return FormCreate;
}();

exports.default = FormCreate;

},{"./FolderSelect":18,"limax":3,"nanoajax":4,"qs":11}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*global document, $, top */

var FormList = function () {
  function FormList() {
    var _this = this;

    _classCallCheck(this, FormList);

    // bind button event click
    this._btnValidates = [].slice.call(document.querySelectorAll('[data-validate-content]'));
    this._handleBtnValidatesClick = this._btnValidatesClick.bind(this);

    this._btnValidates.forEach(function (input) {
      input.addEventListener('click', _this._handleBtnValidatesClick);
    });

    // bind button event click
    this._btnSetRevisions = [].slice.call(document.querySelectorAll('[data-revisions]'));

    this._btnSetRevisions.forEach(function (input) {
      input.addEventListener('click', _this._handleBtnValidatesClick);
    });
  }

  _createClass(FormList, [{
    key: '_btnValidatesClick',
    value: function _btnValidatesClick(e) {
      var tplPath = e.currentTarget.getAttribute('data-template-path');
      var filePath = e.currentTarget.getAttribute('data-file-path');
      var type = e.currentTarget.getAttribute('data-type');

      var data = {
        tplPath: tplPath,
        filePath: filePath,
        saveAction: type
      };

      $.ajax({
        url: document.location.origin + '/save',
        data: data
      }).done(function () {
        top.location.href = top.location.href;
      });
    }
  }]);

  return FormList;
}();

exports.default = FormList;

},{}]},{},[17]);
