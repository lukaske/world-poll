import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { X } from "lucide-react"

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  requirement: number
  isPoints?: boolean
}

interface BadgesModalProps {
  isOpen: boolean
  onClose: () => void
  badges: Badge[]
  userBadges: string[]
}

export function BadgesModal({ isOpen, onClose, badges, userBadges }: BadgesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Your Badges</DialogTitle>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          {badges.map((badge) => {
            const isEarned = userBadges.includes(badge.id)

            return (
              <div
                key={badge.id}
                className={`border rounded-lg p-4 text-center transition-all ${
                  isEarned ? "bg-gradient-to-b from-yellow-50 to-white border-yellow-200" : "opacity-60 grayscale"
                }`}
              >
                <div className="text-4xl mb-2">{badge.icon}</div>
                <h3 className="font-bold text-sm">{badge.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
                {!isEarned && (
                  <div className="mt-2 text-xs bg-gray-100 rounded-full px-2 py-1">
                    {badge.isPoints
                      ? `Earn ${badge.requirement} points`
                      : `Complete ${badge.requirement} poll${badge.requirement > 1 ? "s" : ""}`}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}

