import clc from 'cli-color'

export function dateSlug(date) {
  return date.replace(/[-:\.]/g, '')
}

export function dateUnslug(date, file) {
	if (date.indexOf(':') > -1 || date.indexOf('-') > -1 || date.indexOf('.') > -1) {
    console.log('* * * * * * * * * * * * * * * * * * * * * * * * * * * * *')
    console.log('file', file)
		console.log(clc.green(`[ WARNING ] you have old file architecture`), file)
		return date
	}
  var res = date.substring(0, 4) + '-'
            + date.substring(4, 6) + '-'
            + date.substring(6, 11) + ':'
            + date.substring(11, 13) + ':'
            + date.substring(13, 15) + '.'
            + date.substring(15, 19)
  return res
}