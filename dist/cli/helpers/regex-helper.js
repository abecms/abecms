'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAttr = getAttr;
exports.getEnclosingTags = getEnclosingTags;
exports.escapeTextToRegex = escapeTextToRegex;

var _ = require('../');

function getAttr(str, attr) {
  // var rex = new RegExp(attr + '=["\']([^\'"]+)')
  var rex = new RegExp(attr + '=["|\']([\\S\\s]*?)["|\']( +[a-zA-Z0-9-]*?=|}})');
  // var rex = new RegExp(attr + '=["|\']([\\S\\s]*?)["|\']( [a-zA-Z0-9-]*?=|}})')
  var res = rex.exec(str);
  res = typeof res !== null && res !== null && res.length > 1 ? res[1] : '';
  return res;
}

/**
 * Return array of tag found into html text
 * 
 * @param  {String} text html
 * @param  {String} tag name
 * @return {Array}  array of tags
 *
 * if a tag is inside a tag
 *
 * <div>
 *   <div></div>
 * <div>
 *
 * Will return the whole div (use querySelectorTags for that)
 */
function explodeTag(text, tag) {
  var startWithTags = false;
  if (text.indexOf('<' + tag) === 0) {
    startWithTags = true;
  }
  var tags = text.split('<' + tag);

  var i = 0;
  var reconstruct = [];
  var wait = '';

  reconstruct.push(tags.shift());
  Array.prototype.forEach.call(tags, function (ele) {
    i++;
    var matches = ele.match(escapeTextToRegex('</' + tag, 'g'));
    if (typeof matches !== 'undefined' && matches !== null && matches.length > 0) {
      Array.prototype.forEach.call(matches, function (match) {
        i--;
      });

      if (i === 0) {
        reconstruct.push(wait + '<' + tag + ele);
        wait = '';
      } else {
        wait += '<' + tag + ele;
      }
    } else {
      wait += '<' + tag + ele;
    }
  });
  return reconstruct;
}

/**
 * Return all tags inside text html
 * 
 * @param  {String}   text html
 * @param  {String}   tag name
 * @return {Array}    array of tags
 *
 * Exemple
 *
 * <div class="cl-1">
 *   <div class="cl-2"></div>
 * <div>
 *
 * will return an array with 2
 *
 * [
 *   '<div class="cl-1">
 *     <div class="cl-2"></div>
 *    <div>',
 *    
 *    '<div class="cl-2"></div>'
 * ]
 * 
 */
function querySelectorTags(text, tag) {
  var res = [];
  var finalRes = [];

  while (text !== '') {
    var checkTags = explodeTag(text, tag);
    text = '';
    Array.prototype.forEach.call(checkTags, function (ele) {
      res.push(ele);

      var matches = ele.match(escapeTextToRegex('<' + tag, 'g'));
      if (typeof matches !== 'undefined' && matches !== null && matches.length > 1) {
        var tagLength = '<' + tag;
        tagLength = tagLength.length;

        // remove first tag
        var start = ele.indexOf('<' + tag);
        ele = ele.substring(start + tagLength);

        // remove end tag
        var end = ele.lastIndexOf('</' + tag);
        ele = ele.substring(0, end);

        text += ele;
      }
    });
  }

  Array.prototype.forEach.call(res, function (ele) {
    var matches = ele.match(escapeTextToRegex('<' + tag, 'g'));
    if (typeof matches !== 'undefined' && matches !== null && matches.length > 0) {
      var finalEleReg = new RegExp('<' + tag + '([\\s\\S]*?)<\\/' + tag + '>(?![\\s\\S]*<\/' + tag + '>)');
      finalEleReg = finalEleReg.exec(ele);
      if (typeof finalEleReg !== 'undefined' && finalEleReg !== null && finalEleReg.length > 0) {
        finalRes.push(finalEleReg[0]);
      } else {
        finalRes.push(ele);
      }
    }
  });

  return finalRes;
}

/**
 * Check if an html tag wrap an other tag and return only the deepest one
 * 
 * @param  {Array}    arr of tags
 * @return {Boolean}  true|false
 */
function isInsideOtherTag(arr) {
  var res = [];

  arr = arr.reverse();

  var uniq = arr.reduce(function (a, b) {
    var isUniq = true;
    Array.prototype.forEach.call(arr, function (c) {
      if (c !== b && b.indexOf(c) !== -1) {
        isUniq = false;
      }
    });
    if (isUniq) a.push(b);

    return a;
  }, []);

  return uniq;
}

/**
 * return html tags that enclose a string
 * 
 * @param  {String} text  html
 * @param  {String} match string to match
 * @param  {String} tag   html tag name
 * @return {Array} array of matches
 */
function getEnclosingTags(text, match, tag) {
  var res = [];
  var tags = querySelectorTags(text, tag);

  Array.prototype.forEach.call(tags, function (tag) {
    var matches = tag.match(escapeTextToRegex(match, 'g'));
    if (typeof matches !== 'undefined' && matches !== null && matches.length > 0) {
      res.push(tag);
    }
  });

  res = isInsideOtherTag(res);

  return res;
}

/**
 * escape a regex
 * @param  {String} str
 * @param  {String} params g,m,i
 * @return {Object} RegExp
 */
function escapeTextToRegex(str, params) {
  // str = str.replace(/\((?![\s\S]*\()/g, '\\(')
  // str = str.replace(/\)(?![\s\S]*\))/g, '\\)')
  // str = str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  str = str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  return new RegExp(str, params);
}