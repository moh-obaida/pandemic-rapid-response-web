import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Spinner } from './components/layout/Spinner'

const LandingPage = lazy(() =>
  import('./pages/LandingPage').then((m) => ({ default: m.LandingPage }))
)
const LobbyPage = lazy(() =>
  import('./pages/Lobby').then((m) => ({ default: m.LobbyPage }))
)
const GamePage = lazy(() =>
  import('./pages/Game').then((m) => ({ default: m.GamePage }))
)
const StatsPage = lazy(() =>
  import('./pages/Stats').then((m) => ({ default: m.StatsPage }))
)
const HowToPlayPage = lazy(() =>
  import('./pages/HowToPlay').then((m) => ({ default: m.HowToPlayPage }))
)
const RulesPage = lazy(() =>
  import('./pages/Rules').then((m) => ({ default: m.RulesPage }))
)
const RolesPage = lazy(() =>
  import('./pages/Roles').then((m) => ({ default: m.RolesPage }))
)
const FaqPage = lazy(() =>
  import('./pages/Faq').then((m) => ({ default: m.FaqPage }))
)
const AboutPage = lazy(() =>
  import('./pages/About').then((m) => ({ default: m.AboutPage }))
)
const PrivacyPage = lazy(() =>
  import('./pages/Privacy').then((m) => ({ default: m.PrivacyPage }))
)

function Loading() {
  return (
    <div className="game-viewport flex items-center justify-center bg-canvas">
      <Spinner label="Loading mission console..." />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/play" element={<LobbyPage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/how-to-play" element={<HowToPlayPage />} />
          <Route path="/rules" element={<RulesPage />} />
          <Route path="/roles" element={<RolesPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
