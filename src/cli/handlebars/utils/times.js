export default function times(n, block) {
    n = parseInt(n)
    var accum = ''
    for(var i = 0; i < n; ++i)
        accum += block.fn(i)
    return accum
}