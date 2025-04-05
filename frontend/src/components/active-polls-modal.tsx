import { useState, useEffect, forwardRef, useImperativeHandle } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, Award } from "lucide-react"
import { handlePay } from "./Pay"
import { MiniKit } from "@worldcoin/minikit-js"
import { StepForward } from "lucide-react"

interface Poll {
  _id: string
  question: string
  options: string[]
  answers: number[]
  contributors?: string[]
}

interface ActivePollsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ActivePollsModal = forwardRef<{ refreshPolls: () => Promise<void> }, ActivePollsModalProps>(
  ({ isOpen, onClose }, ref) => {
    const [polls, setPolls] = useState<Poll[]>([])
    const [loading, setLoading] = useState(true)
    const [closingPoll, setClosingPoll] = useState<string | null>(null)

    // Expose the refreshPolls method to parent components
    useImperativeHandle(ref, () => ({
      refreshPolls: fetchPolls,
    }))

    useEffect(() => {
      if (isOpen) {
        fetchPolls()
      }
    }, [isOpen])

    const fetchPolls = async () => {
      try {
        setLoading(true)
        const res = await fetch(import.meta.env.VITE_DEPLOYMENT_URL + "/list-polls", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (res.status === 200) {
          const data = await res.json()
          setPolls(data)
        } else {
          console.error("Error fetching polls")
        }
      } catch (error) {
        console.error("Error fetching polls:", error)
      } finally {
        setLoading(false)
      }
    }

    const closePolls = async () => {
      try {
        // setClosingPoll(pollId)

        // Fetch contributors for this poll
        const response = await fetch(`${import.meta.env.VITE_DEPLOYMENT_URL}/get-contributors`)

        if (!response.ok) {
          throw new Error(`Failed to fetch contributors: ${response.statusText}`)
        }

        const { contributors } = await response.json()

        console.log("contributors", contributors)

        if (!contributors || contributors.length === 0) {
          console.warn("No contributors found for this poll")
          alert("No contributors found for this poll")
          setClosingPoll(null)
          return
        }

        const shuffledContributors = contributors.sort(() => Math.random() - 0.5);
        await handlePay(shuffledContributors[0])

        // Display how many rewards will be distributed
        // console.log(`Distributing rewards to ${contributors.length} contributors`)

        // Distribute rewards to each contributor
        // let successCount = 0
        // for (const contributor of contributors) {
        //   try {
        //     console.log("Paying contributor", contributor)
        //     successCount++
        //   } catch (payError) {
        //     console.error(`Failed to pay contributor ${contributor}:`, payError)
        //   }
        // }

       fetch(`${import.meta.env.VITE_DEPLOYMENT_URL}/close-polls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
       })
       .then(response => response.json())
       .then(data => {
        console.log("Successfully closed polls", data)
       })
       .catch(error => {
        console.error("Error closing polls", error)
       })

       
        // Update poll status to closed
        // const closeResponse = await fetch(`${import.meta.env.VITE_DEPLOYMENT_URL}/close-poll/${pollId}`, {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify({
        //     closedBy: MiniKit.walletAddress,
        //   }),
        // })

        // alert(`Successfully distributed rewards to ${successCount} of ${contributors.length} contributors`)

        // Refresh polls list
        await fetchPolls()
      } catch (error) {
        console.error("Error closing poll:", error)
        alert(`Error closing poll: ${error instanceof Error ? error.message : String(error)}`)
      } finally {
        setClosingPoll(null)
      }
    }

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Active Polls</DialogTitle>
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogHeader>

          <div className="py-4">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : polls.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No active polls found</div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {polls.map((poll) => (
                  <div key={poll._id} className="border rounded-lg p-4">
                    <div className="text-xs text-muted-foreground mb-2">Poll ID: {poll._id}</div>
                    <h3 className="font-bold mb-2">{poll.question}</h3>

                    <div className="space-y-2 mb-4">
                      {poll.options.map((option, index) => {
                        const totalVotes = poll.answers.reduce((sum, count) => sum + count, 0)
                        const percentage = totalVotes > 0 ? Math.round((poll.answers[index] / totalVotes) * 100) : 0

                        return (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="text-sm">{option}</div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                <div
                                  className="bg-primary h-2.5 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="ml-4 text-sm font-medium">
                              {poll.answers[index]} votes ({percentage}%)
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <div className="text-xs text-muted-foreground"><br></br>Poll ID: {poll._id}</div>

                    </div>
                  </div>
                ))}
                  <Button
                  onClick={() => closePolls()}
                  disabled={false}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  {false ? (
                    "Processing..."
                  ) : (
                    <>
                      <Award className="h-4 w-4 mr-1" />
                      Close & Reward all polls
                    </>
                  )}
                </Button>
              </div>
              
            )}
                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={onClose}
                >
                  Iterate based on feedback
                  <StepForward className="h-4 w-4" />
                </Button>

          </div>
        </DialogContent>
      </Dialog>
    )
  },
)

ActivePollsModal.displayName = "ActivePollsModal"

