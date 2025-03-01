import Navigation from "@/components/layout/Navigation"

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main>
      <div className="min-h-screen bg-blueprint-bg text-blueprint-line">
        {children}
      </div>
      <Navigation />
    </main>
  )
}
