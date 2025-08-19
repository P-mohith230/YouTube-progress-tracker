import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { UserSession, AppState } from '../types'
import { updateStreakForCompletion } from '../utils/date'

interface SessionContextValue {
	state: AppState
	setActivePlaylist: (id: string | null) => void
	addNewPlaylist: (session: UserSession) => void
	completeVideo: () => void
	resetAllProgress: () => void
}

const defaultState: AppState = { activePlaylistId: null, playlists: [] }
const SessionContext = createContext<SessionContextValue | undefined>(undefined)

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
	const [state, setState] = useState<AppState>(defaultState)

	useEffect(() => {
		try {
			const raw = localStorage.getItem('skillup_session')
			if (raw) {
				const parsed = JSON.parse(raw)
				// Backward compatibility: migrate single session to AppState
				if (parsed && !('playlists' in parsed)) {
					const migrated: AppState = {
						activePlaylistId: null,
						playlists: [],
					}
					setState(migrated)
				} else {
					setState(parsed as AppState)
				}
			}
		} catch {}
	}, [])

	useEffect(() => {
		try { localStorage.setItem('skillup_session', JSON.stringify(state)) } catch {}
	}, [state])

	function setActivePlaylist(id: string | null) {
		setState((s) => ({ ...s, activePlaylistId: id }))
	}

	function addNewPlaylist(session: UserSession) {
		setState((s) => ({ ...s, playlists: [...s.playlists, session], activePlaylistId: session.id }))
	}

	function completeVideo() {
		setState((s) => {
			const id = s.activePlaylistId
			if (!id) return s
			const idx = s.playlists.findIndex((p) => p.id === id)
			if (idx === -1) return s
			const cur = { ...s.playlists[idx] }
			const list = cur.schedule[`day${cur.currentDay}`] ?? []
			const currentVideo = list[cur.currentVideoIndex]
			if (!currentVideo) return s
			if (!cur.completedVideos.includes(currentVideo.videoId)) {
				cur.completedVideos = [...cur.completedVideos, currentVideo.videoId]
			}
			const isLast = cur.currentVideoIndex + 1 >= list.length
			if (isLast) {
				const { streak, lastCompletedDay } = updateStreakForCompletion(cur.streak, cur.lastCompletedDay)
				cur.streak = streak
				cur.lastCompletedDay = lastCompletedDay
				cur.currentDay += 1
				cur.currentVideoIndex = 0
			} else {
				cur.currentVideoIndex += 1
			}
			const nextPlaylists = [...s.playlists]
			nextPlaylists[idx] = cur
			return { ...s, playlists: nextPlaylists }
		})
	}

	function resetAllProgress() {
		setState(defaultState)
		try { localStorage.removeItem('skillup_session') } catch {}
	}

	const value = useMemo<SessionContextValue>(
		() => ({ state, setActivePlaylist, addNewPlaylist, completeVideo, resetAllProgress }),
		[state]
	)

	return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
	const ctx = useContext(SessionContext)
	if (!ctx) throw new Error('useSession must be used within SessionProvider')
	return ctx
}


