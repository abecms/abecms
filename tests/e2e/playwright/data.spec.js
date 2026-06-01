const {test, expect} = require('@playwright/test')

test.describe.configure({mode: 'serial'})

test.describe('data', () => {
  test('Create a data template post', async ({page}) => {
    await page.goto('/abe/editor')
    await page.locator('#selectTemplate').selectOption({index: 2})
    await page
      .locator("div[data-precontrib-templates='data'] input#name")
      .waitFor()
    await page
      .locator("div[data-precontrib-templates='data'] input#name")
      .fill('data')
    await page.locator('button[data-abe-create="true"]').click()
    await page.waitForURL('**/abe/editor/data.html', {timeout: 30000})
  })

  test('Abe type data reference json', async ({page}) => {
    await page.goto('/abe/editor/data.html')
    const frame = page.frameLocator('iframe').first()
    await expect(frame.locator('#test')).toContainText('content')
  })

  test('The data article is deleted in the manager', async ({page}) => {
    await page.goto('/abe/editor')
    await page.waitForTimeout(1000)
    page.once('dialog', dialog => dialog.accept())
    await page
      .locator('#navigation-list tbody tr')
      .first()
      .locator('td')
      .nth(6)
      .locator('a')
      .first()
      .click()
    await page.waitForTimeout(2000)
    await expect(
      page.locator('#navigation-list tbody tr').first().locator('td').nth(1),
    ).not.toContainText('/data.html')
  })
})
