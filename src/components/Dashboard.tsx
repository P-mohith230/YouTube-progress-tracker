import VideoPlayer from './VideoPlayer'
import ProgressCard from './ProgressCard'
import { useMemo } from 'react'
import { Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSession } from '../context/SessionContext'
import { toast } from 'react-hot-toast'

interface DashboardProps {}

const Dashboard = (_props: DashboardProps) => {
	const { state, completeVideo } = useSession()
	const active = state.playlists.find((p) => p.id === state.activePlaylistId)

	const daysKeys = useMemo(() => (active ? Object.keys(active.schedule) : []), [active])
	const todayKey = useMemo(() => (active ? `day${active.currentDay}` : ''), [active])
	const todayVideos = useMemo(() => (active ? active.schedule[todayKey] ?? [] : []), [active, todayKey])
	const totalVideos = useMemo(
		() => (active ? daysKeys.reduce((sum, d) => sum + (active.schedule[d]?.length ?? 0), 0) : 0),
		[active, daysKeys]
	)

	function handleEnded() {
		if (!active) return
		const list = active.schedule[`day${active.currentDay}`] ?? []
		const isLast = active.currentVideoIndex + 1 >= list.length
		completeVideo()
		if (isLast) {
			toast.success('Nice! Streak updated')
		}
	}

	if (!active) {
		return (
			<div className="min-h-screen p-6 sm:p-8 bg-accent-blue">
				<div className="max-w-3xl mx-auto bg-primary rounded-xl p-6 border border-accent-blue/50 text-text-light">Select a playlist from Home.</div>
			</div>
		)
	}

	const currentVideoId = todayVideos[active.currentVideoIndex]?.videoId
	const completedCount = active.completedVideos.length
	const overallPct = totalVideos ? Math.round((completedCount / totalVideos) * 100) : 0
	const todaysDone = todayVideos.filter(v => active.completedVideos.includes(v.videoId)).length

	async function getNudge() {
		try {
			const ctx = {
				streak: active?.streak ?? 0,
				progress: overallPct,
				videosLeftToday: todayVideos.length - todaysDone,
			}
			const res = await fetch('/api/generateNudge', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(ctx),
			})
			const json = await res.json()
			toast(json.nudge ?? 'Keep going!')
		} catch {
			toast('Keep going!')
		}
	}

	return (
		<div className="min-h-screen p-6 sm:p-8 bg-accent-blue">
			<div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2 space-y-4">
					<VideoPlayer videoId={currentVideoId} onEnded={handleEnded} />
					<div className="bg-primary rounded-xl p-5 shadow-sm border border-accent-blue/50">
						<h2 className="text-lg font-semibold text-text-dark mb-3">Today's Videos</h2>
						<ul className="space-y-2 text-text-dark">
							{todayVideos.map((v) => {
								const done = active.completedVideos.includes(v.videoId)
								return (
									<motion.li key={v.videoId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-3 rounded-lg bg-accent-blue/40 ${done ? 'opacity-60 line-through' : ''}`}>
										{v.title}
									</motion.li>
								)
							})}
						</ul>
					</div>
					<div className="bg-primary rounded-xl p-5 shadow-sm border border-accent-blue/50">
						<div className="flex items-center justify-between gap-3">
							<h3 className="font-semibold text-text-dark">Need a push?</h3>
							<button
								className="inline-flex items-center gap-2 bg-accent-pink hover:bg-accent-pink/80 text-text-dark font-semibold px-4 py-2 rounded-lg transition-colors"
								onClick={getNudge}
							>
								<Sparkles className="w-4 h-4" />
								Get a Motivation Boost
							</button>
						</div>
					</div>
				</div>
				<div className="space-y-4">
					<ProgressCard title="Overall Progress" value={`${overallPct}%`} />
					<ProgressCard title="Today's Goal" value={`${todaysDone} of ${todayVideos.length}`} />
					<ProgressCard title="Current Streak" value={`${active.streak}`} />
				</div>
			</div>
		</div>
	)
}

export default Dashboard


