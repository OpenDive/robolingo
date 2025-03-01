"use client"

import Header from '@/components/layout/Header'
import StoryFeed from '@/components/dashboard/StoryFeed'
import TodaysChallenge from '@/components/challenges/TodaysChallenge'
import ActiveChallenges from '@/components/challenges/ActiveChallenges'
import GroupList from '@/components/dashboard/GroupList'
import Navigation from '@/components/layout/Navigation'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1 p-4 pb-20">
        <StoryFeed />
        <div className="mt-6">
          <TodaysChallenge />
        </div>
        <div className="mt-6">
          <ActiveChallenges />
        </div>
        <div className="mt-6">
          <GroupList />
        </div>
      </div>
      <Navigation />
    </main>
  )
}