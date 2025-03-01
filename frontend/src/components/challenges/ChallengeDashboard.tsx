"use client"

import React, { useState, useEffect } from 'react'
import { FiClock, FiUsers, FiDollarSign, FiAward, FiCalendar, FiTrendingUp } from 'react-icons/fi'
import { useRouter } from 'next/navigation'
import { useChallengeContext } from '@/contexts/ChallengeContext'
import { FiX, FiAlertTriangle } from 'react-icons/fi'
import { Challenge } from '@/contexts/ChallengeContext'

interface Participant {
  id: number
  name: string
  avatar: string
  avatarBg: string
  streak: number
  completedToday: boolean
  progress: number
}

interface ChallengeDashboardProps {
  challenge: Challenge
}

export default function ChallengeDashboard({ challenge }: ChallengeDashboardProps) {
  const router = useRouter()
  const { deleteChallenge } = useChallengeContext()
  const [showExitModal, setShowExitModal] = useState(false)
  
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: 1,
      name: "Alex Kim",
      avatar: "AK",
      avatarBg: "bg-purple-500",
      streak: 7,
      completedToday: true,
      progress: 35
    },
    {
      id: 2,
      name: "Jordan Lee",
      avatar: "JL",
      avatarBg: "bg-blue-500",
      streak: 5,
      completedToday: true,
      progress: 28
    },
    {
      id: 3,
      name: "Taylor Park",
      avatar: "TP",
      avatarBg: "bg-amber-500",
      streak: 3,
      completedToday: false,
      progress: 20
    },
    {
      id: 4,
      name: "Morgan Chen",
      avatar: "MC",
      avatarBg: "bg-green-500",
      streak: 6,
      completedToday: true,
      progress: 30
    }
  ])
  
  const [dailyTasks, setDailyTasks] = useState([
    { id: 1, name: "Daily Practice: Conversation", completed: true, type: "practice" },
    { id: 2, name: "Lesson: Basic Grammar", completed: false, type: "lesson" },
    { id: 3, name: "Quiz: Vocabulary Test", completed: false, type: "quiz" }
  ])
  
  const estimatedYield = parseFloat(challenge.stake.replace(" USDC", "")) * 0.05
  
  const [timeRemaining, setTimeRemaining] = useState({
    days: challenge.daysLeft,
    hours: 23,
    minutes: 59
  })
  
  useEffect(() => {
    const timer = setInterval(() => {
      if (timeRemaining.minutes > 0) {
        setTimeRemaining(prev => ({ ...prev, minutes: prev.minutes - 1 }))
      } else if (timeRemaining.hours > 0) {
        setTimeRemaining(prev => ({ ...prev, hours: prev.hours - 1, minutes: 59 }))
      } else if (timeRemaining.days > 0) {
        setTimeRemaining(prev => ({ ...prev, days: prev.days - 1, hours: 23, minutes: 59 }))
      }
    }, 60000)
    
    return () => clearInterval(timer)
  }, [timeRemaining])
  
  const sortedParticipants = [...participants].sort((a, b) => b.progress - a.progress)
  
  const rotationSpeed = challenge.title.length > 15 ? 'animate-spin-slow' : 'animate-spin-slower'
  
  const handleExit = () => {
    setShowExitModal(true)
  }
  
  const handleConfirmExit = () => {
    deleteChallenge(challenge.id)
    router.push('/')
  }
  
  return (
    <div className="relative">
      {/* Main dashboard content */}
      <div className="bg-blueprint-bg rounded-xl p-6 border-1 border-blueprint-line">
        {/* Decorative elements */}
        <div className="absolute -right-4 -top-4 w-20 h-20 opacity-20">
          <div className={`w-full h-full ${rotationSpeed}`} style={{ 
            backgroundImage: 'url(/images/floral-pattern.svg)', 
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          }}></div>
        </div>
        
        <div className="absolute -left-2 -bottom-2 w-16 h-16 opacity-10 rotate-180">
          <div className={`w-full h-full animate-spin-reverse`} style={{ 
            backgroundImage: 'url(/images/floral-pattern.svg)', 
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          }}></div>
        </div>
        
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-bold text-primary-dark mb-1">{challenge.title}</h2>
            <div className="flex items-center text-sm text-primary-dark">
              <span className="inline-block mr-4">
                <FiClock className="inline-block mr-1 text-blueprint-line" />
                {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m remaining
              </span>
              <span className="inline-block mr-4">
                <FiUsers className="inline-block mr-1 text-blueprint-line" />
                {challenge.participants} participants
              </span>
              <span className="inline-block">
                <FiCalendar className="inline-block mr-1 text-blueprint-line" />
                {challenge.minDailyTime} min/day
              </span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-primary-dark mb-1">Challenge Type</div>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              challenge.type === 'no-loss' 
                ? 'bg-green-100 text-green-800 border-1 border-green-300' 
                : 'bg-amber-100 text-amber-800 border-1 border-amber-300'
            }`}>
              {challenge.type === 'no-loss' ? 'No-Loss' : 'Hardcore'}
            </div>
          </div>
        </div>
        
        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Progress and stake */}
          <div className="lg:col-span-2">
            {/* Progress visualization */}
            <div className="bg-white bg-opacity-50 rounded-xl p-6 mb-6 border-1 border-blueprint-line relative">
              <h3 className="blueprint-heading text-lg mb-4">Progress Tracking</h3>
              
              {/* Mechanical floral visualization */}
              <div className="relative h-48 mb-4 flex items-center justify-center">
                {/* Center gear */}
                <div className="absolute w-24 h-24 animate-gear-rotate" style={{
                  backgroundImage: 'url(/images/gear.svg)',
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center'
                }}></div>
                
                {/* Progress circle */}
                <div className="relative w-40 h-40 rounded-full border-4 border-blueprint-line border-opacity-20 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full" style={{
                    background: `conic-gradient(#D4A84B 0% ${challenge.progress}%, transparent ${challenge.progress}% 100%)`,
                    opacity: 0.7
                  }}></div>
                  <div className="absolute inset-2 rounded-full bg-blueprint-bg"></div>
                  <div className="z-10 text-3xl font-bold text-primary-dark">{challenge.progress}%</div>
                </div>
                
                {/* Decorative floral elements around the circle */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                  <div key={i} className="absolute w-8 h-8" style={{
                    transform: `rotate(${angle}deg) translateX(100px)`,
                  }}>
                    <div className={`w-full h-full animate-spin-${i % 2 === 0 ? 'slow' : 'reverse'}`} style={{ 
                      backgroundImage: 'url(/images/floral-small.svg)', 
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                      opacity: challenge.progress >= (angle / 360) * 100 ? 0.8 : 0.2
                    }}></div>
                  </div>
                ))}
              </div>
              
              {/* Blueprint coordinates */}
              <div className="absolute bottom-2 right-2 text-xs font-mono text-blueprint-line opacity-30">
                PG-{challenge.progress}.{challenge.daysLeft}
              </div>
            </div>
            
            {/* Daily tasks */}
            <div className="bg-white bg-opacity-50 rounded-xl p-6 border-1 border-blueprint-line relative">
              <h3 className="blueprint-heading text-lg mb-4">Daily Task Completion</h3>
              
              <div className="space-y-4">
                {dailyTasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border-1 border-blueprint-line border-opacity-30 bg-white bg-opacity-50">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        task.completed 
                          ? 'bg-green-100 text-green-600 border-1 border-green-300' 
                          : 'bg-gray-100 text-gray-400 border-1 border-gray-300'
                      }`}>
                        {task.completed ? '✓' : '○'}
                      </div>
                      <div>
                        <div className="font-medium text-primary-dark">{task.name}</div>
                        <div className="text-xs text-primary-light">{
                          task.type === 'lecture' ? 'Watch the lecture' : 
                          task.type === 'practice' ? 'Complete practice exercises' : 
                          'Pass the quiz'
                        }</div>
                      </div>
                    </div>
                    <div>
                      {task.completed ? (
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                          Completed
                        </span>
                      ) : (
                        <button className="text-xs bg-amber-100 text-amber-600 px-2 py-1 rounded-full border-1 border-amber-300 hover:bg-amber-200 transition-colors">
                          Start Now
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Blueprint coordinates */}
              <div className="absolute bottom-2 right-2 text-xs font-mono text-blueprint-line opacity-30">
                DT-{dailyTasks.filter(t => t.completed).length}.{dailyTasks.length}
              </div>
            </div>
          </div>
          
          {/* Right column - Stake, Yield, and Leaderboard */}
          <div className="space-y-6">
            {/* Stake information */}
            <div className="bg-white bg-opacity-50 rounded-xl p-6 border-1 border-blueprint-line relative">
              <h3 className="blueprint-heading text-lg mb-4">Stake Information</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-primary-dark">Your Stake</div>
                  <div className="font-mono font-bold text-lg text-primary-dark flex items-center">
                    <FiDollarSign className="text-blueprint-line mr-1" />
                    <span style={{ color: '#D4A84B' }}>{challenge.stake}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm text-primary-dark">Yield Up For Grabs</div>
                  <div className="font-mono font-bold text-lg text-primary-dark flex items-center">
                    <FiTrendingUp className="text-blueprint-line mr-1" />
                    <span style={{ color: '#D4A84B' }}>{estimatedYield.toFixed(3)} USDC</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm text-primary-dark">Challenge Type</div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    challenge.type === 'no-loss' 
                      ? 'bg-green-100 text-green-800 border-1 border-green-300' 
                      : 'bg-amber-100 text-amber-800 border-1 border-amber-300'
                  }`}>
                    {challenge.type === 'no-loss' ? 'No-Loss' : 'Hardcore'}
                  </div>
                </div>
              </div>
              
              {/* Blueprint coordinates */}
              <div className="absolute bottom-2 right-2 text-xs font-mono text-blueprint-line opacity-30">
                SI-{challenge.stake.replace(/\D/g, '')}.{estimatedYield.toFixed(3).replace('.', '')}
              </div>
            </div>
            
            {/* Participant leaderboard */}
            <div className="bg-white bg-opacity-50 rounded-xl p-6 border-1 border-blueprint-line relative">
              <h3 className="blueprint-heading text-lg mb-4">Participant Leaderboard</h3>
              
              <div className="space-y-3">
                {sortedParticipants.map((participant, index) => (
                  <div key={participant.id} className="flex items-center p-3 rounded-lg border-1 border-blueprint-line border-opacity-30 bg-white bg-opacity-50">
                    <div className="font-mono font-bold text-lg mr-3 text-primary-dark w-6 text-center">
                      {index + 1}
                    </div>
                    <div className={`story-avatar w-10 h-10 text-sm ${participant.avatarBg} mr-3`}>
                      {participant.avatar}
                    </div>
                    <div className="flex-grow">
                      <div className="font-medium text-primary-dark">{participant.name}</div>
                      <div className="flex items-center text-xs">
                        <span className="text-primary-light mr-2">
                          {participant.streak} day streak
                        </span>
                        <span className={`w-2 h-2 rounded-full ${participant.completedToday ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        <span className="text-xs text-primary-light ml-1">
                          {participant.completedToday ? 'Completed today' : 'Not completed today'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-primary-dark">{participant.progress}%</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Blueprint coordinates */}
              <div className="absolute bottom-2 right-2 text-xs font-mono text-blueprint-line opacity-30">
                LB-{sortedParticipants.length}.{challenge.participants}
              </div>
            </div>
          </div>
        </div>
        
        {/* Exit button */}
        <div className="mt-12 text-center">
          <button
            onClick={handleExit}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center justify-center mx-auto"
          >
            <FiX className="mr-2" />
            {challenge.type === 'no-loss' ? 'Exit & Forfeit Yield' : 'Exit Challenge'}
          </button>
        </div>
      </div>
      
      {/* Exit confirmation modal */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-center text-red-500 mb-4">
              <FiAlertTriangle size={48} />
            </div>
            <h3 className="text-xl font-bold text-center mb-4">
              {challenge.type === 'no-loss' ? 'Forfeit Yield' : 'Forfeit Deposit'}
            </h3>
            <p className="text-gray-600 text-center mb-6">
              {challenge.type === 'no-loss' 
                ? `This is a No-Loss challenge. If you exit now, you will get your stake of ${challenge.stake} back, but forfeit any potential yield earnings.`
                : `This is a Hardcore mode challenge. If you exit now, you will lose your stake of ${challenge.stake}.`
              }
              Are you sure you want to proceed?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowExitModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmExit}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
              >
                {challenge.type === 'no-loss' ? 'Yes, Forfeit Yield' : 'Yes, Forfeit Deposit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
