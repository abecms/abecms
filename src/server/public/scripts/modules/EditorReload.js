import Nanoajax from 'nanoajax'
import qs from 'qs'
import {Promise} from 'es6-promise'
import Json from '../modules/EditorJson'
import {IframeDocument} from '../utils/iframe'
let singleton = Symbol()
let singletonEnforcer = Symbol()

export default class Reload {

  constructor(enforcer) {
    this._ajax = Nanoajax.ajax
    this._json = Json.instance

    if(enforcer != singletonEnforcer) throw "Cannot construct Reload singleton"
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
    var script  = document.createElement("script")
    script.text = node.innerHTML;
    for( var i = node.attributes.length-1; i >= 0; i-- ) {
      script.setAttribute( node.attributes[i].name, node.attributes[i].value )
    }
    return script
  }

  reload() {
    var iframe = document.querySelector('#page-template')
    var iframeBody = IframeDocument('#page-template').body
    var scrollTop = iframeBody.scrollTop
    var json = JSON.parse(JSON.stringify(this._json.data))
    delete json.abe_source
    var data = qs.stringify({
        json: json
      })

    this._ajax(
    {
      url: iframe.src,
      body: data,
      method: 'post'
    },
    (code, responseText, request) => {
        var str = responseText.replace(/<[\s\S]+(?=<head>)/, '')
        str = str.replace(/<\/html>/, '')
        var matches = str.match(/src=['|"]([\S\s]*?)['|"]/g)
        if(typeof matches !== 'undefined' && matches !== null) {
          Array.prototype.forEach.call(matches, (match) => {
            let matchReplace = match.substring(5, match.length-1)
            if(matchReplace.trim() !== "") {
              str = str.replace(matchReplace, `${matchReplace}?v${parseInt(Math.random() * 999999999999)}`)
            }
          })
        }

        var domSource = document.createDocumentFragment()
        var html = document.createElement("html")
        html.innerHTML = str

        iframe.contentDocument.querySelector('html').innerHTML = str
        this._nodeScriptReplace(iframe.contentDocument.querySelector('html'))
        var scripts = iframe.contentDocument.querySelectorAll('script')
        var loaded = 0
        var scriptsLength = 0
        Array.prototype.forEach.call(scripts, (script) => {
          if(typeof script.src !== 'undefined' && script.src !== null && script.src !== '') {
            scriptsLength++
          }
          script.addEventListener('load', () => {
            loaded++
            if (loaded === scriptsLength) {
              IframeDocument('#page-template').body.scrollTop = scrollTop
            }
          })
        })
    })
  }
}