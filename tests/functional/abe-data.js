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
        .url('http://localhost:3003/abe/editor')
        .click('select[name="selectTemplate"] option[value="autocomplete"]')
        .waitForElementVisible('div[data-precontrib-templates="autocomplete"] input[id="name"]', 1000)
        .setValue('div[data-precontrib-templates="autocomplete"] input[id="name"]', 'autocomplete')
        .click('button[type="submit"]')
        .waitForElementVisible('form[id="abeForm"]', 2000)
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