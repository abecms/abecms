import Handlebars from 'handlebars'
import moment from 'moment'
import {math, abeExtend, config} from '../../../'

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

  if (file.abe_meta.template) {
    res += `<td align="center">
              ${file.abe_meta.template}
            </td>`
  } else {
    res += '<td align="center"></td>'
  }

  if (file.date) {
    var dateSearch = moment(file.date).utcOffset(0).format('YYYY-MM-DD')
    var dateOrder = new Date(file.date).getTime()
    res += `<td align="center" data-search="${dateSearch}" data-order="${dateOrder}">
              ${dateSearch}
            </td>`
  } else {
    res += '<td align="center" data-search="0000-00-00" data-order="0"></td>'
  }

  var workflow = ''

  var status = file.abe_meta.status
  var workflowUser = config.users.workflow
  Array.prototype.forEach.call(workflowUser, flow => {
    var hidden = ''
    if (status !== flow) {
      hidden = 'hidden'
    }

    workflow += `<td align="center" class="${flow}">`
    if (file[flow]) {
      var fDate = moment(file[flow].date)
        .utcOffset(0)
        .format('YYYY-MM-DD HH:mm:ss')
      if (flow === 'publish') {
        workflow += `<a href="/abe/editor${file[flow]
          .link}" class="checkmark label-published" title="${fDate}">&#10004;</a>`
      } else {
        workflow += `<a href="/abe/editor${file[flow]
          .link}" class="${hidden} label label-default label-draft" title="${fDate}">${flow}</a>`
      }
    } else {
    }
    workflow += '</td>'
  })

  res += workflow

  res += `<td align="center">
            <div class="row icons-action">`

  if (file.publish != null) {
    res += `<a href="/abe/operations/unpublish${file.abe_meta.link}"
               title="${text.unpublish}"
               class="icon" data-unpublish="true" data-text="${text.confirmUnpublish} ${file
      .abe_meta.link}"
               title="unpublish">
              <span class="fa fa-eye-close"></span>
            </a>`
  }

  res += `<a href="/abe/operations/delete/${file.abe_meta.status}${file.abe_meta
    .link}"
             title="${text.delete}"
             class="icon"
             data-delete="true"
             data-text="${text.confirmDelete} ${file.abe_meta.link}"
             title="remove">
            <span class="fa fa-trash"></span>
          </a>`

  res += `
        </div>
      </td>
    </tr>`

  res = abeExtend.hooks.instance.trigger(
    'afterListPage',
    res,
    file,
    index,
    text
  )
  return new Handlebars.SafeString(res)
}
