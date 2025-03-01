"use client"

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Navigation from '@/components/layout/Navigation'
import CreateChallengeForm from '@/components/challenges/CreateChallengeForm'

export default function ChallengePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1 p-4 pb-20">
        <CreateChallengeForm />
      </div>
      <Navigation />
    </main>
  )
}
