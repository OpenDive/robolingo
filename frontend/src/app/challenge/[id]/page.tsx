"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiClock, FiDollarSign, FiUsers, FiArrowLeft, FiCalendar, FiBookOpen, FiCheck, FiAward } from 'react-icons/fi'

interface ChallengeDetail {
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
  description: string
  goals: string[]
  totalPool: string
  startDate: string
  endDate: string
  dailyTimeRequired: string
}

// Mock data for challenges - in a real app, this would come from an API
const challengeData: ChallengeDetail[] = [
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
    type: 'no-loss',
    description: 'Master the basics of Korean language in 90 days. This challenge is designed for complete beginners who want to learn hangul, basic grammar, and essential everyday phrases.',
    goals: [
      'Learn to read and write Hangul',
      'Master 500 common words',
      'Hold basic conversations',
      'Understand simple texts'
    ],
    totalPool: '2,100 USDC',
    startDate: 'February 1, 2025',
    endDate: 'May 2, 2025',
    dailyTimeRequired: '30 minutes'
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
    type: 'hardcore',
    description: 'Take your Japanese to the next level with this business-focused hardcore challenge. Perfect for intermediate speakers who want to develop professional language skills.',
    goals: [
      'Master formal business Japanese',
      'Learn 300 business-specific terms',
      'Conduct negotiations in Japanese',
      'Write professional emails'
    ],
    totalPool: '7,000 USDC',
    startDate: 'January 15, 2025',
    endDate: 'March 16, 2025',
    dailyTimeRequired: '45 minutes'
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
    type: 'no-loss',
    description: 'A comprehensive Spanish challenge focusing on conversation skills and practical vocabulary. Perfect for those with basic knowledge looking to become conversational.',
    goals: [
      'Have 15-minute conversations',
      'Understand native speakers',
      'Master present, past and future tenses',
      'Read intermediate texts'
    ],
    totalPool: '10,500 USDC',
    startDate: 'January 25, 2025',
    endDate: 'March 26, 2025',
    dailyTimeRequired: '40 minutes'
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
    type: 'no-loss',
    description: 'Learn practical French for your next trip to France! This challenge focuses on travel vocabulary, restaurant phrases, and essential grammar for getting around.',
    goals: [
      'Order food and book accommodations',
      'Ask for and understand directions',
      'Handle common travel situations',
      'Read signs and menus'
    ],
    totalPool: '4,725 USDC',
    startDate: 'February 15, 2025',
    endDate: 'April 1, 2025',
    dailyTimeRequired: '25 minutes'
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
    type: 'hardcore',
    description: 'Master 1000 Chinese characters in 180 days. This intensive challenge will help you break through the character barrier and dramatically improve your reading skills.',
    goals: [
      'Learn 1000 most common characters',
      'Read simple novels and news',
      'Write short paragraphs',
      'Recognize character components'
    ],
    totalPool: '11,400 USDC',
    startDate: 'January 5, 2025',
    endDate: 'July 4, 2025',
    dailyTimeRequired: '60 minutes'
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
    type: 'hardcore',
    description: 'Perfect your German grammar with this advanced challenge. Focus on complex grammatical structures, subordinate clauses, and the subjunctive mood.',
    goals: [
      'Master all tenses and moods',
      'Use complex sentence structures',
      'Write academic German',
      'Understand dialectal variations'
    ],
    totalPool: '3,400 USDC',
    startDate: 'January 10, 2025',
    endDate: 'April 10, 2025',
    dailyTimeRequired: '50 minutes'
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
    type: 'no-loss',
    description: 'Learn Italian through its food culture! This fun challenge focuses on food vocabulary, restaurant conversations, and the cultural aspects of Italian cuisine.',
    goals: [
      'Master food-related vocabulary',
      'Order in restaurants confidently',
      'Understand cooking instructions',
      'Discuss food preferences and tastes'
    ],
    totalPool: '6,720 USDC',
    startDate: 'January 20, 2025',
    endDate: 'April 20, 2025',
    dailyTimeRequired: '30 minutes'
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
    type: 'no-loss',
    description: 'Take your Portuguese to the next level with this conversation-focused challenge. Practice with native speakers and master the flow of natural dialogue.',
    goals: [
      'Hold 30-minute conversations',
      'Understand Brazilian and European accents',
      'Use idioms and colloquialisms',
      'Express complex thoughts and opinions'
    ],
    totalPool: '3,840 USDC',
    startDate: 'January 15, 2025',
    endDate: 'April 15, 2025',
    dailyTimeRequired: '35 minutes'
  }
]

export default function ChallengePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [challenge, setChallenge] = useState<ChallengeDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulating API call with delay
    setTimeout(() => {
      const found = challengeData.find(c => c.id === params.id)
      setChallenge(found || null)
      setIsLoading(false)
    }, 800)
  }, [params.id])

  if (isLoading) {
    return (
      <div className="py-8 px-4 md:px-8 max-w-4xl mx-auto pb-20">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-3/4 mb-6"></div>
          <div className="h-32 bg-gray-300 rounded w-full mb-6"></div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="h-12 bg-gray-300 rounded"></div>
            <div className="h-12 bg-gray-300 rounded"></div>
          </div>
          <div className="h-48 bg-gray-300 rounded w-full"></div>
        </div>
      </div>
    )
  }

  if (!challenge) {
    return (
      <div className="py-8 px-4 md:px-8 max-w-4xl mx-auto pb-20">
        <Link href="/explore" className="inline-flex items-center text-blueprint-line hover:text-[#D4A84B] mb-6">
          <FiArrowLeft className="mr-2" /> Back to Explore
        </Link>
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-blueprint-line mb-2">Challenge Not Found</h3>
          <p className="text-gray-500 mb-6">
            The challenge you're looking for doesn't exist or has been removed
          </p>
          <Link href="/explore" className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-[#D4A84B] font-bold py-2 px-6 rounded-lg border border-[#D4A84B] transition-colors duration-300">
            Browse Challenges
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8 px-4 md:px-8 max-w-4xl mx-auto pb-20">
      <Link href="/explore" className="inline-flex items-center text-blueprint-line hover:text-[#D4A84B] mb-6">
        <FiArrowLeft className="mr-2" /> Back to Explore
      </Link>
      
      <div className="bg-blueprint-bg border border-blueprint-line rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{challenge.flag}</span>
              <h1 className="text-2xl md:text-3xl font-bold text-blueprint-line font-mono">{challenge.title}</h1>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="inline-block px-3 py-1 rounded bg-[#2A2A2A] text-sm font-mono text-[#D4A84B] border border-[#D4A84B]">
                {challenge.level}
              </div>
              <div className={`inline-block px-3 py-1 rounded text-sm font-mono ${
                challenge.type === 'no-loss'
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                {challenge.type === 'no-loss' ? 'No-Loss Challenge' : 'Hardcore Challenge'}
              </div>
            </div>
          </div>
          
          <button className="w-full md:w-auto bg-[#D4A84B] hover:bg-[#C39A40] text-[#2A2A2A] font-bold py-3 px-6 rounded-lg transition-colors duration-300 flex justify-center items-center gap-2">
            <FiCheck /> Join Challenge
          </button>
        </div>
        
        <p className="text-blueprint-line mb-6">
          {challenge.description}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-[#2A2A2A] rounded-lg p-4 flex items-center">
            <FiUsers className="text-[#D4A84B] text-xl mr-3" />
            <div>
              <div className="text-gray-400 text-sm">Participants</div>
              <div className="text-white font-semibold">{challenge.participants} members</div>
            </div>
          </div>
          
          <div className="bg-[#2A2A2A] rounded-lg p-4 flex items-center">
            <FiDollarSign className="text-[#D4A84B] text-xl mr-3" />
            <div>
              <div className="text-gray-400 text-sm">Minimum Stake</div>
              <div className="text-white font-semibold">{challenge.stake}</div>
            </div>
          </div>
          
          <div className="bg-[#2A2A2A] rounded-lg p-4 flex items-center">
            <FiAward className="text-[#D4A84B] text-xl mr-3" />
            <div>
              <div className="text-gray-400 text-sm">Total Pool</div>
              <div className="text-white font-semibold">{challenge.totalPool}</div>
            </div>
          </div>
          
          <div className="bg-[#2A2A2A] rounded-lg p-4 flex items-center">
            <FiClock className="text-[#D4A84B] text-xl mr-3" />
            <div>
              <div className="text-gray-400 text-sm">Days Remaining</div>
              <div className="text-white font-semibold">{challenge.daysLeft} days</div>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-blueprint-line mb-4">Challenge Progress</h3>
          <div className="w-full bg-[#2A2A2A] rounded-full h-4 mb-2">
            <div 
              className="bg-[#D4A84B] h-4 rounded-full" 
              style={{ width: `${challenge.progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-400">
            <span>Started: {challenge.startDate}</span>
            <span>Ends: {challenge.endDate}</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blueprint-bg border border-blueprint-line rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blueprint-line mb-4 flex items-center">
            <FiBookOpen className="mr-2" /> Learning Goals
          </h3>
          <ul className="space-y-3">
            {challenge.goals.map((goal, index) => (
              <li key={index} className="flex items-start">
                <span className="text-[#D4A84B] mr-2">•</span>
                <span className="text-white">{goal}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-blueprint-bg border border-blueprint-line rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blueprint-line mb-4 flex items-center">
            <FiCalendar className="mr-2" /> Challenge Requirements
          </h3>
          <div className="space-y-4">
            <div>
              <div className="text-gray-400 mb-1">Daily Time Commitment</div>
              <div className="text-white font-medium">{challenge.dailyTimeRequired}</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">Challenge Duration</div>
              <div className="text-white font-medium">{challenge.duration} days</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">Challenge Type</div>
              <div className="text-white font-medium">
                {challenge.type === 'no-loss' 
                  ? 'No-Loss (get stake back regardless)' 
                  : 'Hardcore (lose deposit if requirements not met)'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
