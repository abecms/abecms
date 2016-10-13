export default function raw(obj) {
  return obj.fn(this).replace(/\[\[/g, '{{').replace(/\]\]/g, '}}')
}
