"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { PollCard } from "@/components/poll-card"
import { BadgesModal } from "@/components/badges-modal"
import { PointAnimation } from "@/components/point-animation"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { BottomNavigation } from "@/components/bottom-navigation"
import { ChatInterface } from "@/components/chat-interface"

import { VerifyBlock } from "@/components/Verify"
import { ISuccessResult } from "@worldcoin/minikit-js"
import { MiniKit, VerificationLevel } from "@worldcoin/minikit-js"

// Sample poll data
interface Poll {
  id: number;
  question: string;
  options: string[];
  answers: number[];
}

export type VerifyCommandInput = {
  action: string;
  signal?: string;
  verification_level?: VerificationLevel; // Default: Orb
};

const verifyPayload: VerifyCommandInput = {
  action: "test-action", // This is your action ID from the Developer Portal
  signal: "",
  verification_level: VerificationLevel.Orb, // Orb | Device
};

// const polls = [
//   {
//     id: 1,
//     question: "What's your favorite programming language?",
//     options: ["JavaScript", "Python", "TypeScript", "Java"],
//   },
//   {
//     id: 2,
//     question: "Which framework do you prefer?",
//     options: ["React", "Vue", "Angular", "Svelte"],
//   },
//   {
//     id: 3,
//     question: "What's your preferred deployment platform?",
//     options: ["Vercel", "Netlify", "AWS", "Digital Ocean"],
//   },
//   {
//     id: 4,
//     question: "Which database do you use most often?",
//     options: ["MongoDB", "PostgreSQL", "MySQL", "SQLite"],
//   },
// ]

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
  const [polls, setPolls] = useState<Poll[]>([])
  // const [points, setPoints] = useLocalStorage("poll-points", 0)
  // const [completedPolls, setCompletedPolls] = useLocalStorage("completed-polls", [])
  // const [userBadges, setUserBadges] = useLocalStorage("user-badges", [])
  const [points, setPoints] = useState(0)
  const [completedPolls, setCompletedPolls] = useState<string[]>([])
  const [userBadges, setUserBadges] = useState<string[]>([])
  const [showBadgesModal, setShowBadgesModal] = useState(false)
  const [animations, setAnimations] = useState<{ id: number; x: number; y: number }[]>([])
  const [newBadge, setNewBadge] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("earn")

  useEffect(() => {
    setCompletedPolls([])
    setPoints(0)
    setUserBadges([])
  }, [])
  
  
  const fetchPolls = async () => {
    const res = await fetch(
      import.meta.env.VITE_DEPLOYMENT_URL + "/api/list-polls", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    })
    const data = await res.json()

    if (res.status === 200) {
      setPolls(data)
    } else {
      console.log("error fetching polls", data)
    }
  }

  useEffect(() => {
    fetchPolls()
  }, [])


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
  const handlePollComplete = async (pollId: string, event: React.MouseEvent, option: string) => {
    if (!completedPolls.includes(pollId)) {

      let finalPayloadGlobal = null;

      if (MiniKit.isInstalled()) {
        console.log("WORKING")

        const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload);
    
        console.log("FINAL PAYLOAD", JSON.stringify(finalPayload));
    
        // no need to verify if command errored
        if (finalPayload.status === "error") {
          console.log("Command error");
          console.log(finalPayload);
        }
        console.log("FINAL PAYLOAD", finalPayload)  
        finalPayloadGlobal = finalPayload;
      }
      
      console.log("User address local", MiniKit.walletAddress);
      
      await fetch(
        import.meta.env.VITE_DEPLOYMENT_URL + "/api/update-poll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          pollId, 
          selectedOption: option,
          payloadGlobalData: JSON.stringify({
            payload: finalPayloadGlobal as ISuccessResult, // Parses only the fields we need to verify
            action: verifyPayload.action,
            signal: verifyPayload.signal // Optional
          }),
          userAddress: MiniKit.walletAddress,
        })
      })
      
      fetchPolls()

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
      <Header userPoints={points} badgeCount={userBadges.length} onBadgeClick={() => setShowBadgesModal(true)} setUserBadges={setUserBadges} setUserPoints={setPoints}/>

      <div className="container mx-auto px-4 py-2">
        {activeTab === "earn" && (
          <>
            <h1 className="text-2xl font-bold mb-6">Today's Polls</h1>
            <div className="space-y-4">
              {polls && polls.map((poll) => (
                <PollCard
                  key={poll._id}
                  poll={poll}
                  isCompleted={completedPolls.includes(poll._id)}
                  onComplete={(e, option) => handlePollComplete(poll._id, e, option)}
                />
              ))}
            </div>
          </>
        )}

        {activeTab === "create" && (
          <div className="flex flex-col h-full">
            <h1 className="text-2xl font-bold mb-4">Create with AI</h1>
            <p className="text-gray-500 mb-6">Chat with our AI assistant to help you create the perfect poll.</p>
            <ChatInterface />
          </div>
        )}
      </div>

      {/* Point animations */}
      {animations.map((animation) => (
        <PointAnimation key={animation.id} x={animation.x} y={animation.y} />
      ))}

      {/* Badge notification */}
      {newBadge && (
        <div className="fixed bottom-20 left-0 right-0 mx-auto w-[90%] max-w-md bg-white rounded-lg shadow-lg p-4 z-50 border-2 border-yellow-400">
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

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}

