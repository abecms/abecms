/*global document, window */

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

    if(enforcer != singletonEnforcer) throw 'Cannot construct Reload singleton'
  }

  static get instance() {
    if(!this[singleton]) {
      this[singleton] = new Reload(singletonEnforcer)
      window.formJson = this[singleton]
    }
    return this[singleton]
  }

  _nodeScriptReplace(node) {
    if ( this._nodeScriptIs(node) === true ) {
      node.parentNode.replaceChild( this._nodeScriptClone(node) , node )
    }else {
      var i        = 0
      var children = node.childNodes
      while ( i < children.length ) {
        this._nodeScriptReplace( children[i++] )
      }
    }

    return node
  }

  _nodeScriptIs(node) {
    return node.tagName === 'SCRIPT'
  }

  _nodeScriptClone(node) {
    var script  = document.createElement('script')
    script.text = node.innerHTML
    for( var i = node.attributes.length-1; i >= 0; i-- ) {
      script.setAttribute( node.attributes[i].name, node.attributes[i].value )
    }
    return script
  }

  inject(str) { 
    var iframe = document.querySelector('#page-template')
    
    var initIframe = function () {
      var iframeBody = IframeDocument('#page-template').body 
      var scrollTop = iframeBody.scrollTop

      var doc = iframe.contentWindow.document 
      str = str.replace(/<\/head>/, '<base href="/" /></head>') 
      var template = Handlebars.compile(str, {noEscape: true})
      str = template(json)
      doc.open() 
      doc.write(str) 
      doc.close()

      setTimeout(function () { 
        var iframeDoc = IframeDocument('#page-template') 
        if(typeof iframeDoc !== 'undefined' && iframeDoc !== null 
          && typeof iframeDoc.body !== 'undefined' && iframeDoc.body !== null) { 
          iframeDoc.body.scrollTop = scrollTop 
        } 
      }, 1000)
    }

    if(IframeDocument('#page-template').body) initIframe()
    else iframe.onload = initIframe;
  }
  
  reload() {
    var iframe = document.querySelector('#page-template')
    var json = JSON.parse(JSON.stringify(this._json.data))
    
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
      if(typeof responseText !== 'undefined' && responseText !== null) {
        var template = Handlebars.compile(responseText, {noEscape: true})
        responseText = template(json)
        this.inject(responseText)
      }
        
      return
    })
  }
}