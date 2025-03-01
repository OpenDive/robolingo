"use client"

import { useEffect } from 'react'
import ActiveChallenges from '@/components/challenges/ActiveChallenges'
import CreateChallengeForm from '@/components/challenges/CreateChallengeForm'
import { FiPlus, FiChevronRight } from 'react-icons/fi'
import { useState } from 'react'

export default function ChallengesPage() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold blueprint-heading">Language Challenges</h1>
        
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-primary flex items-center"
        >
          {showCreateForm ? (
            <>Hide Form <FiChevronRight className="ml-2" /></>
          ) : (
            <>Create Challenge <FiPlus className="ml-2" /></>
          )}
        </button>
      </div>
      
      {showCreateForm && (
        <div className="mb-8 bg-white bg-opacity-50 rounded-xl p-6 border-1 border-blueprint-line">
          <CreateChallengeForm onComplete={() => setShowCreateForm(false)} />
        </div>
      )}
      
      <div className="mb-8">
        <ActiveChallenges />
      </div>
      
      {/* Decorative floral elements */}
      <div className="fixed -bottom-20 -right-20 w-64 h-64 opacity-10 pointer-events-none">
        <div className="w-full h-full animate-spin-slower" style={{ 
          backgroundImage: 'url(/images/floral-pattern.svg)', 
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}></div>
      </div>
      
      <div className="fixed -top-20 -left-20 w-48 h-48 opacity-10 pointer-events-none">
        <div className="w-full h-full animate-spin-reverse" style={{ 
          backgroundImage: 'url(/images/floral-pattern.svg)', 
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}></div>
      </div>
    </div>
  )
}
