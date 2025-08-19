import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useSession } from '../context/SessionContext'

const Header = ({ onHome, onAddNew, onViewActive }: { onHome: () => void; onAddNew: () => void; onViewActive: () => void }) => {
	useSession() // ensure provider usage
	const [open, setOpen] = useState(false)

	return (
		<header className="w-full bg-primary border-b border-accent-blue/60">
			<div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<button aria-label="Menu" onClick={() => setOpen(true)}>
						<Menu className="w-6 h-6 text-text-dark" />
					</button>
				</div>
				<div className="hidden md:flex items-center gap-3">
					<button
						className="bg-accent-blue/40 hover:bg-accent-blue/60 text-text-dark font-semibold px-4 py-2 rounded-lg"
						onClick={onHome}
					>
						My Playlists
					</button>
					<button
						className="bg-accent-pink hover:bg-accent-pink/80 text-text-dark font-semibold px-4 py-2 rounded-lg"
						onClick={onAddNew}
					>
						Add New Playlist
					</button>
				</div>
			</div>
			{open && (
				<div className="fixed inset-0 bg-black/30" onClick={() => setOpen(false)}>
					<div className="absolute right-0 top-0 h-full w-64 bg-primary shadow-lg p-4" onClick={(e) => e.stopPropagation()}>
						<div className="flex justify-between items-center mb-4">
							<span className="font-semibold text-text-dark">Menu</span>
							<button aria-label="Close" onClick={() => setOpen(false)}>
								<X className="w-6 h-6 text-text-dark" />
							</button>
						</div>
						<div className="flex flex-col gap-3">
							<button className="w-full bg-accent-blue/40 text-text-dark font-semibold px-4 py-2 rounded-lg" onClick={() => { onHome(); setOpen(false) }}>My Playlists</button>
							<button className="w-full bg-accent-pink text-text-dark font-semibold px-4 py-2 rounded-lg" onClick={() => { onAddNew(); setOpen(false) }}>Add New Playlist</button>
							<button className="w-full bg-accent-blue/40 text-text-dark font-semibold px-4 py-2 rounded-lg" onClick={() => { onViewActive(); setOpen(false) }}>View Active Playlist</button>
						</div>
					</div>
				</div>
			)}
		</header>
	)
}

export default Header


