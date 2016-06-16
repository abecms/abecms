
export default function ifCond(v1, v2, options) {
  v1 = v1 === 'null' ? null : v1
  v2 = v2 === 'null' ? null : v2
  if(v1 == v2) return options.fn(this);
  return options.inverse(this);
}
