export  const metadata ={
    title: 'Live Stream',
    description: 'Watch live streams of your favorite AI personas in action.'
}

export default function LiveLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen">
            {children}
        </div>
    )
}