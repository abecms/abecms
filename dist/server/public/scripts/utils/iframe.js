"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.IframeDocument = IframeDocument;
exports.IframeNode = IframeNode;
exports.IframeCommentNode = IframeCommentNode;
function IframeDocument(frameId) {
	var iframe = document.querySelector(frameId);
	var iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
	return iframeDocument;
}

function IframeNode(frameId, selector) {
	return IframeDocument(frameId).querySelectorAll(selector.replace(/\[([0-9]*)\]/g, '$1'));
}

function IframeGetComment(frameId, prop, val, meth, nd, useSelf) {
	var prop = "nodeType";
	var val = 8;
	var meth = null;
	var r = [],
	    any = IframeGetComment[val] === true;
	nd = nd || IframeDocument(frameId).documentElement;

	if (nd.constructor === Array) {
		nd = { childNodes: nd };
	}
	for (var cn = nd.childNodes, i = 0, mx = cn.length; i < mx; i++) {
		var it = cn[i];
		if (it.childNodes.length && !useSelf) {
			r = r.concat(IframeGetComment(frameId, prop, val, meth, it, useSelf));
		}
		if (any ? it[prop] : it[prop] !== undefined && (meth ? ""[meth] && String(it[prop])[meth](val) : it[prop] == val)) {
			r[r.length] = it;
		}
	}
	return r;
}

function IframeCommentNode(frameId, key) {
	var nodes = IframeGetComment(frameId, "nodeType", 8, null, null);
	var found = [];
	Array.prototype.forEach.call(nodes, function (node) {
		if (node.textContent.indexOf(key) > -1) {
			found.push(node);
		}
	});
	return found;
}