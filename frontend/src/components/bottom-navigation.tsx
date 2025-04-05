"use client"

import { PlusCircle, Award } from "lucide-react"
import { cn } from "@/lib/utils"

interface BottomNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
      <div className="flex items-center justify-around h-16">
        <button
          onClick={() => onTabChange("earn")}
          className={cn(
            "flex flex-col items-center justify-center w-1/2 h-full transition-colors",
            activeTab === "earn" ? "text-primary" : "text-gray-500",
          )}
        >
          <Award className="h-5 w-5 mb-1" />
          <span className="text-xs font-medium">Earn</span>
        </button>
        <button
          onClick={() => onTabChange("create")}
          className={cn(
            "flex flex-col items-center justify-center w-1/2 h-full transition-colors",
            activeTab === "create" ? "text-primary" : "text-gray-500",
          )}
        >
          <PlusCircle className="h-5 w-5 mb-1" />
          <span className="text-xs font-medium">Create</span>
        </button>
      </div>
    </div>
  )
}

