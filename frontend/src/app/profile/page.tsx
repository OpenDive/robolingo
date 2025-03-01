"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  FiUser, 
  FiSettings, 
  FiAward, 
  FiTrendingUp, 
  FiStar, 
  FiClock, 
  FiCalendar, 
  FiDollarSign,
  FiActivity,
  FiGlobe
} from 'react-icons/fi'

interface Achievement {
  id: string
  title: string
  description: string
  date: string
  icon: string
}

interface LanguageProgress {
  language: string
  flag: string
  proficiency: number
  streak: number
  totalHours: number
  level: string
}

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [languages, setLanguages] = useState<LanguageProgress[]>([])
  const [activeTab, setActiveTab] = useState('progress')
  
  // Mock data
  useEffect(() => {
    setTimeout(() => {
      setAchievements([
        {
          id: 'achievement1',
          title: '7-Day Streak',
          description: 'Completed 7 consecutive days of language learning',
          date: 'February 23, 2025',
          icon: '🔥'
        },
        {
          id: 'achievement2',
          title: 'Vocabulary Master',
          description: 'Learned 500 new words in Korean',
          date: 'February 15, 2025',
          icon: '📚'
        },
        {
          id: 'achievement3',
          title: 'Grammar Guru',
          description: 'Completed all grammar lessons in Japanese Basics',
          date: 'January 30, 2025',
          icon: '🏆'
        },
        {
          id: 'achievement4',
          title: 'First Challenge',
          description: 'Joined your first language challenge',
          date: 'January 10, 2025',
          icon: '🚀'
        }
      ])
      
      setLanguages([
        {
          language: 'Korean',
          flag: '🇰🇷',
          proficiency: 65,
          streak: 23,
          totalHours: 78,
          level: 'Intermediate'
        },
        {
          language: 'Japanese',
          flag: '🇯🇵',
          proficiency: 42,
          streak: 8,
          totalHours: 45,
          level: 'Beginner'
        },
        {
          language: 'Spanish',
          flag: '🇪🇸',
          proficiency: 25,
          streak: 5,
          totalHours: 24,
          level: 'Beginner'
        }
      ])
      
      setIsLoading(false)
    }, 800)
  }, [])
  
  return (
    <div className="py-8 px-4 md:px-8 max-w-4xl mx-auto pb-20">
      {/* Profile Header */}
      <div className="bg-blueprint-bg border border-blueprint-line rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#2A2A2A] border-2 border-[#D4A84B] flex items-center justify-center overflow-hidden">
              <FiUser className="text-[#D4A84B] text-5xl" />
            </div>
            <div className="absolute bottom-0 right-0 bg-[#D4A84B] rounded-full p-1">
              <FiSettings className="text-lg text-[#2A2A2A]" />
            </div>
          </div>
          
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-blueprint-line font-mono mb-2">John Doe</h1>
            <p className="text-gray-400 mb-4">Joined January 2025</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <div className="flex items-center bg-[#2A2A2A] rounded-full px-3 py-1">
                <FiAward className="text-[#D4A84B] mr-2" />
                <span className="text-white text-sm">4 Achievements</span>
              </div>
              <div className="flex items-center bg-[#2A2A2A] rounded-full px-3 py-1">
                <FiTrendingUp className="text-[#D4A84B] mr-2" />
                <span className="text-white text-sm">Level 12</span>
              </div>
              <div className="flex items-center bg-[#2A2A2A] rounded-full px-3 py-1">
                <FiStar className="text-[#D4A84B] mr-2" />
                <span className="text-white text-sm">850 XP</span>
              </div>
              <div className="flex items-center bg-[#2A2A2A] rounded-full px-3 py-1">
                <FiClock className="text-[#D4A84B] mr-2" />
                <span className="text-white text-sm">23 Day Streak</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-blueprint-line">
          <div className="flex items-center justify-between mb-2">
            <div className="text-blueprint-line font-semibold">Current Stake</div>
            <div className="text-[#D4A84B] font-mono font-bold">300 USDC</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-blueprint-line font-semibold">Potential Yield</div>
            <div className="text-[#D4A84B] font-mono font-bold">15 USDC</div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-blueprint-line mb-6">
        <button 
          onClick={() => setActiveTab('progress')} 
          className={`py-3 px-5 font-medium text-sm ${
            activeTab === 'progress' 
              ? 'border-b-2 border-[#D4A84B] text-[#D4A84B]' 
              : 'text-blueprint-line'
          }`}
        >
          Language Progress
        </button>
        <button 
          onClick={() => setActiveTab('achievements')} 
          className={`py-3 px-5 font-medium text-sm ${
            activeTab === 'achievements' 
              ? 'border-b-2 border-[#D4A84B] text-[#D4A84B]' 
              : 'text-blueprint-line'
          }`}
        >
          Achievements
        </button>
        <button 
          onClick={() => setActiveTab('rewards')} 
          className={`py-3 px-5 font-medium text-sm ${
            activeTab === 'rewards' 
              ? 'border-b-2 border-[#D4A84B] text-[#D4A84B]' 
              : 'text-blueprint-line'
          }`}
        >
          Rewards
        </button>
      </div>
      
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-40 bg-gray-300 rounded-lg mb-4"></div>
          <div className="h-40 bg-gray-300 rounded-lg"></div>
        </div>
      ) : (
        <>
          {/* Language Progress Tab */}
          {activeTab === 'progress' && (
            <div className="space-y-6">
              {languages.map((language) => (
                <div key={language.language} className="bg-blueprint-bg border border-blueprint-line rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <div className="text-3xl mr-3">{language.flag}</div>
                      <div>
                        <h3 className="text-xl font-semibold text-blueprint-line">{language.language}</h3>
                        <div className="text-sm text-gray-400">{language.level}</div>
                      </div>
                    </div>
                    <Link href={`/challenges?language=${language.language.toLowerCase()}`} className="text-[#D4A84B] text-sm hover:underline">
                      Find Challenges
                    </Link>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400 text-sm">Proficiency</span>
                      <span className="text-gray-400 text-sm">{language.proficiency}%</span>
                    </div>
                    <div className="w-full bg-[#2A2A2A] rounded-full h-2.5">
                      <div 
                        className="bg-[#D4A84B] h-2.5 rounded-full" 
                        style={{ width: `${language.proficiency}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-[#2A2A2A] rounded-lg p-3 flex items-center">
                      <FiCalendar className="text-[#D4A84B] text-lg mr-3" />
                      <div>
                        <div className="text-gray-400 text-xs">Current Streak</div>
                        <div className="text-white font-medium">{language.streak} days</div>
                      </div>
                    </div>
                    
                    <div className="bg-[#2A2A2A] rounded-lg p-3 flex items-center">
                      <FiClock className="text-[#D4A84B] text-lg mr-3" />
                      <div>
                        <div className="text-gray-400 text-xs">Total Hours</div>
                        <div className="text-white font-medium">{language.totalHours} hours</div>
                      </div>
                    </div>
                    
                    <div className="bg-[#2A2A2A] rounded-lg p-3 flex items-center col-span-2 md:col-span-1">
                      <FiActivity className="text-[#D4A84B] text-lg mr-3" />
                      <div>
                        <div className="text-gray-400 text-xs">Last Practice</div>
                        <div className="text-white font-medium">Today</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="flex justify-center">
                <button className="flex items-center bg-[#2A2A2A] hover:bg-[#3A3A3A] text-[#D4A84B] font-medium py-2 px-4 rounded-lg border border-[#D4A84B] transition-colors duration-300">
                  <FiGlobe className="mr-2" /> Add New Language
                </button>
              </div>
            </div>
          )}
          
          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div className="space-y-4">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="bg-blueprint-bg border border-blueprint-line rounded-lg p-4 flex items-start">
                  <div className="flex-shrink-0 bg-[#2A2A2A] h-12 w-12 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">{achievement.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-blueprint-line font-semibold">{achievement.title}</h3>
                    <p className="text-gray-400 text-sm">{achievement.description}</p>
                    <div className="text-[#D4A84B] text-xs mt-1">{achievement.date}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Rewards Tab */}
          {activeTab === 'rewards' && (
            <div>
              <div className="bg-blueprint-bg border border-blueprint-line rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold text-blueprint-line mb-4">Earned Rewards</h3>
                
                <div className="flex justify-between items-center pb-4 mb-4 border-b border-blueprint-line">
                  <div className="flex items-center">
                    <div className="bg-[#2A2A2A] h-10 w-10 rounded-lg flex items-center justify-center mr-3">
                      <FiDollarSign className="text-[#D4A84B]" />
                    </div>
                    <div>
                      <div className="text-blueprint-line font-medium">Consistent Learner Bonus</div>
                      <div className="text-gray-400 text-sm">30-day streak achievement</div>
                    </div>
                  </div>
                  <div className="text-[#D4A84B] font-mono font-bold">5 USDC</div>
                </div>
                
                <div className="flex justify-between items-center pb-4 mb-4 border-b border-blueprint-line">
                  <div className="flex items-center">
                    <div className="bg-[#2A2A2A] h-10 w-10 rounded-lg flex items-center justify-center mr-3">
                      <FiDollarSign className="text-[#D4A84B]" />
                    </div>
                    <div>
                      <div className="text-blueprint-line font-medium">Challenge Completion Reward</div>
                      <div className="text-gray-400 text-sm">Spanish Basics Challenge</div>
                    </div>
                  </div>
                  <div className="text-[#D4A84B] font-mono font-bold">10 USDC</div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="bg-[#2A2A2A] h-10 w-10 rounded-lg flex items-center justify-center mr-3">
                      <FiDollarSign className="text-[#D4A84B]" />
                    </div>
                    <div>
                      <div className="text-blueprint-line font-medium">Group Participation Bonus</div>
                      <div className="text-gray-400 text-sm">Korean Gang active member</div>
                    </div>
                  </div>
                  <div className="text-[#D4A84B] font-mono font-bold">3 USDC</div>
                </div>
              </div>
              
              <div className="bg-blueprint-bg border border-blueprint-line rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-blueprint-line">Available to Withdraw</h3>
                  <div className="text-[#D4A84B] font-mono font-bold text-2xl">18 USDC</div>
                </div>
                
                <button className="w-full bg-[#D4A84B] hover:bg-[#C39A40] text-[#2A2A2A] font-bold py-3 rounded-lg transition-colors duration-300">
                  Withdraw to Wallet
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
