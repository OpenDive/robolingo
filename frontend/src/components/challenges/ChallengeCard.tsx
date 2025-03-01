"use client"

import { FiClock, FiUsers, FiDollarSign } from 'react-icons/fi'

interface ChallengeCardProps {
  title: string
  daysLeft: number
  stake: string
  progress: number
  participants: number
}

export default function ChallengeCard({ title, daysLeft, stake, progress, participants }: ChallengeCardProps) {
  // Calculate animation speed based on title length
  const rotationSpeed = title.length > 15 ? 'animate-spin-slow' : 'animate-spin-slower';
  
  return (
    <div className="relative bg-blueprint-bg border-1 border-blueprint-line rounded-xl p-6 hover:shadow-md transition-all duration-300">
      {/* Small floral decoration */}
      <div className="absolute -right-2 -top-2 w-10 h-10 opacity-20 rotate-45">
        <div className={`w-full h-full ${rotationSpeed}`} style={{ 
          backgroundImage: 'url(/images/floral-pattern.svg)', 
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}></div>
      </div>
      
      {/* Measurement lines */}
      <div className="absolute left-0 top-0 w-px h-full bg-blueprint-line opacity-10"></div>
      <div className="absolute left-0 top-0 w-full h-px bg-blueprint-line opacity-10"></div>
      
      <h3 className="text-lg font-bold text-blueprint-line mb-2">{title}</h3>
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center text-sm text-primary-dark">
          <FiClock className="mr-1 text-blueprint-line" />
          <span>{daysLeft} days left</span>
        </div>
        <div className="flex items-center text-sm text-primary-dark">
          <FiDollarSign className="mr-1 text-blueprint-line" />
          <span>{stake}</span>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-primary-dark">Progress</span>
          <span className="text-xs font-mono text-blueprint-line">{progress}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
      
      <div className="flex items-center text-sm text-primary-dark">
        <FiUsers className="mr-1 text-blueprint-line" />
        <span>{participants} participants</span>
      </div>
      
      {/* Blueprint coordinates */}
      <div className="absolute bottom-2 right-2 text-xs font-mono text-blueprint-line opacity-30">
        CC-{participants}.{progress}
      </div>
    </div>
  )
}