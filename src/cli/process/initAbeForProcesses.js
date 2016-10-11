export function initAbeForProcess() {
	var p = new Promise((resolve) => {
				
		var pConfig = {}
		Array.prototype.forEach.call(process.argv, (item) => {
		  if (item.indexOf('=') > -1) {
		    var ar = item.split('=')
		    pConfig[ar[0]] = ar[1]
		  }
		})

	})

	return p
}