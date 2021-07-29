/*global document, window */

import {IframeNode, IframeCommentNode} from '../utils/iframe'
import Handlebars from 'handlebars'
import math from '../../../../../cli/cms/templates/handlebars/math'
import translate from '../../../../../cli/cms/templates/handlebars/translate-front'
import printJson from '../../../../../cli/cms/templates/handlebars/printJson'

Handlebars.registerHelper('math', math)
Handlebars.registerHelper('i18nAbe', translate)
Handlebars.registerHelper('printJson', printJson)

export default class EditorUtils {
  // static checkAttribute() {
  //   let formAbes = document.querySelectorAll('.form-abe')

  //   Array.prototype.forEach.call(formAbes, formAbe => {
  //     console.log('checkAttribute')
  //     console.log(formAbe.getAttribute('data-id'))
  //     // var hide = IframeNode(
  //     //   '#page-template',
  //     //   '[data-if-empty-clear="' + formAbe.getAttribute('data-id') + '"]'
  //     // )
  //     // if (hide != null) {
  //     //   hide = hide[0]
  //     //   if (typeof hide !== 'undefined' && hide !== null) {
  //     //     if (formAbe.value === '') {
  //     //       hide.style.display = 'none'
  //     //     } else {
  //     //       hide.style.display = ''
  //     //     }
  //     //   }
  //     // }
  //   })
  // }

  static scrollToInputElement(target) {
    var visible = target.getAttribute('data-visible')
    if (visible === 'false' || visible === false) {
      return
    }
    var id = target.getAttribute('data-id').replace(/\./g, '-')
    var nodes = IframeNode('#page-template', '[data-abe-' + id + ']')

    if (typeof nodes === 'undefined' || nodes === null || nodes.length === 0) {
      var nodesComment = [].slice.call(
        IframeCommentNode('#page-template', id.split('[')[0])
      )

      if (typeof nodesComment !== 'undefined' && nodesComment !== null) {
        Array.prototype.forEach.call(nodesComment, nodeComment => {
          var attrId = target
            .getAttribute('data-id')
            .replace(/\./g, '-')
            .replace(/\[/g, '')
            .replace(/\]/g, '')
          if (
            nodeComment.data.substring(0, 3) === 'ABE' &&
            nodeComment.data.indexOf(attrId) > -1
          ) {
            nodeComment.parentNode.classList.add('select-border')
            if (
              typeof nodeComment.parentNode.offsetParent !== 'undefined' &&
              nodeComment.parentNode.offsetParent !== null
            ) {
              var bounds = nodeComment.parentNode.getBoundingClientRect()
              var w = document.getElementById('page-template').contentWindow
              w.scroll(
                0,
                w.scrollY +
                  bounds.top +
                  bounds.height * 0.5 -
                  window.innerHeight * 0.5
              )
            }
          }
        })
      }

      nodes = IframeNode('#page-template', '[data-abe-' + id + ']')
    } else {
      Array.prototype.forEach.call(nodes, node => {
        if (node.nodeType === 8) {
          var attrId = target
            .getAttribute('data-id')
            .replace(/\./g, '-')
            .replace(/\[/g, '')
            .replace(/\]/g, '')
          if (
            node.data.substring(0, 3) === 'ABE' &&
            node.data.indexOf(attrId) > -1
          ) {
            node.parentNode.classList.add('select-border')
            if (
              typeof node.parentNode.offsetParent !== 'undefined' &&
              node.parentNode.offsetParent !== null
            ) {
              var bounds = node.parentNode.getBoundingClientRect()
              var w = document.getElementById('page-template').contentWindow
              w.scroll(
                0,
                w.scrollY +
                  bounds.top +
                  bounds.height * 0.5 -
                  window.innerHeight * 0.5
              )
            }
          }
        } else {
          node.classList.add('select-border')
          // scroll to DOM node
          if (typeof nodes[0] !== 'undefined' && nodes[0] !== null) {
            var bounds = nodes[0].getBoundingClientRect()
            var w = document.getElementById('page-template').contentWindow
            w.scroll(
              0,
              w.scrollY +
                bounds.top +
                bounds.height * 0.5 -
                window.innerHeight * 0.5
            )
          }
        }
      })
    }
  }

  static getAttr(target) {
    var id = target.getAttribute('data-id').replace(/\./g, '-')

    return {
      abe: 'data-abe-' + id.replace(/\[([0-9]*)\]/g, '$1'),
      id: id
    }
  }

  static getNode(attr) {
    var nodes = IframeNode('#page-template', '[' + attr.abe + ']')

    if (typeof nodes === 'undefined' || nodes === null) {
      var blockContent = IframeNode(
        '#page-template',
        '.insert-' + attr.id.split('[')[0]
      )[0]
      var blockHtml = unescape(blockContent.innerHTML).replace(
        /\[0\]\./g,
        attr.id.split('[')[0] + '[0]-'
      )
      blockContent.insertBefore(blockHtml, blockContent)
      nodes = IframeNode(
        '#page-template',
        '[' + attr.abe + '="' + attr.id + '"]'
      )
    }

    Array.prototype.forEach.call(nodes, node => {
      if (node.nodeType === 8) {
        node.parentNode.classList.add('select-border')
      } else node.classList.add('select-border')
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
    var id = input.id.replace(/\./g, '-')
    var placeholder = input.getAttribute('placeholder')
    if (
      typeof placeholder === 'undefined' ||
      placeholder === 'undefined' ||
      placeholder === null
    ) {
      placeholder = ''
    }
    if (val.replace(/^\s+|\s+$/g, '').length < 1) {
      val = placeholder
    }

    var dataAbeAttr
    switch (input.nodeName.toLowerCase()) {
      case 'input':
        if (
          (input.type == 'checkbox') ||
          (input.type == 'radio')
        ) {
          const checkedOptions = input.parentNode.querySelectorAll('input:checked')
          val = ''
          for(var i = 0; i< checkedOptions.length; i++){
            val = `${val} ${checkedOptions[i].value}`
          }

          if (node.nodeType !== 8) {
            dataAbeAttr = node.getAttribute(
              'data-abe-attr-' + id.replace(/\[([0-9]*)\]/g, '$1')
            )
            if (typeof dataAbeAttr !== 'undefined' && dataAbeAttr !== null) {
              node.setAttribute(dataAbeAttr, val)
            } else if (node.inStyle || node.inScript) {
              node.setHtml(node.getHtml() + val)
            } else {
              node.innerHTML = node.innerHTML + val
            }
          } else {
            var commentPattern = new RegExp(
              '(<!--' + node.data + '-->)([\\s\\S]+?)(<!--\\/ABE--->)'
            )
            var res = commentPattern.exec(node.parentNode.innerHTML)
            var repl = node.parentNode.innerHTML.replace(
              res[0],
              `<!--${node.data}-->${val}<!--/ABE--->`
            )

            node.parentNode.innerHTML = repl
          }
        } else {
          if (node.nodeType !== 8) {
            dataAbeAttr = node.getAttribute(
              'data-abe-attr-' + id.replace(/\[([0-9]*)\]/g, '$1')
            )
            if (typeof dataAbeAttr !== 'undefined' && dataAbeAttr !== null) {
              node.setAttribute(dataAbeAttr, val)
            } else if (node.inStyle || node.inScript) {
              node.setHtml(val)
            } else {
              node.innerHTML = val
            }
          } else {
            var commentPattern = new RegExp(
              '(<!--' + node.data + '-->[\\s\\S]+?\\/ABE--->)'
            )
            var res = commentPattern.exec(node.parentNode.innerHTML)
            var repl = node.parentNode.innerHTML.replace(
              res[0],
              '<!--' + node.data + '-->' + val + '<!--/ABE--->'
            )

            node.parentNode.innerHTML = repl
          }
        }

        break
      case 'textarea':
        if (node.nodeType === 8) {
          var commentPattern = new RegExp(
            '(<!--' + node.data + '-->[\\s\\S]+?\\/ABE--->)'
          )
          var res = commentPattern.exec(node.parentNode.innerHTML)
          var repl = node.parentNode.innerHTML
          var newStr
          if (input.classList.contains('form-rich')) {
            newStr =
              '<!--' +
              node.data +
              '-->' +
              input.parentNode.querySelector('[contenteditable]').innerHTML +
              '<!--/ABE--->'
            repl = repl.replace(res[0], newStr)
          } else if (input.classList.contains('abe-format-html')) {
            // In this case I have to check if the html is well formed
            // (it will crash if there is an unclosed tag)
            // If there is an unclosed tag, I close it
            var divTemp = document.createElement('div')
            newStr = '<!--' + node.data + '-->' + val + '<!--/ABE--->'
            divTemp.innerHTML = newStr
            if (
              divTemp.innerHTML == newStr ||
              divTemp.innerHTML.slice(-8) === '/ABE--->'
            ) {
              repl = repl.replace(res[0], newStr)
            } else if (divTemp.innerHTML.indexOf('/ABE--->') > -1) {
              var pos = divTemp.innerHTML.indexOf('/ABE--->') + 8
              var len = divTemp.innerHTML.length
              var tag = divTemp.innerHTML.slice(pos - len)
              newStr =
                newStr.slice(0, newStr.length - 12) + tag + '<!--/ABE--->'
              repl = repl.replace(res[0], newStr)
            }
          } else {
            newStr = '<!--' + node.data + '-->' + val + '<!--/ABE--->'
            repl = repl.replace(res[0], newStr)
          }

          node.parentNode.innerHTML = repl
        } else if (node.inStyle || node.inScript) node.setHtml(val)
        else
          node.innerHTML = input.classList.contains('form-rich')
            ? input.parentNode.querySelector('[contenteditable]').innerHTML
            : val
        break
      case 'select':
        var key = node.getAttribute('data-abe-' + id)
        dataAbeAttr = node.getAttribute(
          'data-abe-attr-' + id.replace(/\[([0-9]*)\]/g, '$1')
        )
        var dataAbeAttrEscaped = unescape(
          node.getAttribute('data-abe-attr-escaped')
        )
        var option = input.querySelector('option:checked')
        if (typeof option !== 'undefined' && option !== null) {
          val = option.value
          if (typeof dataAbeAttr !== 'undefined' && dataAbeAttr !== null) {
            try {
              var template = Handlebars.compile(dataAbeAttrEscaped, {
                noEscape: true
              })
              var json = {}
              json[key] = val
              var compiled = template(json)
              node.setAttribute(dataAbeAttr, compiled)
            } catch (e) {
              console.log(e)
            }
          } else {
            node.innerHTML = val
          }
        }
        break
    }
  }
}
