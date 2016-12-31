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
        .useXpath()
        .url('http://localhost:3003/abe/editor')
        .waitForElementVisible('//body')
        .assert.title('Abe')
        .click('//*[@id="level-1"]/option[2]')
        .click('//*[@id="selectTemplate"]/option[8]')
        .waitForElementVisible("//div[@data-precontrib-templates='single']//input[@id='name']", 1000)
        .setValue("//div[@data-precontrib-templates='single']//input[@id='name']", 'ftest')
        .click("//button[@type='submit']")
        .waitForElementVisible("//*[@id='abeForm']", 2000)
        .assert.urlEquals("http://localhost:3003/abe/editor/articles/ftest.html", "Clicked URL Matches with URL of the New Window");
    });

    it('The created single article is found in the manager', function(client) {
      client
        .useXpath()
        .url('http://localhost:3003/abe/editor')
        .waitForElementVisible("//body")
        .pause(1000)
        .assert.containsText("//table[@id='navigation-list']/tbody/tr[1]/td[2]/a", "/articles/ftest.html");
    });

    it('The created single article is edited and updated with no change', function(client) {
      client
        .useXpath()
        .url('http://localhost:3003/abe/editor/articles/ftest.html#slug')
        .waitForElementVisible('//body')
        .assert.title('Abe')
        .click("//button[@class='btn btn-primary'][2]")
        .pause(2000)
        .assert.urlEquals("http://localhost:3003/abe/editor/articles/ftest.html", "Clicked URL Matches with URL of the New Window");
    });

    it('The updated single article is found in the manager', function(client) {
      client
        .useXpath()
        .url('http://localhost:3003/abe/editor')
        .waitForElementVisible('//body')
        .pause(1000)
        .assert.containsText("//table[@id='navigation-list']/tbody/tr[1]/td[2]/a", "/articles/ftest.html");
    });

    it('The updated single article is edited once more with a new name', function(client) {
      client
        .useXpath()
        .url('http://localhost:3003/abe/editor/articles/ftest.html#slug')
        .waitForElementVisible('//body')
        .assert.title('Abe')
        .setValue("//div[@data-precontrib-templates='single']//input[@id='name']", 'updated')
        .click("//button[@class='btn btn-primary'][2]")
        .pause(2000)
        .assert.urlEquals("http://localhost:3003/abe/editor/articles/ftestupdated.html", "Clicked URL Matches with URL of the New Window");
    });

    it('The updated single article is found in the manager', function(client) {
      client
        .useXpath()
        .url('http://localhost:3003/abe/editor')
        .waitForElementVisible('//body')
        .pause(1000)
        .assert.containsText("//table[@id='navigation-list']/tbody/tr[1]/td[2]/a", "/articles/ftestupdated.html");
    });

    it('The updated single article is duplicated', function(client) {
      client
        .useXpath()
        .url('http://localhost:3003/abe/editor/articles/ftestupdated.html#slug')
        .waitForElementVisible('//body')
        .assert.title('Abe')
        .clearValue("//div[@data-precontrib-templates='single']//input[@id='name']")
        .setValue("//div[@data-precontrib-templates='single']//input[@id='name']", 'ftest')
        .click("//button[@class='btn btn-primary'][1]")
        .pause(2000)
        .assert.urlEquals("http://localhost:3003/abe/editor/articles/ftest.html", "Clicked URL Matches with URL of the New Window");
    });

    it('The updated single article + duplicated are found in the manager', function(client) {
      client
        .useXpath()
        .url('http://localhost:3003/abe/editor')
        .waitForElementVisible('//body')
        .pause(1000)
        .assert.containsText("//table[@id='navigation-list']/tbody/tr[1]/td[2]/a", "/articles/ftest.html")
        .assert.containsText("//table[@id='navigation-list']/tbody/tr[2]/td[2]/a", "/articles/ftestupdated.html");
    });

    it('The updated article is deleted in the manager', function(client) {
      client
        .useXpath()
        .url('http://localhost:3003/abe/editor')
        .waitForElementVisible('//body')
        .pause(1000)
        .click("//table[@id='navigation-list']/tbody/tr[2]/td[7]/div/a[last()]")
        .pause(1000)
        .acceptAlert()
        .url('http://localhost:3003/abe/editor')
        .pause(2000)
        .expect.element("//table[@id='navigation-list']/tbody/tr[2]/td[2]/a").text.to.not.contain('/articles/ftestupdated.html');
    });

    // it('The duplicated single article is published', function(client) {
    //   client
    //     .useXpath()
    //     .url('http://localhost:3003/abe/editor/articles/ftest.html#slug')
    //     .waitForElementVisible('//body')
    //     .assert.title('Abe')
    //     .pause(1000)
    //     .click("//div[@class='btns']/button[3]")
    //     .pause(2000)
    //     .assert.containsText("//div[@class='display-status']/span", "publish")
    //     .url('http://localhost:3003/abe/editor')
    //     .waitForElementVisible('//body')
    //     .assert.cssClassPresent("//table[@id='navigation-list']/tbody/tr[1]/td[6]/a", "label-published");
    // });

    // it('The duplicated article is unpublished in the manager', function(client) {
    //   client
    //     .useXpath()
    //     .url('http://localhost:3003/abe/editor')
    //     .waitForElementVisible('//body')
    //     .pause(1000)
    //     .click("//table[@id='navigation-list']/tbody/tr[1]/td[7]/div/a")
    //     .pause(1000)
    //     .acceptAlert()
    //     .url('http://localhost:3003/abe/editor')
    //     .pause(2000)
    //     .assert.cssClassPresent("//table[@id='navigation-list']/tbody/tr[1]/td[5]/a", "label-draft");
    // });

    it('The duplicated article is deleted in the manager', function(client) {
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