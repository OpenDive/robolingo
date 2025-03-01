import Link from 'next/link'

export default function Navigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-blueprint-bg border-t border-blueprint-line flex justify-around py-3 z-50 overflow-x-hidden">
      <Link href="/" className="nav-icon nav-icon-active">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 blueprint-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span className="text-xs mt-1 font-mono">Home</span>
      </Link>
      
      <Link href="/chat" className="nav-icon">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span className="text-xs mt-1 font-mono">Chat</span>
      </Link>
      
      <Link href="/challenge" className="nav-icon">
        <div className="bg-blueprint-line rounded-lg p-2 -mt-3 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ 
            backgroundImage: 'url(/images/floral-pattern.svg)', 
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          }}></div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blueprint-bg relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <span className="text-xs mt-1 font-mono">Challenge</span>
      </Link>
      
      <Link href="/explore" className="nav-icon">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="text-xs mt-1 font-mono">Explore</span>
      </Link>
      
      <Link href="/profile" className="nav-icon">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span className="text-xs mt-1 font-mono">Profile</span>
      </Link>
    </nav>
  )
}