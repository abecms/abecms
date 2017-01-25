describe('Abe', function() {

  describe('slug', function() {

    before(function(client, done) {
      done();
    });

    after(function(client, done) {
      client.end(function() {
        done();
      });
    });

    afterEach(function(client, done) {
      done();
    });

    beforeEach(function(client, done) {
      done();
    });

    it('Create a slug template post', function(client) {
      client
        .useXpath()
        .url('http://localhost:3003/abe/editor')
        .click('//*[@id="selectTemplate"]/option[8]')
        .pause(1000)
        .elements('xpath',"//div[@data-precontrib-templates='slug']", function (result) {
            client.assert.equal(result.value.length, 2);
        });
    });
  });
});