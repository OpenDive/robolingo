/**
 * Service for handling quiz-related operations
 */

import { QuizQuestion } from '@/types/quiz'

export interface QuizSubmissionData {
  quizId: string
  language: string
  title: string
  score: number
  totalQuestions: number
  percentage: number
  questions: QuizQuestion[]
  timestamp: string
  challengeId: number
}

interface QuizResultsResponse {
  success: boolean
  transactionHash?: string
  id?: string
  walrusSuccess?: boolean
  walrusError?: string
  blobObjectId?: string
  error?: string
}

/**
 * Submit quiz results to the API
 * @param walletId - Wallet ID of the user
 * @param quizData - Quiz data to submit
 * @returns Promise with the response from the API
 */
export async function submitQuizResults(
  walletId: string,
  quizData: QuizSubmissionData
): Promise<QuizResultsResponse> {
  try {
    const response = await fetch('/api/quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ walletId, quizData }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        `API error: ${response.status} ${response.statusText}. ${errorData.error || ''}`
      )
    }

    return await response.json()
  } catch (error) {
    console.error('Error submitting quiz results:', error)
    throw error
  }
}

/**
 * Get quiz results for a specific wallet ID
 * @param walletId - Wallet ID to get results for
 * @returns Promise with the quiz results
 */
export async function getQuizResults(walletId: string) {
  try {
    const response = await fetch(`/api/quiz?walletId=${encodeURIComponent(walletId)}`)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        `API error: ${response.status} ${response.statusText}. ${errorData.error || ''}`
      )
    }

    return await response.json()
  } catch (error) {
    console.error('Error getting quiz results:', error)
    throw error
  }
}
