import sourceAutocomplete   from './sourceAutocomplete'
import sourceOption   from './sourceOption'
import {
  abeExtend
  ,User
} from '../../../'

/**
 * Print form input based on input data type {Textarea | text | meta | link | image | ...}
 * && add appropriate attributs / data-attributs
 * @return {String|html} input / input group ...
 */
export default function printInput (params, root) {
  // var params = arguments[0]
  params = abeExtend.hooks.instance.trigger('beforeEditorInput', params)

  var desc = params.desc + ((params.required) ? ' *' : '')

  var res = `<div class="form-group" data-precontrib-templates="${params.precontribTemplate}">
              <label class="control-label" for="${params.key}" 
                      ${(params.type.indexOf('text_link') > -1) ? 'data-for-link="' + params.key + '"' : ''} >
                ${desc}
              </label>`
  var disabled = ''

  if(!params.placeholder) {
    params.placeholder = ''
  }

  if(params.value == null) {
    params.value = ''
  }
  
  if(typeof params.value === 'string') params.value = params.value.replace(/\"/g, '&quot;')

  var userWorkflow = ''
  if (root.user != null) {
    userWorkflow = root.user.role.workflow
  }

  var disabled = ''
  if (!User.utils.isUserAllowedOnRoute(userWorkflow, `/abe/save/${params.status}/edit`)) {
    disabled = 'disabled="disabled"'
  }
  if (params.tab == 'slug') {
    disabled = ''
  }
  var inputClass = 'form-control form-abe'
  var commonParams = `id="${params.key}"
                    data-id="${params.key}"
                    value="${params.value}"
                    maxlength="${params['max-length']}"
                    reload="${params.reload}"
                    tabIndex="${params.order}"
                    data-required="${params.required}"
                    data-display="${params.display}"
                    data-visible="${params.visible}"
                    data-autocomplete="${params.autocomplete}"
                    placeholder="${params.placeholder}"
                    ${disabled}`

  if(params.source != null) {
    commonParams = `id="${params.key}"
                    data-id="${params.key}"
                    data-maxlength="${params['max-length']}"
                    reload="${params.reload}"
                    tabIndex="${params.order}"
                    data-required="${params.required}"
                    data-display="${params.display}"
                    data-visible="${params.visible}"
                    data-autocomplete="${params.autocomplete}"
                    placeholder="${params.placeholder}"
                    ${disabled}`

    var multiple = ''
    disabled = ''
    if(params['max-length'] == null && params.source.length > 0 || (params['max-length'] > 1 && params.source.length > 0)) {
      multiple = 'multiple'
    }
    if(params.source.length <= 0) {
      disabled = 'disabled'
    }

    var lastValues
    if(params.autocomplete != null && params.autocomplete === 'true') {
      if(params.source.indexOf('http') === 0) {
        lastValues = params.source
      }else {
        lastValues = JSON.stringify(params.source).replace(/\'/g, '&quote;')
      }
      res += '<div class="autocomplete-result-wrapper">'
      if(params.autocomplete != null && params.autocomplete === 'true'
        && params.prefill === 'true') {
        res += `<div class="autocomplete-refresh" value=''
          data-autocomplete-refresh="true"
          data-autocomplete-refresh-sourcestring="${params.sourceString}"
          data-autocomplete-refresh-prefill-quantity="${params['prefill-quantity']}"
          data-autocomplete-refresh-key="${params.key}"
          data-autocomplete-data-display="${params.display}"
          >
          <span class="glyphicon glyphicon-refresh"></span>
        </div>`
      }
      Array.prototype.forEach.call(params.value, (val) => {
        res += sourceAutocomplete(val, params)
      })
      res += '</div>'
      res += `<input value="" autocomplete="off" data-value='${lastValues}' type="text" ${disabled} ${commonParams} class="${inputClass}" />`
    }else {

      lastValues = JSON.stringify(params.value).replace(/\'/g, '&quote;')
      res += `<select ${multiple} ${disabled} ${commonParams} class="${inputClass}"
                        last-values='${lastValues}'>`

      if (!params.required) {
        res += '<option value=\'\'></option>'
      }
      
      if(typeof params.source === 'object' && Object.prototype.toString.call(params.source) === '[object Array]') {
        Array.prototype.forEach.call(params.source, (val) => {
          res += sourceOption(val, params)
        })

      }else {
        res += sourceOption(params.source, params)
      }

      res += '</select>'

    }
  }else if (params.type.indexOf('rich') >= 0){
    commonParams = `id="${params.key}"
                    data-id="${params.key}"
                    maxlength="${params['max-length']}"
                    reload="${params.reload}"
                    tabIndex="${params.order}"
                    data-required="${params.required}"
                    data-display="${params.display}"
                    data-visible="${params.visible}"
                    data-autocomplete="${params.autocomplete}"
                    placeholder="${params.placeholder}"
                    ${disabled}`
                    
    res += `<div class="wysiwyg-container rich">
              <div class="wysiwyg-toolbar wysiwyg-toolbar-top">
                <a class="wysiwyg-toolbar-icon" href="#" title="Bold (Ctrl+B)" hotkey="b" data-action="bold" data-param="">
                  <span class="glyphicon glyphicon-bold"></span>
                </a>
                <a class="wysiwyg-toolbar-icon" href="#" title="Italic (Ctrl+I)" hotkey="i" data-action="italic" data-param="">
                  <span class="glyphicon glyphicon-italic"></span>
                </a>
                <a class="wysiwyg-toolbar-icon" href="#" title="Underline (Ctrl+U)" hotkey="u" data-action="underline" data-param="">
                  <span class="glyphicon underline">U</span>
                </a>
                <a class="wysiwyg-toolbar-icon" href="#" title="Text color" data-action="forecolor" data-param="" data-popup="color">
                  <span class="glyphicon glyphicon-text-color"></span>
                </a>
                <a class="wysiwyg-toolbar-icon" href="#" title="Background color" data-action="highlight" data-param="" data-popup="color">
                  <span class="glyphicon glyphicon-text-background"></span>
                </a>
                <a class="wysiwyg-toolbar-icon" href="#" title="Left" data-action="align" data-param="left">
                  <span class="glyphicon glyphicon-object-align-left"></span>
                </a>
                <a class="wysiwyg-toolbar-icon" href="#" title="Center" data-action="align" data-param="center">
                  <span class="glyphicon glyphicon-object-align-vertical"></span>
                </a>
                <a class="wysiwyg-toolbar-icon" href="#" title="Right" data-action="align" data-param="right">
                  <span class="glyphicon glyphicon-object-align-right"></span>
                </a>
                <a class="wysiwyg-toolbar-icon" href="#" title="Justify" data-action="justify" data-param="justify">
                  <span class="glyphicon glyphicon-menu-hamburger"></span>
                </a>
                <a class="wysiwyg-toolbar-icon" href="#" title="Subscript" data-action="subscript" data-param="">
                  <span class="glyphicon glyphicon-subscript"></span>
                </a>
                <a class="wysiwyg-toolbar-icon" href="#" title="Superscript" data-action="superscript" data-param="">
                  <span class="glyphicon glyphicon-superscript"></span>
                </a>
                <a class="wysiwyg-toolbar-icon" href="#" title="Indent" data-action="indent" data-param="">
                  <span class="glyphicon glyphicon-triangle-right"></span>
                </a>
                <a class="wysiwyg-toolbar-icon" href="#" title="Outdent" data-action="indent" data-param="outdent">
                  <span class="glyphicon glyphicon-triangle-left"></span>
                </a>
                <a class="wysiwyg-toolbar-icon" href="#" title="Unordered list" data-action="insertList" data-param="">
                  <span class="glyphicon glyphicon-th-list"></span>
                </a>
                <a class="wysiwyg-toolbar-icon" href="#" title="Remove format" data-action="removeFormat" data-param="">
                  <span class="glyphicon glyphicon-remove"></span>
                </a>
                <a class="wysiwyg-toolbar-icon" href="#" title="Add link" data-action="insertLink" data-popup="link" data-param="">
                  <span class="glyphicon glyphicon-link"></span>
                </a>
                <a class="wysiwyg-toolbar-icon" href="#" title="Code style" data-action="code" data-param="">
                  <span class="glyphicon glyphicon-console"></span>
                </a>
              </div>
              <textarea class="${inputClass} form-rich"
                        ${commonParams}
                        rows="4">${params.value}</textarea>
            </div>`
  }
  else if (params.type.indexOf('file') >= 0){
    res += `<input class="form-control" ${commonParams} name="${params.key}" type="file" />
            <span class="percent"></span>
            <input type="text" ${commonParams} class="${inputClass} hidden" />`
  }
  else if (params.type.indexOf('textarea') >= 0){
    res += `<textarea class="${inputClass}" ${commonParams} rows="4">${params.value}</textarea>`
  }
  else if (params.type.indexOf('link') >= 0){
    res += `<div class="input-group">
            <div class="input-group-addon link">
              <span class="glyphicon glyphicon-link" aria-hidden="true"></span>
            </div>
            <input type="text" ${commonParams} class="${inputClass}" />
          </div>`
  }
  else if (params.type.indexOf('image') >= 0){
    if(params.thumbs != null) commonParams += `data-size="${params.thumbs}"`
    res += `<div class="input-group img-upload">
              <div class="input-group-addon image">
                <span class="glyphicon glyphicon-picture" aria-hidden="true"></span>
              </div>
              <input type="text" ${commonParams} class="${inputClass} image-input" />
              <div class="upload-wrapper">
                <input class="form-control" ${commonParams} name="${params.key}" type="file" title="upload an image"/>
                <span class="percent">
                  <span class="glyphicon glyphicon-upload" aria-hidden="true"></span>
                </span>
              </div>
            </div>
            <div class="input-error"></div>`
  }
  else {
    res += `<div class="input-group">
            <div class="input-group-addon">
              <span class="glyphicon glyphicon-font" aria-hidden="true"></span>
              </div>
              <input type="text" ${commonParams} class="${inputClass}" />
            </div>`
  }

  res += '</div>'

  res = abeExtend.hooks.instance.trigger('afterEditorInput', res, params)

  return res
}
