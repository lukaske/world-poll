import type React from "react"

import { useState, useRef, useEffect } from "react"
import { marked } from "marked"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot, User, RefreshCcw } from "lucide-react"
import { handlePay } from "./Pay"
import { MiniKit, WalletAuthInput } from '@worldcoin/minikit-js'
import { sample } from "@/components/sample"
import { ParentComponent } from "@/components/ParentComponent"

import ReactMarkdown from 'react-markdown';
import { ActivePollsModal } from "./active-polls-modal"


interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

async function closePoll() {
  const pollId = "67f141b05e76308963c46f53"
  
  console.log("wallet address", MiniKit.walletAddress)

  const response = await fetch(`/api/get-contributors/${pollId}`)
  const { contributors } = await response.json()
  console.log("contributors", contributors)

  await handlePay(contributors[0])
  await handlePay(contributors[0])
  await handlePay(contributors[0])
}

export function ChatInterface() {
  const [pollIds, setPollIds] = useState<string[]>(() => {
    const savedPollIds = localStorage.getItem("pollIds");
    return savedPollIds ? JSON.parse(savedPollIds) : [];
  });
  const [messages, setMessages] = useState<Message[]>(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    return savedMessages 
      ? JSON.parse(savedMessages) 
      : [{
          id: "1",
          role: "assistant",
          content: "Hi! I'm your poll creation assistant. What kind of poll would you like to create today?",
        }];
  });
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  const clearChatHistory = () => {
    localStorage.removeItem("chatMessages");
    localStorage.removeItem("pollIds");
    setMessages([
      {
        id: "1",
        role: "assistant",
        content: "Hi! I'm your poll creation assistant. What kind of poll would you like to create today?",
      },
    ]);
    setPollIds([]);
  };
  

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])


  const sendNotification = async () => {
    fetch(import.meta.env.VITE_DEPLOYMENT_URL + "/send-notification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ wallet_addresses: ["0xfd84b9538bd76523527248b314394a156718016e"] })
    })
    .then(response => response.json())
    .then(data => {
      console.log('Notification sent successfully:', data);
    })
    .catch((error) => {
      console.error('Error sending notification:', error);
    });
  }
  useEffect(() => {
    localStorage.setItem("pollIds", JSON.stringify(pollIds));
  }, [pollIds]);


  const createPoll = (data) => {
    fetch('http://localhost:3030/upload-prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
      if (data.promptId) {
        setPollIds((prev) => [...prev, data.promptId]);
      }

    })
    .catch((error) => {
      console.error('Error:', error);
    });

    sendNotification()
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    setTimeout(() => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Initiating deep polling analysis... hang tight!",
      }
      setMessages((prev) => [...prev, assistantMessage])

          // Call LLM endpoint using fetch
  
    }, 1000)

    
    try {
      /*
      const response = await fetch('http://localhost:8888/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ topic: input + ' please provide some 4 choice poll questions' })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      */
      const data = sample
      // load from sample.ts
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log('Success:', data);


      // Upload response and poll to the database

      setIsLoading(false)

      // Assuming you have your data loaded as 'reportData'
      const displayReport = (reportData) => {
        // Display title
        const titleMessage = {
          id: Date.now().toString(),
          role: "assistant",
          content: `# ${reportData.title}`,
        };
        setMessages((prev) => [...prev, titleMessage]);
        
        // Display introduction
        const introMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `## Introduction\n\n${reportData.introduction}`,
        };
        setMessages((prev) => [...prev, introMessage]);
        
        // Display each section
        reportData.sections.forEach((section, index) => {      
          // Sources for this section
          const sourcesContent = section.sources.map(source => 
            `- [${source.title}](${source.url})`
          ).join('\n');
              
          // Section head & content
          const sectionContentMessage: Message = {
            id: (Date.now() + index + 2 + reportData.sections.length).toString(),
            role: "assistant",
            content: `## ${index +1}. ${section.heading}\n\n${section.content}\n\n### Sources\n\n${sourcesContent}`,
          };
          setMessages((prev) => [...prev, sectionContentMessage]);
          
                
        })

        // Display conclusion
        const conclusionMessage: Message = {
          id: (Date.now() + reportData.sections.length * 3 + 2).toString(),
          role: "assistant",
          content: `## Conclusion\n\n${reportData.conclusion}`,
        };
        setMessages((prev) => [...prev, conclusionMessage]);
        
        
        // Display poll
        const pollQuestions = reportData.poll.map((pollItem, index) => {
          const options = pollItem.options.map((option, i) => 
            `${i + 1}. ${option}`
          ).join('\n');
          
          return `**Q${index + 1}: ${pollItem.question}**\n${options}`;
        }).join('\n\n');
        
        const pollMessage: Message = {
          id: (Date.now() + reportData.sections.length * 3 + 3).toString(),
          role: "assistant",
          content: `## Poll Questions\n\n${pollQuestions}`,
        };
        setMessages((prev) => [...prev, pollMessage]);
      
      };

      // Call the function with your data
      createPoll(data)
      displayReport(data);

    } catch (error) {
      
      console.error('Error:', error);
    }
  }


  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef<{ refreshPolls: () => Promise<void> }>(null);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const refreshPolls = async () => {
    if (modalRef.current) {
      await modalRef.current.refreshPolls();
    }
  };

  

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)]">
      <ActivePollsModal
        ref={modalRef}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`flex items-start space-x-2 max-w-[80%] ${
                message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
              }`}
            >
              <div
                className={`flex-shrink-0 rounded-full p-2 ${
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div
                className={`rounded-lg px-4 py-2 prose ${
                  message.role === "user" ? "bg-primary text-primary-foreground text-white" : "bg-muted "
                }`}
              >
                 <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2 max-w-[80%]">
              <div className="flex-shrink-0 rounded-full p-2 bg-muted text-muted-foreground">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-lg px-4 py-2 bg-muted">
                <div className="flex space-x-1">
                  <div
                    className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
          <Button size='icon' variant={'ghost'} onClick={clearChatHistory} >
            <RefreshCcw className="h-4 w-4" />
          </Button>

        </div>
      </form>
      <button onClick={closePoll}>Close poll</button>
      <button onClick={sendNotification}>Send notification</button>
      {
        pollIds.length > 0 && (
          <div className="p-4 flex justify-center">
          <Button onClick={openModal}>
            Active Poll: {pollIds.length > 0 ? `${pollIds[pollIds.length - 1]}` : ""}
          </Button>
        </div>  
        )
      }
    </div>
  )
}

