import { useNavigate } from 'react-router-dom'
import { LobbyModal } from '../components/Modals/Lobby'

export function LobbyPage() {
  const navigate = useNavigate()

  return <LobbyModal onGameStart={() => navigate('/game')} />
}
