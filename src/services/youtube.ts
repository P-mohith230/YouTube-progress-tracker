import type { PlaylistVideo } from '../types'

export interface PlaylistData {
	title: string
	videos: PlaylistVideo[]
	totalDurationSeconds: number
}

function parseISODurationToSeconds(iso: string): number {
	// Example: PT1H2M30S, PT15M, PT45S
	const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
	const match = iso.match(regex)
	if (!match) return 0
	const hours = parseInt(match[1] ?? '0', 10)
	const minutes = parseInt(match[2] ?? '0', 10)
	const seconds = parseInt(match[3] ?? '0', 10)
	return hours * 3600 + minutes * 60 + seconds
}

export async function fetchPlaylistData(playlistId: string): Promise<PlaylistData> {
	const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY as string | undefined
	if (!apiKey) {
		throw new Error('YouTube API key not configured. Set VITE_YOUTUBE_API_KEY in .env')
	}

	let nextPageToken: string | undefined = undefined
	const allVideoIds: string[] = []
	let playlistTitle = ''

	// Fetch playlist title
	{
		const params = new URLSearchParams({ part: 'snippet', id: playlistId, key: apiKey })
		const res = await fetch(`https://www.googleapis.com/youtube/v3/playlists?${params.toString()}`)
		if (!res.ok) {
			const text = await res.text()
			throw new Error(`Failed fetching playlist metadata: ${text}`)
		}
		const json: any = await res.json()
		playlistTitle = json?.items?.[0]?.snippet?.title ?? 'Playlist'
	}

	// Fetch all playlist items (video IDs)
	for (let i = 0; i < 50; i++) { // hard stop to avoid infinite loops
		const params = new URLSearchParams({
			part: 'snippet',
			maxResults: '50',
			playlistId,
			key: apiKey,
		})
		if (nextPageToken) params.set('pageToken', nextPageToken)
		const itemsRes = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${params.toString()}`)
		if (!itemsRes.ok) {
			const text = await itemsRes.text()
			throw new Error(`Failed fetching playlistItems: ${text}`)
		}
		const itemsJson: any = await itemsRes.json()
		for (const item of itemsJson.items ?? []) {
			const vid = item.snippet?.resourceId?.videoId
			if (vid) allVideoIds.push(vid)
		}
		nextPageToken = itemsJson.nextPageToken
		if (!nextPageToken) break
	}

	// Fetch video details in batches of 50
	const videos: PlaylistVideo[] = []
	for (let start = 0; start < allVideoIds.length; start += 50) {
		const batchIds = allVideoIds.slice(start, start + 50)
		const params = new URLSearchParams({
			part: 'contentDetails,snippet',
			id: batchIds.join(','),
			key: apiKey,
		})
		const vidsRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params.toString()}`)
		if (!vidsRes.ok) {
			const text = await vidsRes.text()
			throw new Error(`Failed fetching videos: ${text}`)
		}
		const vidsJson: any = await vidsRes.json()
		for (const v of vidsJson.items ?? []) {
			const durationIso = v.contentDetails?.duration ?? 'PT0S'
			const durationSeconds = parseISODurationToSeconds(durationIso)
			videos.push({
				title: v.snippet?.title ?? 'Untitled',
				videoId: v.id,
				duration: durationIso,
				durationSeconds,
			})
		}
	}

	const totalDurationSeconds = videos.reduce((sum, v) => sum + v.durationSeconds, 0)
	return {
		title: playlistTitle || 'Playlist',
		videos,
		totalDurationSeconds,
	}
}

export function extractPlaylistIdFromUrl(url: string): string | null {
	try {
		const u = new URL(url)
		const list = u.searchParams.get('list')
		return list
	} catch {
		return null
	}
}


