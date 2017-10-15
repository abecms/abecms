/*global document, window, json */

import Handlebars from 'handlebars'
import Nanoajax from 'nanoajax'
import qs from 'qs'
import Json from '../modules/EditorJson'
import {IframeDocument} from '../utils/iframe'
let singleton = Symbol()
let singletonEnforcer = Symbol()

export default class Reload {
  constructor(enforcer) {
    this._ajax = Nanoajax.ajax
    this._json = Json.instance

    if (enforcer != singletonEnforcer) throw 'Cannot construct Reload singleton'
  }

  static get instance() {
    if (!this[singleton]) {
      this[singleton] = new Reload(singletonEnforcer)
      window.formJson = this[singleton]
    }
    return this[singleton]
  }

  _nodeScriptReplace(node) {
    if (this._nodeScriptIs(node) === true) {
      node.parentNode.replaceChild(this._nodeScriptClone(node), node)
    } else {
      var i = 0
      var children = node.childNodes
      while (i < children.length) {
        this._nodeScriptReplace(children[i++])
      }
    }

    return node
  }

  _nodeScriptIs(node) {
    return node.tagName === 'SCRIPT'
  }

  _nodeScriptClone(node) {
    var script = document.createElement('script')
    script.text = node.innerHTML
    for (var i = node.attributes.length - 1; i >= 0; i--) {
      script.setAttribute(node.attributes[i].name, node.attributes[i].value)
    }
    return script
  }

  inject(str) {
    var currentIframe = document.querySelector('#page-template')
    var sibling = currentIframe.nextElementSibling
    var parent = sibling.parentNode
    var iframe = document.createElement('iframe')
    var scrollTop = IframeDocument('#page-template').body
      ? IframeDocument('#page-template').body.scrollTop
      : 0

    parent.classList.add('reloading')

    iframe.id = 'page-template'
    iframe.src = 'about:blank'
    iframe.sandbox =
      'allow-presentation allow-modals allow-pointer-lock allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms allow-top-navigation'
    iframe.setAttribute(
      'data-iframe-src',
      document.querySelector('#page-template').getAttribute('data-iframe-src')
    )

    var hasNotWritten = true

    var initIframe = function() {
      var doc = iframe.contentWindow.document
      str = str.replace(/<\/head>/, '<base href="/" /></head>')
      doc.open('text/html', 'replace')
      doc.write(str)
      hasNotWritten = false
      doc.close()

      setTimeout(function() {
        var iframeDoc = IframeDocument('#page-template')
        if (
          typeof iframeDoc !== 'undefined' &&
          iframeDoc !== null &&
          typeof iframeDoc.body !== 'undefined' &&
          iframeDoc.body !== null
        ) {
          iframeDoc.body.scrollTop = scrollTop
        }
      }, 1000)
    }

    iframe.onload = function() {
      if(!hasNotWritten) return
      initIframe()
      setTimeout(function() {
        parent.classList.remove('reloading')
      }, 350)
    }

    currentIframe.remove()
    parent.insertBefore(iframe, sibling)
  }

  reload() {
    var iframe = document.querySelector('#page-template')
    if (iframe != null) {
      var json = JSON.parse(JSON.stringify(this._json.data))
      iframe.parentNode.classList.add('reloading')

      delete json.abe_source
      var data = qs.stringify({
        json: json
      })

      this._ajax(
        {
          url: iframe.getAttribute('data-iframe-src'),
          body: data,
          method: 'post'
        },
        (code, responseText) => {
          if (typeof responseText !== 'undefined' && responseText !== null) {
            this.inject(responseText)
          }

          return
        }
      )
    }
  }
}
