import { useNavigate, useSearchParams } from 'react-router-dom'
import { SiteLayout } from '../components/layout/SiteLayout'
import { LobbyModal } from '../components/Modals/Lobby'
import { PortraitRotatePrompt } from '../components/layout/game/PortraitRotatePrompt'

type LobbyMode = 'menu' | 'create' | 'join'

function initialModeFromParams(params: URLSearchParams): LobbyMode {
  if (params.has('join')) return 'join'
  if (params.has('create')) return 'create'
  return 'menu'
}

export function LobbyPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  return (
    <SiteLayout>
      <PortraitRotatePrompt />
      <LobbyModal
        initialMode={initialModeFromParams(searchParams)}
        onGameStart={() => navigate('/game')}
      />
    </SiteLayout>
  )
}
