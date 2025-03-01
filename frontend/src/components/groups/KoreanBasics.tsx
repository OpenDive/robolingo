"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Message {
  id: number
  sender: string
  avatar: string
  content: string
  timestamp: string
  reactions?: { emoji: string, count: number }[]
}

export default function KoreanBasics() {
  const [newMessage, setNewMessage] = useState('')
  
  const groupInfo = {
    name: "Korean Gang 🇰🇷",
    members: 8,
    languages: ["English", "Korean"],
    pool: "0.05 ETH x 8 members"
  }
  
  const messages: Message[] = [
    {
      id: 1,
      sender: "Emma",
      avatar: "E",
      content: "Did you guys see Mark's attempt at saying 안녕하세요? 😂",
      timestamp: "2:30 PM",
      reactions: [
        { emoji: "😂", count: 1 },
        { emoji: "👍", count: 1 }
      ]
    },
    {
      id: 2,
      sender: "Michael",
      avatar: "M",
      content: "",
      timestamp: "2:32 PM"
    },
    {
      id: 3,
      sender: "W Bot",
      avatar: "🤖",
      content: "W Bot is watching... 7/8 members completed today's lesson. Only Mark is missing! Daily deadline: 9:00 PM (4 hours left)",
      timestamp: ""
    }
  ]
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      // Would add message to the list in a real app
      setNewMessage('')
    }
  }
  
  return (
    <div className="flex flex-col h-screen bg-blueprint-bg">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-blueprint-line relative">
        <div className="flex items-center">
          <Link href="/" className="mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 blueprint-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
              K
            </div>
            <h1 className="text-xl font-bold blueprint-heading">{groupInfo.name}</h1>
          </div>
        </div>
        
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-20 opacity-10">
          <div className="w-full h-full bg-blueprint-line" style={{ maskImage: 'url(/images/floral-pattern.svg)', maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }}></div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link href="/lessons" className="flex items-center text-blueprint-line">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Lessons
          </Link>
          
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 blueprint-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      </header>
      
      {/* Group Info */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-blueprint-line bg-blueprint-bg/50">
        <div className="flex items-center">
          <div className="flex items-center mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-blueprint-line" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-sm font-mono">{groupInfo.members} members</span>
          </div>
          
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-blueprint-line" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <span className="text-sm font-mono">{groupInfo.languages.join(", ")}</span>
          </div>
        </div>
        
        <div className="flex items-center text-[#D4A84B] font-mono text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-[#D4A84B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Group pool: {groupInfo.pool}
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-4 space-y-6 bg-blueprint-grid bg-opacity-5">
        {messages.map((message) => (
          <div key={message.id} className={`relative ${message.sender === 'W Bot' ? 'bg-blue-50 p-4 rounded-lg border border-blueprint-line' : ''}`}>
            {message.sender !== 'W Bot' && (
              <div className="flex items-start mb-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-2 ${message.sender === 'Emma' ? 'bg-blue-500' : 'bg-green-500'}`}>
                  {message.avatar}
                </div>
                <div>
                  <div className="flex items-center">
                    <span className="font-semibold mr-2">{message.sender}</span>
                    <span className="text-xs text-gray-500">{message.timestamp}</span>
                  </div>
                  {message.content && (
                    <div className="mt-1 p-3 bg-blueprint-bg border border-blueprint-line rounded-lg relative overflow-hidden">
                      {/* Subtle floral decoration */}
                      <div className="absolute top-0 right-0 w-12 h-12 opacity-5">
                        <div className="w-full h-full" style={{ 
                          backgroundImage: 'url(/images/floral-pattern.svg)', 
                          backgroundSize: 'contain',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'center'
                        }}></div>
                      </div>
                      <p>{message.content}</p>
                      
                      {message.reactions && message.reactions.length > 0 && (
                        <div className="flex mt-2 space-x-2">
                          {message.reactions.map((reaction, index) => (
                            <div key={index} className="flex items-center bg-blueprint-bg/80 border border-blueprint-line rounded-full px-2 py-1">
                              <span className="mr-1">{reaction.emoji}</span>
                              <span className="text-xs">{reaction.count}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {message.sender === 'W Bot' && (
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2 bg-blueprint-bg border border-blueprint-line">
                  {message.avatar}
                </div>
                <div className="flex-1">
                  <p className="text-blueprint-line">{message.content}</p>
                </div>
                <button className="px-4 py-2 bg-[#D4A84B] text-[#1A1A1A] rounded-full font-mono text-sm hover:bg-[#B38728] transition-colors duration-300">
                  Nudge Mark
                </button>
              </div>
            )}
          </div>
        ))}
        
        {/* Today's lesson deadline */}
        <div className="flex items-center justify-between mt-4 py-3 px-4 bg-blueprint-bg/50 border border-blueprint-line rounded-lg">
          <div className="flex items-center text-sm text-blueprint-line">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Today's lesson deadline: 9:00 PM (4 hours remaining)
          </div>
          <Link href="/lesson" className="flex items-center text-[#D4A84B] font-mono text-sm hover:text-[#B38728] transition-colors duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            Jump to lesson
          </Link>
        </div>
      </div>
      
      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-blueprint-line bg-blueprint-bg flex items-center space-x-2 mb-16">
        <button type="button" className="p-2 text-blueprint-line rounded-full hover:bg-blueprint-line/10 transition-colors duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        
        <div className="flex-1 bg-blueprint-bg border border-blueprint-line rounded-full px-4 py-2 flex items-center relative overflow-hidden">
          {/* Subtle floral decoration */}
          <div className="absolute inset-0 opacity-5">
            <div className="w-full h-full" style={{ 
              backgroundImage: 'url(/images/floral-pattern.svg)', 
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center'
            }}></div>
          </div>
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..." 
            className="flex-1 bg-transparent outline-none text-blueprint-line placeholder-blueprint-line/50 relative z-10"
          />
        </div>
        
        <button type="button" className="p-2 text-blueprint-line rounded-full hover:bg-blueprint-line/10 transition-colors duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>
        
        <button type="button" className="p-2 text-blueprint-line rounded-full hover:bg-blueprint-line/10 transition-colors duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        
        <button 
          type="submit" 
          className="p-3 bg-[#D4A84B] text-[#1A1A1A] rounded-full hover:bg-[#B38728] transition-colors duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  )
}
