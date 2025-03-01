"use client"

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/layout/Header'
import Navigation from '@/components/layout/Navigation'
import ChatSidebar from '@/components/chat/ChatSidebar'
import ChatPanel from '@/components/chat/ChatPanel'

export default function ChatPage() {
  const searchParams = useSearchParams()
  const groupParam = searchParams.get('group')
  const [selectedGroup, setSelectedGroup] = useState<string | null>(groupParam)
  
  useEffect(() => {
    if (groupParam) {
      setSelectedGroup(groupParam)
    }
  }, [groupParam])
  
  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <ChatSidebar onSelectGroup={setSelectedGroup} selectedGroup={selectedGroup} />
        <ChatPanel groupId={selectedGroup} />
      </div>
      <Navigation />
    </main>
  )
}
