import { expect, test, type Page } from '@playwright/test'
import { gameConfig, stageIds } from '../src/config/gameConfig'
import { mapLayouts } from '../src/config/mapConfig'
import { gameReducer, getCurrentStage, isGameState } from '../src/state/gameState'
import { openSavedGame, readSavedValue, serializeSavedGame, stateAfterStages } from './fixtures'

/** Publish an actual reducer result through the existing cross-tab persistence interface. */
async function completeActiveStage(page: Page): Promise<void> {
  const saved: unknown = JSON.parse((await readSavedValue(page)) ?? 'null')
  if (!saved || typeof saved !== 'object' || !('state' in saved) || !isGameState(saved.state)) throw new Error('A valid active game is required.')
  const stage = getCurrentStage(saved.state)
  if (!stage) throw new Error('There is no current game to complete.')
  const next = gameReducer(saved.state, { type: 'COMPLETE_GAME', stage })
  if (next === saved.state) throw new Error('The reducer refused this completion.')
  const writer = await page.context().newPage()
  await writer.goto(page.url())
  await page.bringToFront()
  await writer.evaluate(({ key, value }) => localStorage.setItem(key, value), { key: gameConfig.storage.key, value: serializeSavedGame(next) })
  await writer.close()
}

async function assertPlayerAtDestination(page: Page, destination: 'start' | number | 'treasure') {
  const world = page.locator('.treasure-world')
  await expect(world).toHaveAttribute('data-moving', 'false')
  const mode = await world.getAttribute('data-layout')
  const layout = mapLayouts[mode === 'wide' ? 'wide' : 'portrait']
  const point = layout.stops[destination as keyof typeof layout.stops]
  await expect(page.getByTestId('map-player')).toHaveAttribute('data-destination', String(destination))
  await expect(page.getByTestId('map-player')).toHaveAttribute('transform', `translate(${point.x} ${point.y})`)
}

async function pauseAnimationClock(page: Page) {
  await page.clock.install({ time: new Date('2026-09-12T00:00:00Z') })
  await page.clock.pauseAt(new Date('2026-09-12T00:00:01Z'))
}

test('map landmarks remain separated, tappable and fully inside the world', async ({ page }, testInfo) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'شروع ماجراجویی', exact: true }).click()
  await assertPlayerAtDestination(page, 'start')
  await expect(page.locator('[data-stage="1"]')).toBeEnabled()
  await expect(page.locator('.map-treasure')).toBeDisabled()
  const geometry = await page.evaluate(() => {
    const world = document.querySelector('.treasure-world')!.getBoundingClientRect()
    const boxes = [...document.querySelectorAll('.map-checkpoint')].map(element => {
      const box = element.getBoundingClientRect()
      return { x: box.x, y: box.y, right: box.right, bottom: box.bottom, width: box.width, height: box.height }
    })
    const labels = [...document.querySelectorAll('.checkpoint-label')].map(element => {
      const box = element.getBoundingClientRect()
      return { x: box.x, y: box.y, right: box.right, bottom: box.bottom }
    })
    return { world: { x: world.x, y: world.y, right: world.right, bottom: world.bottom }, boxes, labels,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth }
  })
  expect(geometry.overflow).toBe(false)
  for (const box of geometry.boxes) {
    expect(box.width).toBeGreaterThanOrEqual(44)
    expect(box.height).toBeGreaterThanOrEqual(44)
    expect(box.x).toBeGreaterThanOrEqual(geometry.world.x)
    expect(box.right).toBeLessThanOrEqual(geometry.world.right)
    expect(box.y).toBeGreaterThanOrEqual(geometry.world.y)
    expect(box.bottom).toBeLessThanOrEqual(geometry.world.bottom)
  }
  for (const [index, label] of geometry.labels.entries()) {
    for (const other of geometry.labels.slice(index + 1)) {
      expect(label.right <= other.x || other.right <= label.x || label.bottom <= other.y || other.bottom <= label.y).toBe(true)
    }
  }
  await page.screenshot({ path: testInfo.outputPath('initial-map.png'), fullPage: true })
  for (const stage of stageIds.slice(1)) {
    const locked = page.locator(`[data-stage="${stage}"]`)
    await expect(locked).toBeDisabled()
    await locked.dispatchEvent('click')
    if (testInfo.project.use.hasTouch) {
      const bounds = await locked.boundingBox()
      if (!bounds) throw new Error('A locked landmark must remain visible.')
      await page.touchscreen.tap(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2)
    }
    await expect(page.locator('#map-title')).toBeVisible()
  }
  await page.locator('[data-stage="1"]').focus()
  await expect(page.locator('[data-stage="1"]')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#game-title')).toBeVisible()
})

test('valid completion moves along the route before unlocking; every new game needs a manual click', async ({ page }, testInfo) => {
  await pauseAnimationClock(page)
  await openSavedGame(page, stateAfterStages(0))
  for (const stage of stageIds) {
    const checkpoint = page.locator(`[data-stage="${stage}"]`)
    if (testInfo.project.use.hasTouch) await checkpoint.tap()
    else await checkpoint.click()
    await completeActiveStage(page)
    await expect(page.locator('#map-title')).toBeVisible()
    await expect(page.locator(`[data-stage="${stage}"]`)).toHaveAttribute('data-status', 'completed')
    const next = stageIds.at(stage)
    const target = next ? page.locator(`[data-stage="${next}"]`) : page.locator('.map-treasure')
    await expect(target).toBeDisabled()
    await expect(page.getByTestId('map-player')).toHaveAttribute('data-travelling', 'true')
    const from = await page.getByTestId('map-player').getAttribute('transform')
    await page.clock.runFor(650)
    await expect.poll(() => page.getByTestId('map-player').getAttribute('transform')).not.toBe(from)
    await expect(target).toBeDisabled()
    await page.clock.runFor(750)
    await assertPlayerAtDestination(page, next ?? 'treasure')
    await expect(target).toBeEnabled()
    await expect(page.locator('#map-title')).toBeVisible()
    const overlapsLabel = await page.evaluate(() => {
      const player = document.querySelector('[data-testid="map-player"]')!.getBoundingClientRect()
      return [...document.querySelectorAll('.checkpoint-label')].some(element => {
        const label = element.getBoundingClientRect()
        return player.left < label.right && player.right > label.left && player.top < label.bottom && player.bottom > label.top
      })
    })
    expect(overlapsLabel, 'The resting character must not obscure any checkpoint label.').toBe(false)
    if (stage === 2) await page.screenshot({ path: testInfo.outputPath('progressed-map.png'), fullPage: true })
  }
  await expect(page.locator('.map-treasure .landmark-art')).toBeVisible()
  await page.reload()
  await assertPlayerAtDestination(page, 'treasure')
})

test('refresh during travel restores the earned destination without replaying animation', async ({ page }) => {
  await pauseAnimationClock(page)
  await openSavedGame(page, gameReducer(stateAfterStages(1), { type: 'OPEN_GAME', stage: 2 }))
  await completeActiveStage(page)
  await expect(page.locator('.treasure-world')).toHaveAttribute('data-moving', 'true')
  await page.reload()
  await assertPlayerAtDestination(page, 3)
  await expect(page.locator('[data-stage="3"]')).toBeEnabled()
  await expect(page.locator('[data-stage="2"]')).toHaveAttribute('data-status', 'completed')
})

test('reduced motion and responsive layout changes preserve progression and destination', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openSavedGame(page, gameReducer(stateAfterStages(0), { type: 'OPEN_GAME', stage: 1 }))
  await completeActiveStage(page)
  await assertPlayerAtDestination(page, 2)
  await expect(page.locator('[data-stage="2"] .checkpoint-aura')).toHaveCSS('animation-name', 'none')
  await page.setViewportSize({ width: 1024, height: 900 })
  await assertPlayerAtDestination(page, 2)
  await page.setViewportSize({ width: 390, height: 844 })
  await assertPlayerAtDestination(page, 2)
  await page.locator('[data-stage="2"]').click()
  await expect(page.locator('#game-title')).toBeVisible()
})

test('confirmed restart cancels travel and restores the initial map', async ({ page }) => {
  await pauseAnimationClock(page)
  await openSavedGame(page, gameReducer(stateAfterStages(2), { type: 'OPEN_GAME', stage: 3 }))
  await completeActiveStage(page)
  await page.getByRole('button', { name: 'شروع دوبارهٔ ماجراجویی', exact: true }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'بله، از اول شروع کن', exact: true }).click()
  expect(await readSavedValue(page)).toBeNull()
  await page.getByRole('button', { name: 'شروع ماجراجویی', exact: true }).click()
  await assertPlayerAtDestination(page, 'start')
  await expect(page.locator('[data-stage="1"]')).toBeEnabled()
  await expect(page.locator('[data-stage="4"]')).toBeDisabled()
  await page.reload()
  await assertPlayerAtDestination(page, 'start')
})
