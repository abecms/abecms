import {IframeNode, IframeCommentNode} from "../utils/iframe"
import Handlebars from "handlebars"
import math from "../../../../cli/handlebars/utils/math"
import translate from "../../../../cli/handlebars/utils/translate-front"

Handlebars.registerHelper("math", math) // HandlebarsJS unique text helper
Handlebars.registerHelper("i18nAbe", translate) // HandlebarsJS unique text helper

export default class EditorUtils {

  static checkAttribute() {
    let formAbes = document.querySelectorAll(".form-abe")

    Array.prototype.forEach.call(formAbes, (formAbe) => {
      var hide = IframeNode("#page-template", "[data-if-empty-clear=\"" + formAbe.getAttribute("data-id") + "\"]")[0]
      if(typeof hide !== "undefined" && hide !== null) {
        if (formAbe.value === "") {
          hide.style.display = "none"
        }else {
          hide.style.display = ""
        }
      }
    })
  }

  static scrollToInputElement(target) {
    var visible = target.getAttribute("data-visible")
    if (visible === "false" || visible === false) {
      return
    }
    var dataLink = target.getAttribute("data-id-link")
    var id = target.getAttribute("data-id")
    var nodes = IframeNode("#page-template", "[data-abe-" + id + "]")

    if(typeof nodes === "undefined" || nodes === null || nodes.length === 0) {
      var nodesComment = [].slice.call(IframeCommentNode("#page-template", id.split("[")[0]))
      if(typeof nodesComment !== "undefined" && nodesComment !== null
        && typeof nodesComment.textContent !== "undefined" && nodesComment.textContent !== null) {
        var blockHtml = unescape(nodesComment.textContent.replace(/\[\[([\S\s]*?)\]\]/, ""))

        var newBlock = document.createElement("abe")
        newBlock.innerHTML = blockHtml
        
        var childs = [].slice.call(newBlock.childNodes)
        Array.prototype.forEach.call(childs, (child) => {
          nodesComment.parentNode.insertBefore(child, nodesComment)
        })
      }else if(typeof nodesComment !== "undefined" && nodesComment !== null) {
        Array.prototype.forEach.call(nodesComment, (nodeComment) => {
          if(typeof nodeComment.parentNode.offsetParent !== "undefined" && nodeComment.parentNode.offsetParent !== null) {
            var bounds = nodeComment.parentNode.getBoundingClientRect()
            var w = document.getElementById("page-template").contentWindow
            w.scroll(0, w.scrollY + bounds.top + (bounds.height * 0.5) - (window.innerHeight * 0.5))
          }
        })
      }
      
      nodes = IframeNode("#page-template", "[data-abe-" + id + "]")
    }

    Array.prototype.forEach.call(nodes, (node) => {
      node.classList.add("select-border")
    })
    
    // scroll to DOM node
    if(typeof nodes[0] !== "undefined" && nodes[0] !== null) {
      var bounds = nodes[0].getBoundingClientRect()
      var w = document.getElementById("page-template").contentWindow
      w.scroll(0, w.scrollY + bounds.top + (bounds.height * 0.5) - (window.innerHeight * 0.5))
    }
  }

  static getAttr(target) {
    var dataLink = target.getAttribute("data-id-link")
    var id = target.getAttribute("data-id")

    return {
      abe: "data-abe-" + id.replace(/\[([0-9]*)\]/g, "$1"),
      id: id
    }
  }

  static getNode(attr) {
    var nodes = IframeNode("#page-template", "[" + attr.abe + "]")

    if(typeof nodes === "undefined" || nodes === null) {
      var blockContent = IframeNode("#page-template", ".insert-" + attr.id.split("[")[0])[0]
      var blockHtml = unescape(blockContent.innerHTML).replace(/\[0\]\./g, attr.id.split("[")[0] + "[0]-")
      blockContent.insertBefore(blockHtml, blockContent)
      nodes = IframeNode("#page-template", "[" + attr.abe + "=\"" + attr.id + "\"]")
    }

    Array.prototype.forEach.call(nodes, (node) => {
      node.classList.add("select-border")
    })

    return nodes
  }

  /**
   * get input value and set to iframe html
   * @param  {Object} node  html node
   * @param  {Object} input input elem
   * @return {null}
   */
  static formToHtml(node, input) {
    var val = input.value
    var id = input.id
    var placeholder = input.getAttribute("placeholder")
    if(typeof placeholder === "undefined" || placeholder === "undefined" || placeholder === null) {
      placeholder = ""
    }
    if(val.replace(/^\s+|\s+$/g, "").length < 1) {
      val = placeholder
    }

    switch(input.nodeName.toLowerCase()){
    case "input":
      var dataAbeAttr = node.getAttribute("data-abe-attr-" + id.replace(/\[([0-9]*)\]/g, "$1"))
      if(typeof dataAbeAttr !== "undefined" && dataAbeAttr !== null) {
        node.setAttribute(dataAbeAttr, val)
      }else {
        node.innerHTML = val
      }
      break
    case "textarea":
      node.innerHTML = (input.classList.contains("form-rich")) ? input.parentNode.querySelector("[contenteditable]").innerHTML : val
      break
    case "select":
      var key = node.getAttribute("data-abe-" + id)
      var dataAbeAttr = node.getAttribute("data-abe-attr-" + id.replace(/\[([0-9]*)\]/g, "$1"))
      var dataAbeAttrEscaped = unescape(node.getAttribute("data-abe-attr-escaped"))
      var option = input.querySelector("option:checked")
      if(typeof option !== "undefined" && option !== null) {
        val = option.value
        if(typeof dataAbeAttr !== "undefined" && dataAbeAttr !== null) {
          try {
            var template = Handlebars.compile(dataAbeAttrEscaped, {noEscape: true})
            var json = {}
            json[key] = val
            var compiled = template(json)
            node.setAttribute(dataAbeAttr, compiled)
          } catch(e) {
            console.log(e)
          }
        }else {
          node.innerHTML = val
        }
      }
      break
    }
  }
}