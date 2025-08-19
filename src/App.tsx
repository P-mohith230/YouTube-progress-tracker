import { useEffect, useState } from 'react'
import LandingPage from './components/LandingPage'
import Dashboard from './components/Dashboard'
import Scheduler from './components/Scheduler'
import PlaylistDashboard from './components/PlaylistDashboard'
import { extractPlaylistIdFromUrl, fetchPlaylistData, type PlaylistData } from './services/youtube'
import { Toaster, toast } from 'react-hot-toast'
import { SessionProvider, useSession } from './context/SessionContext'
import Header from './components/Header'

function AppBody() {
	const [stage, setStage] = useState<'landing' | 'scheduler' | 'dashboard' | 'home'>('landing')
	const [playlist, setPlaylist] = useState<PlaylistData | null>(null)
	const { state, addNewPlaylist, setActivePlaylist } = useSession()

	useEffect(() => {
		try {
			const raw = localStorage.getItem('skillup_session')
			if (raw) setStage('home')
			else setStage('landing')
		} catch { setStage('landing') }
	}, [])

	useEffect(() => {
		if (state.activePlaylistId) setStage('dashboard')
	}, [state.activePlaylistId])

	async function handleSubmitUrl(url: string) {
		const playlistId = extractPlaylistIdFromUrl(url)
		if (!playlistId) throw new Error('Invalid URL')
		const data = await fetchPlaylistData(playlistId)
		setPlaylist(data)
		setStage('scheduler')
	}

	function handleConfirm(plan: any) {
		if (!playlist) return
		const session = {
			id: crypto.randomUUID(),
			playlistTitle: playlist.title,
			schedule: plan,
			currentDay: 1,
			currentVideoIndex: 0,
			completedVideos: [],
			streak: 0,
			lastCompletedDay: ''
		}
		addNewPlaylist(session)
		toast.success('Your learning plan is ready!')
		setStage('dashboard')
	}

	function goHome() {
		setStage('home')
		setActivePlaylist(null)
	}

	function goAddNew() {
		setPlaylist(null)
		setActivePlaylist(null)
		setStage('landing')
	}

	function goViewActive() {
		if (state.activePlaylistId) setStage('dashboard')
	}

	return (
		<div className="min-h-screen">
			<Header onHome={goHome} onAddNew={goAddNew} onViewActive={goViewActive} />
			{stage === 'landing' && <LandingPage onSubmitUrl={handleSubmitUrl} />}
			{stage === 'home' && <PlaylistDashboard onAddNew={goAddNew} />}
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

function App() {
	return (
		<SessionProvider>
			<Toaster position="top-right" />
			<AppBody />
		</SessionProvider>
	)
}

export default App
