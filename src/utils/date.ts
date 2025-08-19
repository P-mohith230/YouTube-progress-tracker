function pad2(n: number): string {
	return n < 10 ? `0${n}` : `${n}`
}

export function localDateKey(date: Date = new Date()): string {
	const y = date.getFullYear()
	const m = pad2(date.getMonth() + 1)
	const d = pad2(date.getDate())
	return `${y}-${m}-${d}`
}

function daysBetweenLocal(a: string, b: string): number {
	// a and b are 'YYYY-MM-DD' local date keys
	const [ay, am, ad] = a.split('-').map((x) => parseInt(x, 10))
	const [by, bm, bd] = b.split('-').map((x) => parseInt(x, 10))
	const aDate = new Date(ay, (am ?? 1) - 1, ad ?? 1)
	const bDate = new Date(by, (bm ?? 1) - 1, bd ?? 1)
	const ms = bDate.getTime() - aDate.getTime()
	return Math.round(ms / (1000 * 60 * 60 * 24))
}

export function updateStreakForCompletion(
	currentStreak: number,
	lastCompletedDay: string
): { streak: number; lastCompletedDay: string } {
	const todayKey = localDateKey()
	if (!lastCompletedDay) {
		return { streak: 1, lastCompletedDay: todayKey }
	}
	if (lastCompletedDay === todayKey) {
		return { streak: currentStreak, lastCompletedDay }
	}
	const diff = daysBetweenLocal(lastCompletedDay, todayKey)
	if (diff === 1) {
		return { streak: currentStreak + 1, lastCompletedDay: todayKey }
	}
	if (diff > 1) {
		return { streak: 1, lastCompletedDay: todayKey }
	}
	// diff < 1 means stored date is in the future; keep as is
	return { streak: currentStreak, lastCompletedDay }
}



