import { expect, test as base, type Page } from '@playwright/test'
import { gameConfig } from '../src/config/gameConfig'
import { gameReducer } from '../src/state/gameState'
import {
  openSavedGame,
  openSerializedGame,
  readSavedValue,
  serializeSavedGame,
  stateAfterStages,
} from './fixtures'

const test = base.extend<{ runtimeErrors: void }>({
  runtimeErrors: [async ({ page }, use) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await use()
    expect(errors, 'The browser should not report unhandled application errors.').toEqual([])
  }, { auto: true }],
})

const startName = 'شروع ماجراجویی'
const restartName = 'شروع دوبارهٔ ماجراجویی'
const cancelName = 'نه، ادامه می‌دهم'
const confirmName = 'بله، از اول شروع کن'
const mapName = 'مسیر ماجراجویی'
const firstStage = gameConfig.stages.find((stage) => stage.id === 1)
const secondStage = gameConfig.stages.find((stage) => stage.id === 2)
if (!firstStage || !secondStage) throw new Error('The adventure configuration must contain stages one and two.')

async function assertResponsiveRtl(page: Page): Promise<void> {
  await expect(page.locator('html')).toHaveAttribute('lang', 'fa')
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(page.locator('body')).toHaveCSS('direction', 'rtl')
  await expect(page.locator('main')).toHaveCSS('direction', 'rtl')
  const measurements = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    width: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
    buttons: Array.from(document.querySelectorAll('button'))
      .filter((button) => button.getClientRects().length > 0)
      .map((button) => ({
        label: button.textContent?.trim() ?? '',
        width: button.getBoundingClientRect().width,
        height: button.getBoundingClientRect().height,
      })),
  }))
  expect(measurements.width, 'The page should not overflow horizontally.').toBeLessThanOrEqual(measurements.viewport)
  for (const button of measurements.buttons) {
    expect(button.width, `Touch-target width: ${button.label}`).toBeGreaterThanOrEqual(44)
    expect(button.height, `Touch-target height: ${button.label}`).toBeGreaterThanOrEqual(44)
  }
}

test('navigates the production app in RTL, preserves the current screen, and keeps future stages locked', async ({ page }, testInfo) => {
  await page.goto('./')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('ماموریت پنج‌مرحله‌ای صبح رویش')
  await assertResponsiveRtl(page)
  await page.screenshot({ path: testInfo.outputPath('intro.png'), fullPage: true })

  await page.getByRole('button', { name: startName, exact: true }).click()
  await expect(page.getByRole('heading', { name: mapName, exact: true })).toBeFocused()
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '0')
  for (const stage of gameConfig.stages) {
    const checkpoint = page.getByRole('button', { name: new RegExp(stage.title) })
    if (stage.id === 1) {
      await expect(checkpoint).toBeEnabled()
      await expect(checkpoint).toHaveAttribute('aria-current', 'step')
    } else {
      await expect(checkpoint).toBeDisabled()
      await expect(checkpoint).toContainText('قفل')
    }
  }
  await expect(page.getByRole('button', { name: /گنج پایانی/ })).toBeDisabled()
  await assertResponsiveRtl(page)
  await page.screenshot({ path: testInfo.outputPath('map.png'), fullPage: true })

  await page.getByRole('button', { name: new RegExp(firstStage.title) }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('کلاس پر از نشانه')
  await assertResponsiveRtl(page)
  await page.screenshot({ path: testInfo.outputPath('game-placeholder.png'), fullPage: true })
  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('کلاس پر از نشانه')
  expect(JSON.parse((await readSavedValue(page)) ?? 'null')).toEqual({
    version: gameConfig.storage.schemaVersion,
    state: { screen: 'GAME_1', completedStages: [] },
  })

  await page.getByRole('button', { name: 'بازگشت به مسیر', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { name: mapName, exact: true })).toBeFocused()
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '0')
})

test('restores all completed checkpoints and the final treasure state across refresh', async ({ page }) => {
  const completedMap = stateAfterStages(5)
  await openSavedGame(page, completedMap)
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '5')
  for (const stage of gameConfig.stages) {
    const checkpoint = page.getByRole('button', { name: new RegExp(stage.title) })
    await expect(checkpoint).toBeDisabled()
    await expect(checkpoint).toContainText('کامل شده')
  }
  await page.getByRole('button', { name: /گنج پایانی/ }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('گنج پیدا شد!')
  await assertResponsiveRtl(page)
  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('گنج پیدا شد!')
  expect(await readSavedValue(page)).toBe(serializeSavedGame(gameReducer(completedMap, { type: 'OPEN_TREASURE' })))
  await page.getByRole('button', { name: 'دیدن مسیر ماجراجویی', exact: true }).click()
  await expect(page.getByRole('heading', { name: mapName, exact: true })).toBeVisible()
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '5')
})

test('reset traps focus, permits cancel and Escape, and clears only adventure progress after confirmation', async ({ page }, testInfo) => {
  const inGame = gameReducer(stateAfterStages(2), { type: 'OPEN_GAME', stage: 3 })
  await openSavedGame(page, inGame)
  await page.evaluate(() => localStorage.setItem('unrelated-preference', 'keep-me'))
  const restart = page.getByRole('button', { name: restartName, exact: true })
  const dialog = page.getByRole('dialog', { name: 'ماجراجویی را از اول شروع کنیم؟', exact: true })
  const cancel = dialog.getByRole('button', { name: cancelName, exact: true })
  const confirm = dialog.getByRole('button', { name: confirmName, exact: true })

  await restart.click()
  await expect(dialog).toBeVisible()
  await expect(cancel).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(confirm).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(cancel).toBeFocused()
  await assertResponsiveRtl(page)
  await page.screenshot({ path: testInfo.outputPath('reset-confirmation.png'), fullPage: true })
  await cancel.click()
  await expect(dialog).not.toBeVisible()
  await expect(restart).toBeFocused()
  expect(await readSavedValue(page)).toBe(serializeSavedGame(inGame))

  await restart.click()
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(restart).toBeFocused()
  expect(await readSavedValue(page)).toBe(serializeSavedGame(inGame))

  await restart.click()
  await confirm.click()
  await expect(dialog).not.toBeVisible()
  await expect(page.getByRole('button', { name: startName, exact: true })).toBeVisible()
  expect(await readSavedValue(page)).toBeNull()
  expect(await page.evaluate(() => localStorage.getItem('unrelated-preference'))).toBe('keep-me')
  await page.reload()
  await expect(page.getByRole('button', { name: startName, exact: true })).toBeVisible()
  expect(await readSavedValue(page)).toBeNull()
  await page.getByRole('button', { name: startName, exact: true }).click()
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '0')
  await expect(page.getByRole('button', { name: new RegExp(secondStage.title) })).toBeDisabled()
})

test('recovers from corrupt JSON and impossible saved progression', async ({ page }) => {
  const invalidValues = [
    '{broken-json',
    JSON.stringify({ version: 1, state: { screen: 'MAP', completedStages: [2] } }),
    JSON.stringify({ version: 1, state: { screen: 'GAME_5', completedStages: [] } }),
  ]
  for (const value of invalidValues) {
    await openSerializedGame(page, value)
    await expect(page.getByRole('status')).toContainText('ذخیرهٔ قبلی قابل خواندن نبود')
    await page.getByRole('button', { name: startName, exact: true }).click()
    await expect(page.getByRole('heading', { name: mapName, exact: true })).toBeVisible()
    expect(await readSavedValue(page)).toBe(serializeSavedGame(stateAfterStages(0)))
  }
})

test('preserves an unknown storage schema until the player confirms a reset', async ({ page }) => {
  const futureSave = JSON.stringify({ version: gameConfig.storage.schemaVersion + 1, state: { futureProgress: true } })
  await openSerializedGame(page, futureSave)
  await expect(page.getByRole('status')).toContainText('ذخیرهٔ قبلی مربوط به نسخهٔ دیگری است')
  await page.getByRole('button', { name: startName, exact: true }).click()
  await expect(page.getByRole('heading', { name: mapName, exact: true })).toBeVisible()
  expect(await readSavedValue(page)).toBe(futureSave)
  await page.reload()
  await expect(page.getByRole('button', { name: startName, exact: true })).toBeVisible()
  expect(await readSavedValue(page)).toBe(futureSave)
  await page.getByRole('button', { name: restartName, exact: true }).click()
  await page.getByRole('dialog').getByRole('button', { name: confirmName, exact: true }).click()
  expect(await readSavedValue(page)).toBeNull()
  await expect(page.getByRole('status')).toHaveCount(0)
  await page.getByRole('button', { name: startName, exact: true }).click()
  expect(await readSavedValue(page)).toBe(serializeSavedGame(stateAfterStages(0)))
})

test('continues in memory and explains the limitation when browser storage access is blocked', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get: () => { throw new DOMException('Storage access blocked for this test.', 'SecurityError') },
    })
  })
  await page.goto('./')
  await expect(page.getByRole('status')).toContainText('مرورگر اجازهٔ ذخیره نمی‌دهد')
  await page.getByRole('button', { name: startName, exact: true }).click()
  await page.getByRole('button', { name: new RegExp(firstStage.title) }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('کلاس پر از نشانه')
  await assertResponsiveRtl(page)
  await page.reload()
  await expect(page.getByRole('button', { name: startName, exact: true })).toBeVisible()
})

test('keeps progress and the confirmation open if storage refuses to clear', async ({ page }) => {
  const savedState = stateAfterStages(2)
  await openSavedGame(page, savedState)
  await page.evaluate(() => {
    Storage.prototype.removeItem = () => { throw new DOMException('Storage removal blocked for this test.', 'SecurityError') }
  })
  await page.getByRole('button', { name: restartName, exact: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('button', { name: confirmName, exact: true }).click()
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('alert')).toContainText('پاک‌کردن ذخیره انجام نشد')
  expect(await readSavedValue(page)).toBe(serializeSavedGame(savedState))
  await dialog.getByRole('button', { name: cancelName, exact: true }).click()
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '2')
  await page.reload()
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '2')
})
