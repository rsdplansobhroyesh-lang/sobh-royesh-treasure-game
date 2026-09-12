export const stageIds = [1, 2, 3, 4, 5] as const

export type StageId = (typeof stageIds)[number]

export const gameConfig = {
  primaryColor: '#0D7572',
  storage: {
    key: 'sobh-royesh:adventure',
    schemaVersion: 1,
  },
  memoryGame: {
    correctAnswer: 7,
    initialObservationMs: 10_000,
    retryObservationMs: 5_000,
    yellowObjects: [
      'backpack',
      'ruler',
      'notebook',
      'pencil-case',
      'cup',
      'ball',
      'lunch-box',
    ],
  },
  timerGame: {
    targetCentiseconds: 1_000,
    maxAttempts: 3,
    magicDurationMs: 900,
  },
  imageGuessGame: {
    imagePath: 'assets/dehkadeh.jpg',
    zoomScale: 3.2,
    focalX: 28,
    focalY: 58,
    maxNormalAttempts: 3,
    magicDurationMs: 850,
  },
  mazeGame: {
    width: 350,
    height: 450,
    cellSize: 50,
    baseTolerance: 2,
    assistedTolerance: 5,
    assistanceAfterFailures: 2,
  },
  sudokuGame: {
    size: 6,
    boxRows: 2,
    boxColumns: 3,
    puzzle: [
      1, 0, 0, 4, 0, 6,
      0, 5, 6, 0, 2, 0,
      2, 0, 4, 0, 0, 1,
      0, 6, 0, 2, 3, 0,
      3, 0, 5, 0, 1, 0,
      0, 1, 0, 3, 0, 5,
    ],
    solution: [
      1, 2, 3, 4, 5, 6,
      4, 5, 6, 1, 2, 3,
      2, 3, 4, 5, 6, 1,
      5, 6, 1, 2, 3, 4,
      3, 4, 5, 6, 1, 2,
      6, 1, 2, 3, 4, 5,
    ],
  },
  stages: [
    { id: 1, title: 'آزمون حافظهٔ تصویری' },
    { id: 2, title: 'چالش توقف تایمر' },
    { id: 3, title: 'حدس تصویر' },
    { id: 4, title: 'هزارتوی مدرسه' },
    { id: 5, title: 'سودوکوی کوچک' },
  ] satisfies ReadonlyArray<{ id: StageId; title: string }>,
} as const
