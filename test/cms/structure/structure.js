import chai from 'chai'
import path from 'path'
import sinonChai from'sinon-chai'
chai.use(sinonChai)
import sinon from 'sinon'
import mkdirp from 'mkdirp'
import events from 'events'
import {
  cmsStructure,
  abeExtend,
  config
} from '../../../src/cli'

config.set({root: path.join(process.cwd(), 'test','fixtures')})

describe('cmsStructure', function() {

  var folderPath = '/my/folder/path'
  
  /**
   * cmsStructure.structure.addFolder
   * 
   */
  it('cmsStructure.structure.addFolder()', function() {
    this.sinon = sinon.sandbox.create();
    // var stub = sinon.stub(mkdirp)
    var MyMkdirp = exports.MyMkdirp = mkdirp = 
    // function() {
    //   return {
    //     'stdout': new events.EventEmitter(),
    //     'stderr': new events.EventEmitter()
    //   }
    // };
    var stub = sinon.createStubInstance(exports, 'MyMkdirp')
    stub.returns({
      'stdout': new events.EventEmitter(),
      'stderr': new events.EventEmitter()
    })
    var result = cmsStructure.structure.addFolder(folderPath)
    console.log("result", result)
    // chai.expect(result).to.not.be.undefined
    // chai.expect(result).to.be.a('string')
    // chai.expect(result).to.equal(folderPath)
    // chai.expect(result).to.equal(path.join(config.root, config.publish.url, '/myImageFolder'))
    sinon.assert.calledOnce(mkdirp)
    exports.MyMkdirp.restore()
  });

});
