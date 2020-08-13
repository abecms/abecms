import sourceAutocomplete from './sourceAutocomplete'
import sourceOption from './sourceOption'
import {abeExtend, User, cmsData} from '../../../'

export function getAttributes(params) {
  var attributes = ''
  if (params.key != null)
    attributes += `id="${params.key}" data-id="${params.key}"`
  if (params.value != null) attributes += ` value="${params.value}"`
  if (params['max-length'] != null)
    attributes += ` data-maxlength="${params['max-length']}"`
  if (params.reload != null) attributes += ` reload="${params.reload}"`
  if (params.order != null) attributes += ` tabIndex="${params.order}"`
  if (params.required != null)
    attributes += ` data-required="${params.required}"`
  if (params.display != null) attributes += ` data-display="${params.display}"`
  if (params.visible != null) attributes += ` data-visible="${params.visible}"`
  if (params.autocomplete != null)
    attributes += ` data-autocomplete="${params.autocomplete}"`
  if (params.placeholder != null)
    attributes += ` placeholder="${params.placeholder}"`
  if (params.thumbs != null) attributes += ` data-size="${params.thumbs}"`
  if (params.toolbar != null) attributes += ` data-toolbar="${params.toolbar}"`
  if (params.multiple != null)
    attributes += ` data-multiple="${params.multiple}"`
  if (params.disabled != null) attributes += ` ${params.disabled}`
  return attributes
}

export function getLabel(params) {
  var desc = params.desc + (params.required ? ' *' : '')
  return `<label class="control-label" for="${params.key}" >
            ${desc}
          </label>`
}

export function hint(params) {
  if (params.hint) {
    return `<p class="abe-hint help-block">
        <span class="fa fa-info-sign"></span>&nbsp;<em>${params.hint}</em>
      </p>`
  }

  return ''
}

export function createInputSource(attributes, inputClass, params) {
  var inputSource = `<div class="parent-${params.type} parent-${params.key}" data-parent="${params.key}">`
  var lastValues

  if (
    (params.autocomplete != null && params.autocomplete === 'true') ||
    (params.multiple != null && params.multiple === 'multiple')
  ) {
    if (cmsData.sql.getSourceType(params.sourceString) === 'url')
      lastValues = params.source
    else lastValues = JSON.stringify(params.source).replace(/\'/g, '&quote;')
    inputSource += '<div class="autocomplete-result-wrapper">'
    if (
      params.autocomplete != null &&
      params.autocomplete === 'true' &&
      params.prefill === 'true'
    ) {
      inputSource += `<div  class="autocomplete-refresh" value=''
                            data-autocomplete-refresh="true"
                            data-autocomplete-refresh-sourcestring="${params.sourceString}"
                            data-autocomplete-refresh-prefill-quantity="${params[
                              'prefill-quantity'
                            ]}"
                            data-autocomplete-refresh-key="${params.key}"
                            data-autocomplete-data-display="${params.display}" >
                        <span class="fa fa-refresh"></span>
                      </div>`
    }
    Array.prototype.forEach.call(params.value, val => {
      inputSource += sourceAutocomplete(val, params)
    })
    inputSource += '</div>'
  }

  if (params.autocomplete != null && params.autocomplete === 'true') {
    inputSource += `<input value="" type="text" autocomplete="off" data-value='${lastValues}' ${attributes} class="${inputClass}" />`
  } else {
    // lastValues = JSON.stringify(params.value).replace(/\'/g, '&quote;')
    inputSource += `<select ${attributes} class="${inputClass}">`

    // if (!params.required) inputSource += '<option value=\'\'></option>'
    var options = ''
    if (
      typeof params.source === 'object' &&
      Object.prototype.toString.call(params.source) === '[object Array]'
    ) {
      Array.prototype.forEach.call(params.source, val => {
        options += sourceOption(val, params)
      })
    } else {
      options += sourceOption(params.source, params)
    }

    var defaultValueSelected = 'selected=selected'
    if (options.indexOf('selected') > -1) {
      defaultValueSelected = ''
    }
    if (params.required)
      inputSource += `<option value="" disabled ${defaultValueSelected}>Select ${params.desc.toLowerCase()}...</option>`
    if (!params.required)
      inputSource += `<option value="" ${defaultValueSelected}></option>`
    inputSource += options

    inputSource += '</select>'
  }
  inputSource += `${hint(params)}</div>`

  return inputSource
}

export function createInputRich(attributes, inputClass, params) {
  var buttons = [
    {
      icon: 'bold',
      title: 'Bold (Ctrl+B)',
      action: 'bold',
      param: '',
      hotkey: 'b',
      key: 'b'
    },
    {
      icon: 'ti-Italic',
      title: 'Italic (Ctrl+I)',
      action: 'italic',
      param: '',
      hotkey: 'i'
    },
    {
      icon: 'ti-underline',
      title: 'Underline (Ctrl+U)',
      action: 'underline',
      param: '',
      hotkey: 'u'
    },
    {
      icon: 'strikethrough',
      title: 'Strikethrough',
      action: 'strikethrough',
      param: '',
      key: 's'
    },
    {
      icon: 'ti-paint-bucket',
      title: 'Text color',
      action: 'forecolor',
      param: '',
      popup: 'color'
    },
    {
      icon: 'ti-paint-bucket bg',
      title: 'Background color',
      action: 'highlight',
      param: '',
      popup: 'color'
    },
    {icon: 'ti-align-left', title: 'Left', action: 'align', param: 'left'},
    {
      icon: 'ti-align-center',
      title: 'Center',
      action: 'align',
      param: 'center'
    },
    {icon: 'ti-align-right', title: 'Right', action: 'align', param: 'right'},
    {
      icon: 'ti-align-justify',
      title: 'Justify',
      action: 'align',
      param: 'justify'
    },
    {
      icon: 'ti-text ti-text-sub',
      title: 'Subscript',
      action: 'subscript',
      param: ''
    },
    {
      icon: 'ti-text ti-text-sup',
      title: 'Superscript',
      action: 'superscript',
      param: ''
    },
    {icon: 'ti-shift-right-alt', title: 'Indent', action: 'indent', param: ''},
    {
      icon: 'ti-shift-left-alt',
      title: 'Outdent',
      action: 'indent',
      param: 'outdent'
    },
    {icon: 'ti-list', title: 'Unordered list', action: 'list', param: ''},
    {
      icon: 'ti-list-ol',
      title: 'Ordered list',
      action: 'list',
      param: 'ordered'
    },
    {
      icon: 'ti-eraser',
      title: 'Remove format',
      action: 'removeFormat',
      param: ''
    },
    {
      icon: 'ti-link',
      title: 'Add link',
      action: 'insertLink',
      param: '',
      popup: 'link'
    },
    {
      icon: 'console',
      title: 'Code style',
      action: 'code',
      param: '',
      key: '{code}'
    },
    {
      icon: 'ti-image',
      title: 'media',
      action: 'media',
      param: '',
      popup: 'image'
    },
    {
      icon: 'ti-face-smile',
      title: 'smiley',
      action: 'smiley',
      param: '',
      popup: 'smiley'
    }
  ]

  var selects = [
    {
      name: 'Formating',
      id: 'format',
      options: [
        {name: 'Heading 1', regexp: '<h1>$1</h1>'},
        {name: 'Heading 2', regexp: '<h2>$1</h2>'},
        {name: 'Heading 3', regexp: '<h3>$1</h3>'},
        {name: 'Heading 4', regexp: '<h4>$1</h4>'},
        {name: 'Heading 5', regexp: '<h5>$1</h5>'},
        {name: 'Heading 6', regexp: '<h6>$1</h6>'},
        {name: 'Paragraph', regexp: '<p>$1</p>'}
      ]
    },
    {
      name: 'Font',
      id: 'font',
      options: [
        {
          name: 'Georgia',
          regexp: '<span style="font-family:Georgia;">$1</span>'
        },
        {name: 'serif', regexp: '<span style="font-family:serif;">$1</span>'},
        {
          name: 'Helvetica',
          regexp: '<span style="font-family:Helvetica;">$1</span>'
        },
        {name: 'Times', regexp: '<span style="font-family:Times;">$1</span>'},
        {
          name: 'Times New Roman',
          regexp: '<span style="font-family:Times New Roman;">$1</span>'
        },
        {name: 'Arial', regexp: '<span style="font-family:Arial;">$1</span>'},
        {
          name: 'Arial Black',
          regexp: '<span style="font-family:Arial Black;">$1</span>'
        },
        {
          name: 'Verdana',
          regexp: '<span style="font-family:Verdana;">$1</span>'
        },
        {
          name: 'monospace',
          regexp: '<span style="font-family:monospace;">$1</span>'
        },
        {
          name: 'fantasy',
          regexp: '<span style="font-family:fantasy;">$1</span>'
        }
      ]
    },
    {
      name: 'Font size',
      id: 'fontsize',
      options: [
        {name: '5', regexp: '<span style="font-size:5px;">$1</span>'},
        {name: '6', regexp: '<span style="font-size:6px;">$1</span>'},
        {name: '7', regexp: '<span style="font-size:7px;">$1</span>'},
        {name: '8', regexp: '<span style="font-size:8px;">$1</span>'},
        {name: '9', regexp: '<span style="font-size:9px;">$1</span>'},
        {name: '10', regexp: '<span style="font-size:10px;">$1</span>'},
        {name: '11', regexp: '<span style="font-size:11px;">$1</span>'},
        {name: '12', regexp: '<span style="font-size:12px;">$1</span>'},
        {name: '14', regexp: '<span style="font-size:14px;">$1</span>'},
        {name: '16', regexp: '<span style="font-size:16px;">$1</span>'},
        {name: '18', regexp: '<span style="font-size:18px;">$1</span>'},
        {name: '20', regexp: '<span style="font-size:20px;">$1</span>'},
        {name: '22', regexp: '<span style="font-size:22px;">$1</span>'},
        {name: '24', regexp: '<span style="font-size:24px;">$1</span>'},
        {name: '26', regexp: '<span style="font-size:26px;">$1</span>'},
        {name: '28', regexp: '<span style="font-size:28px;">$1</span>'},
        {name: '36', regexp: '<span style="font-size:36px;">$1</span>'},
        {name: '48', regexp: '<span style="font-size:48px;">$1</span>'},
        {name: '72', regexp: '<span style="font-size:72px;">$1</span>'}
      ]
    }
  ]

  if (params.toolbar !== '*') params.toolbar = params.toolbar.split(',')
  var inputRich = `<div class="parent-${params.type} parent-${params.key}" data-parent="${params.key}">
                  <div class="wysiwyg-container rich">
                    <div class="wysiwyg-toolbar wysiwyg-toolbar-top">`

  selects.forEach(function(select) {
    if (params.toolbar === '*' || params.toolbar.indexOf(select.id) > -1) {
      inputRich += `<div class="dropdown">
                      <button id="${select.id}" class="dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        ${select.name}
                        <span class="caret"></span>
                      </button>
                    <ul class="dropdown-menu" aria-labelledby="${select.id}">`
      select.options.forEach(function(option) {
        inputRich += `<li>
                        <a href='#' class='wysiwyg-dropdown-option' data-regexp='${option.regexp}'>
                          ${option.name}
                        </a>
                      </li>`
      })
      inputRich += `</ul>
                  </div>`
    }
  })

  buttons.forEach(function(button) {
    if (params.toolbar === '*' || params.toolbar.indexOf(button.action) > -1) {
      var hotkey = button.hotkey != null ? `hotkey="${button.hotkey}"` : ''
      var popup = button.popup != null ? `data-popup="${button.popup}"` : ''
      if (button.popup === 'image') button.action = 'insertImage'
      if (button.action === 'list') button.action = 'insertList'
      inputRich += `<a  class="wysiwyg-toolbar-icon parent-${button.icon}"
                        data-action="${button.action}"
                        data-param="${button.param}"
                        title="${button.title}"
                        ${hotkey}
                        ${popup}
                        href="#">
                      <span class="fa theme-icon ${button.icon}">${button.key
        ? button.key
        : ''}</span>
                    </a>`
    }
  })

  inputRich += `</div>
                  <textarea class="${inputClass} form-rich" ${attributes} rows="4">${params.value}</textarea>
                </div>
                ${hint(params)}
              </div>`
  return inputRich
}

export function createInputFile(attributes, inputClass, params) {
  return `<div class="parent-${params.type} parent-${params.key}" data-parent="${params.key}">
          <div class="input-group file-upload" data-keep-name="${(params.keepName === undefined) ? false : params.keepName}">
            <div class="input-group-addon my-auto image">
              <span class="fa fa-file" aria-hidden="true"></span>
            </div>
            <input type="text" ${attributes} class="${inputClass} file-input" />

            <div class="input-group-btn">
              <span class="border">
                <div class="upload-wrapper">
                  <input class="form-control" ${attributes} name="${params.key}" type="file" title="upload file"/>
                  <span class="percent">
                    <span class="fa fa-upload" aria-hidden="true"></span>
                  </span>
                </div>
              </span>
              <span class="image-icon"></span>
            </div>

          </div>
          <div class="input-error"></div>
          ${hint(params)}
        </div>`
}

export function createInputTextarea(attributes, inputClass, params) {
  return `<div class="parent-${params.type} parent-${params.key}" data-parent="${params.key}">
          <textarea class="${inputClass}" ${attributes} rows="4">${params.value}</textarea>
            ${hint(params)}
          </div>`
}

export function createInputLink(attributes, inputClass, params) {
  return `<div class="parent-${params.type} parent-${params.key}" data-parent="${params.key}">
          <div class="input-group">
            <div class="input-group-addon my-auto link">
              <span class="fa fa-link" aria-hidden="true"></span>
            </div>
            <input type="text" ${attributes} class="${inputClass}" />
          </div>
          ${hint(params)}
        </div>`
}

export function createInputImage(attributes, inputClass, params) {
  return `<div class="parent-${params.type} parent-${params.key}" data-parent="${params.key}">
          <div class="input-group img-upload" data-keep-name="${(params.keepName === undefined) ? false : params.keepName}">
            <input type="text" ${attributes} class="${inputClass} file-input" />
            <div class="input-group-append">
              <span class="border">
                <div class="upload-wrapper">
                  <input class="form-control" ${attributes} name="${params.key}" type="file" title="upload an image"/>
                  <span class="percent">
                    <i class="fa fa-upload"></i>
                  </span>
                </div>
              </span>
              <span class="image-icon"></span>
            </div>
          </div>
          <div class="input-error">
        </div>
        ${hint(params)}
      </div>`
}

export function createInputText(attributes, inputClass, params) {
  if (params.editable)
    return `<div class="parent-${params.type} parent-${params.key}" data-parent="${params.key}">
              <div class="input-group">
                <div class="input-group-addon my-auto">
                  <span class="fa fa-font" aria-hidden="true"></span>
                </div>
                <input type="text" ${attributes} class="${inputClass}" />
              </div>
              ${hint(params)}
            </div>`
  else
    return `<div class="parent-${params.type} parent-${params.key}" data-parent="${params.key}">
              <div>
                <input type="hidden" ${attributes} class="${inputClass}" />
              </div>
            </div>`
}

/**
 * Print form input based on input data type {Textarea | text | meta | link | image | ...}
 * && add appropriate attributs / data-attributs
 * @return {String|html} input / input group ...
 */
export function printInput(params, root) {
  params = abeExtend.hooks.instance.trigger('beforeEditorInput', params)
  let userWorkflow = root.user != null ? root.user.role.workflow : ''
  let inputClass = 'form-control form-abe'
  let res
  if (params.editable) {
    res = `<div class="form-group" data-precontrib-templates="${params.precontribTemplate}">`
    res += getLabel(params)
  } else {
    res = `<div data-precontrib-templates="${params.precontribTemplate}">`
  }

  if (params.value === null && params.defaultValue != null)
    params.value = params.defaultValue
  params.placeholder = params.placeholder || ''
  params.value = params.value || ''

  if (typeof params.value === 'string')
    params.value = params.value.replace(/\"/g, '&quot;')
  if (!(params.toolbar != null)) params.toolbar = '*'

  params.disabled = ''
  if (
    params.tab !== 'slug' &&
    !User.utils.isUserAllowedOnRoute(
      userWorkflow,
      `/abe/operations/edit/${params.status}`
    )
  ) {
    params.disabled = 'disabled="disabled"'
  }
  let attributes = getAttributes(params)

  if (params.source != null) {
    params.multiple =
      (params['max-length'] == null || params['max-length'] > 1) &&
      params.source.length > 0
        ? 'multiple'
        : ''
    params.disabled = params.source.length <= 0 ? 'disabled' : ''
    res += createInputSource(getAttributes(params), inputClass, params)
  } else if (params.type.indexOf('rich') >= 0)
    res += createInputRich(attributes, inputClass, params)
  else if (params.type.indexOf('file') >= 0)
    res += createInputFile(attributes, inputClass, params)
  else if (params.type.indexOf('textarea') >= 0)
    res += createInputTextarea(attributes, inputClass, params)
  else if (params.type.indexOf('link') >= 0)
    res += createInputLink(attributes, inputClass, params)
  else if (params.type.indexOf('image') >= 0)
    res += createInputImage(attributes, inputClass, params)
  else res += createInputText(attributes, inputClass, params)

  res += '</div>'
  res = abeExtend.hooks.instance.trigger('afterEditorInput', res, params)

  return res
}
