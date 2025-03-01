import UserStory from './UserStory'
import FriendStory from './FriendStory'

export default function StoryFeed() {
  const friends = [
    { id: 1, name: 'Emma', initial: 'E', active: true },
    { id: 2, name: 'Mark', initial: 'M', active: true },
    { id: 3, name: 'Sarah', initial: 'S', active: false },
    { id: 4, name: 'Michael', initial: 'M', active: true },
    { id: 5, name: 'W Bot', initial: '🤖', active: false },
  ]

  return (
    <div className="flex space-x-4 overflow-x-auto pb-2 relative">
      {/* Decorative line connecting stories */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-blueprint-line opacity-30 z-0"></div>
      
      <UserStory />
      {friends.map((friend) => (
        <FriendStory 
          key={friend.id} 
          name={friend.name} 
          initial={friend.initial} 
          active={friend.active}
        />
      ))}
    </div>
  )
}