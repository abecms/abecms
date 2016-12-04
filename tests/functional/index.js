describe('Abe', function() {

  describe('operations', function() {

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

    it('Create a single article', function(client) {
      client
        .url('http://localhost:3003/abe/editor')
        .waitForElementVisible('body')
        .assert.title('Abe')
        .click('select[id="level-1"] option:nth-child(2)')
        .click('select[name="selectTemplate"] option[value="single"]')
        .waitForElementVisible('div[data-precontrib-templates=single]', 1000)
        .setValue('div[data-precontrib-templates=single] > div > input', 'ftest')
        .click('button[type="submit"]')
        .waitForElementVisible('form[id="abeForm"]', 2000)
        .assert.urlEquals("http://localhost:3003/abe/editor/articles/ftest.html", "Clicked URL Matches with URL of the New Window")
        .end();
    });

    it('The created single article is found in the manager', function(client) {
      client
        .useXpath()
        .url('http://localhost:3003/abe/editor')
        .waitForElementVisible('//body')
        .assert.containsText("//table[@id='navigation-list']/tbody/tr[1]/td[2]/a", "/articles/ftest.html")
        .end();
    });
  });
});