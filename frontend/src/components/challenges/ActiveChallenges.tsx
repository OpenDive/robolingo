import ChallengeCard from './ChallengeCard'
import JoinChallenge from './JoinChallenge'
import { useChallengeContext } from '@/contexts/ChallengeContext'

export default function ActiveChallenges() {
  const { challenges } = useChallengeContext();

  return (
    <div className="relative">
      {/* Technical drawing measurement lines */}
      <div className="absolute -left-2 top-0 h-full w-px bg-blueprint-line opacity-10"></div>
      <div className="absolute left-0 -top-2 w-full h-px bg-blueprint-line opacity-10"></div>
      
      {/* Corner gear decorations */}
      <div className="absolute -left-4 -top-4 w-16 h-16 opacity-20">
        <div className="w-full h-full animate-spin-slower" style={{ 
          backgroundImage: 'url(/images/floral-pattern.svg)', 
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}></div>
      </div>
      
      <div className="absolute -right-4 -top-4 w-12 h-12 opacity-15">
        <div className="w-full h-full animate-spin-reverse" style={{ 
          backgroundImage: 'url(/images/floral-pattern.svg)', 
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}></div>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold blueprint-heading relative">
          Your Active Challenges
          {/* Small gear decoration */}
          <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 w-4 h-4 opacity-30">
            <div className="w-full h-full animate-spin-slow" style={{ 
              backgroundImage: 'url(/images/floral-pattern.svg)', 
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center'
            }}></div>
          </div>
        </h2>
        <a href="#" className="text-blueprint-line font-mono hover:underline relative group">
          See All
          <span className="absolute bottom-0 left-0 w-0 h-px bg-blueprint-line transition-all duration-300 group-hover:w-full"></span>
        </a>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
        {/* Connecting lines between cards */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-blueprint-line opacity-10 z-0"></div>
        <div className="absolute top-0 bottom-0 left-1/3 w-px bg-blueprint-line opacity-10 z-0"></div>
        <div className="absolute top-0 bottom-0 left-2/3 w-px bg-blueprint-line opacity-10 z-0"></div>
        
        {/* Gear connection points */}
        <div className="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 opacity-30 z-0">
          <div className="w-full h-full animate-gear-rotate" style={{ 
            backgroundImage: 'url(/images/floral-pattern.svg)', 
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          }}></div>
        </div>
        
        <div className="absolute top-1/2 left-2/3 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 opacity-30 z-0">
          <div className="w-full h-full animate-gear-rotate" style={{ 
            backgroundImage: 'url(/images/floral-pattern.svg)', 
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            animationDirection: 'reverse'
          }}></div>
        </div>
        
        {challenges.map(challenge => (
          <ChallengeCard 
            key={challenge.id}
            id={challenge.id}
            title={challenge.title}
            daysLeft={challenge.daysLeft}
            stake={challenge.stake}
            progress={challenge.progress}
            participants={challenge.participants}
          />
        ))}
        
        <JoinChallenge />
      </div>
      
      {/* Blueprint coordinates */}
      <div className="absolute bottom-0 right-0 text-xs font-mono text-blueprint-line opacity-30">
        AC-{challenges.length}.{challenges.reduce((sum, c) => sum + c.participants, 0)}
      </div>
    </div>
  )
}