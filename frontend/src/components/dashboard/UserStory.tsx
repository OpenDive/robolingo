export default function UserStory() {
  return (
    <div className="flex flex-col items-center relative z-10">
      <div className="story-avatar bg-blueprint-bg border-1 border-blueprint-line story-avatar-active relative overflow-hidden">
        {/* Blueprint grid background */}
        <div className="absolute inset-0 bg-blueprint-grid opacity-20"></div>
        
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blueprint-line relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <span className="mt-2 text-xs font-mono text-blueprint-line">Your Story</span>
    </div>
  )
}