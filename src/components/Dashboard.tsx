import VideoPlayer from './VideoPlayer'
import ProgressCard from './ProgressCard'
import type { PlaylistVideo } from '../services/youtube'
import { useEffect, useMemo, useState } from 'react'
import { updateStreakForCompletion } from '../utils/date'
import { Sparkles } from 'lucide-react'

interface DashboardProps {}

interface UserSession {
	schedule: Record<string, PlaylistVideo[]>
	currentDay: number
	currentVideoIndex: number
	completedVideos: string[]
	streak: number
	lastCompletedDay: string
}

const Dashboard = (_props: DashboardProps) => {
	const [session, setSession] = useState<UserSession | null>(null)

	useEffect(() => {
		try {
			const raw = localStorage.getItem('skillup_session')
			if (raw) setSession(JSON.parse(raw) as UserSession)
		} catch {}
	}, [])

	const daysKeys = useMemo(() => (session ? Object.keys(session.schedule) : []), [session])
	const todayKey = useMemo(() => (session ? `day${session.currentDay}` : ''), [session])
	const todayVideos = useMemo(() => (session ? session.schedule[todayKey] ?? [] : []), [session, todayKey])
	const totalVideos = useMemo(
		() => (session ? daysKeys.reduce((sum, d) => sum + (session.schedule[d]?.length ?? 0), 0) : 0),
		[session, daysKeys]
	)

	function persist(next: UserSession) {
		setSession(next)
		localStorage.setItem('skillup_session', JSON.stringify(next))
	}

	function handleEnded() {
		if (!session) return
		const current = { ...session }
		const currentList = current.schedule[`day${current.currentDay}`] ?? []
		const currentVideo = currentList[current.currentVideoIndex]
		if (!currentVideo) return

		if (!current.completedVideos.includes(currentVideo.videoId)) {
			current.completedVideos = [...current.completedVideos, currentVideo.videoId]
		}

		const isLastVideoOfDay = current.currentVideoIndex + 1 >= currentList.length
		if (isLastVideoOfDay) {
			const { streak, lastCompletedDay } = updateStreakForCompletion(current.streak, current.lastCompletedDay)
			current.streak = streak
			current.lastCompletedDay = lastCompletedDay
			current.currentDay += 1
			current.currentVideoIndex = 0
		} else {
			current.currentVideoIndex += 1
		}
		persist(current)
	}

	const currentVideoId = todayVideos[session?.currentVideoIndex ?? 0]?.videoId
	const completedCount = session?.completedVideos.length ?? 0
	const overallPct = totalVideos ? Math.round((completedCount / totalVideos) * 100) : 0
	const todaysDone = session ? todayVideos.filter(v => session.completedVideos.includes(v.videoId)).length : 0
	const [nudge, setNudge] = useState<string>('')
	const [loadingNudge, setLoadingNudge] = useState(false)

	async function getNudge() {
		try {
			setLoadingNudge(true)
			const ctx = {
				streak: session?.streak ?? 0,
				progress: overallPct,
				videosLeftToday: todayVideos.length - todaysDone,
			}
			const res = await fetch('/api/generateNudge', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(ctx),
			})
			const json = await res.json()
			setNudge(json.nudge ?? 'Keep going!')
		} catch {
			setNudge('Keep going!')
		} finally {
			setLoadingNudge(false)
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
								const done = session?.completedVideos.includes(v.videoId)
								return (
									<li key={v.videoId} className={`p-3 rounded-lg bg-accent-blue/40 ${done ? 'opacity-60 line-through' : ''}`}>
										{v.title}
									</li>
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
								disabled={loadingNudge}
							>
								<Sparkles className="w-4 h-4" />
								{loadingNudge ? 'Thinking…' : 'Get a Motivation Boost'}
							</button>
						</div>
						{nudge && (
							<div className="mt-3 text-text-dark/90 bg-accent-blue/40 border border-accent-blue/60 rounded-lg p-3">
								{nudge}
							</div>
						)}
					</div>
				</div>
				<div className="space-y-4">
					<ProgressCard title="Overall Progress" value={`${overallPct}%`} />
					<ProgressCard title="Today's Goal" value={`${todaysDone} of ${todayVideos.length}`} />
					<ProgressCard title="Current Streak" value={`${session?.streak ?? 0}`} />
				</div>
			</div>
		</div>
	)
}

export default Dashboard


