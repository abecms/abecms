/*global document */

export function IframeDocument (frameId){
  let iframe = document.querySelector(frameId)
  let iframeDocument = iframe != null ? iframe.contentDocument || iframe.contentWindow.document : null
  return iframeDocument
}

/**
 * This function search dom nodes including comments
 * @param {[type]} frameId  [description]
 * @param {[type]} selector [description]
 */
export function IframeNode (frameId, selector){
  var iframe = IframeDocument(frameId)
  var result
  if (iframe) {
    try{
      result = iframe.querySelectorAll(selector.replace(/\[([0-9]*)\]/g, '$1'))
    } catch(e){
      result = []
    }
    // No DOM node found
    if (result.length === 0) {
      let key
      if (selector[0] === '[')
        key = selector.slice(1, -1)
      else
        key = selector
      result = IframeCommentNode(frameId, key)
      Array.prototype.forEach.call(result, (node, index) => {
        if(node.nodeType === 8 && node.data.substring(0, 4) !== 'ABE ')
          result.splice(index, 1)
        node.getAttribute = function(attr) {
          if(node.textContent.indexOf(attr) > -1) {
            return node.textContent
          } else {
            return null
          }
        }
      })

      // searching Abe tags in <style> tags
      if (result.length === 0) {
        let eachStylePattern = new RegExp('[\\S\\s]*?(\\/\\*<!--ABE '+key+'[\\S\\s]*?--->\\*\\/)([\\S\\s]*?)(\\/\\*<!--\\/ABE--->\\*\\/)[\\S\\s]*?')
        let styles = iframe.getElementsByTagName('style')
        
        Array.prototype.forEach.call(styles, (style) => {
          let matchFromExec = eachStylePattern.exec(style.textContent)
          if(matchFromExec != null && matchFromExec[1] != null) {
            var node = {classList:{}, inStyle:true, }
            node.classList.add = function(){}
            node.classList.remove = function(){}
            node.getBoundingClientRect = function(){
              return {height:0, top:0}
            }
            node.getAttribute = function(attr) {}
            node.setHtml = function(val) {
              style.textContent = style.textContent.replace(matchFromExec[1] + matchFromExec[2] + matchFromExec[3],matchFromExec[1] + val + matchFromExec[3])
            }
            result=[]
            result.push(node)
          }
        })
      }

      // searching Abe tags in <script> tags
      if (result.length === 0) {
        let eachScriptPattern = new RegExp('[\\S\\s]*?(\\/\\*<!--ABE '+key+'[\\S\\s]*?--->\\*\\/)([\\S\\s]*?)(\\/\\*<!--\\/ABE--->\\*\\/)[\\S\\s]*?')
        let scripts = iframe.getElementsByTagName('script')

        Array.prototype.forEach.call(scripts, (script) => {
          let matchFromExec = eachScriptPattern.exec(script.innerHTML)
          if(matchFromExec != null && matchFromExec[1] != null) {
            var node = {classList:{}, inScript:true, }
            node.classList.add = function(){}
            node.classList.remove = function(){}
            node.getBoundingClientRect = function(){
              return {height:0, top:0}
            }
            node.getAttribute = function(attr) {}
            node.setHtml = function(val) {
              script.innerHTML = script.innerHTML.replace(matchFromExec[1] + matchFromExec[2] + matchFromExec[3],matchFromExec[1] + val + matchFromExec[3])
            }
            result=[]
            result.push(node)
          }
        })
      }
    }
    return result
  }
  return []
}

function IframeGetComment(frameId, prop, val, meth, nd, useSelf ) {
  prop = 'nodeType'
  val = 8
  meth = null
  var r=[], any= IframeGetComment[val]===true
  var iframe = IframeDocument(frameId)
  if (iframe == null) return []
  nd = nd||IframeDocument(frameId).documentElement

  if(nd.constructor===Array){
    nd = {childNodes:nd}
  }
  for(var cn = nd.childNodes, i=0, mx=cn.length;i<mx;i++) {
    var it=cn[i]
    if(it.childNodes.length && !useSelf) {
      r = r.concat(IframeGetComment(frameId, prop, val, meth, it, useSelf ))
    }
    if( any ? it[prop] : (it[prop]!==undefined && (meth ? ''[meth] &&  String(it[prop])[meth](val) : it[prop]==val))) {
      r[r.length]=it
    }
  }
  return r
}

export function IframeCommentNode(frameId, key) {
  var nodes = IframeGetComment(frameId, 'nodeType', 8, null, null)
  var found = []
  Array.prototype.forEach.call(nodes, (node) => {
    if(node.textContent.indexOf(key) > -1) {
      found.push(node)
    }
  })
  return found
}