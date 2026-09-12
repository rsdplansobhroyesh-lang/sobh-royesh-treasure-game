import { expect, test, type Page } from '@playwright/test'
import { gameConfig } from '../src/config/gameConfig'
import { openSavedGame, readSavedValue, stateAfterStages } from './fixtures'

async function openImageGuess(page: Page) {
  await openSavedGame(page, stateAfterStages(2))
  await page.locator('[data-stage="3"]').click()
  await expect(page.getByRole('heading', { name: 'این تصویر چیه؟', exact: true })).toBeVisible()
}

async function submitAnswer(page: Page, answer: string) {
  await page.getByLabel('پاسخ تو').fill(answer)
  await page.getByRole('button', { name: 'ثبت پاسخ', exact: true }).click()
}

async function finishMapArrival(page: Page) {
  await expect(page.locator('[data-stage="3"]')).toHaveAttribute('data-status', 'completed')
  await expect(page.locator('[data-stage="4"]')).toBeDisabled()
  await expect(page.locator('[data-stage="4"]')).toBeEnabled({ timeout: 3_000 })
}

test('Game 3 is available only at Stage 3 and uses the committed production image', async ({ page }, testInfo) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'شروع ماجراجویی', exact: true }).click()
  const lockedStage = page.locator('[data-stage="3"]')
  await expect(lockedStage).toBeDisabled()
  await lockedStage.dispatchEvent('click')
  await expect(page.locator('#map-title')).toBeVisible()

  await openImageGuess(page)
  await expect(page.getByTestId('image-attempts')).toContainText('۳')
  const photo = page.locator('.image-guess-frame img')
  await expect(photo).toHaveAttribute('src', /assets\/dehkadeh\.jpg$/)
  await expect(page.locator('.image-guess-frame')).toHaveAttribute('data-revealed', 'false')
  expect(await photo.evaluate((image: HTMLImageElement) => [image.naturalWidth, image.naturalHeight])).toEqual([768, 364])
  const imageResponse = await page.request.get(new URL(gameConfig.imageGuessGame.imagePath, page.url()).href)
  expect(imageResponse.ok()).toBe(true)

  if (testInfo.project.name === 'mobile') {
    await page.screenshot({ path: testInfo.outputPath('initial-zoom-mobile.png'), fullPage: true, animations: 'disabled', style: '.skip-link { display: none !important; }' })
  }
  if (testInfo.project.name === 'desktop') {
    await page.screenshot({ path: testInfo.outputPath('initial-game-3-desktop.png'), fullPage: true, animations: 'disabled', style: '.skip-link { display: none !important; }' })
    await page.goto('./?setup=1')
    await expect(page.getByRole('heading', { name: 'این تصویر چیه؟', exact: true })).toBeVisible()
    await expect(page.getByRole('slider')).toHaveCount(0)
  } else {
    await page.reload()
    await expect(page.getByRole('heading', { name: 'این تصویر چیه؟', exact: true })).toBeVisible()
    await expect(page.locator('.image-guess-frame')).toHaveAttribute('data-revealed', 'false')
    await expect(page.getByTestId('image-attempts')).toContainText('۳')
  }
})

test('a missing puzzle image does not crash the Game 3 interface', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/assets/dehkadeh.jpg', route => route.abort())
  await openImageGuess(page)
  await expect(page.getByRole('heading', { name: 'این تصویر چیه؟', exact: true })).toBeVisible()
  await expect(page.getByLabel('پاسخ تو')).toBeEditable()
  await expect(page.getByRole('button', { name: 'ثبت پاسخ', exact: true })).toBeEnabled()
  expect(errors).toEqual([])
})

test('hints, think-again, and a correct answer reveal the full image and unlock Stage 4', async ({ page }, testInfo) => {
  await openImageGuess(page)

  await submitAnswer(page, 'درخت')
  await expect(page.getByTestId('hint-1')).toContainText('اشتباه گفتی.')
  await expect(page.getByTestId('hint-1')).toContainText('این تصویر مربوط به صبح رویش هست.')
  if (testInfo.project.name === 'mobile') {
    await page.screenshot({ path: testInfo.outputPath('first-hint-mobile.png'), fullPage: true, animations: 'disabled', style: '.skip-link { display: none !important; }' })
  }

  await submitAnswer(page, 'باغچه')
  await expect(page.getByTestId('hint-2')).toContainText('هنوز نه!')
  await expect(page.getByTestId('hint-2')).toContainText('این توی دبستان‌هاست.')
  if (testInfo.project.name === 'mobile') {
    await page.screenshot({ path: testInfo.outputPath('second-hint-mobile.png'), fullPage: true, animations: 'disabled', style: '.skip-link { display: none !important; }' })
  }

  await submitAnswer(page, 'حیاط')
  await expect(page.getByTestId('magic-choice')).toContainText('دوباره می‌خوای از چوب جادو استفاده کنی؟')
  if (testInfo.project.name === 'mobile') {
    await page.screenshot({ path: testInfo.outputPath('magic-choice-mobile.png'), fullPage: true, animations: 'disabled', style: '.skip-link { display: none !important; }' })
  }

  await page.getByRole('button', { name: 'یک بار دیگه فکر می‌کنم', exact: true }).click()
  await expect(page.getByTestId('hint-2')).toBeVisible()
  await expect(page.getByTestId('image-attempts')).toContainText('۰')
  await page.getByLabel('پاسخ تو').fill('  دهكده‌ي،   صبح رويش!  ')
  await page.getByLabel('پاسخ تو').press('Enter')

  await expect(page.getByTestId('image-reveal')).toContainText('آفرین! اینجا دهکده صبح رویش هست.')
  await expect(page.locator('.image-guess-frame')).toHaveAttribute('data-revealed', 'true')
  if (testInfo.project.name === 'mobile') {
    await page.screenshot({ path: testInfo.outputPath('full-image-reveal-mobile.png'), fullPage: true, animations: 'disabled', style: '.skip-link { display: none !important; }' })
  }

  await page.getByRole('button', { name: 'مرحله بعد', exact: false }).click()
  await finishMapArrival(page)
  await page.reload()
  await expect(page.locator('[data-stage="4"]')).toBeEnabled()
  expect(JSON.parse((await readSavedValue(page)) ?? 'null').state.completedStages).toEqual([1, 2, 3])
})

test('the magic wand reveals the photo and completes Stage 3 through normal progression', async ({ page }) => {
  await openImageGuess(page)
  await submitAnswer(page, 'یک')
  await submitAnswer(page, 'دو')
  await submitAnswer(page, 'سه')
  await page.getByRole('button', { name: 'بله، چوب جادو!', exact: true }).click()
  await expect(page.locator('.image-guess-frame')).toHaveAttribute('data-revealed', 'true')
  await expect(page.getByTestId('image-reveal')).toContainText('اینجا دهکده صبح رویش هست.', { timeout: 2_000 })
  await page.getByRole('button', { name: 'مرحله بعد', exact: false }).click()
  await finishMapArrival(page)
})
