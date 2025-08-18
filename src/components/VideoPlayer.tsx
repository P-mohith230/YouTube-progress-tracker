import YouTube from 'react-youtube'
import type { YouTubeEvent, YouTubePlayer } from 'react-youtube'

interface VideoPlayerProps {
	videoId?: string
	onEnded?: () => void
}

const VideoPlayer = ({ videoId, onEnded }: VideoPlayerProps) => {
	const opts = { width: '100%', height: '100%', playerVars: { autoplay: 0 } } as const
	function handleStateChange(e: YouTubeEvent<YouTubePlayer>) {
		// 0 === ENDED
		if (e.data === 0) onEnded?.()
	}

	return (
		<div className="aspect-video w-full bg-black/5 rounded-lg border border-accent-blue/50 overflow-hidden">
			{videoId ? (
				<YouTube videoId={videoId} opts={opts} onStateChange={handleStateChange} className="w-full h-full" />
			) : (
				<div className="w-full h-full flex items-center justify-center text-text-light text-sm">Video will appear here</div>
			)}
		</div>
	)
}

export default VideoPlayer


