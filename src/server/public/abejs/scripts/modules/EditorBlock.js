/*global document, abe, $, jQuery */

import {IframeNode, IframeCommentNode} from '../utils/iframe'
import {nextSibling} from '../utils/dom'
import Color from '../utils/color-picker'
import Link from '../utils/link-picker'
import image from '../utils/img-picker'
import RichText from '../utils/rich-texarea'
import Json from './EditorJson'
import EditorUtils from './EditorUtils'
import on from 'on'

export default class EditorBlock {
  constructor() {
    this._json = Json.instance
    var colorWysiwyg = document.querySelector('.wysiwyg-popup.color')
    if (colorWysiwyg != null) {
      this.color = new Color(colorWysiwyg)
    }
    var linkWysiwyg = document.querySelector('.wysiwyg-popup.link')
    if (linkWysiwyg != null) {
      this.link = new Link(linkWysiwyg)
    }
    var imgWysiwyg = document.querySelector('.wysiwyg-popup.image')
    if (imgWysiwyg != null) {
      this.image = new image(imgWysiwyg)
    }

    this._removeblock = [].slice.call(document.querySelectorAll('.list-group[data-block]'))
    this._handleClickRemoveBlock = this._clickRemoveBlock.bind(this)
    
    this._addblock = [].slice.call(document.querySelectorAll('.add-block'))
    this._handleClickAddBlock = this._clickAddBlock.bind(this)

    this.onNewBlock = on(this)
    this.onRemoveBlock = on(this)

    this._bindEvents()
  }

  /**
   * bind events
   * @return {[type]} [description]
   */
  _bindEvents() {
    this._removeblock.forEach((block) => {
      block.addEventListener('click', this._handleClickRemoveBlock)
    })
    this._addblock.forEach((block) => {
      block.addEventListener('click', this._handleClickAddBlock)
    })
  }

  /**
   * event remove block
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  _clickRemoveBlock(e) {
    var target = e.target
      , elem = target
      , parent = null
      , listGroup = null
      , blockAttr = ''
      , wasFound = false
      , startNumber = 0
      , endNumber = 0
    
    if(elem.classList.contains('glyphicon-trash') || elem.classList.contains('remove-block')){
      for(; elem && elem !== document; elem = elem.parentNode){
        if (elem.hasAttribute('data-block')) {
          parent = elem
          listGroup = parent.parentNode
          blockAttr = listGroup.getAttribute('data-block')
          break
        }
      }
    }

    if(parent && listGroup){
      if(listGroup.querySelectorAll('[data-block]').length === 1){
        var items = IframeNode('#page-template', `[data-abe-block="${blockAttr}0"]`)
        Array.prototype.forEach.call(items, (item) => {
          item.parentNode.removeChild(item)
        })
        var child = document.querySelector(`[data-block=${blockAttr}0]`)
        child.style.display = 'none'
        Array.prototype.forEach.call(child.querySelectorAll('.form-abe'), (item) => {
          item.value = ''
        })
        delete abe.json._data[blockAttr][0]
      }
      else{
        var toRemove = null
        Array.prototype.forEach.call(listGroup.querySelectorAll('[data-block]'), (block) => {
          var currentBlockAttr = block.getAttribute('data-block')
          var nb = parseInt(currentBlockAttr.replace(blockAttr, ''))
          if(wasFound){
            Array.prototype.forEach.call(listGroup.querySelectorAll('.form-abe'), (el) => {
              el.setAttribute('value', el.value)
            })
            var blockId = blockAttr + (nb-1)
            var html = block.innerHTML

            html = html.replace(/data-block=(\'|\")(.*)(\'|\")/g, `data-block="${blockId}"`)
            html = html.replace(/data-target=(\'|\")(.*)(\'|\")/g, `data-target="#${blockId}"`)
            html = html.replace(new RegExp('id=(' + '\\\'' + '|\\"' + ')' + blockAttr + '(\\d+)(' + '\\\'' + '|\\"' + ')', 'g'), `id="${blockId}"`)
            html = html.replace(/\[(\d+)\]/g, `[${nb-1}]`)
            block.innerHTML = html
            block.setAttribute('data-block', blockAttr + (nb - 1))
            var labelCount = block.querySelector('.label-count')
            labelCount.textContent = parseInt(labelCount.textContent) - 1
            Array.prototype.forEach.call(block.querySelectorAll('label'), (label) => {
              label.textContent = label.textContent.replace(new RegExp(nb, 'g'), nb - 1)
            })

            Array.prototype.forEach.call(IframeNode('#page-template', `[data-abe-block="${blockAttr + nb}"]`), (el) => {
              el.parentNode.removeChild(el)
            })
            
            endNumber = nb
          }
          else if(currentBlockAttr === parent.getAttribute('data-block')){
            Array.prototype.forEach.call(IframeNode('#page-template', `[data-abe-block="${blockAttr + nb}"]`), (el) => {
              el.parentNode.removeChild(el)
            })

            toRemove = block
            wasFound = true
            startNumber = nb
          }
        })

        toRemove.remove()

        var json = this._json.data
        for(var i = startNumber; i < endNumber; i++){
          this._insertNewBlock(blockAttr, i)
          Array.prototype.forEach.call(document.querySelectorAll('[data-block="' + blockAttr + i + '"] .form-abe'), (el) => {
            var key = el.getAttribute('data-id').split('-')
            if(key){
              key = key[1]
              json[blockAttr][i][key] = el.value
              var nodes = EditorUtils.getNode(EditorUtils.getAttr(el))
              Array.prototype.forEach.call(nodes, (node) => {
                EditorUtils.formToHtml(node, el)
              })
            }
          })
        }
        json[blockAttr].pop()
        this._json.data = json
      }
    }

    this.onRemoveBlock._fire()
  }

  /**
   * event add new block
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  _clickAddBlock(e) {
    let target = e.currentTarget
    var dataLink = target.getAttribute('data-id-link')
    var prevListItem = target.parentNode.parentNode.querySelectorAll('.list-block')
    var listGroupItem = prevListItem.length
    prevListItem = prevListItem[prevListItem.length - 1]

    var attrId = (typeof dataLink !== 'undefined' && dataLink !== null) ? 'data-id-link' : 'data-id'
      , itemNumber = 0
      , newNumber = 0
      , rex = new RegExp(itemNumber, 'g')

    if(listGroupItem > 1 || (listGroupItem === 1 && prevListItem.style.display !== 'none')) {
      newNumber = this._createNewBlock(prevListItem, itemNumber, newNumber)
      rex = new RegExp(newNumber - 1, 'g')
    }else {
      prevListItem.style.display = 'block'
    }

    prevListItem = target.parentNode.parentNode.querySelectorAll('.list-block')
    prevListItem = prevListItem[prevListItem.length - 1]
    var prevButton = prevListItem.querySelector('button')
    var dataTarget = prevButton.getAttribute('data-target')
    var newTarget = dataTarget.replace(rex, newNumber)

    var contentListItem = prevListItem.querySelector(dataTarget)
    contentListItem.setAttribute('id', newTarget.slice(1))
    contentListItem.setAttribute(attrId, newTarget.slice(1))

    prevButton.setAttribute('data-target', newTarget)
    this._insertNewBlock(prevListItem.parentNode.getAttribute('data-block'), newNumber)
    var labels = prevListItem.querySelectorAll('label')
    Array.prototype.forEach.call(labels, (label) => {
      label.innerHTML = label.innerHTML.replace(rex, newNumber)
    })

    if($(target).parents('.list-group').find('.list-block').size() > 1){
      prevListItem.querySelector('.label-count').textContent = parseInt(prevListItem.querySelector('.label-count').textContent) + 1
    }

    this.onNewBlock._fire()

    if(typeof jQuery !== 'undefined' && jQuery !== null){ // Bootstrap collapse
      var blocks = $(target).parents('.list-group').find('.list-block > [data-id]')
      $(target).parents('.list-group').find('.list-block .collapse').collapse('hide')
      setTimeout(function () {
        $('#' + blocks[blocks.length - 1].id).collapse('show')
      }, 200)
    }

  }

  /**
   * insert node page side
   * @param  {[type]} dataBlock [description]
   * @param  {[type]} newNumber [description]
   * @return {[type]}           [description]
   */
  _insertNewBlock(dataBlock, newNumber) {
    var blockContent = IframeCommentNode('#page-template', dataBlock)
    if(typeof blockContent !== 'undefined' && blockContent !== null && blockContent.length > 0) {
      blockContent = blockContent[0]
      var blockHtml = unescape(blockContent.textContent.replace(/\[\[([\S\s]*?)\]\]/, ''))
                        .replace(new RegExp(`-${dataBlock}0`, 'g'), `-${dataBlock}${newNumber}`)
                        .replace(/\[0\]-/g, '' + newNumber + '-')
      var newBlock = document.createElement('abe')
      newBlock.innerHTML = blockHtml

      var childs = [].slice.call(newBlock.childNodes)
      Array.prototype.forEach.call(childs, (child) => {
        if(typeof child.setAttribute !== 'undefined' && child.setAttribute !== null) {
          child.setAttribute('data-abe-block', dataBlock + newNumber)
        }
        blockContent.parentNode.insertBefore(child, blockContent)
      })
      
    }
  }

  /**
   * remove default value into a form
   * @param  {[type]} block [description]
   * @return {[type]}       [description]
   */
  _unValueForm(block) {

    var inputs = [].slice.call(block.querySelectorAll('input'))
    Array.prototype.forEach.call(inputs, (input) => {
      input.value = ''
    })

    var textareas = [].slice.call(block.querySelectorAll('textarea'))
    Array.prototype.forEach.call(textareas, (textarea) => {
      textarea.value = ''
    })

    // var contenteditables = [].slice.call(block.querySelectorAll('[contenteditable]'))
    // Array.prototype.forEach.call(contenteditables, (contenteditable) => {
    //   contenteditable.innerHTML = ''
    // })

    var selects = [].slice.call(block.querySelectorAll('select'))
    Array.prototype.forEach.call(selects, (select) => {
      select.value = ''

      var options = [].slice.call(select.querySelectorAll('option'))
      Array.prototype.forEach.call(options, (option) => {
        option.removeAttribute('selected')
      })
    })
  }

  /**
   * Create admin side block
   * @param  {[type]} prevListItem [description]
   * @param  {[type]} itemNumber   [description]
   * @param  {[type]} newNumber    [description]
   * @return {[type]}              [description]
   */
  _createNewBlock(prevListItem, itemNumber, newNumber) {
    var htmlBlockItem = prevListItem.innerHTML

    htmlBlockItem = htmlBlockItem.replace(/\[(.*?)\]/g, function(val, $_1) {
      itemNumber = parseInt($_1)
      newNumber = itemNumber + 1
      return '[' + newNumber + ']'
    })
    var rex = new RegExp(itemNumber, 'g')
    
    var dataBlock = prevListItem.getAttribute('data-block').replace(rex, newNumber)

    var newBlock = document.createElement('div')
    newBlock.classList.add('list-block')
    newBlock.setAttribute('data-block', dataBlock)
    newBlock.innerHTML = htmlBlockItem
    var next = nextSibling(prevListItem.parentNode, prevListItem)
    prevListItem.parentNode.insertBefore(newBlock, next)
    this._unValueForm(newBlock)

    var richs = [].slice.call(newBlock.querySelectorAll('[contenteditable]'))
    if(typeof richs !== 'undefined' && richs !== null && richs.length > 0) {
      Array.prototype.forEach.call(richs, (rich) => {
        rich.remove()
      })
      var newRichs = [].slice.call(newBlock.querySelectorAll('.rich'))
      Array.prototype.forEach.call(newRichs, (newRich) => {
        new RichText(newRich, this.color, this.link, this.image)
      })
    }

    return newNumber
  }
}