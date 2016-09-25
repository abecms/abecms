var deep_value = function(obj, path) {

    if(path.indexOf('.') === -1) {
        return (typeof obj[path] !== 'undefined' && obj[path] !== null) ? obj[path] : null
    }

    var pathSplit = path.split('.')
    var res = JSON.parse(JSON.stringify(obj))

    while(pathSplit.length > 0) {
    
        if(typeof res[pathSplit[0]] !== 'undefined' && res[pathSplit[0]] !== null) {
            if(typeof res[pathSplit[0]] === 'object' && Object.prototype.toString.call(res[pathSplit[0]]) === '[object Array]') {
                var resArray = []

                Array.prototype.forEach.call(res[pathSplit[0]], (item) => {
                    resArray.push(deep_value(item, pathSplit.join('.').replace(`${pathSplit[0]}.`, '')))
                })
                res = resArray
                pathSplit.shift()
            }else {
                res = res[pathSplit[0]]
            }
        }else {
            return null
        }
        pathSplit.shift()
    }

    return res
}

export default deep_value