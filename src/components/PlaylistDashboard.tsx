import { useMemo } from 'react'
import { useSession } from '../context/SessionContext'

const PlaylistDashboard = ({ onAddNew }: { onAddNew: () => void }) => {
	const { state, setActivePlaylist } = useSession()
	const totals = useMemo(() => {
		return state.playlists.map((p) => ({
			id: p.id,
			title: p.playlistTitle,
			completed: p.completedVideos.length,
			total: Object.values(p.schedule).reduce((sum, arr) => sum + arr.length, 0),
		}))
	}, [state.playlists])

	return (
		<div className="min-h-screen p-6 sm:p-8 bg-accent-blue">
			<div className="max-w-7xl mx-auto">
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-2xl font-bold text-text-dark">Your Playlists</h2>
					<button className="bg-accent-pink hover:bg-accent-pink/80 text-text-dark font-semibold px-4 py-2 rounded-lg" onClick={onAddNew}>
						Add New Playlist
					</button>
				</div>
				{totals.length === 0 ? (
					<div className="bg-primary rounded-xl p-6 border border-accent-blue/50 text-text-light">No playlists yet. Add one to get started.</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{totals.map((t) => {
							const pct = t.total ? Math.round((t.completed / t.total) * 100) : 0
							return (
								<button key={t.id} onClick={() => setActivePlaylist(t.id)} className="text-left">
									<div className="bg-primary rounded-xl p-5 shadow-sm border border-accent-blue/50">
										<p className="text-sm text-text-light mb-2">{t.title}</p>
										<div className="text-2xl font-bold text-text-dark mb-2">{pct}%</div>
										<div className="h-2 bg-accent-blue/50 rounded-full overflow-hidden">
											<div className="h-full bg-accent-pink" style={{ width: `${pct}%` }} />
										</div>
									</div>
								</button>
							)
						})}
					</div>
				)}
			</div>
		</div>
	)
}

export default PlaylistDashboard


