/**
 * sort an array of objects by date attribute
 *
 * Example : [{date: {abe_meta: {publish: {latest: date}}}}, {date: {abe_meta: {publish: {latest: date}}}}].sort(cmsData.sort.byDateDesc)
 * 
 * @param  {Object} a object with date attribute
 * @param  {Object} b object with date attribute
 * @return {Int}   1 | 0 | -1
 */
export function byDateDesc(a, b) {
  var dateA = (a.abe_meta.publish != null && a.abe_meta.publish.latest != null) ? new Date(a.abe_meta.publish.latest.date) : 0
  var dateB = (b.abe_meta.publish != null && b.abe_meta.publish.latest) ? new Date(b.abe_meta.publish.latest.date) : 0
  if(dateA < dateB) {
    return 1
  }else if(dateA > dateB) {
    return -1
  }
  return 0
}
/**
 * sort an array of objects by date attribute
 *
 * Example : [{date: {abe_meta: {publish: {latest: date}}}}, {date: {abe_meta: {publish: {latest: date}}}}].sort(cmsData.sort.byDateAsc)
 * 
 * @param  {Object} a object with date attribute
 * @param  {Object} b object with date attribute
 * @return {Int}   1 | 0 | -1
 */
export function byDateAsc(a, b) {
  var dateA = (a.abe_meta.publish != null && a.abe_meta.publish.latest != null) ? new Date(a.abe_meta.publish.latest.date) : 0
  var dateB = (b.abe_meta.publish != null && b.abe_meta.publish.latest) ? new Date(b.abe_meta.publish.latest.date) : 0
  if(dateA > dateB) {
    return 1
  }else if(dateA < dateB) {
    return -1
  }
  return 0
}