"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface Message {
  id: number
  sender: string
  avatar: string
  avatarBg: string
  content: string
  timestamp: string
  reactions?: { emoji: string, count: number }[]
}

interface GroupInfo {
  id: string
  name: string
  flag: string
  members: number
  languages: string[]
  pool: string
}

interface ChatPanelProps {
  groupId: string | null
}

export default function ChatPanel({ groupId }: ChatPanelProps) {
  const [newMessage, setNewMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null)
  
  // Simulate loading group data
  useEffect(() => {
    if (!groupId) return
    
    // Korean Gang data
    if (groupId === 'korean-gang') {
      setGroupInfo({
        id: 'korean-gang',
        name: "Korean Gang 🇰🇷",
        flag: "🇰🇷",
        members: 8,
        languages: ["English", "Korean"],
        pool: "50 USDC x 8 members"
      })
      
      setMessages([
        {
          id: 1,
          sender: "Emma",
          avatar: "E",
          avatarBg: "bg-blue-500",
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
          avatarBg: "bg-green-500",
          content: "I was dying! He said something that sounded more like 'on young hot sale' 🤣",
          timestamp: "2:32 PM"
        },
        {
          id: 3,
          sender: "W Bot",
          avatar: "🤖",
          avatarBg: "bg-blueprint-bg",
          content: "W Bot is watching... 7/8 members completed today's lesson. Only Mark is missing! Daily deadline: 9:00 PM (4 hours left)",
          timestamp: ""
        }
      ])
    }
    
    // Samurai Squad data
    else if (groupId === 'samurai-squad') {
      setGroupInfo({
        id: 'samurai-squad',
        name: "Samurai Squad 🇯🇵",
        flag: "🇯🇵",
        members: 5,
        languages: ["English", "Japanese"],
        pool: "200 USDC x 5 members"
      })
      
      setMessages([
        {
          id: 1,
          sender: "Sarah",
          avatar: "S",
          avatarBg: "bg-purple-500",
          content: "I'll complete today's lesson after dinner",
          timestamp: "1:15 PM"
        },
        {
          id: 2,
          sender: "W Bot",
          avatar: "🤖",
          avatarBg: "bg-blueprint-bg",
          content: "Great! 3/5 members have already completed today's lesson on basic greetings.",
          timestamp: ""
        }
      ])
    }
    
    // Spanish Fiesta data
    else if (groupId === 'spanish-fiesta') {
      setGroupInfo({
        id: 'spanish-fiesta',
        name: "Spanish Fiesta 🇪🇸",
        flag: "🇪🇸",
        members: 6,
        languages: ["English", "Spanish"],
        pool: "30 USDC x 6 members"
      })
      
      setMessages([
        {
          id: 1,
          sender: "W Bot",
          avatar: "🤖",
          avatarBg: "bg-blueprint-bg",
          content: "Emma's on a 7-day streak! She's earned a bonus of 5 USDC from the group pool.",
          timestamp: "10:30 AM"
        },
        {
          id: 2,
          sender: "Mark",
          avatar: "M",
          avatarBg: "bg-yellow-500",
          content: "Congrats Emma! 🎉 I'm only at 3 days but I'm catching up!",
          timestamp: "11:45 AM"
        }
      ])
    }
    
    // Default case for any new groups
    else {
      // Extract group name from the ID
      const groupName = groupId.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      
      // Determine language from group name
      let language = "Unknown";
      let flag = "🌎";
      
      if (groupName.toLowerCase().includes('korean')) {
        language = "Korean";
        flag = "🇰🇷";
      } else if (groupName.toLowerCase().includes('spanish')) {
        language = "Spanish";
        flag = "🇪🇸";
      } else if (groupName.toLowerCase().includes('japanese')) {
        language = "Japanese";
        flag = "🇯🇵";
      } else if (groupName.toLowerCase().includes('french')) {
        language = "French";
        flag = "🇫🇷";
      } else if (groupName.toLowerCase().includes('german')) {
        language = "German";
        flag = "🇩🇪";
      } else if (groupName.toLowerCase().includes('italian')) {
        language = "Italian";
        flag = "🇮🇹";
      } else if (groupName.toLowerCase().includes('chinese')) {
        language = "Chinese";
        flag = "🇨🇳";
      }
      
      setGroupInfo({
        id: groupId,
        name: `${groupName} ${flag}`,
        flag: flag,
        members: 2, // Default number of members
        languages: ["English", language],
        pool: "50 USDC x 2 members" // Default pool
      });
      
      setMessages([
        {
          id: 1,
          sender: "W Bot",
          avatar: "🤖",
          avatarBg: "bg-blueprint-bg",
          content: `Challenge created! Let's get started!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [groupId])
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim() && groupId) {
      const newMsg: Message = {
        id: messages.length + 1,
        sender: "You",
        avatar: "Y",
        avatarBg: "bg-blue-500",
        content: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      
      setMessages([...messages, newMsg])
      setNewMessage('')
      
      // Show typing indicator
      setMessages(prev => [...prev, {
        id: -1, // Temporary ID for typing indicator
        sender: "W Bot",
        avatar: "🤖",
        avatarBg: "bg-blueprint-bg",
        content: "...",
        timestamp: ""
      }]);
      
      // Generate response from W Bot using Atoma LLM
      fetch('/api/bot-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: newMessage,
          groupId,
          language: groupInfo?.languages?.[1] || null
        }),
      })
      .then(response => response.json())
      .then(data => {
        // Remove typing indicator
        setMessages(prev => prev.filter(msg => msg.id !== -1));
        
        // Add the real W bot response
        const botMsg: Message = {
          id: messages.length + 2,
          sender: "W Bot",
          avatar: "🤖",
          avatarBg: "bg-blueprint-bg",
          content: data.success ? data.response : "I'm having trouble connecting right now. Please try again later!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
        
        setMessages(prev => [...prev, botMsg]);
      })
      .catch(error => {
        console.error('Error getting bot response:', error);
        
        // Remove typing indicator
        setMessages(prev => prev.filter(msg => msg.id !== -1));
        
        // Add fallback response
        const errorMsg: Message = {
          id: messages.length + 2,
          sender: "W Bot",
          avatar: "🤖",
          avatarBg: "bg-blueprint-bg",
          content: "Sorry, I'm having trouble connecting right now. Please try again later!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
        
        setMessages(prev => [...prev, errorMsg]);
      });
    }
  }
  
  if (!groupId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-blueprint-grid bg-opacity-5">
        <div className="text-center p-8 max-w-md">
          <div className="w-24 h-24 mx-auto opacity-20 mb-4">
            <div className="w-full h-full animate-spin-slow" style={{ 
              backgroundImage: 'url(/images/floral-pattern.svg)', 
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center'
            }}></div>
          </div>
          <h2 className="text-xl font-bold blueprint-heading mb-2">Select a group to start chatting</h2>
          <p className="text-gray-600">Choose one of your language learning groups from the sidebar</p>
        </div>
      </div>
    )
  }
  
  if (!groupInfo) {
    return (
      <div className="flex-1 flex items-center justify-center bg-blueprint-grid bg-opacity-5">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-[#D4A84B] border-blueprint-line rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex-1 flex flex-col bg-blueprint-grid bg-opacity-5">
      {/* Header */}
      <div className="p-4 border-b border-blueprint-line bg-blueprint-bg flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
            {groupInfo.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-lg font-bold blueprint-heading">{groupInfo.name}</h1>
            <div className="flex items-center text-xs text-gray-500">
              <span className="mr-2">{groupInfo.members} members</span>
              <span>{groupInfo.languages.join(", ")}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center text-[#D4A84B] font-mono text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-[#D4A84B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Pool: {groupInfo.pool}
          </div>
          
          <button className="p-2 text-blueprint-line rounded-full hover:bg-blueprint-line/10 transition-colors duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-4 space-y-6">
        {messages.map((message) => (
          <div key={message.id} className={`relative ${message.sender === 'W Bot' ? 'bg-blue-50 p-4 rounded-lg border border-blueprint-line' : ''}`}>
            {message.sender !== 'W Bot' && (
              <div className="flex items-start mb-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-2 ${message.avatarBg}`}>
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
                  <p className="text-blueprint-line">
                    {message.content === "..." ? (
                      <span className="typing-indicator">
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                      </span>
                    ) : (
                      message.content
                    )}
                  </p>
                </div>
                {message.content.includes('Mark is missing') && (
                  <button className="px-4 py-2 bg-[#D4A84B] text-[#1A1A1A] rounded-full font-mono text-sm hover:bg-[#B38728] transition-colors duration-300">
                    Nudge Mark
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
        
        {/* Today's lesson deadline */}
        {groupId === 'korean-gang' && (
          <div className="flex items-center justify-between mt-4 py-3 px-4 bg-blueprint-bg/50 border border-blueprint-line rounded-lg">
            <div className="flex items-center text-sm text-blueprint-line">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Today's lesson deadline: 9:00 PM (4 hours remaining)
            </div>
            <button className="flex items-center text-[#D4A84B] font-mono text-sm hover:text-[#B38728] transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
              Jump to lesson
            </button>
          </div>
        )}
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
