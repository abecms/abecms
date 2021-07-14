import {printInput} from './printInput'
import abeEngine from './abeEngine'

export default function printBlock(ctx, root) {
  var res = ''
  var precontrib = false
  if (root.precontrib != null) {
    precontrib = root.precontrib
  }

  if (ctx[0].block != null && ctx[0].block !== '') {
    let tmpContent = ''
    let hidden = true
    Array.prototype.forEach.call(ctx, item => {
      if (item.editable) hidden = false
      if (precontrib) item.value = ''
      tmpContent += printInput(item, root)
    })

    if (!hidden)
      res += `<div class="form-group" data-precontrib-templates="${ctx[0]
        .precontribTemplate}">
          <div class="card">
            <h5 class="card-header">${ctx[0].group != null ? ctx[0].group : ctx[0].block}</h5>
            <div class='single-block card-body bg-light'>
      `
    else
      res += `<div class="form-group" data-precontrib-templates="${ctx[0]
        .precontribTemplate}">
                <div class='single-block'>`
    res += tmpContent
    res += '</div></div>'
  } else if (ctx[0].key.indexOf('[') > -1) {
    var ctxBlock = ctx[0].key.split('[')[0]
    res += `<div class="form-group" data-precontrib-templates="${ctx[0]
      .precontribTemplate}">
        <div class="card">
          <h5 class="card-header">${ctxBlock}
          <button type="button" class="btn btn-success add-block" title="Add new block" style="float: right;">
            <span class="fa fa-plus" aria-hidden="true"></span>
          </button></h5>
          <div class="single-block card-body bg-light" data-block="${ctxBlock}">
      `

    var arrItem = []
    Array.prototype.forEach.call(ctx, item => {
      var index = item.key.match(/[^\[\]]+?(?=\])/)
      if (arrItem[index] == null) {
        arrItem[index] = []
      }
      arrItem[index].push(item)
    })

    Array.prototype.forEach.call(Object.keys(arrItem), i => {
      var key = arrItem[i][0].key.split('[')[0]
      var display = ''
      if (
        abeEngine.instance.content[key] == null ||
        abeEngine.instance.content[key].length === 0
      ) {
        display = 'style="display: none"'
      }
      res += `<div class="list-block" data-block="${key}${i}" ${display}>
                <button type="button" class="btn btn-info collapsed" data-toggle="collapse" data-target="#${key}${i}" >
                  Section <span class='label-count'>${i}</span> :
                  <span class="fa fa-chevron-down" aria-hidden="true"></span>
                </button>
                <button type="button" class="btn btn-danger remove-block" title="Delete block" >
                  <span class="fa fa-trash" aria-hidden="true"></span>
                </button>
                <div id="${key}${i}" class="collapse" >
                `
      Array.prototype.forEach.call(arrItem[i], item => {
        if (precontrib) item.value = ''
        res += printInput(item, root)
      })
      res += '</div></div>'
    })

    res += `
            </div>
          </div>
        </div>`
  } else {
    if (precontrib) ctx[0].value = ''
    res += printInput(ctx[0], root)
  }

  return res
}
