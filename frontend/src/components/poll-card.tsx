"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

interface Poll {
  id: number
  question: string
  options: string[]
  answers: number[]
}

interface PollCardProps {
  poll: Poll
  isCompleted: boolean
  onComplete: (event: React.MouseEvent, option: string) => void
}

export function PollCard({ poll, isCompleted, onComplete }: PollCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.MouseEvent) => {
    if (!selectedOption || isCompleted) return

    setIsSubmitting(true)

    // Simulate submission delay
    setTimeout(() => {
      onComplete(e, selectedOption)
      setIsSubmitting(false)
    }, 500)
  }

  return (
    <Card className={`transition-all ${isCompleted ? "bg-gray-50" : "bg-white"}`}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-medium">{poll.question}</h3>
          {isCompleted && <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />}
        </div>

        <RadioGroup
          value={selectedOption || ""}
          onValueChange={setSelectedOption}
          className="space-y-2"
          disabled={isCompleted}
        >
          {poll.options.map((option, index) => (
            <div
              key={option}
              className={`flex items-center space-x-2 rounded-md border p-3 transition-colors ${
                isCompleted
                  ? "opacity-70"
                  : selectedOption === option
                    ? "border-primary bg-primary/5"
                    : "hover:bg-gray-50"
              }`}
            >
              <RadioGroupItem value={option} id={`${poll.id}-${option}`} disabled={isCompleted} />
              <Label htmlFor={`${poll.id}-${option}`} className="w-full cursor-pointer">
                {option}
              </Label>
              <p className="text-sm text-gray-500">{((poll.answers[index] / poll.answers.reduce((a, b) => a + b, 0)) * 100).toFixed(0)}%</p>
            </div>
          ))}
        </RadioGroup>
      </CardContent>

      <CardFooter>
        <Button className="w-full" disabled={!selectedOption || isCompleted || isSubmitting} onClick={handleSubmit}>
          {isCompleted ? "Completed" : isSubmitting ? "Submitting..." : "Submit Vote"}
        </Button>
      </CardFooter>
    </Card>
  )
}

