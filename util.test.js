const util = require('./util')

test('blendResults', () => {
    expect(util.blendResults(4, 100, 0)).toEqual(4)
    expect(util.blendResults(4, 100, 1)).toEqual(0)
    expect(util.blendResults(4, 100, .5)).toEqual(2)
})