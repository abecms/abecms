import Handlebars from 'handlebars'
import moment from 'moment'
import {
  math
  ,abeExtend
  ,config
} from '../../../'

export default function listPage(file, index, text) {
  var res = ''

  file = abeExtend.hooks.instance.trigger('beforeListPage', file, index, text)

  res += '<tr>'
  res += `<td>${math(index, '+', 1)}</td>
        <td>
          <a href="/abe/editor${file.abe_meta.link}" class="file-path">
            ${file.abe_meta.link}
          </a>
        </td>`
  
  if(file.abe_meta.template){
    res += `<td align="center">
              ${file.abe_meta.template}
            </td>`
  }else {
    res += '<td align="center"></td>'
  }
  
  if(file.date){
    var dateSearch = moment(file.date).format('YYYY-MM-DD')
    var dateOrder = new Date(file.date).getTime()
    res += `<td align="center" data-search="${dateSearch}" data-order="${dateOrder}">
              ${dateSearch}
            </td>`
  }else {
    res += '<td align="center" data-search="0000-00-00" data-order="0"></td>'
  }

  var workflow = ''

  var status = file.abe_meta.status
  var workflowUser = config.users.workflow
  Array.prototype.forEach.call(workflowUser, (flow) => {
    var hidden = ''
    if(status !== flow) {
      hidden = 'hidden'
    }

    workflow += `<td align="center" class="${flow}">`
    if(file[flow]) {
      if (flow === 'publish') {
        workflow += `<a href="/abe/editor${file[flow].html}" class="checkmark label-published" title="${file[flow].cleanDate}">&#10004;</a>`
      }else {
        workflow += `<a href="/abe/editor${file[flow].html}" class="${hidden} label label-default label-draft" title="${file[flow].cleanDate}">${flow}</a>`
      }
    }else {

    }
    workflow += '</td>'
  })

  res += workflow

  res += `<td align="center">
            <div class="row icons-action">`

  if(file.publish != null) {
    res += `<a href="/abe/operations/${file.abe_meta.status}/unpublish${file.abe_meta.link}"
               title="${text.unpublish}"
               class="icon" data-unpublish="true" data-text="${text.confirmUnpublish} ${file.abe_meta.link}"
               title="unpublish">
              <span class="glyphicon glyphicon-eye-close"></span>
            </a>`
  }
      
  res += `<a href="/abe/operations/${file.abe_meta.status}/delete${file.abe_meta.link}"
             title="${text.delete}"
             class="icon"
             data-delete="true"
             data-text="${text.confirmDelete} ${file.abe_meta.link}"
             title="remove">
            <span class="glyphicon glyphicon-trash"></span>
          </a>`

  res += `
        </div>
      </td>
    </tr>`

  res = abeExtend.hooks.instance.trigger('afterListPage', res, file, index, text)
  return new Handlebars.SafeString(res)
}
