export default function concat() {
  var arg = Array.prototype.slice.call(arguments, 0)
  arg.pop()
  return arg.join('')
}
