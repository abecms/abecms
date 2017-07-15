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

    it('autocomplete: Create a autocomplete template post', function(client) {
      client
        .useXpath()
        .url('http://localhost:3003/abe/editor')
        .click('//*[@id="selectTemplate"]/option[2]')
        .waitForElementVisible("//div[@data-precontrib-templates='autocomplete']//input[@id='name']", 1000)
        .setValue("//div[@data-precontrib-templates='autocomplete']//input[@id='name']", 'autocomplete')
        .click("//button[@type='submit']")
        .pause(1000)
        .waitForElementVisible('//*[@id="abeForm"]', 2000)
        .assert.urlEquals("http://localhost:3003/abe/editor/autocomplete.html", "Clicked URL Matches with URL of the New Window");
    });

    it('autocomplete: Check input select fields', function(client) {
      client
        .useXpath()
        .url('http://localhost:3003/abe/editor/autocomplete.html')
        .execute(function() {
          var sel = document.getElementById('colors.multiple')
          sel.options[1].selected = true;

          if ("createEvent" in document) {
              var evt = document.createEvent("HTMLEvents");
              evt.initEvent("change", false, true);
              sel.dispatchEvent(evt);
          }
          else {
              sel.fireEvent("onchange");
          }
        })
        //.click('//*[@id="colors.multiple"]/option[2]')
        .getText('//*[@id="colors"]', function(result) {
          elementValue = result.value;
          //console.log(result)
        })
        .perform(function() {
          console.log('elementValue', elementValue);
        })
        // .source(function (result){
        //     // Source will be stored in result.value
        //     console.log(result.value);
        // })
        .waitForElementVisible('//*[@data-parent-id="colors.multiple"]', 1000)
        .assert.containsText('//*[@data-parent-id="colors.multiple"]', 'rouge')
        .click('//*[@data-parent-id="colors.multiple"]/span')
        .assert.elementNotPresent('//*[@data-parent-id="colors.multiple"]')
    });

    it('autocomplete: Check input autocomplete fields', function(client) {
      client
        .useXpath()
        .url('http://localhost:3003/abe/editor/autocomplete.html')
        .setValue('//*[@id="colors.colors_autocomplete"]', 'rouge')
        .waitForElementVisible('//*[@id="colors"]/div/div/div/div[3]/div/div[2]/div', 1000)
        .click('//*[@id="colors"]/div/div/div/div[3]/div/div[2]/div')
        .waitForElementVisible('//*[@data-parent-id="colors.colors_autocomplete"]', 1000)
        .assert.containsText('//*[@data-parent-id="colors.colors_autocomplete"]', 'rouge')
        .click('//*[@data-parent-id="colors.colors_autocomplete"]/span')
        .assert.elementNotPresent('//*[@data-parent-id="colors.colors_autocomplete"]')
    });

    // it('autocomplete: Abe type data reference json', function(client) {
    //   client
    //     .useXpath()
    //     .url('http://localhost:3003/abe/editor/autocomplete.html')
    //     .waitForElementVisible('//body')
    //     .pause(1000)
    //     .click('//*[@id="abeForm"]/ul/li[2]/a')
    //     .waitForElementVisible('//*[@id="reference"]/div')
    //     .click('//*[@id="reference.single"]/option[2]')
    //     .click('//*[@id="reference.multiple"]/option[3]')
    //     .setValue('//*[@id="reference.autocomplete"]', 'rouge')
    //     .waitForElementVisible('//*[@id="reference"]/div/div/div/div[3]/div[2]', 2000)
    //     .click('//*[@id="reference"]/div/div/div/div[3]/div[2]/div[1]')
    //     .waitForElementVisible('//*[@id="reference"]/div/div/div/div[3]/div/div', 2000);
    // });
    // 
    
    it('autocomplete: The autocomplete article is deleted in the manager', function(client) {
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