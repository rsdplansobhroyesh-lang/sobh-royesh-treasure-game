import type { CSSProperties } from 'react'
import { gameConfig } from '../../config/gameConfig'

interface ImageGuessPhotoProps {
  zoomScale: number
  focalX: number
  focalY: number
  revealed: boolean
}

export function ImageGuessPhoto({ zoomScale, focalX, focalY, revealed }: ImageGuessPhotoProps) {
  const imageStyle: CSSProperties = revealed
    ? {}
    : {
        width: `${zoomScale * 100}%`,
        left: `${50 - focalX * zoomScale}%`,
        top: `${50 - focalY * zoomScale}%`,
      }

  return <figure className={`image-guess-frame${revealed ? ' image-guess-frame-revealed' : ''}`} data-revealed={revealed}>
    <img
      src={`${import.meta.env.BASE_URL}${gameConfig.imageGuessGame.imagePath}`}
      alt={revealed ? 'نمای کامل دهکده صبح رویش' : 'بخشی بزرگ‌نمایی‌شده از تصویر معما'}
      style={imageStyle}
      draggable={false}
    />
    {!revealed && <span className="image-guess-zoom-badge" aria-hidden="true">نمای نزدیک</span>}
  </figure>
}
