import { expect, test } from '@playwright/test'
import { gameConfig } from '../src/config/gameConfig'
import { readSavedValue } from './fixtures'

test('Game 1 observes, retries, completes, and persists through the approved progression', async ({ page }, testInfo) => {
  await page.clock.install({ time: new Date('2026-09-12T00:00:00Z') })
  await page.clock.pauseAt(new Date('2026-09-12T00:00:01Z'))
  await page.goto('./')
  await page.getByRole('button', { name: 'شروع ماجراجویی', exact: true }).click()
  await page.locator('[data-stage="1"]').click()

  const scene = page.getByTestId('memory-scene')
  const observation = page.getByTestId('memory-observation')
  await expect(page.getByRole('heading', { name: 'کلاس پر از نشانه' })).toBeVisible()
  await expect(observation).toHaveAttribute('data-attempt', '1')
  await expect(observation).toHaveAttribute('data-duration-ms', String(gameConfig.memoryGame.initialObservationMs))
  await expect(scene).toHaveAttribute('data-yellow-count', String(gameConfig.memoryGame.correctAnswer))
  await expect(page.locator('[data-yellow-object]')).toHaveCount(gameConfig.memoryGame.correctAnswer)

  if (testInfo.project.name === 'mobile') {
    await page.screenshot({ path: testInfo.outputPath('memory-scene-mobile.png'), fullPage: true })
  }
  if (testInfo.project.name === 'desktop') {
    await page.screenshot({ path: testInfo.outputPath('memory-scene-desktop.png'), fullPage: true })
  }

  await page.clock.runFor(gameConfig.memoryGame.initialObservationMs - 1)
  await expect(scene).toBeVisible()
  await page.clock.runFor(1)
  await expect(scene).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'چند شیء زرد توی تصویر بود؟' })).toBeVisible()
  await expect(page.getByLabel('تعداد اشیای زرد')).toBeFocused()
  if (testInfo.project.name === 'mobile') {
    await page.clock.runFor(200)
    await page.screenshot({ path: testInfo.outputPath('answer-screen-mobile.png'), fullPage: true, animations: 'disabled' })
  }

  await page.getByLabel('تعداد اشیای زرد').fill('۶')
  await page.getByRole('button', { name: 'ثبت پاسخ', exact: true }).click()
  const wrong = page.getByTestId('memory-wrong-state')
  await expect(wrong).toContainText('سوختی! دوباره امتحان کن.')
  await expect(wrong).not.toContainText(String(gameConfig.memoryGame.correctAnswer))
  expect(JSON.parse((await readSavedValue(page)) ?? 'null')).toEqual({
    version: gameConfig.storage.schemaVersion,
    state: { screen: 'GAME_1', completedStages: [] },
  })
  await page.reload()
  await expect(page.getByTestId('memory-observation')).toHaveAttribute('data-attempt', '1')
  await page.clock.runFor(gameConfig.memoryGame.initialObservationMs)
  await page.getByLabel('تعداد اشیای زرد').fill('۶')
  await page.getByRole('button', { name: 'ثبت پاسخ', exact: true }).click()
  if (testInfo.project.name === 'mobile') {
    await page.clock.runFor(200)
    await page.screenshot({ path: testInfo.outputPath('wrong-answer-mobile.png'), fullPage: true, animations: 'disabled' })
  }

  await page.getByRole('button', { name: 'دوباره ببین', exact: true }).click()
  await expect(observation).toHaveAttribute('data-attempt', '2')
  await expect(observation).toHaveAttribute('data-duration-ms', String(gameConfig.memoryGame.retryObservationMs))
  await page.clock.runFor(gameConfig.memoryGame.retryObservationMs - 1)
  await expect(scene).toBeVisible()
  await page.clock.runFor(1)
  await expect(scene).toHaveCount(0)

  await page.getByLabel('تعداد اشیای زرد').fill('۷')
  await page.getByRole('button', { name: 'ثبت پاسخ', exact: true }).click()
  await expect(page.getByTestId('memory-success-state')).toContainText('آفرین! حالا برو مرحله بعدی.')
  if (testInfo.project.name === 'mobile') {
    await page.clock.runFor(200)
    await page.screenshot({ path: testInfo.outputPath('success-mobile.png'), fullPage: true, animations: 'disabled' })
  }

  await page.getByRole('button', { name: 'ادامه مسیر', exact: false }).click()
  await expect(page.locator('[data-stage="1"]')).toHaveAttribute('data-status', 'completed')
  await expect(page.locator('[data-stage="2"]')).toBeDisabled()
  expect(JSON.parse((await readSavedValue(page)) ?? 'null')).toEqual({
    version: gameConfig.storage.schemaVersion,
    state: { screen: 'MAP', completedStages: [1] },
  })
  await page.clock.runFor(1_400)
  await expect(page.locator('[data-stage="2"]')).toBeEnabled()
  await page.reload()
  await expect(page.locator('[data-stage="1"]')).toHaveAttribute('data-status', 'completed')
  await expect(page.locator('[data-stage="2"]')).toBeEnabled()
})
