import { Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface HeaderProps {
  points: number
  badgeCount: number
  onBadgeClick: () => void
}

export function Header({ points, badgeCount, onBadgeClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">PollMaster</h1>

          <div className="flex items-center space-x-3">
            {/* Points display */}
            <div className="flex items-center bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 py-1 rounded-full">
              <span className="font-bold text-lg">{points}</span>
              <span className="ml-1 text-xs">pts</span>
            </div>

            {/* Badges button */}
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
        </div>
      </div>
    </header>
  )
}

