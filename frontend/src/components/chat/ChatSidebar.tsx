"use client"

import { useState } from 'react'
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

interface ChatSidebarProps {
  onSelectGroup: (groupId: string) => void
  selectedGroup: string | null
}

export default function ChatSidebar({ onSelectGroup, selectedGroup }: ChatSidebarProps) {
  const { groups } = useChallengeContext();
  
  // Add a default Spanish group if it doesn't exist in the context
  // This is just to maintain the existing UI with 3 groups
  const allGroups = [...groups];
  if (!allGroups.some(g => g.id === "spanish-fiesta")) {
    allGroups.push({
      id: "spanish-fiesta",
      name: "Spanish Fiesta",
      flag: "🇪🇸",
      avatar: "S",
      avatarBg: "bg-green-500",
      members: 3,
      lastMessage: "¡Hola amigos! How's everyone doing?",
      time: "3h ago",
      usdcAmount: "100 USDC",
      unread: 0
    });
  }
  
  return (
    <div className="w-1/3 border-r border-blueprint-line overflow-y-auto bg-blueprint-bg">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold blueprint-heading">Your Groups</h2>
          <button className="bg-blueprint-bg border border-blueprint-line text-blueprint-line rounded-full py-2 px-4 flex items-center font-mono text-sm hover:bg-blueprint-line hover:text-blueprint-bg transition-colors duration-300">
            <span className="mr-1">+</span> New Group
          </button>
        </div>
        
        <div className="space-y-3">
          {allGroups.map((currentGroup) => (
            <div 
              key={currentGroup.id} 
              onClick={() => onSelectGroup(currentGroup.id)}
              className={`bg-blueprint-bg border rounded-xl p-4 transition-colors duration-300 relative overflow-hidden cursor-pointer ${
                selectedGroup === currentGroup.id 
                  ? 'border-[#D4A84B] bg-[#D4A84B]/5' 
                  : 'border-blueprint-line hover:border-[#D4A84B]/50'
              }`}
            >
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
                <div className={`w-12 h-12 ${currentGroup.avatarBg} rounded-full flex items-center justify-center text-white font-bold mr-3 relative`}>
                  {currentGroup.avatar}
                  {currentGroup.unread && (
                    <span className="absolute -top-1 -right-1 bg-[#D4A84B] text-[#1A1A1A] text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {currentGroup.unread}
                    </span>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">
                      {currentGroup.name} <span className="ml-1">{currentGroup.flag}</span>
                    </h3>
                    <span className="text-xs text-gray-500 font-mono">{currentGroup.time}</span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-gray-600 truncate w-3/4">{currentGroup.lastMessage}</p>
                    <span className="text-xs font-mono text-[#D4A84B]">{currentGroup.usdcAmount}</span>
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500 font-mono">
                    {currentGroup.members} members
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
