"use client"

import { useState, useEffect } from 'react'
import { QuizQuestion } from '@/types/quiz'
import { FiCheck, FiX, FiArrowRight } from 'react-icons/fi'

// Korean phrases with English translations
const koreanPhrases: QuizQuestion[] = [
  {
    id: 1,
    text: "안녕하세요",
    correctAnswer: "Hello",
  },
  {
    id: 2,
    text: "감사합니다",
    correctAnswer: "Thank you",
  },
  {
    id: 3,
    text: "실례합니다",
    correctAnswer: "Excuse me",
  },
  {
    id: 4,
    text: "안녕히 계세요",
    correctAnswer: "Goodbye",
  },
  {
    id: 5,
    text: "잘 지내세요?",
    correctAnswer: "How are you?",
  }
]

interface KoreanQuizProps {
  onComplete: (score: number, totalQuestions: number, questions: QuizQuestion[]) => void
  onCancel: () => void
  challengeId: number
}

export default function KoreanQuiz({ onComplete, onCancel, challengeId = 1 }: KoreanQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null)
  const [score, setScore] = useState(0)
  const [questions, setQuestions] = useState<QuizQuestion[]>(koreanPhrases)
  const [isComplete, setIsComplete] = useState(false)
  const [waitingForNextQuestion, setWaitingForNextQuestion] = useState(false)
  
  const currentQuestion = questions[currentQuestionIndex]
  
  // Check the answer and provide feedback
  const checkAnswer = () => {
    if (waitingForNextQuestion || feedback !== null) return
    
    const isCorrect = userAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim()
    
    // Update the question with user's answer and result
    const updatedQuestions = [...questions]
    updatedQuestions[currentQuestionIndex] = {
      ...currentQuestion,
      userAnswer,
      isCorrect
    }
    setQuestions(updatedQuestions)
    
    // Set feedback and increment score if correct
    setFeedback(isCorrect ? 'correct' : 'incorrect')
    if (isCorrect) {
      setScore(score + 1)
    }
    
    // Set waiting flag to prevent multiple submissions
    setWaitingForNextQuestion(true)
    
    // Automatically move to next question after a short delay
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setUserAnswer("")
        setFeedback(null)
        setWaitingForNextQuestion(false)
      } else {
        setIsComplete(true)
        // Pass all questions data with the completion callback
        onComplete(
          score + (isCorrect ? 1 : 0), 
          questions.length,
          updatedQuestions
        )
      }
    }, 1500)
  }
  
  // Handle enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && userAnswer.trim() !== "" && feedback === null && !waitingForNextQuestion) {
      checkAnswer()
    }
  }
  
  // Auto-focus input field when question changes
  useEffect(() => {
    const inputElement = document.getElementById('answer-input')
    if (inputElement) {
      inputElement.focus()
    }
  }, [currentQuestionIndex])
  
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
      
      <div className="flex items-center mb-6">
        <div className="mr-4">
          <span className="text-4xl">🇰🇷</span>
        </div>
        
        <div>
          <h2 className="text-xl font-bold text-blueprint-line">Korean Translation Quiz</h2>
          <p className="text-primary-dark opacity-80">Translate the Korean phrases to English</p>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-primary-dark">Progress</span>
          <span className="text-sm text-primary-dark">{currentQuestionIndex + 1}/{questions.length}</span>
        </div>
        <div className="h-1.5 w-full bg-blueprint-bg border-1 border-blueprint-line rounded-full overflow-hidden">
          <div 
            className="h-full bg-blueprint-line transition-all duration-300"
            style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="mb-6">
        <div className="text-center p-5 mb-4 bg-blueprint-bg bg-opacity-50 border-1 border-blueprint-line rounded-lg">
          <h3 className="text-2xl font-bold text-blueprint-line mb-1">{currentQuestion.text}</h3>
          <p className="text-primary-dark opacity-80">Translate to English</p>
        </div>

        {/* Input field */}
        <div className="relative">
          <input
            id="answer-input"
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className={`w-full p-3 border-1 rounded-lg bg-blueprint-bg bg-opacity-30 focus:outline-none focus:ring-1 focus:ring-amber-500
              ${feedback === 'correct' ? 'border-green-500 text-green-500' : 
                feedback === 'incorrect' ? 'border-red-500 text-red-500' : 
                'border-blueprint-line text-blueprint-line'}`}
            disabled={feedback !== null || waitingForNextQuestion}
            onKeyPress={handleKeyPress}
          />
          
          {feedback && (
            <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 
              ${feedback === 'correct' ? 'text-green-500' : 'text-red-500'}`}>
              {feedback === 'correct' ? <FiCheck size={20} /> : <FiX size={20} />}
            </div>
          )}
        </div>
        
        {feedback === 'incorrect' && (
          <p className="mt-2 text-red-500 transition-opacity duration-200">
            Correct answer: {currentQuestion.correctAnswer}
          </p>
        )}
      </div>

      {/* Next question hint if waiting */}
      {waitingForNextQuestion && currentQuestionIndex < questions.length - 1 && (
        <div className="text-sm text-center text-amber-500 mb-4 animate-pulse">
          Next question coming up...
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <button 
          onClick={onCancel}
          className="px-4 py-2 text-blueprint-line hover:underline"
        >
          Cancel
        </button>
        
        <button 
          onClick={checkAnswer}
          disabled={userAnswer.trim() === "" || feedback !== null || waitingForNextQuestion}
          className={`flex items-center justify-center px-6 py-2 rounded-full border-1 border-blueprint-line
            ${userAnswer.trim() === "" || feedback !== null || waitingForNextQuestion ? 
              'bg-transparent text-blueprint-line opacity-50 cursor-not-allowed' : 
              'bg-transparent hover:bg-blueprint-line text-blueprint-line hover:text-blueprint-bg transition-all duration-300'}`}
        >
          <span>Submit</span>
          <FiArrowRight className="ml-2" />
        </button>
      </div>
      
      {/* Blueprint coordinates */}
      <div className="absolute bottom-2 right-2 text-xs font-mono text-blueprint-line opacity-30">
        KQ-1.2
      </div>
    </div>
  )
}
