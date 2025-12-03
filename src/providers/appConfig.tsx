import {
  type PropsWithChildren,
  createContext,
  useContext,
  useCallback,
  useState,
  Suspense,
  type ReactElement,
} from "react"

import type { TAppConfig } from "@/types/types"

const GameConfigContext = createContext<TAppConfig | undefined>(undefined)

const createResource = <T,>(promise: Promise<T>) => {
  let status = "pending"
  let result: T
  const suspender = promise.then(
    (r) => {
      status = "success"
      result = r
    },
    (e) => {
      status = "error"
      result = e
    },
  )

  return {
    read() {
      if (status === "pending") throw suspender
      if (status === "error") throw result
      return result
    },
  }
}

const appDataPromise = async (): Promise<TAppConfig> => {
  const res = await fetch("./app-config/appConfig.json")
  const appConfig = (await res.json()) as TAppConfig

  return appConfig
}

const appResource = createResource(appDataPromise())

const useGameConfig = () => {
  const context = useContext(GameConfigContext)
  if (!context) {
    throw new Error("useAppConfig must be used within a AppConfigProvider")
  }

  const { content, theme, settings, assets, finished, setFinished } = context
  const [totalGameScore, setTotalGameScore] = useState<number>(0)

  const handleEnd = useCallback(() => {
    window.parent.postMessage({ message: "finish" }, "*")
  }, [])

  const handleScore = (points: number, text: string) => {
    console.log("update score: " + points)
    window.parent.postMessage(
      {
        message: "updateScore",
        value: points,
        choice: text,
      },
      "*",
    )
  }

  const resetGame = useCallback(() => {
    window.parent.postMessage({ message: "reset" }, "*")
  }, [])

  return {
    content,
    theme,
    assets,
    settings,
    handleEnd,
    handleScore,
    resetGame,
    finished,
    setFinished,
    totalGameScore,
    setTotalGameScore,
  }
}

const GameConfig = ({ children }: PropsWithChildren): ReactElement => {
  const [finished, setFinished] = useState<boolean>(false)
  const appConfig = appResource.read()
  return (
    <GameConfigContext.Provider value={{ ...appConfig, finished, setFinished }}>
      {children}
    </GameConfigContext.Provider>
  )
}

const GameProvider = ({ children }: PropsWithChildren): ReactElement => {
  return (
    <Suspense fallback={<div></div>}>
      <GameConfig>{children}</GameConfig>
    </Suspense>
  )
}

GameProvider.displayName = "AppConfigProvider"

export { GameProvider, useGameConfig }
