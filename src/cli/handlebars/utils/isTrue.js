
export default function isTrue(v1, operator, v2) {
  switch (operator) {
    case '==':
      return (v1 == v2);
    case '===':
      return (v1 === v2);
    case '<':
      return (v1 < v2);
    case '<=':
      return (v1 <= v2);
    case '>':
      return (v1 > v2);
    case '>=':
      return (v1 >= v2);
    case '&&':
      var eval1 = false;
      var eval2 = false;
      if((v1 && !Array.isArray(v1)) || (Array.isArray(v1) && v1.length>0) || typeof v1 === 'object') eval1 = true;
      if((v2 && !Array.isArray(v2)) || (Array.isArray(v2) && v2.length>0) || typeof v2 === 'object') eval2 = true;

      return (eval1 && eval2);
    case '||':
      var eval1 = false;
      var eval2 = false;
      if((v1 && !Array.isArray(v1)) || (Array.isArray(v1) && v1.length>0) || typeof v1 === 'object') eval1 = true;
      if((v2 && !Array.isArray(v2)) || (Array.isArray(v2) && v1.length>0) || typeof v2 === 'object') eval2 = true;

      return (eval1 || eval2);
    default:
      return false;
  }
}
