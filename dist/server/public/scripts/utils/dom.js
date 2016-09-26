'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.nextSibling = nextSibling;
exports.getClosest = getClosest;
function nextSibling(parent, ele) {
  var next;
  var found = false;
  Array.prototype.forEach.call(parent.childNodes, function (node) {
    if (node.nodeName.indexOf('text') === -1) {
      if (found) {
        next = node;
        found = false;
      }
      if (node === ele) {
        found = true;
      }
    }
  });

  return next;
}

/**
 * Get closest DOM element up the tree that contains a class, ID, or data attribute
 * @param  {Node} elem The base element
 * @param  {String} selector The class, id, data attribute, or tag to look for
 * @return {Node} Null if no match
 */
function getClosest(elem, selector) {

  var firstChar = selector.charAt(0);

  // Get closest match
  for (; elem && elem !== document; elem = elem.parentNode) {

    // If selector is a class
    if (firstChar === '.') {
      if (elem.classList.contains(selector.substr(1))) {
        return elem;
      }
    }

    // If selector is an ID
    if (firstChar === '#') {
      if (elem.id === selector.substr(1)) {
        return elem;
      }
    }

    // If selector is a data attribute
    if (firstChar === '[') {
      if (elem.hasAttribute(selector.substr(1, selector.length - 2))) {
        return elem;
      }
    }

    // If selector is a tag
    if (elem.tagName.toLowerCase() === selector) {
      return elem;
    }
  }

  return false;
}