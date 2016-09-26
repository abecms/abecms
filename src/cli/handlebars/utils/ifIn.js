
export default function ifIn (actions, currentAction, options) {
  for(var action in actions){
    if(action === currentAction) return options.fn(this)
  }
  return ''
}
