const {test, expect} = require('@playwright/test')

test.describe('slug', () => {
  test.describe.configure({mode: 'serial'})

  test('Create a slug template post', async ({page}) => {
    await page.goto('/abe/editor')
    await page.locator('#selectTemplate').selectOption({index: 7})
    await page.waitForTimeout(1000)
    await expect(
      page.locator("div[data-precontrib-templates='slug']"),
    ).toHaveCount(2)
  })
})
