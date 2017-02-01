import extend from 'extend'

/**
 * This helper divide an array into groups of objects and repeat the structure
 * Usage : 
 * 
 *{{#eachgroup products '[{"group":"my","qty":"1"},{"group":"ty","qty":"3"}]'}}
 *    {{my.0.title}} <img src="{{my.0.cover_273x273}}" width="40"><br/>
 *    {{ty.0.title}} <img src="{{ty.0.cover_273x273}}" width="40"><br/>
 *    {{ty.1.title}} <img src="{{ty.1.cover_273x273}}" width="40"><br/>
 *    {{ty.2.title}} <img src="{{ty.2.cover_273x273}}" width="40"><br/>
 *{{/eachgroup}}
 *
 * @param  {[type]} context The array to parse
 * @param  {[type]} id      the groups of groups and qty
 * @param  {[type]} options 
 * @return {[type]}         html
 */
export default function eachGroup(context, groups, options) {
  var fn = options.fn, inverse = options.inverse;
  var ret = ''
  var group = []
  function getLeaf(node) {
    if (node.group && node.qty) {
      return node
    } else {
      try{
        return getLeaf(node[Object.keys(node)[0]]);
      } catch (e){ 
        return null
      }
    }
  }

  if(typeof groups !== 'undefined'){
    if(typeof groups === 'string'){
      groups = JSON.parse(groups)
    }
    if(context && context.length > 0) {
      for(var i=0, newCount=0, j=context.length, distribIndex=0, k=0, iteration=0; i<j; i++,newCount++) {
        var o = getLeaf(groups[Object.keys(groups)[distribIndex]])
        if(o == null) break
        var first = newCount % o['qty'] === 0;

        // Adding index, isFirst, isLast, isNewGroup to each record
        context[i] = extend(true, {
          index: i,
          isFirst: first,
          isNewGroup: first && newCount > 0,
          isLast: i === context.length - 1
        }, context[i])

        if(first){
          if(newCount > 0){
            // if the last group has been reached, I reinit the distribIndex
            // and iterate on the result array
            if(distribIndex === Object.keys(groups).length - 1) {
              distribIndex = 0
              var ar = []
            } else {
              distribIndex++
            }
            iteration++
            newCount = 0
            k++
          }

          o = getLeaf(groups[Object.keys(groups)[distribIndex]])
          var key = o['group']
          if(group[iteration] == null)
            group.push([])
          if(group[iteration][key] == null){
            group[iteration][key] = []
          }
        }
        group[iteration][key].push(context[i])
      }
      context = group
    }

    if(context) {
      for(var i=0, j=context.length, k=0; i<j; i++) {
        ret += fn(context[i]);
      }
    } else {
      ret = inverse(this);
    }
  }

  return ret;
}
