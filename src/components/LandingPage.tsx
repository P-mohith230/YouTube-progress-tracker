import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface LandingPageProps {
	onSubmitUrl?: (url: string) => Promise<void> | void
}

const LandingPage = ({ onSubmitUrl }: LandingPageProps) => {
	const [url, setUrl] = useState('')

	return (
		<div className="flex items-center justify-center min-h-screen bg-accent-blue px-4">
			<div className="w-full max-w-2xl bg-primary rounded-xl shadow-sm p-8">
				<h1 className="text-3xl sm:text-4xl font-bold text-text-dark text-center mb-6">
					Learn Smarter, Not Harder.
				</h1>
				<p className="text-text-light text-center mb-8">
					Paste a YouTube playlist URL to create your personalized plan.
				</p>
				<div className="flex gap-3">
					<input
						type="text"
						value={url}
						onChange={(e) => setUrl(e.target.value)}
						placeholder="https://www.youtube.com/playlist?list=..."
						className="flex-1 rounded-lg border border-accent-blue/50 px-4 py-3 outline-none focus:ring-2 focus:ring-accent-blue focus:border-accent-blue text-text-dark placeholder:text-text-light"
					/>
					<button
						type="button"
						className="inline-flex items-center gap-2 bg-accent-pink hover:bg-accent-pink/80 text-text-dark font-semibold px-5 py-3 rounded-lg transition-colors"
						onClick={async () => {
							try {
								await onSubmitUrl?.(url)
							} catch (e) {
								toast.error('Invalid Playlist URL or API Key issue')
							}
						}}
					>
						Create My Plan
						<ArrowRight className="h-5 w-5" />
					</button>
				</div>
			</div>
		</div>
	)
}

export default LandingPage


