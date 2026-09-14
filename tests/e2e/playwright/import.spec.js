const {test, expect} = require('@playwright/test')

test.describe.configure({mode: 'serial'})

test.describe('import', () => {
  test('Create an import post', async ({page}) => {
    await page.goto('/abe/editor')
    await page.locator('#selectTemplate').selectOption({index: 4})
    await page
      .locator("div[data-precontrib-templates='import'] input#name")
      .waitFor()
    await page
      .locator("div[data-precontrib-templates='import'] input#name")
      .fill('import')
    await page.locator('button[data-abe-create="true"]').click()
    await page.waitForURL('**/abe/editor/import.html', {timeout: 30000})
  })

  test('Select a language', async ({page}) => {
    await page.goto('/abe/editor/import.html')
    await page.locator('#language').selectOption({index: 1})
    await page
      .locator(
        "div.toolbar div.btns button.btn.btn-info.btn-save.btn-draft",
      )
      .click()
    await expect(page).toHaveURL('http://localhost:3003/abe/editor/import.html')
  })

  test('Check that the partial displayed is ok', async ({page}) => {
    await page.goto('/abe/editor/import.html')
    await page.waitForTimeout(2000)
    const frame = page.frameLocator('#page-template')
    await expect(frame.locator('#fh5co-logo a')).toContainText('Abe demo fr')
  })

  test('The import post is deleted in the manager', async ({page}) => {
    await page.goto('/abe/editor')
    await page.waitForTimeout(1000)
    page.once('dialog', dialog => dialog.accept())
    await page.locator("#navigation-list span.fa.fa-trash").first().click()
    await page.waitForTimeout(2000)
    await expect(
      page.locator('#navigation-list tbody tr').first().locator('td').nth(1),
    ).not.toContainText('/import.html')
  })
})
