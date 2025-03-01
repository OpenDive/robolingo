"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { validateInviteCode } from '@/utils/inviteCode'
import { FiClock, FiDollarSign, FiUsers } from 'react-icons/fi'
import Header from '@/components/layout/Header'
import Navigation from '@/components/layout/Navigation'

export default function InvitePage() {
  const params = useParams()
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [challenge, setChallenge] = useState<any>(null)
  
  useEffect(() => {
    if (params.code) {
      // Validate the invite code
      const valid = validateInviteCode(params.code as string)
      setIsValid(valid)
      
      if (valid) {
        // In a real app, we would fetch the challenge details from the backend
        // For now, we'll use mock data
        setChallenge({
          title: "Korean in 90 Days",
          language: "korean",
          type: (params.code as string).startsWith('NL') ? 'no-loss' : 'hardcore',
          stake: "50 USDC",
          duration: 90,
          minDailyTime: "30 minutes",
          participants: 3
        })
      }
    }
  }, [params.code])
  
  if (isValid === null) {
    return <div>Loading...</div>
  }
  
  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1 p-4 pb-20">
        <div className="max-w-2xl mx-auto">
          {isValid ? (
            <div className="bg-blueprint-bg border-1 border-blueprint-line rounded-xl p-8 relative overflow-hidden">
              {/* Floral decoration */}
              <div className="absolute -right-10 -bottom-10 w-40 h-40 opacity-10">
                <div className="w-full h-full" style={{ 
                  backgroundImage: 'url(/images/floral-pattern.svg)', 
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center'
                }}></div>
              </div>
              
              <h1 className="text-2xl font-bold text-blueprint-line mb-6">Join Challenge: {challenge.title}</h1>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-center text-blueprint-line">
                  <FiDollarSign className="mr-2" />
                  <span>Stake Amount: {challenge.stake}</span>
                </div>
                
                <div className="flex items-center text-blueprint-line">
                  <FiClock className="mr-2" />
                  <span>Duration: {challenge.duration} days</span>
                </div>
                
                <div className="flex items-center text-blueprint-line">
                  <FiClock className="mr-2" />
                  <span>Daily Requirement: {challenge.minDailyTime}</span>
                </div>
                
                <div className="flex items-center text-blueprint-line">
                  <FiUsers className="mr-2" />
                  <span>{challenge.participants} participants already joined</span>
                </div>
                
                <div className="bg-blueprint-bg/50 border border-blueprint-line rounded-lg p-4">
                  <h3 className="font-bold mb-2">Challenge Type: {challenge.type === 'no-loss' ? 'No-Loss' : 'Hardcore'}</h3>
                  <p className="text-sm text-gray-600">
                    {challenge.type === 'no-loss' 
                      ? 'Get your stake back regardless of completion.' 
                      : 'Lose your deposit if you miss the daily requirements.'}
                  </p>
                </div>
              </div>
              
              <button className="w-full bg-[#D4A84B] text-[#1A1A1A] font-semibold py-3 px-6 rounded-full hover:bg-[#B38728] transition-all duration-300">
                Join Challenge
              </button>
              
              {/* Blueprint coordinates */}
              <div className="absolute bottom-2 right-2 text-xs font-mono text-blueprint-line opacity-30">
                IC-{challenge.participants}.1
              </div>
            </div>
          ) : (
            <div className="bg-blueprint-bg border-1 border-blueprint-line rounded-xl p-8 text-center">
              <h1 className="text-2xl font-bold text-blueprint-line mb-4">Invalid Invite Code</h1>
              <p className="text-gray-600 mb-6">The invite code you provided is not valid.</p>
              <button 
                onClick={() => window.history.back()}
                className="bg-transparent hover:bg-blueprint-line text-blueprint-line hover:text-blueprint-bg font-semibold py-2 px-6 border-1 border-blueprint-line rounded-full transition-all duration-300"
              >
                Go Back
              </button>
            </div>
          )}
        </div>
      </div>
      <Navigation />
    </main>
  )
}
