from fastapi import FastAPI, HTTPException
from utils import extract_json_from_report
import uvicorn

from langgraph.types import Command
from langgraph.checkpoint.memory import MemorySaver
from open_deep_research.graph import builder
from pydantic import BaseModel
from typing import Dict, List, Optional
import os
from dotenv import load_dotenv
import uuid

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

class ResearchRequest(BaseModel):
    topic: str
    previous_poll_results: Optional[Dict[str, List[Dict]]] = None

REPORT_STRUCTURE = """Use this structure to create a report on the user-provided topic:

1. Introduction (no research needed)
   - Brief overview of the topic area
2. Main Body Sections:
   - Each section should focus on a sub-topic of the user-provided topic
   - There should be at most 1 section, and all should be detailed in a few sentences, any empirical evidence should be included
   - Make sure that each section is researched on publicly available data
   - At least one sections should be based on empirical evidence gathered from internet
   - If previous poll results are provided, incorporate insights from them
3. Conclusion
    - Provide a concise summary of the report
4. Pool
    - Identify the subjective elements of the report and create a poll to gather user feedback
    - Create a poll with about 3 questions for the user to choose from which should give the user additional data which can be used to improve the report
    - The pool should be in the form of a multiple choice question
    - Each question should have around 3-5 options
"""

async def generate_research(request: ResearchRequest):
    memory = MemorySaver()
    graph = builder.compile(checkpointer=memory)
    # Format previous poll results as a string if they exist
    poll_context = ""
    if request.previous_poll_results:
        poll_context = "\nPrevious poll results:\n"
        for question, responses in request.previous_poll_results.items():
            poll_context += f"\nQuestion: {question}\n"
            for response in responses:
                poll_context += f"- {response['option']}: {response['count']} responses\n"
    
    thread = {
        "configurable": {
            "thread_id": str(uuid.uuid4()),
            "search_api": "tavily", 
            "planner_provider": "openai",
            "planner_model": "o3-mini",
            "writer_provider": "openai",
            "writer_model": "o3-mini",
            "max_search_depth": 1,
            "report_structure": REPORT_STRUCTURE
        }
    }

    try:
        topic_with_context = f"{request.topic}{poll_context}"
        async for event in graph.astream({"topic": topic_with_context}, thread, stream_mode="updates"):
            if '__interrupt__' in event:
                interrupt_value = event['__interrupt__'][0].value
                print(interrupt_value)

        async for event in graph.astream(Command(resume=True), thread, stream_mode="updates"):
            print(event)
            continue

        final_state = graph.get_state(thread)
        report = final_state.values.get('final_report')
        
        if not report:
            raise Exception("Failed to generate report")
        
        print(report)
            
        return report
        
    except Exception as e:
        raise Exception(e)

app = FastAPI()

class TopicRequest(BaseModel):
    topic: str
    previous_poll_results: Optional[Dict[str, List[Dict]]] = None

@app.get("/research")
async def get_research(topic: str, previous_poll_results: Optional[Dict[str, List[Dict]]] = None):
    try:
        request = ResearchRequest(
            topic=topic,
            previous_poll_results=previous_poll_results
        )
        
        research_result = await generate_research(request)
        structured_report = extract_json_from_report(research_result)
        
        return structured_report
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/ping")
async def ping():
    return {"message": "pong"} 

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8888)
