import { PayBlock } from "./components/Pay";
import { VerifyBlock } from "./components/Verify";
import { useState } from "react";
import PollApp from "@/components/poll-app"


export default function App() {
  
  return (
    <main className="min-h-screen bg-gray-50">
      <PollApp />
    </main>
  );
}
