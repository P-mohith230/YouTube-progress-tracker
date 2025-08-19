const Block = ({ className }: { className?: string }) => (
	<div className={`bg-accent-blue/50 animate-pulse rounded-lg ${className ?? ''}`} />
)

const DashboardSkeleton = () => {
	return (
		<div className="min-h-screen p-6 sm:p-8 bg-accent-blue">
			<div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2 space-y-4">
					<Block className="aspect-video" />
					<div className="bg-primary rounded-xl p-5 shadow-sm border border-accent-blue/50">
						<Block className="h-6 w-40 mb-4" />
						<div className="space-y-2">
							<Block className="h-10" />
							<Block className="h-10" />
							<Block className="h-10" />
						</div>
					</div>
				</div>
				<div className="space-y-4">
					<Block className="h-24" />
					<Block className="h-24" />
					<Block className="h-24" />
				</div>
			</div>
		</div>
	)
}

export default DashboardSkeleton


