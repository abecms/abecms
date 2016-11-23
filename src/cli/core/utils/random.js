export function generateUniqueIdentifier(substring = 0) {
  return (((1+Math.random())*0x100000)|0).toString(16).substring(substring)
}