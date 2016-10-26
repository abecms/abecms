import Handlebars from 'handlebars'
import moment from 'moment'
import {
  math
  ,abeExtend
} from '../../../'

export default function listPage(file, index, text) {
  var res = ''

  file = abeExtend.hooks.instance.trigger('beforeListPage', file, index, text)

  res += '<tr>'
  res += `<td>${math(index, '+', 1)}</td>
        <td>
          <a href="/abe/${file.abe_meta.template}?filePath=${file.abe_meta.link}" class="file-path">
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

  workflow += '<td align="center" class="draft">'
  if(file.draft != null) {
    if((file.publish == null)
      || (file.publish && file.publish.date < file.draft.date)) {
      workflow += `<a href="/abe/${file.abe_meta.template}?filePath=${file.draft.html}" class="label label-default label-draft" title="${file.draft.cleanDate}">draft</a>`
    }else {
      workflow += `<a href="/abe/${file.abe_meta.template}?filePath=${file.draft.html}" class="hidden label label-default label-draft" title="${file.draft.cleanDate}">draft</a>`
    }
  }else {
    workflow += `<a href="/abe/${file.abe_meta.template}?filePath=${file.abe_meta.link}" class="hidden label label-default label-draft" title="${file.cleanDate}">draft</a>`
  }

  workflow += '</td>'
  workflow += '<td align="center" class="publish">'

  if (file.publish){
    workflow += `<a href="/abe/${file.abe_meta.template}?filePath=${file.publish.html}" class="checkmark label-published" title="${file.publish.cleanDate}">&#10004;</a>`
  }
  workflow += '</td>'

  workflow = abeExtend.hooks.instance.trigger('afterListPageDraft', workflow, file, index, text)
  res += workflow

  res += `<td align="center">
            <div class="row icons-action">`

  if(file.publish != null) {
    res += `<a href="/abe/unpublish/?filePath=${file.abe_meta.link}"
               title="${text.unpublish}"
               class="icon" data-unpublish="true" data-text="${text.confirmUnpublish} ${file.abe_meta.link}"
               title="unpublish">
              <span class="glyphicon glyphicon-eye-close"></span>
            </a>`
  }
      
  res += `<a href="/abe/delete/?filePath=${file.abe_meta.link}"
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
