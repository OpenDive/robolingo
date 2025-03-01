"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FiClock, FiDollarSign, FiUsers, FiFlag, FiAward } from 'react-icons/fi'

// Challenge type definition
interface Challenge {
  id: string
  title: string
  language: string
  flag: string
  level: string
  participants: number
  stake: string
  daysLeft: number
  duration: number
  progress: number
  type: 'no-loss' | 'hardcore'
}

export default function ExplorePage() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Mock data - in a real app this would come from an API
  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setChallenges([
        {
          id: 'challenge-1',
          title: 'Korean for Beginners',
          language: 'korean',
          flag: '🇰🇷',
          level: 'Beginner',
          participants: 42,
          stake: '50 USDC',
          daysLeft: 78,
          duration: 90,
          progress: 13,
          type: 'no-loss'
        },
        {
          id: 'challenge-2',
          title: 'Japanese Business Mastery',
          language: 'japanese',
          flag: '🇯🇵',
          level: 'Advanced',
          participants: 28,
          stake: '250 USDC',
          daysLeft: 25,
          duration: 60,
          progress: 58,
          type: 'hardcore'
        },
        {
          id: 'challenge-3',
          title: 'Spanish in 60 Days',
          language: 'spanish',
          flag: '🇪🇸',
          level: 'Intermediate',
          participants: 105,
          stake: '100 USDC',
          daysLeft: 45,
          duration: 60,
          progress: 25,
          type: 'no-loss'
        },
        {
          id: 'challenge-4',
          title: 'French for Travelers',
          language: 'french',
          flag: '🇫🇷',
          level: 'Beginner',
          participants: 63,
          stake: '75 USDC',
          daysLeft: 30,
          duration: 45,
          progress: 33,
          type: 'no-loss'
        },
        {
          id: 'challenge-5',
          title: 'Mandarin Characters',
          language: 'mandarin',
          flag: '🇨🇳',
          level: 'Intermediate',
          participants: 38,
          stake: '300 USDC',
          daysLeft: 152,
          duration: 180,
          progress: 16,
          type: 'hardcore'
        },
        {
          id: 'challenge-6',
          title: 'German Advanced Grammar',
          language: 'german',
          flag: '🇩🇪',
          level: 'Advanced',
          participants: 17,
          stake: '200 USDC',
          daysLeft: 64,
          duration: 90,
          progress: 29,
          type: 'hardcore'
        },
        {
          id: 'challenge-7',
          title: 'Italian for Foodies',
          language: 'italian',
          flag: '🇮🇹',
          level: 'Beginner',
          participants: 84,
          stake: '80 USDC',
          daysLeft: 72,
          duration: 90,
          progress: 20,
          type: 'no-loss'
        },
        {
          id: 'challenge-8',
          title: 'Portuguese Conversation',
          language: 'portuguese',
          flag: '🇵🇹',
          level: 'Intermediate',
          participants: 32,
          stake: '120 USDC',
          daysLeft: 58,
          duration: 90,
          progress: 36,
          type: 'no-loss'
        }
      ])
      setIsLoading(false)
    }, 1000)
  }, [])

  const filteredChallenges = filter === 'all' 
    ? challenges 
    : challenges.filter(challenge => challenge.language === filter)

  return (
    <div className="py-8 px-4 md:px-8 max-w-7xl mx-auto pb-20">
      <h1 className="text-2xl md:text-3xl font-bold text-blueprint-line font-mono mb-6">Explore Challenges</h1>
      
      {/* Language Filters */}
      <div className="overflow-x-auto mb-6">
        <div className="flex space-x-2 py-2 min-w-max">
          <button 
            onClick={() => setFilter('all')} 
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
              filter === 'all' 
                ? 'bg-[#D4A84B] text-[#2A2A2A] font-medium' 
                : 'bg-blueprint-bg border border-blueprint-line text-blueprint-line'
            }`}
          >
            All Languages
          </button>
          {['korean', 'japanese', 'spanish', 'french', 'mandarin', 'german', 'italian', 'portuguese'].map((lang) => (
            <button 
              key={lang}
              onClick={() => setFilter(lang)} 
              className={`px-4 py-2 rounded-full text-sm flex items-center whitespace-nowrap ${
                filter === lang 
                  ? 'bg-[#D4A84B] text-[#2A2A2A] font-medium' 
                  : 'bg-blueprint-bg border border-blueprint-line text-blueprint-line'
              }`}
            >
              <span className="mr-2">
                {lang === 'korean' && '🇰🇷'}
                {lang === 'japanese' && '🇯🇵'}
                {lang === 'spanish' && '🇪🇸'}
                {lang === 'french' && '🇫🇷'}
                {lang === 'mandarin' && '🇨🇳'}
                {lang === 'german' && '🇩🇪'}
                {lang === 'italian' && '🇮🇹'}
                {lang === 'portuguese' && '🇵🇹'}
              </span>
              <span>{lang.charAt(0).toUpperCase() + lang.slice(1)}</span>
            </button>
          ))}
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-blueprint-bg border border-blueprint-line rounded-lg p-4 animate-pulse">
              <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-3"></div>
              <div className="h-4 bg-gray-300 rounded w-1/4 mb-3"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3 mb-3"></div>
              <div className="h-8 bg-gray-300 rounded-full w-full mt-4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((challenge) => (
            <Link href={`/challenge/${challenge.id}`} key={challenge.id}>
              <div className="bg-blueprint-bg border border-blueprint-line rounded-lg p-4 hover:border-[#D4A84B] transition-colors duration-300 h-full flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-blueprint-line">{challenge.title}</h3>
                    <span className="text-xl">{challenge.flag}</span>
                  </div>
                  
                  <div className="mb-2">
                    <div className="inline-block px-2 py-1 rounded bg-[#2A2A2A] text-xs font-mono text-[#D4A84B] border border-[#D4A84B]">
                      {challenge.level}
                    </div>
                    <div className={`inline-block ml-2 px-2 py-1 rounded text-xs font-mono ${
                      challenge.type === 'no-loss'
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {challenge.type === 'no-loss' ? 'No-Loss' : 'Hardcore'}
                    </div>
                  </div>
                  
                  <div className="flex items-center text-white mb-2">
                    <FiUsers className="mr-2 text-[#D4A84B]" />
                    <span className="text-sm">{challenge.participants} participants</span>
                  </div>
                  
                  <div className="flex items-center text-white mb-2">
                    <FiDollarSign className="mr-2 text-[#D4A84B]" />
                    <span className="text-sm">{challenge.stake} minimum stake</span>
                  </div>
                  
                  <div className="flex items-center text-white mb-3">
                    <FiClock className="mr-2 text-[#D4A84B]" />
                    <span className="text-sm">{challenge.daysLeft} days left</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-[#2A2A2A] rounded-full h-2.5 mb-1">
                    <div 
                      className="bg-[#D4A84B] h-2.5 rounded-full" 
                      style={{ width: `${challenge.progress}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 font-mono text-right">
                    {challenge.progress}% complete
                  </div>
                </div>
                
                <button className="mt-4 w-full bg-[#2A2A2A] hover:bg-[#3A3A3A] text-[#D4A84B] font-bold py-2 px-4 rounded-lg border border-[#D4A84B] transition-colors duration-300">
                  View Challenge
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!isLoading && filteredChallenges.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-blueprint-line mb-2">No challenges found</h3>
          <p className="text-gray-500">
            Try selecting a different language filter or check back later
          </p>
        </div>
      )}
    </div>
  )
}
