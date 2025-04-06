import { Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
// import { MiniKit } from "@worldcoin/minikit-js"
import { useState, useEffect, useCallback } from "react"
import { MiniKit, RequestPermissionPayload, Permission } from '@worldcoin/minikit-js'

import logo from '../logo.png';

const Logo = () => (
  <img src={logo} alt="Logo" className="h-8 w-auto" />
);


interface HeaderProps {
  userPoints: number
  badgeCount: number
  onBadgeClick: () => void
  setUserBadges: (badges: string[]) => void
  setUserPoints: (points: number) => void
}


export function Header({ userPoints, badgeCount, onBadgeClick, setUserBadges, setUserPoints }: HeaderProps) {
  const [walletAddress, setWalletAddress] = useState<string | undefined>(undefined)
  // const [userPoints, setUserPoints] = useState<number>(0)

  const signIn = async () => {
    console.log("Signing in")
    if (!MiniKit.isInstalled()) {
      console.log("MiniKit is not installed")
      return
    }
    const res = await fetch(`${import.meta.env.VITE_DEPLOYMENT_URL}/nonce`)
    console.log("res", res)
    const { nonce } = await res.json()
    console.log("nonce", nonce)
    const {commandPayload: generateMessageResult, finalPayload} = await MiniKit.commandsAsync.walletAuth({
      nonce: nonce,
      // requestId: '0', // Optional
      expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
      notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
      statement: 'This is my statement and here is a link https://worldcoin.com/apps',
    })
    console.log("data", generateMessageResult, finalPayload)
    console.log("wallet address", MiniKit.walletAddress)
    setWalletAddress(MiniKit.walletAddress!)

    const res2 = await fetch(`/api/points-badges/${MiniKit.walletAddress}`)
    const { points, badges } = await res2.json()

    setUserPoints(points)
    setUserBadges(badges)

    // NOTIFICATIONS
    console.log("requesting permission for notifications")

    const requestPermissionPayload: RequestPermissionPayload = {
      permission: Permission.Notifications,
    };
    const payload = await MiniKit.commandsAsync.requestPermission(requestPermissionPayload);

    console.log("payload", payload)
  }
  
  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Logo />
          <h1 className="text-xl font-bold">PollMaster</h1>

            {/* Badges button */}
            { walletAddress !== undefined && walletAddress !== null ? (
              <div className="flex items-center space-x-3">
              {/* Points display */}
                <div className="flex items-center bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 py-1 rounded-full">
                  <span className="font-bold text-lg">{userPoints}</span>
                  <span className="ml-1 text-xs">pts</span>
                </div>
                <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={onBadgeClick}>
                  <Award className="h-4 w-4" />
                  <span>Badges</span>
                  {badgeCount > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                      {badgeCount}
                    </Badge>
                  )}
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={signIn}>
                <span>Sign in</span>
              </Button>
            )}
        </div>
      </div>
    </header>
  )
}

