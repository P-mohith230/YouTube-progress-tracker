import type { ReactNode } from 'react'

interface ProgressCardProps {
	title: string
	value?: string | ReactNode
}

const ProgressCard = ({ title, value }: ProgressCardProps) => {
	return (
		<div className="bg-primary rounded-xl p-5 shadow-sm border border-accent-blue/50">
			<p className="text-sm text-text-light mb-2">{title}</p>
			<div className="text-2xl font-bold text-text-dark">{value ?? '—'}</div>
		</div>
	)
}

export default ProgressCard


