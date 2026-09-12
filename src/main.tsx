import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './styles/tokens.css'
import './styles/fonts.css'
import './styles/global.css'
import './styles/map.css'
import './styles/memory.css'
import './styles/timer.css'
import './styles/imageGuess.css'
import './styles/maze.css'
import './styles/sudoku.css'
import './styles/finalTreasure.css'

const root = document.getElementById('root')
if (!root) throw new Error('The application root is missing.')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
