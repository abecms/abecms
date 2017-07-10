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

    it('Create a data template post', function(client) {
      client
        .useXpath()
        .url('http://localhost:3003/abe/editor')
        .click('//*[@id="selectTemplate"]/option[3]')
        .waitForElementVisible("//div[@data-precontrib-templates='data']//input[@id='name']", 1000)
        .setValue("//div[@data-precontrib-templates='data']//input[@id='name']", 'data')
        .click("//button[@type='submit']")
        .pause(1000)
        .waitForElementVisible('//*[@id="abeForm"]', 2000)
        .assert.urlEquals("http://localhost:3003/abe/editor/data.html", "Clicked URL Matches with URL of the New Window");
    });

    it('Abe type data reference json', function(client) {
      client
        .useXpath()
        .url('http://localhost:3003/abe/editor/data.html')
        .waitForElementVisible('//body')
        .pause(1000)
        .expect.element("//form[@id='abeForm']//li[@class='active']/a").text.to.contain('slug');
    });
    
    
    it('The autocomplete article is deleted in the manager', function(client) {
      client
        .useXpath()
        .url('http://localhost:3003/abe/editor')
        .waitForElementVisible('//body')
        .pause(1000)
        .click("//table[@id='navigation-list']/tbody/tr[1]/td[7]/div/a")
        .pause(1000)
        .acceptAlert()
        .url('http://localhost:3003/abe/editor')
        .pause(2000)
        .expect.element("//table[@id='navigation-list']/tbody/tr[1]/td[2]/a").text.to.not.contain('/articles/ftest.html');
    });
  });
});