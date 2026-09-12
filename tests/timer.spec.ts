import { expect, test, type Page } from '@playwright/test'
import { gameConfig } from '../src/config/gameConfig'
import { openSavedGame, readSavedValue, stateAfterStages } from './fixtures'

async function installPausedClock(page: Page) {
  await page.clock.install({ time: new Date('2026-09-12T00:00:00Z') })
  await page.clock.pauseAt(new Date('2026-09-12T00:00:01Z'))
}

async function openTimerGame(page: Page) {
  await openSavedGame(page, stateAfterStages(1))
  await page.locator('[data-stage="2"]').click()
  await expect(page.getByRole('heading', { name: 'ایست روی ده ثانیه' })).toBeVisible()
  await expect(page.getByTestId('timer-display')).toHaveText('0:00')
}

async function waitForMapArrival(page: Page) {
  await expect(page.locator('[data-stage="2"]')).toHaveAttribute('data-status', 'completed')
  await expect(page.locator('[data-stage="3"]')).toBeDisabled()
  await page.clock.runFor(1_400)
  await expect(page.locator('[data-stage="3"]')).toBeEnabled()
}

test('an exact normal stop completes Game 2 through the existing progression', async ({ page }, testInfo) => {
  await installPausedClock(page)
  await page.goto('./')
  await page.getByRole('button', { name: 'شروع ماجراجویی', exact: true }).click()
  const lockedStageTwo = page.locator('[data-stage="2"]')
  await expect(lockedStageTwo).toBeDisabled()
  await lockedStageTwo.dispatchEvent('click')
  await expect(page.locator('#map-title')).toBeVisible()

  await openTimerGame(page)
  await expect(page.getByTestId('timer-attempts')).toContainText('۳')
  if (testInfo.project.name === 'mobile') {
    await page.screenshot({ path: testInfo.outputPath('initial-timer-mobile.png'), fullPage: true, style: '.skip-link { display: none !important; }' })
  }
  if (testInfo.project.name === 'desktop') {
    await page.screenshot({ path: testInfo.outputPath('initial-timer-desktop.png'), fullPage: true, style: '.skip-link { display: none !important; }' })
  }

  await page.reload()
  await expect(page.getByTestId('timer-display')).toHaveText('0:00')
  expect(JSON.parse((await readSavedValue(page)) ?? 'null')).toEqual({
    version: gameConfig.storage.schemaVersion,
    state: { screen: 'GAME_2', completedStages: [1] },
  })

  await page.clock.runFor(10_000)
  await page.getByTestId('timer-stop').click()
  await expect(page.getByTestId('timer-display')).toHaveText('10:00')
  await expect(page.getByTestId('timer-success')).toContainText('عالی بود! دقیقاً روی 10:00!')
  if (testInfo.project.name === 'mobile') {
    await page.screenshot({ path: testInfo.outputPath('normal-success-mobile.png'), fullPage: true, animations: 'disabled', style: '.skip-link { display: none !important; }' })
  }

  await page.getByRole('button', { name: 'ادامه مسیر', exact: false }).click()
  await waitForMapArrival(page)
  await page.reload()
  await expect(page.locator('[data-stage="2"]')).toHaveAttribute('data-status', 'completed')
  await expect(page.locator('[data-stage="3"]')).toBeEnabled()
})

test('three misses activate the wand and wand completion unlocks Stage 3', async ({ page }, testInfo) => {
  await installPausedClock(page)
  await openTimerGame(page)

  await page.clock.runFor(9_840)
  await page.getByTestId('timer-stop').click()
  await expect(page.getByTestId('timer-display')).toHaveText('9:84')
  await expect(page.getByTestId('timer-attempts')).toContainText('۲')
  await expect(page.getByTestId('timer-failed')).toContainText('نشد! دوباره تلاش کن.')
  if (testInfo.project.name === 'mobile') {
    await page.screenshot({ path: testInfo.outputPath('failed-attempt-mobile.png'), fullPage: true, animations: 'disabled', style: '.skip-link { display: none !important; }' })
  }

  await page.getByRole('button', { name: 'تلاش دوباره', exact: true }).click()
  await expect(page.getByTestId('timer-display')).toHaveText('0:00')
  await page.clock.runFor(8_500)
  await page.getByTestId('timer-stop').click()
  await expect(page.getByTestId('timer-attempts')).toContainText('۱')

  await page.getByRole('button', { name: 'تلاش دوباره', exact: true }).click()
  await expect(page.getByTestId('timer-display')).toHaveText('0:00')
  await page.clock.runFor(11_000)
  await page.getByTestId('timer-stop').click()
  await expect(page.getByTestId('timer-attempts')).toContainText('۰')
  await expect(page.getByTestId('wand-state')).toContainText('عیب نداره! تو یه قدرت ویژه داری.')
  await expect(page.getByTestId('timer-stop')).toHaveCount(0)
  if (testInfo.project.name === 'mobile') {
    await page.screenshot({ path: testInfo.outputPath('magic-wand-mobile.png'), fullPage: true, animations: 'disabled', style: '.skip-link { display: none !important; }' })
  }

  const beforeMagic = await page.getByTestId('timer-display').getAttribute('data-centiseconds')
  await page.getByRole('button', { name: 'استفاده از چوب جادو', exact: true }).click()
  await page.clock.runFor(450)
  await expect(page.getByTestId('timer-display')).not.toHaveAttribute('data-centiseconds', beforeMagic ?? '')
  await page.clock.runFor(460)
  await expect(page.getByTestId('timer-display')).toHaveText('10:00')
  await page.clock.runFor(200)
  await expect(page.getByTestId('wand-success')).toContainText('جادو انجام شد!')
  if (testInfo.project.name === 'mobile') {
    await page.screenshot({ path: testInfo.outputPath('magic-success-mobile.png'), fullPage: true, animations: 'disabled', style: '.skip-link { display: none !important; }' })
  }

  await page.getByRole('button', { name: 'ادامه مسیر', exact: false }).click()
  await waitForMapArrival(page)
})
