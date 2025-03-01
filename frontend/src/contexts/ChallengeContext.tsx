"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface Challenge {
  id: number
  title: string
  daysLeft: number
  stake: string
  progress: number
  participants: number
  language?: string
  minDailyTime?: number
  type?: 'no-loss' | 'hardcore'
  createdAt?: Date
}

export interface Group {
  id: string
  name: string
  flag: string
  avatar: string
  avatarBg: string
  members: number
  lastMessage: string
  time: string
  unread: number
  ethAmount: string
}

interface ChallengeContextType {
  challenges: Challenge[]
  groups: Group[]
  addChallenge: (challenge: Omit<Challenge, 'id' | 'progress'>) => void
  addGroup: (group: Omit<Group, 'id'>) => void
  deleteChallenge: (id: number) => void
}

const ChallengeContext = createContext<ChallengeContextType | undefined>(undefined)

export const ChallengeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with default challenges
  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: 1,
      title: 'Korean Basics',
      daysLeft: 83,
      stake: '0.05 ETH',
      progress: 7,
      participants: 8,
      language: 'korean',
      minDailyTime: 30,
      type: 'no-loss'
    },
    {
      id: 2,
      title: 'Japanese for Business',
      daysLeft: 60,
      stake: '0.2 ETH',
      progress: 30,
      participants: 5,
      language: 'japanese',
      minDailyTime: 45,
      type: 'hardcore'
    }
  ])
  
  // Initialize with default groups
  const [groups, setGroups] = useState<Group[]>([
    {
      id: "korean-gang",
      name: "Korean Gang",
      flag: "🇰🇷",
      avatar: "K",
      avatarBg: "bg-purple-500",
      members: 8,
      lastMessage: "Did you guys see Mark's attempt at saying 안녕하세요?",
      time: "2m ago",
      unread: 3,
      ethAmount: "0.05 ETH"
    },
    {
      id: "samurai-squad",
      name: "Samurai Squad",
      flag: "🇯🇵",
      avatar: "S",
      avatarBg: "bg-blue-500",
      members: 5,
      lastMessage: "I learned 20 new kanji today!",
      time: "1h ago",
      unread: 0,
      ethAmount: "0.2 ETH"
    }
  ])
  
  // Load from localStorage on initial render
  useEffect(() => {
    const savedChallenges = localStorage.getItem('challenges')
    const savedGroups = localStorage.getItem('groups')
    
    if (savedChallenges) {
      setChallenges(JSON.parse(savedChallenges))
    }
    
    if (savedGroups) {
      setGroups(JSON.parse(savedGroups))
    }
  }, [])
  
  // Save to localStorage whenever challenges or groups change
  useEffect(() => {
    localStorage.setItem('challenges', JSON.stringify(challenges))
    localStorage.setItem('groups', JSON.stringify(groups))
  }, [challenges, groups])
  
  // Add a new challenge
  const addChallenge = (challenge: Omit<Challenge, 'id' | 'progress'>) => {
    const newChallenge: Challenge = {
      ...challenge,
      id: challenges.length + 1,
      progress: 0 // New challenges start at 0% progress
    }
    
    setChallenges([...challenges, newChallenge])
  }
  
  // Delete a challenge
  const deleteChallenge = (id: number) => {
    setChallenges(challenges.filter(challenge => challenge.id !== id))
  }
  
  // Add a new group
  const addGroup = (group: Omit<Group, 'id'>) => {
    // Generate a slug-like ID from the name
    const id = group.name.toLowerCase().replace(/\s+/g, '-')
    const newGroup: Group = {
      ...group,
      id
    }
    
    setGroups([...groups, newGroup])
  }
  
  return (
    <ChallengeContext.Provider value={{ challenges, groups, addChallenge, addGroup, deleteChallenge }}>
      {children}
    </ChallengeContext.Provider>
  )
}

export const useChallengeContext = () => {
  const context = useContext(ChallengeContext)
  if (context === undefined) {
    throw new Error('useChallengeContext must be used within a ChallengeProvider')
  }
  return context
}
