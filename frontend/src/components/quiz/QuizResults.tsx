"use client"

import { useState, useEffect } from 'react'
import { FiAward, FiTrendingUp, FiArrowRight, FiCheck, FiLoader, FiInfo } from 'react-icons/fi'
import { useChallengeContext } from '@/contexts/ChallengeContext'
import { QuizQuestion } from '@/types/quiz'
import { submitQuizResults, QuizSubmissionData } from '@/services/quizService'

interface QuizResultsProps {
  score: number
  totalQuestions: number
  questions: QuizQuestion[]
  onClose: () => void
  challengeId: number
}

export default function QuizResults({ score, totalQuestions, questions, onClose, challengeId = 1 }: QuizResultsProps) {
  const { getCurrentStreak, updateChallengeStreak } = useChallengeContext()
  const percentage = Math.round((score / totalQuestions) * 100)
  
  // Get the current streak from context
  const currentStreak = getCurrentStreak(challengeId)
  
  // State for Walrus transaction
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [blobObjectId, setBlobObjectId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLocalOnly, setIsLocalOnly] = useState(false)
  
  // Submit quiz data to Walrus on component mount and update streak
  useEffect(() => {
    // Update the challenge streak
    updateChallengeStreak(challengeId)
    
    // Only submit if not already submitted
    if (!isSubmitting && !transactionHash && !error) {
      submitQuizToWalrus()
    }
  }, [])
  
  // Function to submit quiz data to Walrus
  const submitQuizToWalrus = async () => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Generate a quiz ID using timestamp for uniqueness
      const quizId = `korean-quiz-${Date.now()}`
      
      // Prepare quiz data
      const quizData: QuizSubmissionData = {
        quizId,
        language: 'korean',
        title: 'Korean Translation Quiz',
        score,
        totalQuestions,
        percentage,
        questions,
        timestamp: new Date().toISOString(),
        challengeId
      }
      
      // Submit to API
      const response = await submitQuizResults('0xdb5b3b7499e4bedab66447a08145fa499134f02a09c133279a8496ca2907ea6a', quizData)
      
      if (response.success) {
        setTransactionHash(response.transactionHash)
        if (response.blobObjectId) {
          setBlobObjectId(response.blobObjectId)
        }
        
        // Check if we're in local-only mode
        if (response.walrusSuccess === false || response.localOnly === true) {
          setIsLocalOnly(true)
        }
      } else {
        setError(response.walrusError || 'Failed to submit quiz results')
        setIsLocalOnly(true)
      }
    } catch (err) {
      console.error('Error submitting quiz:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      setIsLocalOnly(true)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="bg-blueprint-bg border-1 border-blueprint-line rounded-xl p-6 w-full max-w-2xl mx-auto relative overflow-hidden">
      {/* Measurement lines */}
      <div className="absolute left-0 top-0 w-px h-full bg-blueprint-line opacity-10"></div>
      <div className="absolute left-0 top-0 w-full h-px bg-blueprint-line opacity-10"></div>
      
      {/* Floral decoration - top right */}
      <div className="absolute -right-10 -top-10 w-40 h-40 opacity-30 rotate-12">
        <div className="w-full h-full animate-spin-slow" style={{ 
          backgroundImage: 'url(/images/floral-pattern.svg)', 
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}></div>
      </div>
      
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-blueprint-line mb-2">Quiz Completed!</h2>
        <p className="text-primary-dark opacity-80">You've completed today's Korean challenge</p>
      </div>
      
      <div className="flex justify-center mb-8">
        <div className="relative w-40 h-40">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-500">{percentage}%</div>
              <div className="text-sm text-primary-dark">{score}/{totalQuestions} correct</div>
            </div>
          </div>
          
          {/* Circular progress indicator */}
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle 
              cx="50" cy="50" r="45" 
              fill="none" 
              stroke="#2A2A2A" 
              strokeWidth="5"
            />
            <circle 
              cx="50" cy="50" r="45" 
              fill="none" 
              stroke="#D4A84B" 
              strokeWidth="5"
              strokeDasharray={`${percentage * 2.83} 283`}
              strokeDashoffset="0"
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
          </svg>
        </div>
      </div>
      
      <div className="bg-blueprint-bg bg-opacity-50 border-1 border-blueprint-line rounded-lg p-4 mb-6">
        <div className="flex items-center mb-4">
          <div className="rounded-full p-2 bg-blueprint-line bg-opacity-20 mr-3">
            <FiAward className="text-xl text-amber-500" />
          </div>
          <div>
            <h3 className="font-bold text-blueprint-line">Daily Challenge Completed</h3>
            <p className="text-sm text-primary-dark">+20 XP earned</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="rounded-full p-2 bg-blueprint-line bg-opacity-20 mr-3">
            <FiTrendingUp className="text-xl text-amber-500" />
          </div>
          <div>
            <h3 className="font-bold text-blueprint-line">Current Streak: {currentStreak} days</h3>
            <p className="text-sm text-primary-dark">+{currentStreak * 5} bonus XP for streak</p>
          </div>
        </div>
      </div>
      
      {/* Walrus Transaction Status */}
      <div className="mb-6 p-4 border-1 border-blueprint-line rounded-lg">
        <h3 className="font-bold text-blueprint-line mb-2">Data Storage Status</h3>
        
        {isSubmitting && (
          <div className="flex items-center text-amber-500">
            <FiLoader className="animate-spin mr-2" />
            <span>Saving your results...</span>
          </div>
        )}
        
        {transactionHash && !isLocalOnly && (
          <div className="flex items-center text-green-500">
            <FiCheck className="mr-2" />
            <div>
              <p>Results saved successfully on blockchain!</p>
              {blobObjectId ? (
                <p className="text-xs font-mono mt-1 break-all">Blob Object ID: {blobObjectId}</p>
              ) : (
                <p className="text-xs font-mono mt-1 break-all">Transaction: {transactionHash}</p>
              )}
            </div>
          </div>
        )}
        
        {transactionHash && isLocalOnly && (
          <div className="flex items-center text-amber-500">
            <FiInfo className="mr-2" />
            <div>
              <p>Results saved locally</p>
              <p className="text-xs mt-1">Your results have been saved to local storage. Blockchain integration is currently unavailable.</p>
              <p className="text-xs font-mono mt-1 break-all">Local ID: {transactionHash}</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="text-red-500">
            <p>Error: {error}</p>
            <p className="text-xs mt-1">Please try again later or contact support if the issue persists.</p>
          </div>
        )}
      </div>
      
      <button 
        onClick={onClose}
        className="w-full bg-transparent hover:bg-blueprint-line text-blueprint-line hover:text-blueprint-bg font-semibold py-2 px-4 border-1 border-blueprint-line rounded-full transition-all duration-300 flex items-center justify-center group"
      >
        <span>Continue</span>
        <FiArrowRight className="ml-2 group-hover:transform group-hover:translate-x-1 transition-all duration-300" />
      </button>
      
      {/* Blueprint coordinates */}
      <div className="absolute bottom-2 right-2 text-xs font-mono text-blueprint-line opacity-30">
        QR-1.5
      </div>
    </div>
  )
}
