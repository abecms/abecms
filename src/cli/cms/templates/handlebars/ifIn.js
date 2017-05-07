
export default function ifIn (arValues, value, options) {
  for(var arValue in arValues){
    if(arValue === value) return options.fn(this)
  }
  return options.inverse(this)
}
