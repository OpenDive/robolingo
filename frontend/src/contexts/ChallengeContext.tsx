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
  streak?: number
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
  usdcAmount: string
}

interface ChallengeContextType {
  challenges: Challenge[]
  groups: Group[]
  addChallenge: (challenge: Omit<Challenge, 'id' | 'progress'>) => void
  addGroup: (group: Omit<Group, 'id'>) => void
  deleteChallenge: (id: number) => void
  getCurrentStreak: (challengeId: number) => number
  updateChallengeStreak: (challengeId: number) => void
}

const ChallengeContext = createContext<ChallengeContextType | undefined>(undefined)

export const ChallengeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with default challenges
  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: 1,
      title: 'Korean Basics',
      language: 'korean',
      stake: '50 USDC',
      duration: 90,
      dailyMinutes: 30,
      participants: 8,
      type: 'no-loss',
      createdAt: new Date('2023-05-01').toISOString(),
      daysLeft: 74,
      progress: 18,
      streak: 5,
    },
    {
      id: 2,
      title: 'Japanese Immersion Challenge',
      language: 'japanese',
      stake: '200 USDC',
      duration: 60,
      dailyMinutes: 45,
      participants: 5,
      type: 'hardcore',
      createdAt: new Date('2023-05-10').toISOString(),
      daysLeft: 54,
      progress: 10,
      streak: 3,
    }
  ])
  
  // Initialize with default groups
  const [groups, setGroups] = useState<Group[]>([
    {
      id: "korean-gang",
      name: "Korean Study Group",
      description: 'A group dedicated to learning Korean',
      flag: "🇰🇷",
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
      name: "Japanese Language Mastery",
      description: 'Hardcore Japanese learners',
      flag: "🇯🇵",
      avatar: "S",
      avatarBg: "bg-blue-500",
      members: 5,
      lastMessage: "I learned 20 new kanji today!",
      time: "1h ago",
      unread: 0,
      usdcAmount: "200 USDC"
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
      progress: 0, // New challenges start at 0% progress
      streak: 0 // New challenges start with 0 streak
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
  
  // Get current streak for a challenge
  const getCurrentStreak = (challengeId: number): number => {
    const challenge = challenges.find(c => c.id === challengeId)
    return challenge?.streak || 0
  }
  
  // Update streak for a challenge after completing a quiz
  const updateChallengeStreak = (challengeId: number) => {
    setChallenges(prevChallenges => {
      return prevChallenges.map(challenge => {
        if (challenge.id === challengeId) {
          return {
            ...challenge,
            streak: (challenge.streak || 0) + 1,
            progress: Math.min(100, challenge.progress + 2) // Also increase progress slightly
          }
        }
        return challenge
      })
    })
  }
  
  return (
    <ChallengeContext.Provider value={{ 
      challenges, 
      groups, 
      addChallenge, 
      addGroup, 
      deleteChallenge,
      getCurrentStreak,
      updateChallengeStreak
    }}>
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
