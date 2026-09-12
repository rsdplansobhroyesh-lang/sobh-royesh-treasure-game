import { expect, test, type Page } from '@playwright/test'
import { cellCenter, goalCell, startCell, validRoute, type MazePoint } from '../src/games/maze/mazeGeometry'
import { openSavedGame, readSavedValue, stateAfterStages } from './fixtures'

async function openMaze(page: Page) {
  await openSavedGame(page, stateAfterStages(3))
  await page.locator('[data-stage="4"]').click()
  await expect(page.getByRole('heading', { name: 'راه مدرسه را پیدا کن', exact: true })).toBeVisible()
}

async function screenPoint(page: Page, point: MazePoint) {
  const box = await page.getByTestId('maze-board').boundingBox()
  if (!box) throw new Error('Maze board is not visible.')
  return { x: box.x + point.x / 350 * box.width, y: box.y + point.y / 450 * box.height }
}

async function beginAt(page: Page, point: MazePoint) {
  const screen = await screenPoint(page, point)
  await page.mouse.move(screen.x, screen.y)
  await page.mouse.down()
}

async function moveTo(page: Page, point: MazePoint) {
  const screen = await screenPoint(page, point)
  await page.mouse.move(screen.x, screen.y)
}

async function followValidRoute(page: Page) {
  await beginAt(page, cellCenter(startCell))
  for (const cell of validRoute.slice(1)) await moveTo(page, cellCenter(cell))
  await page.mouse.up()
}

test('Game 4 opens only when available and keeps Stage 5 locked', async ({ page }, testInfo) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'شروع ماجراجویی', exact: true }).click()
  await expect(page.locator('[data-stage="4"]')).toBeDisabled()
  await page.locator('[data-stage="4"]').dispatchEvent('click')
  await expect(page.locator('#map-title')).toBeVisible()

  await openMaze(page)
  await expect(page.getByText('مدرسه صبح رویش', { exact: true })).toBeVisible()
  await expect(page.getByTestId('maze-board')).toHaveAttribute('data-phase', 'idle')
  if (testInfo.project.name === 'mobile') {
    await page.screenshot({ path: testInfo.outputPath('initial-maze-mobile.png'), fullPage: true, animations: 'disabled', style: '.skip-link { display: none !important; }' })
  }
  if (testInfo.project.name === 'desktop') {
    await page.screenshot({ path: testInfo.outputPath('maze-desktop.png'), fullPage: true, animations: 'disabled', style: '.skip-link { display: none !important; }' })
  }
  await page.reload()
  await expect(page.getByTestId('maze-board')).toHaveAttribute('data-phase', 'idle')
})

test('start gating, segment collision, cancellation, and repeated failures reset safely', async ({ page }, testInfo) => {
  await openMaze(page)
  const board = page.getByTestId('maze-board')

  await beginAt(page, cellCenter({ row: 8, column: 1 }))
  await moveTo(page, cellCenter({ row: 8, column: 2 }))
  await page.mouse.up()
  await expect(board).toHaveAttribute('data-phase', 'idle')
  await expect(page.getByTestId('maze-status')).toContainText('اول خودِ پسر')

  await beginAt(page, cellCenter(startCell))
  await moveTo(page, cellCenter(validRoute[1]!))
  await expect(board).toHaveAttribute('data-phase', 'active')
  await expect(page.getByTestId('maze-trail')).toHaveCount(1)
  if (testInfo.project.name === 'mobile') {
    await page.screenshot({ path: testInfo.outputPath('active-maze-mobile.png'), fullPage: true, animations: 'disabled', style: '.skip-link { display: none !important; }' })
  }
  await moveTo(page, cellCenter(goalCell))
  await expect(page.getByTestId('maze-status')).toContainText('اوه! به دیوار خوردی. دوباره امتحان کن.')
  await expect(page.getByTestId('maze-trail')).toHaveCount(0)
  if (testInfo.project.name === 'mobile') {
    await page.screenshot({ path: testInfo.outputPath('wall-collision-mobile.png'), fullPage: true, animations: 'disabled', style: '.skip-link { display: none !important; }' })
  }

  await beginAt(page, cellCenter(startCell))
  await moveTo(page, cellCenter(goalCell))
  await expect(page.getByTestId('maze-status')).toContainText('به دیوار خوردی')
  await expect(board).toHaveAttribute('data-assisted', 'true')

  await beginAt(page, cellCenter(startCell))
  await board.dispatchEvent('pointercancel', { pointerId: 1, pointerType: 'mouse', clientX: 0, clientY: 0 })
  await expect(board).toHaveAttribute('data-phase', 'idle')
  await expect(page.getByTestId('maze-trail')).toHaveCount(0)
})

test('a representative pointer route reaches school and unlocks Stage 5', async ({ page }, testInfo) => {
  await openMaze(page)
  await followValidRoute(page)
  await expect(page.getByTestId('maze-success')).toContainText('رسیدی به مدرسه!')
  if (testInfo.project.name === 'mobile') {
    await page.screenshot({ path: testInfo.outputPath('maze-success-mobile.png'), fullPage: true, animations: 'disabled', style: '.skip-link { display: none !important; }' })
  }
  await page.getByRole('button', { name: 'ادامه مسیر', exact: false }).click()
  await expect(page.locator('[data-stage="4"]')).toHaveAttribute('data-status', 'completed')
  await expect(page.locator('[data-stage="5"]')).toBeDisabled()
  await expect(page.locator('[data-stage="5"]')).toBeEnabled({ timeout: 3_000 })
  expect(JSON.parse((await readSavedValue(page)) ?? 'null').state.completedStages).toEqual([1, 2, 3, 4])
})
