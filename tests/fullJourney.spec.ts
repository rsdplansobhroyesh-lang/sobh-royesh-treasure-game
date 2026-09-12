import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, test, type Page } from '@playwright/test'
import { gameConfig } from '../src/config/gameConfig'
import { cellCenter, startCell, validRoute, type MazePoint } from '../src/games/maze/mazeGeometry'

const screenshotDirectory = resolve('artifacts/final-qa')
mkdirSync(screenshotDirectory, { recursive: true })

async function screenshot(page: Page, name: string) {
  await assertMobileLayout(page)
  await page.screenshot({
    path: resolve(screenshotDirectory, name),
    fullPage: true,
    animations: 'disabled',
    style: '.skip-link { display: none !important; }',
  })
}

async function assertMobileLayout(page: Page) {
  const result = await page.evaluate(() => ({
    viewportWidth: document.documentElement.clientWidth,
    contentWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
    direction: getComputedStyle(document.documentElement).direction,
    controls: [...document.querySelectorAll<HTMLElement>('button:not([hidden]), input:not([hidden])')]
      .filter(element => element.getClientRects().length > 0)
      .map(element => ({ width: element.getBoundingClientRect().width, height: element.getBoundingClientRect().height })),
  }))
  expect(result.contentWidth).toBeLessThanOrEqual(result.viewportWidth)
  expect(result.direction).toBe('rtl')
  for (const control of result.controls) {
    expect(control.width).toBeGreaterThanOrEqual(44)
    expect(control.height).toBeGreaterThanOrEqual(44)
  }
}

async function rapidActivate(locator: ReturnType<Page['locator']>) {
  await locator.evaluate((element: HTMLElement) => { element.click(); element.click() })
}

async function finishTravel(page: Page, nextStage: number | 'treasure') {
  const target = nextStage === 'treasure' ? page.locator('.map-treasure') : page.locator(`[data-stage="${nextStage}"]`)
  await expect(target).toBeDisabled()
  await page.clock.runFor(1_400)
  await expect(target).toBeEnabled()
  await page.reload()
  await expect(target).toBeEnabled()
}

async function screenPoint(page: Page, point: MazePoint) {
  const box = await page.getByTestId('maze-board').boundingBox()
  if (!box) throw new Error('Maze board is not visible.')
  return { x: box.x + point.x / 350 * box.width, y: box.y + point.y / 450 * box.height }
}

test('fresh mobile adventure completes every real game and reaches the final treasure', async ({ page }, testInfo) => {
  test.setTimeout(90_000)
  test.skip(testInfo.project.name !== 'mobile', 'The continuous real-user journey targets the primary mobile viewport.')
  const pageErrors: string[] = []
  const consoleErrors: string[] = []
  page.on('pageerror', error => pageErrors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(`${message.text()} @ ${message.location().url}`)
  })
  await page.clock.install({ time: new Date('2026-09-12T00:00:00Z') })
  await page.clock.pauseAt(new Date('2026-09-12T00:00:01Z'))

  await page.goto('./')
  await rapidActivate(page.getByRole('button', { name: 'شروع ماجراجویی', exact: true }))
  await expect(page.getByRole('heading', { name: 'مسیر ماجراجویی', exact: true })).toBeVisible()
  await expect(page.locator('[data-stage="1"]')).toBeEnabled()
  for (let stage = 2; stage <= 5; stage += 1) await expect(page.locator(`[data-stage="${stage}"]`)).toBeDisabled()
  await assertMobileLayout(page)
  await screenshot(page, '01-initial-map-mobile.png')

  await rapidActivate(page.locator('[data-stage="1"]'))
  await expect(page.getByRole('heading', { name: 'کلاس پر از نشانه' })).toBeVisible()
  await screenshot(page, '02-game-1-memory-mobile.png')
  await page.reload()
  await expect(page.getByTestId('memory-observation')).toHaveAttribute('data-duration-ms', '10000')
  await page.clock.runFor(10_000)
  await page.getByLabel('تعداد اشیای زرد').fill('۷')
  await rapidActivate(page.getByRole('button', { name: 'ثبت پاسخ', exact: true }))
  await rapidActivate(page.getByRole('button', { name: /ادامه مسیر/ }))
  await finishTravel(page, 2)

  await rapidActivate(page.locator('[data-stage="2"]'))
  await expect(page.getByTestId('timer-display')).toHaveText('0:00')
  await screenshot(page, '03-game-2-timer-mobile.png')
  await page.reload()
  await expect(page.getByTestId('timer-display')).toHaveText('0:00')
  await page.clock.runFor(10_000)
  await rapidActivate(page.getByTestId('timer-stop'))
  await expect(page.getByTestId('timer-display')).toHaveText('10:00')
  await rapidActivate(page.getByRole('button', { name: /ادامه مسیر/ }))
  await finishTravel(page, 3)

  await rapidActivate(page.locator('[data-stage="3"]'))
  await expect(page.getByRole('heading', { name: 'این تصویر چیه؟', exact: true })).toBeVisible()
  await screenshot(page, '04-game-3-image-guess-mobile.png')
  await page.reload()
  await page.getByLabel('پاسخ تو').fill('  دهكده‌ي،   صبح رويش!  ')
  await rapidActivate(page.getByRole('button', { name: 'ثبت پاسخ', exact: true }))
  await rapidActivate(page.getByRole('button', { name: /مرحله بعد/ }))
  await finishTravel(page, 4)

  await rapidActivate(page.locator('[data-stage="4"]'))
  await expect(page.getByTestId('maze-board')).toBeVisible()
  await screenshot(page, '05-game-4-maze-mobile.png')
  await page.reload()
  const start = await screenPoint(page, cellCenter(startCell))
  await page.mouse.move(start.x, start.y)
  await page.mouse.down()
  for (const cell of validRoute.slice(1)) {
    const point = await screenPoint(page, cellCenter(cell))
    await page.mouse.move(point.x, point.y)
  }
  await page.mouse.up()
  await expect(page.getByTestId('maze-success')).toBeVisible()
  await rapidActivate(page.getByRole('button', { name: /ادامه مسیر/ }))
  await finishTravel(page, 5)

  await rapidActivate(page.locator('[data-stage="5"]'))
  await expect(page.getByRole('gridcell')).toHaveCount(36)
  await screenshot(page, '06-game-5-sudoku-mobile.png')
  await page.reload()
  for (const [index, value] of gameConfig.sudokuGame.solution.entries()) {
    if (gameConfig.sudokuGame.puzzle[index] !== 0) continue
    await page.locator(`[data-sudoku-cell="${index}"]`).click()
    await page.getByRole('button', { name: `عدد ${value}`, exact: true }).click()
  }
  await expect(page.getByText('عالیه! سودوکو کامل شد.')).toBeVisible()
  await rapidActivate(page.getByRole('button', { name: 'رسیدن به گنج', exact: true }))
  await finishTravel(page, 'treasure')

  const chest = page.getByRole('button', { name: /گنج پایانی/ })
  await rapidActivate(chest)
  await expect(page.getByRole('heading', { name: 'گنج پیدا شد!' })).toBeVisible()
  await expect(page.getByText('این بار، گنج خودِ تویی.')).toBeVisible()
  await assertMobileLayout(page)
  await screenshot(page, '07-final-treasure-mobile.png')
  await page.reload()
  await expect(page.getByRole('heading', { name: 'گنج پیدا شد!' })).toBeVisible()
  await page.goBack()
  await page.goForward()
  await expect(page.getByRole('heading', { name: 'گنج پیدا شد!' })).toBeVisible()
  await page.getByRole('button', { name: 'بازی دوباره', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'ماجراجویی را از اول شروع کنیم؟' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'نه، ادامه می‌دهم', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'گنج پیدا شد!' })).toBeVisible()
  expect(pageErrors).toEqual([])
  expect(consoleErrors).toEqual([])
})
