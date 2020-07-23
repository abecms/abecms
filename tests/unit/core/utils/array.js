import chai from 'chai'
import path from 'path'
import sinonChai from'sinon-chai'
chai.use(sinonChai)
import sinon from 'sinon'

import {
  coreUtils,
  abeExtend,
  cmsData,
  config
} from '../../../../src/cli'
config.set({root: path.join(process.cwd(), 'tests', 'unit', 'fixtures')})

describe('coreUtils.array', function() {

  var arr = [{'test': 'val'}, {'test2': 'val2'}];
  var arrFacet = [{'a': 'vala', 'b': {'ba':'other'}}, {'a': 'valaprime', 'b': {'ba':'otherprime'}}];

  it('coreUtils.array.find()', function() {
    var result = coreUtils.array.find(arr, 'test', 'val');
    chai.expect(result).to.be.a('array')
    chai.expect(result.length).to.equal(1)
    chai.expect(result[0]).to.equal(0)
    var result2 = coreUtils.array.find(arr, 'test2', 'val2');
    chai.expect(result2).to.be.a('array')
    chai.expect(result2.length).to.equal(1)
    chai.expect(result2[0]).to.equal(1)
  });

  it('coreUtils.array.facet()', function() {
    var result = coreUtils.array.facet(arrFacet, ['a'], 'val');
    chai.expect(result).to.be.a('array')
    chai.expect(result.length).to.equal(2)
    chai.expect(result[0]['a']).to.equal('vala')
    
    result = coreUtils.array.facet(arrFacet, ['a', 'b.ba'], 'otherprime');
    chai.expect(result).to.be.a('array')
    chai.expect(result.length).to.equal(1)
    chai.expect(result[0]['a']).to.equal('valaprime')
  });

  it('coreUtils.array.filter()', function() {
    var result = coreUtils.array.filter(arr, 'test', 'val');
    chai.expect(result).to.be.a('array')
    chai.expect(result.length).to.equal(1)
    chai.expect(result[0]).to.have.property('test')
    chai.expect(result[0].test).to.equal('val')
  });

  it('coreUtils.array.removeByAttr()', function() {
    var result = coreUtils.array.removeByAttr(arr, 'test2', 'val2');
    chai.expect(result).to.be.a('array')
    chai.expect(result.length).to.equal(1)
    chai.expect(result[0]).to.have.property('test')
    chai.expect(result[0].test).to.equal('val')
  });

  it('coreUtils.array.contains()', function() {
    var testArray = ["test0", "test1", "test2"];
    var result = coreUtils.array.contains(testArray, 'test1');
    chai.expect(result).to.be.true
    var result2 = coreUtils.array.contains(testArray, 'test3');
    chai.expect(result2).to.be.false
  });

});
