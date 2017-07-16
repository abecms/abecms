// DISPLAY BROWSER'S LOGS
// ----------------------
// .getLog('browser', function(result) {
//   console.log(result);
// })

// DISPLAY WEBPAGE'S SOURCE
// ----------------------
// .source(function (result){
//   // Source will be stored in result.value
//   console.log(result.value);
// })

// EXECUTE JAVASCRIPT
// ----------------------
// .execute(function() {
//   var sel = document.getElementById('colors.multiple')
//   sel.options[2].selected = true;
//   console.log(sel.options[1].value)
//   var evt = document.createEvent("HTMLEvents");
//   evt.initEvent("change", false, true);
//   sel.dispatchEvent(evt);
// })

// MOVE MOUSE AND CLICK
// ----------------------
// .moveToElement('//*[@id="colors.multiple"]/option[2]', 0, 0)
// .mouseButtonClick(0)

// USE KEYBOARD
// ----------------------
// '\uE015' down array key
// '\uE006'] enter key
//.keys(['\uE015', '\uE015', '\uE006'])

// SET VARIABLE AND REUSE IT
// ----------------------
// .getText('//*[@id="colors"]', function(result) {
//   elementValue = result.value;
//   //console.log(result)
// })
// .perform(function() {
//   console.log('elementValue', elementValue);
// })

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
        // colors single
        .pause(1000)
        .click('//*[@id="colors.single"]/option[3]')
        .pause(1000)
        .assert.containsText('//*[@id="colors.single"]', "vert")
        // colors multiple
        .click('//*[@id="colors.multiple"]/option[2]')
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

    it('autocomplete: Abe type data reference json', function(client) {
      client
        .useXpath()
        .url('http://localhost:3003/abe/editor/autocomplete.html')
        .click('//ul[@class="nav nav-tabs"]/li[2]/a')
        .waitForElementVisible('//*[@id="reference"]/div')
        // reference single
        .click('//*[@id="reference.single"]/option[2]')
        .assert.containsText('//*[@id="reference.single"]', "test 1")
        // reference multiple
        .click('//*[@id="reference.multiple"]/option[3]')
        .waitForElementVisible('//*[@data-parent-id="reference.multiple"]', 1000)
        .assert.containsText('//*[@data-parent-id="reference.multiple"]', 'test 2')
        // reference autocomplete
        .setValue('//*[@id="reference.autocomplete"]', 'test 2')
        .waitForElementVisible('//*[@id="reference"]/div/div/div/div[3]/div/div[2]/div', 1000)
        .click('//*[@id="reference"]/div/div/div/div[3]/div/div[2]/div')
        .waitForElementVisible('//*[@data-parent-id="reference.autocomplete"]', 1000)
        .assert.containsText('//*[@data-parent-id="reference.autocomplete"]', 'test 2')
        .click('//*[@data-parent-id="reference.autocomplete"]/span')
        .assert.elementNotPresent('//*[@data-parent-id="reference.autocomplete"]');

    });
   
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