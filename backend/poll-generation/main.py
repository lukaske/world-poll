import uuid
import uvicorn

from langgraph.types import Command
from langgraph.checkpoint.memory import MemorySaver
from open_deep_research.graph import builder
from pydantic import BaseModel
from typing import Dict, List, Optional
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from utils import analyze_previous_poll_results, extract_json_from_report
from prompts import REPORT_STRUCTURE
from langchain_community.llms import OpenAI
from langchain.chains.summarize import load_summarize_chain
from langchain.docstore.document import Document

load_dotenv()

class ResearchRequest(BaseModel):
    topic: str
    previous_poll_results: Optional[Dict[str, List[Dict]]] = None

class ResearchSummaryRequest(BaseModel):
    research_history: str

async def generate_research(request: ResearchRequest):
    memory = MemorySaver()
    graph = builder.compile(checkpointer=memory)
    poll_context = ""

    if request.previous_poll_results:
        poll_context = analyze_previous_poll_results(request.previous_poll_results)

    thread = {
        "configurable": {
            "thread_id": str(uuid.uuid4()),
            "search_api": "tavily",
            "planner_provider": "openai",
            "planner_model": "gpt-4o",
            "writer_provider": "openai",
            "writer_model": "gpt-4o",
            "max_search_depth": 1, # in order to make everything faster
            "max_search_results": 1,
            "report_structure": REPORT_STRUCTURE
        }
    }

    try:
        topic_with_context = f"\nUSER QUERY: {request.topic}\n\nPREVIOUS POLL CONTEXT:\n{poll_context}"
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

        return report

    except Exception as e:
        raise Exception(e)

async def summarize_research(request: ResearchSummaryRequest):
    llm = OpenAI(temperature=0)
    summary_chain = load_summarize_chain(llm, chain_type="map_reduce")

    research_text = request.research_history
    documents = [Document(page_content=research_text)]

    summary = summary_chain.run(documents)

    print("Summary:\n", summary)
    return summary

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TopicRequest(BaseModel):
    topic: str
    previous_poll_results: Optional[Dict[str, List[Dict]]] = None

@app.post("/research")
async def get_research(request: ResearchRequest):
    try:
        research_result = await generate_research(request)
        structured_report = extract_json_from_report(research_result)

        return structured_report

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/summarize-research")
async def summarize_research_endpoint(request: ResearchSummaryRequest):
    try:
        summary = await summarize_research(request)
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ping")
async def ping():
    return {"message": "pong"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8888)
