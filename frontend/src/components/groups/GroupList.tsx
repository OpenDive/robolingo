"use client"

import Link from 'next/link'

interface Group {
  id: string
  name: string
  description: string
  participants: number
  avatar: string
  avatarBg: string
  lastMessage: string
  time: string
  unread?: number
  ethAmount: string
}

export default function GroupList() {
  const groups: Group[] = [
    {
      id: "group-1",
      name: "Korean Basics",
      description: "Learn the fundamentals of Korean language",
      participants: 8,
      avatar: "K",
      avatarBg: "bg-blue-500",
      lastMessage: "See you all at the next meeting!",
      time: "2h ago",
      unread: 3,
      ethAmount: "50 USDC"
    },
    {
      id: "group-2",
      name: "90-Day Japanese Challenge",
      description: "Hardcore challenge for learning Japanese",
      participants: 5,
      avatar: "J",
      avatarBg: "bg-green-500",
      lastMessage: "Great progress everyone, keep it up!",
      time: "1d ago",
      unread: 0,
      ethAmount: "200 USDC"
    },
    {
      id: "group-3",
      name: "Spanish Beginners",
      description: "Spanish for complete beginners",
      participants: 6,
      avatar: "S",
      avatarBg: "bg-purple-500",
      lastMessage: "Don't forget to practice daily",
      time: "Just now",
      unread: 1,
      ethAmount: "30 USDC"
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold blueprint-heading">Your Groups</h2>
        <Link href="/new-group" className="bg-blueprint-bg border border-blueprint-line text-blueprint-line rounded-full py-2 px-4 flex items-center font-mono text-sm hover:bg-blueprint-line hover:text-blueprint-bg transition-colors duration-300">
          <span className="mr-1">+</span> New Group
        </Link>
      </div>
      
      <div className="space-y-3">
        {groups.map((group) => (
          <Link 
            key={group.id} 
            href={group.id === "group-1" ? "/groups/korean-basics" : "#"} 
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
                      {group.name} 
                    </h3>
                    <span className="text-xs text-gray-500 font-mono">{group.time}</span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-gray-600 truncate w-3/4">{group.lastMessage}</p>
                    <span className="text-xs font-mono text-[#D4A84B]">{group.ethAmount}</span>
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500 font-mono">
                    {group.participants} members
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
