interface FriendStoryProps {
  name: string;
  initial: string;
  active: boolean;
}

export default function FriendStory({ name, initial, active }: FriendStoryProps) {
  return (
    <div className="flex flex-col items-center relative z-10">
      <div className={`story-avatar bg-blueprint-bg relative overflow-hidden ${active ? 'story-avatar-active' : 'border-gray-400 opacity-80'}`}>
        {/* Blueprint grid background */}
        <div className="absolute inset-0 bg-blueprint-grid opacity-20"></div>
        
        <span className="relative z-10 text-blueprint-line font-mono">{initial}</span>
      </div>
      <span className="mt-2 text-xs font-mono text-blueprint-line">{name}</span>
    </div>
  )
}