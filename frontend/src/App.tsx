import { PayBlock } from "./components/Pay";
import { VerifyBlock } from "./components/Verify";
import { useState } from "react";


export default function App() {
  const [page, setPage] = useState<"forms" | "chat">("forms");
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 gap-y-3">
      {page === "forms" && (
        <VerifyBlock />
      )}
      {page === "chat" && (
        <PayBlock />
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
