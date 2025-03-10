"use client"

import { useState } from 'react'
import { FiDollarSign, FiClock, FiUsers, FiLink, FiCheck, FiX, FiCopy } from 'react-icons/fi'
import Link from 'next/link'
import { generateInviteCode } from '@/utils/inviteCode'
import { useChallengeContext } from '@/contexts/ChallengeContext';
import { useWalletContext } from '@/contexts/WalletContext'
import { ethers } from 'ethers'
import { toast } from 'react-toastify'

interface CreateChallengeFormProps {
  onComplete?: () => void;
}

// Add contract ABIs and addresses
const LEARNING_POOL_ADDRESS = "0xEeBcBd2641DA50D9Ab8a6bC7e3f2Fff191f48e10"
const USDC_ADDRESS = "0x0000000000000000000000000000000000001549" // Hedera Testnet USDC
const USDC_DECIMALS = 6

export default function CreateChallengeForm({ onComplete }: CreateChallengeFormProps) {
  const { addChallenge, addGroup } = useChallengeContext();
  const { status, signer } = useWalletContext();
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
  const [isStaking, setIsStaking] = useState(false)
  
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
  
  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (status !== 'connected') {
      toast.error('Please connect your wallet first')
      return
    }

    try {
      setIsStaking(true)

      // Create contract instances
      const usdcContract = new ethers.Contract(
        USDC_ADDRESS,
        ['function approve(address spender, uint256 amount) public returns (bool)',
         'function allowance(address owner, address spender) public view returns (uint256)'],
        signer
      )

      const learningPool = new ethers.Contract(
        LEARNING_POOL_ADDRESS,
        ['function createLearningGroup(uint256 _stakingAmount, uint256 _duration, uint256 _maxMembers) public returns (uint256)',
         'function stake(uint256 _groupId) public'],
        signer
      )

      // Convert stake amount to proper decimals
      const stakeAmount = ethers.parseUnits(stake, USDC_DECIMALS)
      
      // Check existing allowance
      const currentAllowance = await usdcContract.allowance(
        await signer.getAddress(),
        LEARNING_POOL_ADDRESS
      )

      // Approve USDC spend if needed
      if (currentAllowance < stakeAmount) {
        const approveTx = await usdcContract.approve(
          LEARNING_POOL_ADDRESS,
          stakeAmount,
          { gasLimit: 1000000 }
        )
        toast.info('Approving USDC spend...')
        await approveTx.wait()
        toast.success('USDC approved!')
      }

      // Create learning group
      const durationInSeconds = parseInt(duration) * 24 * 60 * 60 // Convert days to seconds
      const createTx = await learningPool.createLearningGroup(
        stakeAmount,
        durationInSeconds,
        participants.length + 1, // +1 for creator
        { gasLimit: 1000000 }
      )
      
      toast.info('Creating learning group...')
      const receipt = await createTx.wait()
      
      // Get group ID from event logs
      const groupId = receipt.logs[0].topics[1] // Assuming GroupCreated event is first log
      
      // Stake in the group
      const stakeTx = await learningPool.stake(groupId, { gasLimit: 1000000 })
      toast.info('Staking USDC...')
      await stakeTx.wait()
      toast.success('Successfully staked!')

      // Create challenge object and update UI
      const challenge = {
        id: groupId.toString(),
        title,
        language,
        stake: `${stake} USDC`,
        duration: parseInt(duration),
        dailyMinutes: parseInt(minDailyTime),
        participants: participants.filter(p => p.trim() !== '').length + 1,
        type: challengeType,
        createdAt: new Date(),
        daysLeft: parseInt(duration),
        progress: 0,
      }

      // Add to context and show success
      addChallenge(challenge)
      addGroup({
        name: challenge.title,
        flag: language === 'japanese' ? '🇯🇵' : 
              language === 'spanish' ? '🇪🇸' : 
              language === 'french' ? '🇫🇷' : 
              language === 'german' ? '🇩🇪' : 
              language === 'italian' ? '🇮🇹' : 
              language === 'portuguese' ? '🇵🇹' : 
              language === 'russian' ? '🇷🇺' : 
              language === 'korean' ? '🇰🇷' : 
              language === 'chinese' ? '🇨🇳' : '🌍',
        avatar: language.charAt(0).toUpperCase(),
        avatarBg: `bg-${['blue', 'green', 'purple', 'red', 'yellow'][Math.floor(Math.random() * 5)]}-500`,
        members: participants.filter(p => p.trim() !== '').length + 1,
        lastMessage: "Group created! Let's start learning together!",
        time: "Just now",
        unread: 0,
        usdcAmount: `${stake} USDC`,
      })
      
      setShowSuccessScreen(true)
      if (onComplete) onComplete()

    } catch (error: any) {
      console.error('Creation failed:', error)
      toast.error(error.message || 'Failed to create challenge')
    } finally {
      setIsStaking(false)
    }
  }
  
  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode)
    setShowCopiedMessage(true)
    setTimeout(() => setShowCopiedMessage(false), 2000)
  }
  
  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink)
    setShowCopiedLinkMessage(true)
    setTimeout(() => setShowCopiedLinkMessage(false), 2000)
  }
  
  return (
    <div className="max-w-4xl mx-auto w-full min-h-[80vh] px-4 py-6">
      {!showSuccessScreen ? (
        <form onSubmit={handleCreateChallenge} className="p-6 md:p-8 bg-blueprint-bg border border-blueprint-line rounded-lg shadow-lg w-full">
          <h1 className="text-2xl font-bold mb-6 text-blueprint-line font-mono">Create New Challenge</h1>
          
          <div className="mb-6">
            <label className="block text-blueprint-line font-mono text-sm mb-2">Challenge Type</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                className={`cursor-pointer p-4 rounded-lg border transition-all duration-300 flex flex-col ${
                  challengeType === 'no-loss' 
                    ? 'border-[#D4A84B] bg-[rgba(212,168,75,0.15)]' 
                    : 'border-blueprint-line bg-blueprint-bg hover:border-[#D4A84B]'
                }`}
                onClick={() => setChallengeType('no-loss')}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-blueprint-line">No-Loss</h3>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    challengeType === 'no-loss' ? 'bg-[#D4A84B]' : 'bg-blueprint-line'
                  }`}>
                    {challengeType === 'no-loss' && <FiCheck className="text-black" />}
                  </div>
                </div>
                <p className="text-xs mt-1 text-gray-400">Get your stake back regardless of completion</p>
              </div>
              
              <div
                className={`cursor-pointer p-4 rounded-lg border transition-all duration-300 flex flex-col ${
                  challengeType === 'hardcore' 
                    ? 'border-[#D4A84B] bg-[rgba(212,168,75,0.15)]' 
                    : 'border-blueprint-line bg-blueprint-bg hover:border-[#D4A84B]'
                }`}
                onClick={() => setChallengeType('hardcore')}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-blueprint-line">Hardcore</h3>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    challengeType === 'hardcore' ? 'bg-[#D4A84B]' : 'bg-blueprint-line'
                  }`}>
                    {challengeType === 'hardcore' && <FiCheck className="text-black" />}
                  </div>
                </div>
                <p className="text-xs mt-1 text-gray-400">Lose your stake if you don't meet requirements</p>
              </div>
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
              placeholder="e.g., Korean Language 90-Day Challenge"
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
                  <span>Minimum Stake (USDC)</span>
                </div>
              </label>
              <input
                type="text"
                id="stake"
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                className="w-full bg-blueprint-bg border border-blueprint-line rounded-lg px-4 py-3 text-blueprint-line focus:border-[#D4A84B] focus:outline-none transition-colors duration-300"
                placeholder="e.g., 1000"
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
            <select
              id="minDailyTime"
              value={minDailyTime}
              onChange={(e) => setMinDailyTime(e.target.value)}
              className="w-full bg-blueprint-bg border border-blueprint-line rounded-lg px-4 py-3 text-blueprint-line focus:border-[#D4A84B] focus:outline-none transition-colors duration-300"
              required
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
              <option value="90">90 minutes</option>
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block text-blueprint-line font-mono text-sm mb-2">
              <div className="flex items-center">
                <FiUsers className="mr-1" />
                <span>Participants</span>
              </div>
            </label>
            
            <div className="space-y-3">
              {participants.map((participant, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="text"
                    value={participant}
                    onChange={(e) => handleParticipantChange(index, e.target.value)}
                    className="flex-grow bg-blueprint-bg border border-blueprint-line rounded-lg px-4 py-3 text-blueprint-line focus:border-[#D4A84B] focus:outline-none transition-colors duration-300"
                    placeholder={`Participant ${index + 1} email or wallet address`}
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveParticipant(index)}
                      className="ml-2 p-2 text-blueprint-line hover:text-red-500 transition-colors"
                    >
                      <FiX size={20} />
                    </button>
                  )}
                </div>
              ))}
              
              <button
                type="button"
                onClick={handleAddParticipant}
                className="mt-2 text-sm text-blueprint-line hover:text-[#D4A84B] font-medium transition-colors inline-flex items-center"
              >
                <FiUsers className="mr-1" />
                Add Participant
              </button>
            </div>
          </div>
          
          <div className="mt-8">
            <button
              type="submit"
              disabled={isStaking || status !== 'connected'}
              className={`w-full ${
                isStaking || status !== 'connected'
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-[#2A2A2A] hover:bg-[#3A3A3A]'
              } text-[#D4A84B] font-bold py-3 px-6 rounded-lg border border-[#D4A84B] transition-colors duration-300`}
            >
              {isStaking 
                ? 'Creating Challenge...' 
                : status !== 'connected'
                ? 'Connect Wallet to Create'
                : 'Create Challenge'
              }
            </button>
          </div>
        </form>
      ) : (
        <div className="p-6 md:p-8 bg-blueprint-bg border border-blueprint-line rounded-lg shadow-lg w-full">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-[#2A2A2A] rounded-full flex items-center justify-center text-[#D4A84B]">
              <FiCheck size={30} />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-4 text-blueprint-line font-mono">Challenge Created!</h2>
          <p className="text-center text-blueprint-line mb-8">Your challenge has been created. Share the invite code or link with friends to join.</p>
          
          <div className="mb-8">
            <label className="block text-blueprint-line font-mono text-sm mb-2">
              <div className="flex items-center">
                <FiLink className="mr-1" />
                <span>Invite Code</span>
              </div>
            </label>
            <div className="flex">
              <div className="flex-grow bg-blueprint-bg border border-blueprint-line rounded-l-lg px-4 py-3 text-[#D4A84B] font-mono">
                {inviteCode}
              </div>
              <button
                type="button"
                onClick={copyInviteCode}
                className="bg-[#2A2A2A] border border-l-0 border-blueprint-line rounded-r-lg px-4 text-blueprint-line hover:text-[#D4A84B] transition-colors"
              >
                {showCopiedMessage ? <FiCheck size={20} /> : <FiCopy size={20} />}
              </button>
            </div>
          </div>
          
          <div className="mb-8">
            <label className="block text-blueprint-line font-mono text-sm mb-2">
              <div className="flex items-center">
                <FiLink className="mr-1" />
                <span>Invite Link</span>
              </div>
            </label>
            <div className="flex">
              <div className="flex-grow bg-blueprint-bg border border-blueprint-line rounded-l-lg px-4 py-3 text-[#D4A84B] font-mono truncate">
                {inviteLink}
              </div>
              <button
                type="button"
                onClick={copyInviteLink}
                className="bg-[#2A2A2A] border border-l-0 border-blueprint-line rounded-r-lg px-4 text-blueprint-line hover:text-[#D4A84B] transition-colors"
              >
                {showCopiedLinkMessage ? <FiCheck size={20} /> : <FiCopy size={20} />}
              </button>
            </div>
          </div>
          
          <div className="mt-8">
            <Link
              href="/"
              className="block w-full bg-[#2A2A2A] hover:bg-[#3A3A3A] text-[#D4A84B] font-bold py-3 px-6 rounded-lg border border-[#D4A84B] transition-colors duration-300 text-center"
            >
              Go to Home
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
