
/**
 */
export default function notEmpty(variable, block) {
  if (typeof variable !== 'undefined' && variable !== null && variable !== '') {
    return block.fn(this)
  }else {
    return ''
  }
}
