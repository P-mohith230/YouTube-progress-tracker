import { useEffect, useState } from 'react'
import LandingPage from './components/LandingPage'
import Dashboard from './components/Dashboard'
import Scheduler from './components/Scheduler'
import { extractPlaylistIdFromUrl, fetchPlaylistData, type PlaylistData, type PlaylistVideo } from './services/youtube'
import { useLocalStorage } from './hooks/useLocalStorage'

function App() {
	const [stage, setStage] = useState<'landing' | 'scheduler' | 'dashboard'>('landing')
	const [playlist, setPlaylist] = useState<PlaylistData | null>(null)
	const [_session, setSession] = useLocalStorage<UserSession | null>('skillup_session', null)

	type Schedule = Record<string, PlaylistVideo[]>
	interface UserSession {
		schedule: Schedule
		currentDay: number
		currentVideoIndex: number
		completedVideos: string[]
		streak: number
		lastCompletedDay: string
	}

	useEffect(() => {
		try {
			const raw = localStorage.getItem('skillup_session')
			if (raw) setStage('dashboard')
		} catch {}
	}, [])

	async function handleSubmitUrl(url: string) {
		const playlistId = extractPlaylistIdFromUrl(url)
		if (!playlistId) return
		try {
			const data = await fetchPlaylistData(playlistId)
			setPlaylist(data)
			setStage('scheduler')
		} catch (e) {
			console.error(e)
		}
	}

	function handleConfirm(userPlan: Record<string, PlaylistVideo[]>) {
		const initial: UserSession = {
			schedule: userPlan,
			currentDay: 1,
			currentVideoIndex: 0,
			completedVideos: [],
			streak: 0,
			lastCompletedDay: ''
		}
		setSession(initial)
		setStage('dashboard')
	}

	return (
		<div className="min-h-screen">
			{stage === 'landing' && <LandingPage onSubmitUrl={handleSubmitUrl} />}
			{stage === 'scheduler' && playlist && (
				<Scheduler
					playlist={playlist}
					onConfirm={(p) => handleConfirm(p)}
				/>
			)}
			{stage === 'dashboard' && <Dashboard />}
		</div>
	)
}

export default App
