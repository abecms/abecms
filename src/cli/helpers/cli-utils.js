import prettyjson from 'prettyjson'
import Table from 'cli-table'

export default class CliUtils {

  static table(arr) {
  	var vertical = {}

  	// instantiate
		var tab = new Table()

  	var i = '0'
  	Array.prototype.forEach.call(arr, (value) => {
  		var obj = {}
  	  obj['item-' + (i++)] = value
  	  tab.push(obj)
  	})

		console.log(tab.toString())
  }

  static json(obj) {
  	console.log(prettyjson.render(obj));
  }
}