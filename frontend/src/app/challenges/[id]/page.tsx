"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useChallengeContext, Challenge } from '@/contexts/ChallengeContext'
import ChallengeDashboard from '@/components/challenges/ChallengeDashboard'
import { FiArrowLeft } from 'react-icons/fi'
import Link from 'next/link'

export default function ChallengePage() {
  const params = useParams()
  const { challenges } = useChallengeContext()
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (params.id && challenges.length > 0) {
      const foundChallenge = challenges.find(c => c.id.toString() === params.id)
      setChallenge(foundChallenge || null)
      setLoading(false)
    }
  }, [params.id, challenges])
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 animate-spin-slow" style={{ 
          backgroundImage: 'url(/images/gear.svg)', 
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}></div>
      </div>
    )
  }
  
  if (!challenge) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link href="/challenges" className="flex items-center text-blueprint-line mb-4 hover:underline">
          <FiArrowLeft className="mr-2" /> Back to Challenges
        </Link>
        <div className="bg-blueprint-bg rounded-xl p-6 border-1 border-blueprint-line text-center">
          <h2 className="text-2xl font-bold text-primary-dark mb-4">Challenge Not Found</h2>
          <p className="text-primary-dark mb-6">The challenge you're looking for doesn't exist or has been removed.</p>
          <Link href="/challenges" className="btn-primary">
            View All Challenges
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/challenges" className="flex items-center text-blueprint-line mb-4 hover:underline">
        <FiArrowLeft className="mr-2" /> Back to Challenges
      </Link>
      <ChallengeDashboard challenge={challenge} />
    </div>
  )
}
