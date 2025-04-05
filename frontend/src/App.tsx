import "./App.css";

import { PayBlock } from "./components/Pay";
import { VerifyBlock } from "./components/Verify";
import { useState, useEffect, useRef } from "react";

interface Message {
  text: string;
  sender: 'user' | 'chatgpt';
}

const initialMessages: Message[] = [
  { text: "Hello! How can I help you today?", sender: 'chatgpt' },
  { text: "I have a question about the World ID verification process.", sender: 'user' },
  { text: "Of course! I'd be happy to help you with that. What specific aspect would you like to know more about?", sender: 'chatgpt' },
  { text: "How does the verification process work?", sender: 'user' },
  { text: "The verification process involves scanning your face using your device's camera. This helps ensure that each person can only verify once, maintaining the uniqueness of World ID.", sender: 'chatgpt' }
];

export default function App() {
  const [page, setPage] = useState<"forms" | "chat">("forms");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll to bottom when switching to chat page
  useEffect(() => {
    if (page === "chat") {
      setMessages(initialMessages);
      setTimeout(scrollToBottom, 100); // Small delay to ensure DOM is updated
    }
  }, [page]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: 'user' }]);
      setInput("");
      // Simulate ChatGPT response
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          text: "I understand your question. Let me help you with that.", 
          sender: 'chatgpt' 
        }]);
      }, 1000);
    }
  };

  return (
    <main className="flex min-h-screen flex-col">
      {page === "forms" && (
        <div className="p-24">
          <VerifyBlock />
        </div>
      )}
      {page === "chat" && (
        <div className="chat-container">
          <div className="messages">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`message ${msg.sender === 'user' ? 'user-message' : 'chatgpt-message'}`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="input-container">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="message-input"
            />
            <button onClick={handleSendMessage} className="send-button">
              Send
            </button>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 shadow-md p-4">
        <ul className="flex justify-around">
          <li>
            <button 
              className="flex items-center text-white hover:text-blue-400 transition duration-300" 
              onClick={() => setPage("forms")}
            >
              Forms
            </button>
          </li>
          <li>
            <button 
              className="flex items-center text-white hover:text-blue-400 transition duration-300" 
              onClick={() => setPage("chat")}
            >
              Chat
            </button>
          </li>
        </ul>
      </nav>
    </main>
  );
}
