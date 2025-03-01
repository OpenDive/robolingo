"use client"

import Link from 'next/link'
import { useChallengeContext } from '@/contexts/ChallengeContext'

interface Group {
  id: string
  name: string
  flag: string
  avatar: string
  avatarBg: string
  members: number
  lastMessage: string
  time: string
  unread?: number
  usdcAmount: string
}

export default function GroupList() {
  const { groups } = useChallengeContext();

  // Sample groups data
  const sampleGroups: Group[] = [
    {
      id: "korean-gang",
      name: "Korean Gang 🇰🇷",
      avatar: "K",
      avatarBg: "bg-purple-500",
      members: 8,
      lastMessage: "Did you guys see Mark's attempt at saying 안녕하세요?",
      time: "2m ago",
      unread: 3,
      usdcAmount: "50 USDC"
    },
    {
      id: "samurai-squad",
      name: "Samurai Squad 🇯🇵",
      avatar: "S",
      avatarBg: "bg-blue-500",
      members: 5,
      lastMessage: "I'll complete today's lesson after dinner",
      time: "1h ago",
      unread: 0,
      usdcAmount: "200 USDC"
    },
    {
      id: "spanish-fiesta",
      name: "Spanish Fiesta 🇪🇸",
      avatar: "S",
      avatarBg: "bg-green-500",
      members: 6,
      lastMessage: "[AI] Emma's on a 7-day streak...",
      time: "3h ago",
      unread: 12,
      usdcAmount: "30 USDC"
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold blueprint-heading">Your Groups</h2>
        <Link href="/chat" className="text-[#D4A84B] font-mono text-sm hover:text-[#B38728] transition-colors duration-300 flex items-center">
          View All
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      
      <div className="space-y-3">
        {sampleGroups.map((group) => (
          <Link 
            key={group.id} 
            href={`/chat?group=${group.id}`}
            className="block"
          >
            <div className="bg-blueprint-bg border border-blueprint-line rounded-xl p-4 hover:border-[#D4A84B] transition-colors duration-300 relative overflow-hidden">
              {/* Subtle floral decoration */}
              <div className="absolute -right-10 -bottom-10 w-20 h-20 opacity-5">
                <div className="w-full h-full" style={{ 
                  backgroundImage: 'url(/images/floral-pattern.svg)', 
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center'
                }}></div>
              </div>
              
              <div className="flex items-center">
                <div className={`w-12 h-12 ${group.avatarBg} rounded-full flex items-center justify-center text-white font-bold mr-3 relative`}>
                  {group.avatar}
                  {group.unread && (
                    <span className="absolute -top-1 -right-1 bg-[#D4A84B] text-[#1A1A1A] text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {group.unread}
                    </span>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">
                      {group.name} <span className="ml-1">{group.flag}</span>
                    </h3>
                    <span className="text-xs text-gray-500 font-mono">{group.time}</span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-gray-600 truncate w-3/4">{group.lastMessage}</p>
                    <span className="text-xs font-mono text-[#D4A84B]">{group.usdcAmount}</span>
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500 font-mono">
                    {group.members} members
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
