import { Vector3Object } from "@react-three/rapier"
import { useGameConfig } from "@/providers/appConfig"

export type bubbleT = {
  position: Vector3Object
  id: number
  size: number
  textContent: string
  points: number
  fontSize: number
}

export function useGameData(width: number, height: number): bubbleT[] {
  const { content, settings } = useGameConfig()

  const totalBubbles = settings.totalBubbles
  const textContent = content.bubbles.map((val) => val.bubbleText)
  const points = content.bubbles.map((val) => val.points)
  const size = content.bubbles.map((val) => val.size)
  const fontSizes = content.bubbles.map((val) => val.fontSize)

  const clamp = (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max)
  }

  const createArray = (size: number): Vector3Object[] => {
    let result: Vector3Object[] = []
    const gap = settings.positionalGap * size
    for (let x = -width / 2; x < width / 2; x += gap) {
      for (let y = -height / 2; y < height / 2; y += gap) {
        const clampedX = clamp(x, -width / 2 + size, width / 2 - size)
        const clampedY = clamp(y, -height / 2 + size, height / 2 - size)
        result = [...result, { x: clampedX, y: clampedY, z: -1 }]
      }
    }
    return result
  }

  const shuffleArray = (array: Vector3Object[]): Vector3Object[] => {
    const arrayCopy = [...array]
    for (let i = arrayCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = arrayCopy[i]
      arrayCopy[i] = arrayCopy[j]
      arrayCopy[j] = temp
    }
    return arrayCopy
  }

  const makeBubbles = (array: Vector3Object[]): bubbleT[] => {
    return array.map((pos, index) => ({
      position: pos,
      id: index,
      size: size[index] ?? 1,
      points: points[index] ?? 0,
      textContent: textContent[index] ?? "",
      // If the bubble's fontSize is 0 or undefined, use the global content.fontSize.
      fontSize: fontSizes[index] || settings.bubbleFontSize,
    }))
  }

  const assignPositions = () => {
    let bubbleCount = totalBubbles

    if (bubbleCount > width * height) {
      bubbleCount = Math.floor(width * height)
    }

    const largestsize = Math.max(...size)
    const positions = createArray(largestsize)
    let shuffledPositions = shuffleArray(positions)

    if (bubbleCount > shuffledPositions.length) {
      bubbleCount = shuffledPositions.length
    } else {
      shuffledPositions = shuffledPositions.slice(0, bubbleCount)
    }

    return makeBubbles(shuffledPositions)
  }

  return assignPositions()
}
