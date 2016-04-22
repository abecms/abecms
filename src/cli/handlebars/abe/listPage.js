import Handlebars from 'handlebars'
import math from '../utils/math'
import moment from 'moment'
import {Hooks} from '../../'

export default function listPage(file, index, text) {
  var res = '';
  file = Hooks.instance.trigger('beforeListPage', file, index, text)

  res += `<tr>`
  res += `<td>${math(index, '+', 1)}</td>
        <td>
          <a href="/abe/${file.template}?filePath=${file.path}" class="file-path">
            ${file.path}
          </a>
        </td>`
  
  if(file.date){
    res += `<td align="center">
              ${moment(file.date).format('YYYY-MM-DD')}
            </td>`
  }

  var workflow = ''

  workflow += `<td>`
  if(!file.published || (file.published && file.draft && file.published.date < file.draft.date)) {
    workflow += `<a href="/abe/${file.template}?filePath=${file.path}" class="file-path">draft</a>`
  }
  workflow += `</td>`
  workflow += `<td align="center publish">`

  if (file.published){
    workflow += `<a href="/abe/${file.template}?filePath=${file.published.filePath}" class="checkmark">&#10004;</a>`
  }
  workflow += `</td>`

  workflow = Hooks.instance.trigger('afterListPageDraft', workflow, file, index, text)
  res += workflow

  res += `<td align="center draft">
            <div class="row icons-action">
              <div class="col-xs-6">`
  
  if (this.published){
    res += `<a href="/unpublish/?filePath=${file.path}"
               title="${text.unpublish}"
               class="icon" data-unpublish="true"data-text="${text.confirmUnpublish} {{file.path}}">
              <span class="glyphicon glyphicon-eye-close"></span>
            </a>`
  }
          
  res += `</div>
          <div class="col-xs-6">`
      
  res += `<a href="/delete/?filePath=${this.path}"
             title="${text.delete}"
             class="icon"
             data-delete="true"
             data-text="${text.confirmDelete} ${file.path}">
            <span class="glyphicon glyphicon-trash"></span>
          </a>`

  res += `</div>
        </div>
      </td>
    </tr>`

  res = Hooks.instance.trigger('afterListPage', res, file, index, text)
  return new Handlebars.SafeString(res)
}
