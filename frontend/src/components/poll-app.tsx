import type React from "react"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { PollCard } from "@/components/poll-card"
import { BadgesModal } from "@/components/badges-modal"
import { PointAnimation } from "@/components/point-animation"
import { useLocalStorage } from "@/hooks/use-local-storage"

// Sample poll data
const polls = [
  {
    id: 1,
    question: "What's your favorite programming language?",
    options: ["JavaScript", "Python", "TypeScript", "Java"],
  },
  {
    id: 2,
    question: "Which framework do you prefer?",
    options: ["React", "Vue", "Angular", "Svelte"],
  },
  {
    id: 3,
    question: "What's your preferred deployment platform?",
    options: ["Vercel", "Netlify", "AWS", "Digital Ocean"],
  },
  {
    id: 4,
    question: "Which database do you use most often?",
    options: ["MongoDB", "PostgreSQL", "MySQL", "SQLite"],
  },
]

// Badge definitions
const badges = [
  {
    id: "first_poll",
    name: "First Vote",
    description: "Completed your first poll",
    icon: "🗳️",
    requirement: 1,
  },
  {
    id: "poll_enthusiast",
    name: "Poll Enthusiast",
    description: "Completed 3 polls",
    icon: "🔍",
    requirement: 3,
  },
  {
    id: "poll_master",
    name: "Poll Master",
    description: "Earned 100 points",
    icon: "🏆",
    requirement: 100,
    isPoints: true,
  },
]

export default function PollApp() {
  const [points, setPoints] = useLocalStorage("poll-points", 0)
  const [completedPolls, setCompletedPolls] = useLocalStorage("completed-polls", [])
  const [userBadges, setUserBadges] = useLocalStorage("user-badges", [])
  const [showBadgesModal, setShowBadgesModal] = useState(false)
  const [animations, setAnimations] = useState<{ id: number; x: number; y: number }[]>([])
  const [newBadge, setNewBadge] = useState<string | null>(null)

  // Check for new badges
  useEffect(() => {
    // Skip this effect if there are no completed polls or points yet
    if (completedPolls.length === 0 && points === 0) return

    const earnedBadges = badges.filter((badge) => {
      if (badge.isPoints) {
        return points >= badge.requirement && !userBadges.includes(badge.id)
      } else {
        return completedPolls.length >= badge.requirement && !userBadges.includes(badge.id)
      }
    })

    if (earnedBadges.length > 0) {
      const newBadgeIds = earnedBadges.map((badge) => badge.id)
      // Only update if there are actually new badges
      if (newBadgeIds.some((id) => !userBadges.includes(id))) {
        setUserBadges([...userBadges, ...newBadgeIds])
        setNewBadge(earnedBadges[0].id)
      }
    }
  }, [points, completedPolls, userBadges, setUserBadges])

  // Handle poll completion
  const handlePollComplete = (pollId: number, event: React.MouseEvent) => {
    if (!completedPolls.includes(pollId)) {
      // Add points
      const pointsToAdd = 10
      setPoints(points + pointsToAdd)

      // Add to completed polls
      setCompletedPolls([...completedPolls, pollId])

      // Create point animation
      const rect = (event.target as HTMLElement).getBoundingClientRect()
      const x = event.clientX || rect.left + rect.width / 2
      const y = event.clientY || rect.top + rect.height / 2

      const newAnimation = {
        id: Date.now(),
        x,
        y,
      }

      setAnimations((prev) => [...prev, newAnimation])

      // Remove animation after it completes
      setTimeout(() => {
        setAnimations((prev) => prev.filter((a) => a.id !== newAnimation.id))
      }, 1000)
    }
  }

  // Close badge notification
  const handleCloseBadgeNotification = () => {
    setNewBadge(null)
  }

  return (
    <div className="relative pb-20">
      <Header points={points} badgeCount={userBadges.length} onBadgeClick={() => setShowBadgesModal(true)} />

      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Today's Polls</h1>

        <div className="space-y-4">
          {polls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              isCompleted={completedPolls.includes(poll.id)}
              onComplete={(e) => handlePollComplete(poll.id, e)}
            />
          ))}
        </div>
      </div>

      {/* Point animations */}
      {animations.map((animation) => (
        <PointAnimation key={animation.id} x={animation.x} y={animation.y} />
      ))}

      {/* Badge notification */}
      {newBadge && (
        <div className="fixed bottom-4 left-0 right-0 mx-auto w-[90%] max-w-md bg-white rounded-lg shadow-lg p-4 z-50 border-2 border-yellow-400">
          <div className="flex items-center">
            <div className="text-3xl mr-3">{badges.find((b) => b.id === newBadge)?.icon}</div>
            <div>
              <h3 className="font-bold">New Badge Earned!</h3>
              <p>{badges.find((b) => b.id === newBadge)?.name}</p>
            </div>
            <button className="ml-auto text-gray-500" onClick={handleCloseBadgeNotification}>
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Badges modal */}
      <BadgesModal
        isOpen={showBadgesModal}
        onClose={() => setShowBadgesModal(false)}
        badges={badges}
        userBadges={userBadges}
      />
    </div>
  )
}

