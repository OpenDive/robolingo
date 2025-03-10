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

  // If there are no groups, we'll show a message
  if (groups.length === 0) {
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
        
        <div className="bg-blueprint-bg border border-blueprint-line rounded-xl p-6 text-center">
          <p className="text-gray-500 mb-4">You haven't joined any groups yet</p>
          <Link href="/explore" className="inline-block text-[#D4A84B] hover:underline">
            Find challenges to join
          </Link>
        </div>
      </div>
    );
  }

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
        {groups.map((group) => (
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
                  {group.unread && group.unread > 0 && (
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
