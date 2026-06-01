const {test, expect} = require('@playwright/test')

test.describe.configure({mode: 'serial'})

test.describe('operations', () => {
  test('Create a single article', async ({page}) => {
    await page.goto('/abe/editor')
    await page.locator('#level-1').selectOption({index: 1})
    await page.locator('#selectTemplate').selectOption({index: 6})
    await page
      .locator("div[data-precontrib-templates='single'] input#name")
      .waitFor()
    await page
      .locator("div[data-precontrib-templates='single'] input#name")
      .fill('ftest')
    await page.locator('button[data-abe-create="true"]').click()
    await page.waitForURL('**/abe/editor/articles/ftest.html', {timeout: 30000})
  })

  test('The created single article is found in the manager', async ({page}) => {
    await page.goto('/abe/editor')
    await page.waitForTimeout(1000)
    await expect(
      page.locator('#navigation-list tbody tr').first().locator('td').nth(1),
    ).toContainText('/articles/ftest.html')
  })

  test('The created single article is edited and updated with no change', async ({
    page,
  }) => {
    await page.goto('/abe/editor/articles/ftest.html#slug')
    await page.locator('button.btn.btn-primary').nth(1).click()
    await page.waitForTimeout(2000)
    await expect(page).toHaveURL(
      'http://localhost:3003/abe/editor/articles/ftest.html',
    )
  })

  test('The updated single article is found in the manager', async ({page}) => {
    await page.goto('/abe/editor')
    await page.waitForTimeout(1000)
    await expect(
      page.locator('#navigation-list tbody tr').first().locator('td').nth(1),
    ).toContainText('/articles/ftest.html')
  })

  test('The updated single article is edited once more with a new name', async ({
    page,
  }) => {
    await page.goto('/abe/editor/articles/ftest.html#slug')
    await page
      .locator("div[data-precontrib-templates='single'] input#name")
      .fill('updated')
    await page.locator('button.btn.btn-primary').nth(1).click()
    await page.waitForTimeout(2000)
    await expect(page).toHaveURL(
      'http://localhost:3003/abe/editor/articles/updated.html',
    )
  })

  test('The updated single article is found in the manager after rename', async ({
    page,
  }) => {
    await page.goto('/abe/editor')
    await page.waitForTimeout(1000)
    await expect(
      page.locator('#navigation-list tbody tr').first().locator('td').nth(1),
    ).toContainText('/articles/updated.html')
  })

  test('The updated single article is duplicated', async ({page}) => {
    await page.goto('/abe/editor/articles/updated.html#slug')
    await page
      .locator("div[data-precontrib-templates='single'] input#name")
      .fill('ftest')
    await page.locator('button.btn.btn-primary').first().click()
    await page.waitForTimeout(2000)
    await expect(page).toHaveURL(
      'http://localhost:3003/abe/editor/articles/ftest.html',
    )
  })

  test('The updated single article + duplicated are found in the manager', async ({
    page,
  }) => {
    await page.goto('/abe/editor')
    await page.waitForTimeout(1000)
    await expect(
      page.locator('#navigation-list tbody tr').nth(0).locator('td').nth(1),
    ).toContainText('/articles/ftest.html')
    await expect(
      page.locator('#navigation-list tbody tr').nth(1).locator('td').nth(1),
    ).toContainText('/articles/updated.html')
  })

  test('The updated article is deleted in the manager', async ({page}) => {
    await page.goto('/abe/editor')
    await page.waitForTimeout(1000)
    page.once('dialog', dialog => dialog.accept())
    await page
      .locator('#navigation-list tbody tr')
      .nth(1)
      .locator('td')
      .nth(6)
      .locator('a')
      .last()
      .click()
    await page.waitForTimeout(2000)
    await expect(
      page.locator('#navigation-list tbody tr').nth(1).locator('td').nth(1),
    ).not.toContainText('/articles/updated.html')
  })

  test('The duplicated article is deleted in the manager', async ({page}) => {
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
    ).not.toContainText('/articles/ftest.html')
  })
})
