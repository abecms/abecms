
export default function isTrue(v1, operator, v2) {
  var eval1
  var eval2
  switch (operator) {
  case '==':
    return (v1 == v2)
  case '===':
    return (v1 === v2)
  case '<':
    return (v1 < v2)
  case '<=':
    return (v1 <= v2)
  case '>':
    return (v1 > v2)
  case '>=':
    return (v1 >= v2)
  case '&&':
    eval1 = false
    eval2 = false
    if((!!v1 === true && !Array.isArray(v1))|| (Array.isArray(v1) && v1.length>0)) eval1 = true
    if((!!v2 === true && !Array.isArray(v2))|| (Array.isArray(v2) && v2.length>0)) eval2 = true

    return (eval1 && eval2)
  case '||':
    eval1 = false
    eval2 = false
    if((!!v1 === true && !Array.isArray(v1))|| (Array.isArray(v1) && v1.length>0)) eval1 = true
    if((!!v2 === true && !Array.isArray(v2))|| (Array.isArray(v2) && v2.length>0)) eval2 = true

    return (eval1 || eval2)
  default:
    return false
  }
}
