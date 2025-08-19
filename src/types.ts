export interface PlaylistVideo {
	title: string
	videoId: string
	duration: string
	durationSeconds: number
}

export type Schedule = Record<string, PlaylistVideo[]>

export interface UserSession {
	id: string
	playlistTitle: string
	schedule: Schedule
	currentDay: number
	currentVideoIndex: number
	completedVideos: string[]
	streak: number
	lastCompletedDay: string
}

export interface AppState {
	activePlaylistId: string | null
	playlists: UserSession[]
}


