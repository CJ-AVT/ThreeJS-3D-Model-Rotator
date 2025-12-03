import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { GameProvider } from "./providers/appConfig.tsx"
import ConfigLoader from "./components/ConfigLoader"
import "./tailwind.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GameProvider>
      <ConfigLoader />
    </GameProvider>
  </StrictMode>,
)
