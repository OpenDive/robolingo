"use client"

import { FiPlus } from 'react-icons/fi'
import Link from 'next/link'

export default function JoinChallenge() {
  return (
    <div className="relative bg-blueprint-bg border-1 border-blueprint-line rounded-xl p-6 flex flex-col items-center justify-center min-h-[200px] hover:shadow-md transition-all duration-300">
      {/* Floral decoration */}
      <div className="absolute -right-4 -top-4 w-16 h-16 opacity-20">
        <div className="w-full h-full animate-spin-reverse" style={{ 
          backgroundImage: 'url(/images/floral-pattern.svg)', 
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}></div>
      </div>
      
      {/* Measurement lines */}
      <div className="absolute left-0 top-0 w-px h-full bg-blueprint-line opacity-10"></div>
      <div className="absolute left-0 top-0 w-full h-px bg-blueprint-line opacity-10"></div>
      
      <div className="w-14 h-14 rounded-full bg-blueprint-bg border-1 border-blueprint-line flex items-center justify-center mb-4">
        <FiPlus className="text-2xl text-blueprint-line" />
      </div>
      
      <h3 className="text-lg font-bold text-blueprint-line mb-2">Join New Challenge</h3>
      <p className="text-primary-dark text-center text-sm mb-4">Find a challenge that matches your learning goals</p>
      
      <Link href="/challenge" className="bg-transparent hover:bg-blueprint-line text-blueprint-line hover:text-blueprint-bg font-semibold py-2 px-6 border-1 border-blueprint-line rounded-full transition-all duration-300">
        Create Challenge
      </Link>
      
      {/* Blueprint coordinates */}
      <div className="absolute bottom-2 right-2 text-xs font-mono text-blueprint-line opacity-30">
        JC-1.0
      </div>
    </div>
  )
}