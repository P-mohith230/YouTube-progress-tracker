import type { PlaylistData, PlaylistVideo } from '../services/youtube'
import { useMemo, useState } from 'react'

interface SchedulerProps {
	playlist: PlaylistData
	onConfirm: (plan: Record<string, PlaylistVideo[]>, meta: { days: number; dailyHours: number }) => void
}

function secondsToHhMm(ss: number): string {
	const h = Math.floor(ss / 3600)
	const m = Math.floor((ss % 3600) / 60)
	return `${h}h ${m}m`
}

export function createSchedule(
	playlistData: PlaylistData,
	userSchedule: { days: number; dailyHours: number }
): Record<string, PlaylistVideo[]> {
	const targetPerDaySeconds = Math.max(1, Math.floor(userSchedule.dailyHours * 3600))
	const result: Record<string, PlaylistVideo[]> = {}
	let day = 1
	let currentDayAccum = 0
	let bucket: PlaylistVideo[] = []

	for (const video of playlistData.videos) {
		// if adding this video exceeds target and we still have remaining days, push to next day
		if (
			bucket.length > 0 &&
			currentDayAccum + video.durationSeconds > targetPerDaySeconds &&
			day < userSchedule.days
		) {
			result[`day${day}`] = bucket
			day += 1
			bucket = []
			currentDayAccum = 0
		}
		bucket.push(video)
		currentDayAccum += video.durationSeconds
	}

	if (bucket.length > 0) {
		result[`day${day}`] = bucket
	}

	// If we still have more days than filled, add empty days
	for (let d = day + 1; d <= userSchedule.days; d++) {
		result[`day${d}`] = []
	}

	return result
}

const Scheduler = ({ playlist, onConfirm }: SchedulerProps) => {
	const [days, setDays] = useState(5)
	const [dailyHours, setDailyHours] = useState(1)

	const previewPlan = useMemo(
		() => createSchedule(playlist, { days, dailyHours }),
		[playlist, days, dailyHours]
	)

	return (
		<div className="min-h-screen p-6 sm:p-8 bg-accent-blue">
			<div className="max-w-3xl mx-auto bg-primary rounded-xl p-6 shadow-sm border border-accent-blue/50">
				<h2 className="text-2xl font-bold text-text-dark mb-2">{playlist.title}</h2>
				<p className="text-text-light mb-6">
					Total duration: {secondsToHhMm(playlist.totalDurationSeconds)} • Videos: {playlist.videos.length}
				</p>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
					<label className="flex flex-col gap-2">
						<span className="text-sm text-text-light">How many days to complete?</span>
						<input
							type="number"
							min={1}
							value={days}
							onChange={(e) => setDays(Math.max(1, Number(e.target.value)))}
							className="rounded-lg border border-accent-blue/50 px-3 py-2 text-text-dark"
						/>
					</label>
					<label className="flex flex-col gap-2">
						<span className="text-sm text-text-light">Daily hours</span>
						<input
							type="number"
							min={0.25}
							step={0.25}
							value={dailyHours}
							onChange={(e) => setDailyHours(Math.max(0.25, Number(e.target.value)))}
							className="rounded-lg border border-accent-blue/50 px-3 py-2 text-text-dark"
						/>
					</label>
				</div>

				<div className="max-h-72 overflow-auto border border-accent-blue/50 rounded-lg">
					{Object.entries(previewPlan).map(([dayKey, vids]) => (
						<div key={dayKey} className="p-4 border-b last:border-b-0 border-accent-blue/50">
							<p className="font-semibold text-text-dark mb-2 capitalize">{dayKey}</p>
							<ul className="space-y-1">
								{vids.length === 0 && (
									<li className="text-sm text-text-light">No videos</li>
								)}
								{vids.map((v) => (
									<li key={v.videoId} className="text-sm text-text-dark">
										{v.title}
									</li>
								))}
							</ul>
						</div>
					))}
				</div>

				<div className="flex justify-end mt-6">
					<button
						className="inline-flex items-center gap-2 bg-accent-pink hover:bg-accent-pink/80 text-text-dark font-semibold px-5 py-3 rounded-lg transition-colors"
						onClick={() => onConfirm(previewPlan, { days, dailyHours })}
					>
						Confirm Plan
					</button>
				</div>
			</div>
		</div>
	)
}

export default Scheduler


