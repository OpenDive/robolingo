"use client"

import { useState } from 'react'
import { FiDollarSign, FiClock, FiUsers, FiLink, FiCheck, FiX, FiCopy } from 'react-icons/fi'
import Link from 'next/link'
import { generateInviteCode } from '@/utils/inviteCode'
import { useChallengeContext } from '@/contexts/ChallengeContext';

export default function CreateChallengeForm() {
  const { addChallenge, addGroup } = useChallengeContext();
  const [challengeType, setChallengeType] = useState<'no-loss' | 'hardcore'>('no-loss')
  const [title, setTitle] = useState('')
  const [language, setLanguage] = useState('')
  const [stake, setStake] = useState('')
  const [duration, setDuration] = useState('30')
  const [minDailyTime, setMinDailyTime] = useState('30')
  const [inviteLink, setInviteLink] = useState('')
  const [showSuccessScreen, setShowSuccessScreen] = useState(false)
  const [participants, setParticipants] = useState<string[]>([''])
  const [inviteCode, setInviteCode] = useState('')
  const [showCopiedMessage, setShowCopiedMessage] = useState(false)
  const [showCopiedLinkMessage, setShowCopiedLinkMessage] = useState(false)
  
  const handleAddParticipant = () => {
    setParticipants([...participants, ''])
  }
  
  const handleParticipantChange = (index: number, value: string) => {
    const newParticipants = [...participants]
    newParticipants[index] = value
    setParticipants(newParticipants)
  }
  
  const handleRemoveParticipant = (index: number) => {
    const newParticipants = [...participants]
    newParticipants.splice(index, 1)
    setParticipants(newParticipants)
  }
  
  const handleCreateChallenge = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Generate invite code
    const code = generateInviteCode(challengeType)
    setInviteCode(code)
    
    // Create invite link
    const link = `${window.location.origin}/invite/${code}`
    setInviteLink(link)
    
    // Add challenge to context
    addChallenge({
      title: title,
      daysLeft: parseInt(duration),
      stake: `${stake} ETH`,
      participants: participants.length + 1, // +1 for the creator
      language: language,
      minDailyTime: parseInt(minDailyTime),
      type: challengeType === 'no-loss' ? 'no-loss' : 'hardcore',
      createdAt: new Date()
    });
    
    // Add group to context if it's a group challenge
    if (participants.length > 0) {
      // Create a group name based on the challenge title
      const groupName = `${title} Group`;
      
      // Determine flag emoji based on language
      let flag = '🌎';
      if (language === 'korean') flag = '🇰🇷';
      if (language === 'japanese') flag = '🇯🇵';
      if (language === 'mandarin') flag = '🇨🇳';
      if (language === 'spanish') flag = '🇪🇸';
      if (language === 'french') flag = '🇫🇷';
      
      addGroup({
        name: groupName,
        flag: flag,
        avatar: groupName.charAt(0).toUpperCase(),
        avatarBg: "bg-indigo-500",
        members: participants.length + 1, // +1 for the creator
        lastMessage: "Challenge created! Let's get started!",
        time: "just now",
        unread: 0,
        ethAmount: `${stake} ETH`
      });
    }
    
    // Show success screen
    setShowSuccessScreen(true);
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode)
    setShowCopiedMessage(true)
    setTimeout(() => setShowCopiedMessage(false), 2000)
  }
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink)
    setShowCopiedLinkMessage(true)
    setTimeout(() => setShowCopiedLinkMessage(false), 2000)
  }
  
  return (
    <div className="relative max-w-3xl mx-auto">
      {/* Technical drawing measurement lines */}
      <div className="absolute -left-2 top-0 h-full w-px bg-blueprint-line opacity-10"></div>
      <div className="absolute left-0 -top-2 w-full h-px bg-blueprint-line opacity-10"></div>
      
      {/* Corner gear decorations */}
      <div className="absolute -left-4 -top-4 w-16 h-16 opacity-20">
        <div className="w-full h-full animate-spin-slower" style={{ 
          backgroundImage: 'url(/images/floral-pattern.svg)', 
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}></div>
      </div>
      
      <div className="absolute -right-4 -top-4 w-12 h-12 opacity-15">
        <div className="w-full h-full animate-spin-reverse" style={{ 
          backgroundImage: 'url(/images/floral-pattern.svg)', 
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}></div>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold blueprint-heading relative">
          Create New Challenge
          {/* Small gear decoration */}
          <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 w-4 h-4 opacity-30">
            <div className="w-full h-full animate-spin-slow" style={{ 
              backgroundImage: 'url(/images/floral-pattern.svg)', 
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center'
            }}></div>
          </div>
        </h1>
      </div>
      
      {showSuccessScreen ? (
        <div className="bg-blueprint-bg border-1 border-blueprint-line rounded-xl p-8 relative overflow-hidden">
          {/* Success floral decoration */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 opacity-10">
            <div className="w-full h-full" style={{ 
              backgroundImage: 'url(/images/floral-pattern.svg)', 
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center'
            }}></div>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-[#D4A84B]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck className="text-3xl text-[#D4A84B]" />
            </div>
            
            <h2 className="text-xl font-bold text-blueprint-line mb-2">Challenge Created!</h2>
            <p className="text-gray-600 mb-6">Share this invite link with your friends</p>
            
            <div className="flex items-center justify-center mb-6">
              <div className="bg-blueprint-bg/50 border border-blueprint-line rounded-l-lg py-3 px-4 flex-grow font-mono text-sm overflow-hidden text-ellipsis">
                {inviteLink}
              </div>
              <button 
                className="bg-[#D4A84B] text-[#1A1A1A] py-3 px-4 rounded-r-lg hover:bg-[#B38728] transition-colors duration-300 relative"
                onClick={handleCopyLink}
              >
                Copy
                {showCopiedLinkMessage && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[#1A1A1A] text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                    Copied!
                  </div>
                )}
              </button>
            </div>
            
            {/* Invite Code Section */}
            <div className="mb-6">
              <p className="text-gray-600 mb-2">Or share this invite code</p>
              <div className="flex items-center justify-center space-x-2">
                <div className="bg-blueprint-bg/50 border border-blueprint-line rounded-lg py-3 px-6 font-mono text-lg tracking-wider">
                  {inviteCode}
                </div>
                <button
                  onClick={handleCopyCode}
                  className="bg-transparent hover:bg-blueprint-line text-blueprint-line hover:text-blueprint-bg p-3 border border-blueprint-line rounded-lg transition-colors duration-300 relative"
                >
                  <FiCopy />
                  {showCopiedMessage && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[#1A1A1A] text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                      Copied!
                    </div>
                  )}
                </button>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <Link 
                href="/"
                className="bg-transparent hover:bg-blueprint-line text-blueprint-line hover:text-blueprint-bg font-semibold py-2 px-6 border-1 border-blueprint-line rounded-full transition-all duration-300"
              >
                Back to Home
              </Link>
              <button 
                onClick={() => setShowSuccessScreen(false)}
                className="bg-[#D4A84B] text-[#1A1A1A] font-semibold py-2 px-6 rounded-full hover:bg-[#B38728] transition-all duration-300"
              >
                Create Another
              </button>
            </div>
          </div>
          
          {/* Blueprint coordinates */}
          <div className="absolute bottom-2 right-2 text-xs font-mono text-blueprint-line opacity-30">
            CC-SUCCESS.1
          </div>
        </div>
      ) : (
        <form onSubmit={handleCreateChallenge} className="bg-blueprint-bg border-1 border-blueprint-line rounded-xl p-8 relative overflow-hidden">
          {/* Form floral decoration */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 opacity-10">
            <div className="w-full h-full" style={{ 
              backgroundImage: 'url(/images/floral-pattern.svg)', 
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center'
            }}></div>
          </div>
          
          <div className="mb-6">
            <label className="block text-blueprint-line font-mono text-sm mb-2">Challenge Type</label>
            <div className="flex space-x-4">
              <button
                type="button"
                className={`flex-1 py-3 px-4 rounded-lg border ${
                  challengeType === 'no-loss' 
                    ? 'bg-[#D4A84B]/10 border-[#D4A84B] text-[#D4A84B]' 
                    : 'bg-blueprint-bg border-blueprint-line text-blueprint-line'
                } transition-colors duration-300`}
                onClick={() => setChallengeType('no-loss')}
              >
                <div className="flex items-center justify-center">
                  <div className={`w-5 h-5 rounded-full border ${
                    challengeType === 'no-loss' ? 'border-[#D4A84B]' : 'border-blueprint-line'
                  } flex items-center justify-center mr-2`}>
                    {challengeType === 'no-loss' && <div className="w-3 h-3 rounded-full bg-[#D4A84B]"></div>}
                  </div>
                  <span>No-Loss</span>
                </div>
                <p className="text-xs mt-1 text-gray-500">Get your stake back regardless of completion</p>
              </button>
              
              <button
                type="button"
                className={`flex-1 py-3 px-4 rounded-lg border ${
                  challengeType === 'hardcore' 
                    ? 'bg-[#D4A84B]/10 border-[#D4A84B] text-[#D4A84B]' 
                    : 'bg-blueprint-bg border-blueprint-line text-blueprint-line'
                } transition-colors duration-300`}
                onClick={() => setChallengeType('hardcore')}
              >
                <div className="flex items-center justify-center">
                  <div className={`w-5 h-5 rounded-full border ${
                    challengeType === 'hardcore' ? 'border-[#D4A84B]' : 'border-blueprint-line'
                  } flex items-center justify-center mr-2`}>
                    {challengeType === 'hardcore' && <div className="w-3 h-3 rounded-full bg-[#D4A84B]"></div>}
                  </div>
                  <span>Hardcore</span>
                </div>
                <p className="text-xs mt-1 text-gray-500">Lose deposit if daily requirements not met</p>
              </button>
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="title" className="block text-blueprint-line font-mono text-sm mb-2">Challenge Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-blueprint-bg border border-blueprint-line rounded-lg px-4 py-3 text-blueprint-line focus:border-[#D4A84B] focus:outline-none transition-colors duration-300"
              placeholder="e.g., Korean in 90 Days"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="language" className="block text-blueprint-line font-mono text-sm mb-2">Language</label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-blueprint-bg border border-blueprint-line rounded-lg px-4 py-3 text-blueprint-line focus:border-[#D4A84B] focus:outline-none transition-colors duration-300"
              required
            >
              <option value="">Select a language</option>
              <option value="korean">Korean</option>
              <option value="japanese">Japanese</option>
              <option value="spanish">Spanish</option>
              <option value="french">French</option>
              <option value="german">German</option>
              <option value="mandarin">Mandarin</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="stake" className="block text-blueprint-line font-mono text-sm mb-2">
                <div className="flex items-center">
                  <FiDollarSign className="mr-1" />
                  <span>Minimum Stake (ETH)</span>
                </div>
              </label>
              <input
                type="text"
                id="stake"
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                className="w-full bg-blueprint-bg border border-blueprint-line rounded-lg px-4 py-3 text-blueprint-line focus:border-[#D4A84B] focus:outline-none transition-colors duration-300"
                placeholder="e.g., 0.05"
                required
              />
            </div>
            
            <div>
              <label htmlFor="duration" className="block text-blueprint-line font-mono text-sm mb-2">
                <div className="flex items-center">
                  <FiClock className="mr-1" />
                  <span>Duration (days)</span>
                </div>
              </label>
              <select
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-blueprint-bg border border-blueprint-line rounded-lg px-4 py-3 text-blueprint-line focus:border-[#D4A84B] focus:outline-none transition-colors duration-300"
                required
              >
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
                <option value="180">180 days</option>
              </select>
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="minDailyTime" className="block text-blueprint-line font-mono text-sm mb-2">
              <div className="flex items-center">
                <FiClock className="mr-1" />
                <span>Minimum Daily Time (minutes)</span>
              </div>
            </label>
            <input
              type="number"
              id="minDailyTime"
              value={minDailyTime}
              onChange={(e) => setMinDailyTime(e.target.value)}
              className="w-full bg-blueprint-bg border border-blueprint-line rounded-lg px-4 py-3 text-blueprint-line focus:border-[#D4A84B] focus:outline-none transition-colors duration-300"
              min="5"
              max="120"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {challengeType === 'hardcore' ? 
                `Participants will lose their deposit if they don't study for at least ${minDailyTime} minutes each day.` : 
                `Participants should study for at least ${minDailyTime} minutes each day to complete the challenge.`}
            </p>
          </div>
          
          <div className="mb-6">
            <label className="block text-blueprint-line font-mono text-sm mb-2">
              <div className="flex items-center">
                <FiUsers className="mr-1" />
                <span>Add Participants</span>
              </div>
            </label>
            
            <div className="space-y-3">
              {participants.map((participant, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={participant}
                    onChange={(e) => handleParticipantChange(index, e.target.value)}
                    className="flex-grow bg-blueprint-bg border border-blueprint-line rounded-lg px-4 py-3 text-blueprint-line focus:border-[#D4A84B] focus:outline-none transition-colors duration-300"
                    placeholder="Email or wallet address"
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveParticipant(index)}
                      className="p-3 bg-blueprint-bg border border-blueprint-line rounded-lg text-blueprint-line hover:bg-blueprint-line hover:text-blueprint-bg transition-colors duration-300"
                    >
                      <FiX />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <button
              type="button"
              onClick={handleAddParticipant}
              className="mt-3 flex items-center text-[#D4A84B] hover:text-[#B38728] transition-colors duration-300"
            >
              <FiUsers className="mr-1" />
              <span>Add Another Participant</span>
            </button>
          </div>
          
          <div className="flex justify-end">
            <Link 
              href="/"
              className="bg-transparent hover:bg-blueprint-line text-blueprint-line hover:text-blueprint-bg font-semibold py-2 px-6 border-1 border-blueprint-line rounded-full transition-all duration-300 mr-4"
            >
              Cancel
            </Link>
            <button 
              type="submit"
              className="bg-[#D4A84B] text-[#1A1A1A] font-semibold py-2 px-6 rounded-full hover:bg-[#B38728] transition-all duration-300"
            >
              Create Challenge
            </button>
          </div>
          
          {/* Blueprint coordinates */}
          <div className="absolute bottom-2 right-2 text-xs font-mono text-blueprint-line opacity-30">
            CC-FORM.1
          </div>
        </form>
      )}
    </div>
  )
}
