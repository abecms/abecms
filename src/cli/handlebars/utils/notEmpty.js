
/**
 */
export default function notEmpty(variable) {
    if (typeof variable !== 'undefined' && variable !== null && variable !== '') {
        return block.fn(this)
    }else {
        return ''
    }
}
