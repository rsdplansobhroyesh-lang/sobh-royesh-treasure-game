import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, test } from '@playwright/test'
import { gameConfig } from '../src/config/gameConfig'
import { openSavedGame, stateAfterStages } from './fixtures'

const shots = resolve('artifacts/game5')
mkdirSync(shots, { recursive: true })

async function openSudoku(page: Parameters<typeof openSavedGame>[0]) {
  await openSavedGame(page, stateAfterStages(4))
  await page.getByRole('button', { name: /سودوکوی کوچک/ }).click()
  await expect(page.getByRole('heading', { name: 'سودوکوی کوچک' })).toBeVisible()
}

async function enterCell(page: Parameters<typeof openSavedGame>[0], index: number, value: number) {
  await page.locator(`[data-sudoku-cell="${index}"]`).click()
  await page.getByRole('button', { name: `عدد ${value}`, exact: true }).click()
}

test('Stage 5 obeys unlocking, opens as a fixed RTL Sudoku, and survives refresh', async ({ page }, testInfo) => {
  await openSavedGame(page, stateAfterStages(3))
  await expect(page.getByRole('button', { name: /سودوکوی کوچک/ })).toBeDisabled()
  await openSudoku(page)
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(page.getByRole('gridcell')).toHaveCount(36)
  await expect(page.locator('[data-sudoku-cell="0"]')).toContainText('۱')
  await page.locator('[data-sudoku-cell="0"]').click()
  await page.getByRole('button', { name: 'عدد 6', exact: true }).click()
  await expect(page.locator('[data-sudoku-cell="0"]')).toContainText('۱')
  await page.locator('[data-sudoku-cell="1"]').click()
  await expect(page.locator('.sudoku-cell.is-selected')).toHaveCount(1)
  await expect(page.locator('.sudoku-cell.is-peer')).not.toHaveCount(0)
  await page.keyboard.press('2')
  await expect(page.locator('[data-sudoku-cell="1"]')).toContainText('۲')
  await page.reload()
  await expect(page.getByRole('heading', { name: 'سودوکوی کوچک' })).toBeVisible()
  await expect(page.locator('[data-sudoku-cell="1"]')).toBeEmpty()
  if (testInfo.project.name === 'mobile') await page.screenshot({ path: resolve(shots, 'initial-sudoku-mobile.png'), fullPage: true })
  if (testInfo.project.name === 'desktop') await page.screenshot({ path: resolve(shots, 'initial-sudoku-desktop.png'), fullPage: true })
})

test('selection, pencil, eraser, conflicts, and confirmed puzzle restart work', async ({ page }, testInfo) => {
  await openSudoku(page)
  await page.locator('[data-sudoku-cell="1"]').click()
  if (testInfo.project.name === 'mobile') await page.screenshot({ path: resolve(shots, 'selected-cell-mobile.png'), fullPage: true })
  await page.getByRole('button', { name: /مداد/ }).click()
  await page.getByRole('button', { name: 'عدد 2', exact: true }).click()
  await expect(page.locator('[data-sudoku-cell="1"]')).toContainText('۲')
  if (testInfo.project.name === 'mobile') await page.screenshot({ path: resolve(shots, 'pencil-notes-mobile.png'), fullPage: true })
  await page.getByRole('button', { name: /پاک‌کن/ }).click()
  await expect(page.locator('[data-sudoku-cell="1"]')).toBeEmpty()
  await page.getByRole('button', { name: /مداد/ }).click()
  await enterCell(page, 1, 1)
  await expect(page.getByRole('status')).toContainText('تداخل')
  expect(await page.locator('.sudoku-cell.is-conflict').count()).toBeGreaterThanOrEqual(2)
  if (testInfo.project.name === 'mobile') await page.screenshot({ path: resolve(shots, 'conflict-mobile.png'), fullPage: true })
  await page.getByRole('button', { name: 'شروع دوباره', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'جدول از نو شروع شود؟' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'ادامه می‌دهم' }).click()
  await expect(page.locator('[data-sudoku-cell="1"]')).toContainText('۱')
  await page.getByRole('button', { name: 'شروع دوباره', exact: true }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'بله، از نو' }).click()
  await expect(page.locator('[data-sudoku-cell="1"]')).toBeEmpty()
})

test('a correct board completes Stage 5 and opens the final treasure safely', async ({ page }, testInfo) => {
  await openSudoku(page)
  const editable = gameConfig.sudokuGame.puzzle.findIndex(value => value === 0)
  await enterCell(page, editable, 1)
  for (const [index, value] of gameConfig.sudokuGame.solution.entries()) {
    if (gameConfig.sudokuGame.puzzle[index] === 0 && index !== editable) await enterCell(page, index, value)
  }
  await expect(page.getByRole('button', { name: 'رسیدن به گنج' })).toHaveCount(0)
  await enterCell(page, editable, gameConfig.sudokuGame.solution[editable]!)
  await expect(page.getByText('عالیه! سودوکو کامل شد.')).toBeVisible()
  if (testInfo.project.name === 'mobile') await page.screenshot({ path: resolve(shots, 'completed-sudoku-mobile.png'), fullPage: true })

  await page.getByRole('button', { name: 'رسیدن به گنج' }).click()
  const chest = page.getByRole('button', { name: /گنج پایانی/ })
  await expect(chest).toBeDisabled()
  await expect(chest).toHaveClass(/treasure-arriving/)
  await page.waitForTimeout(1500)
  await expect(chest).toBeEnabled()
  if (testInfo.project.name === 'mobile') await page.screenshot({ path: resolve(shots, 'final-map-mobile.png'), fullPage: true })
  await chest.click()
  await expect(page.getByRole('heading', { name: 'گنج پیدا شد!' })).toBeVisible()
  await expect(page.getByText('رسیدی به آخر مسیر.')).toBeVisible()
  await expect(page.getByText('این بار، گنج خودِ تویی.')).toBeVisible()
  await page.waitForTimeout(1000)
  if (testInfo.project.name === 'mobile') await page.screenshot({ path: resolve(shots, 'final-celebration-mobile.png'), fullPage: true })
  await page.getByRole('button', { name: 'بازی دوباره' }).click()
  await expect(page.getByRole('dialog', { name: 'ماجراجویی را از اول شروع کنیم؟' })).toBeVisible()
})
