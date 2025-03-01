"use client"

import { useState } from 'react'
import { FiClock, FiUsers, FiArrowRight } from 'react-icons/fi'

export default function TodaysChallenge() {
  const [isHovering, setIsHovering] = useState(false)
  
  return (
    <div className="relative bg-blueprint-bg border-1 border-blueprint-line rounded-xl p-6 mb-6 overflow-hidden"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
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
      
      <div className="flex items-center mb-4">
        <div className="relative mr-4">
          <div className="w-16 h-16 rounded-full bg-blueprint-bg border-2 border-blueprint-line relative overflow-hidden flex items-center justify-center">
            {/* Gear-like avatar background */}
            <div className="absolute inset-0 opacity-10 animate-spin-slow" style={{ 
              backgroundImage: 'url(/images/floral-pattern.svg)', 
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center'
            }}></div>
            <span className="text-xl font-bold text-blueprint-line relative z-10">KR</span>
          </div>
          {/* Technical measurement circle */}
          <div className="absolute -top-1 -left-1 -right-1 -bottom-1 rounded-full border-1 border-dashed border-blueprint-line opacity-30"></div>
        </div>
        
        <div>
          <h2 className="text-xl font-bold text-blueprint-line">Today's Challenge</h2>
          <p className="text-primary-dark opacity-80">Korean Basics - Lesson 3</p>
        </div>
      </div>
      
      <div className="bg-blueprint-bg bg-opacity-50 border-1 border-blueprint-line rounded-lg p-4 mb-4">
        <p className="text-primary-dark mb-2">Complete the following exercise:</p>
        <p className="font-mono text-blueprint-line font-semibold">Translate 5 basic Korean phrases into English</p>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center text-sm text-primary-dark">
          <FiClock className="mr-1 text-blueprint-line" />
          <span>83 days left</span>
        </div>
        <div className="flex items-center text-sm text-primary-dark">
          <FiUsers className="mr-1 text-blueprint-line" />
          <span>8 participants</span>
        </div>
      </div>
      
      <button 
        className="w-full bg-transparent hover:bg-blueprint-line text-blueprint-line hover:text-blueprint-bg font-semibold py-2 px-4 border-1 border-blueprint-line rounded-full transition-all duration-300 flex items-center justify-center group"
      >
        <span>Start Today's Challenge</span>
        <FiArrowRight className={`ml-2 transition-all duration-300 ${isHovering ? 'transform translate-x-1' : ''}`} />
      </button>
      
      {/* Blueprint coordinates */}
      <div className="absolute bottom-2 right-2 text-xs font-mono text-blueprint-line opacity-30">
        TC-3.8
      </div>
    </div>
  )
}