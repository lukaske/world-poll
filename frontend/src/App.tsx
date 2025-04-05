import "./App.css";

import { PayBlock } from "./components/Pay";
import { VerifyBlock } from "./components/Verify";
import { useState } from "react";
import PollApp from "@/components/poll-app"

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
  
  return (
    <main className="min-h-screen bg-gray-50">
      {/* <button onClick={() => fetch("http://localhost:3030/create-poll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ question: "What is the best dog breed?", options: ["Labrador", "Poodle 1", "Poodle 2", "Poodle 3"], answers: [1, 5, 10, 2] })
      })
      }>Create Poll</button>
      <button onClick={async () => {
        const response = await fetch("http://localhost:3030/list-polls", {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        });
        const data = await response.json();
        console.log(data);
      }}>List Polls</button> */}
      <PollApp />
    </main>
  );
}
