describe('Abe', function() {

  describe('data', function() {

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

    it('Create a autocomplete template post', function(client) {
      client
        .useXpath()
        .url('http://localhost:3003/abe/editor')
        .click('//*[@id="selectTemplate"]/option[2]')
        .waitForElementVisible('//*[@id="name"]', 1000)
        .setValue('//*[@id="name"]', 'autocomplete')
        .click('/html/body/div[1]/div[1]/div[2]/div[1]/div[1]/div[2]/form/div[11]/div/button')
        .pause(1000)
        .waitForElementVisible('//*[@id="abeForm"]', 2000)
        .assert.urlEquals("http://localhost:3003/abe/editor/autocomplete.html", "Clicked URL Matches with URL of the New Window");
    });


    it('Abe type data reference json', function(client) {
      client
        .useXpath()
        .url('http://localhost:3003/abe/editor/autocomplete.html')
        .waitForElementVisible('//body')
        .pause(1000)
        .click('//*[@id="abeForm"]/ul/li[2]/a')
        .waitForElementVisible('//*[@id="reference"]/div')
        .click('//*[@id="reference.single"]/option[2]')
        .click('//*[@id="reference.multiple"]/option[3]')
        .setValue('//*[@id="reference.autocomplete"]', 'test')
        .waitForElementVisible('//*[@id="reference"]/div/div/div/div[3]/div[2]', 2000)
        .click('//*[@id="reference"]/div/div/div/div[3]/div[2]/div[1]')
        .waitForElementVisible('//*[@id="reference"]/div/div/div/div[3]/div/div', 2000);
    });
  });
});