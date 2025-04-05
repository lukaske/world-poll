import os
import json
import re
from openai import OpenAI

from dotenv import load_dotenv
from prompts import PREVIOUS_POLLS_CONTEXT

load_dotenv()


def extract_json_from_report(content):
    api_key = os.environ.get("OPENAI_API_KEY")
    if api_key is None:
        raise ValueError("OpenAI API key must be provided or set as OPENAI_API_KEY environment variable")

    client = OpenAI(api_key=api_key)

    prompt = """
    The JSON structure should be the following:
    {
      "title": "string",
      "introduction": "string",
      "sections": [
        {
          "heading": "string",
          "content": "string",
          "sources": [
            {
              "title": "string",
              "url": "string"
            }
          ]
        }
      ],
      "conclusion": "string",
      "poll": [
        {
          "question": "string",
          "options": ["string"]
        }
      ]
    }
    Here is the report you need to structure:
    
    """ + content

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system",
             "content": "You are a JSON extraction assistant. Extract valid JSON from the provided text."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.0,
    )
    result = response.choices[0].message.content.strip()
    json_match = re.search(r'({[\s\S]*}|\[[\s\S]*\])', result)
    if json_match:
        result = json_match.group(0)

    parsed_json = json.loads(result)
    return parsed_json


def analyze_previous_poll_results(previous_poll_results):
    poll_context = PREVIOUS_POLLS_CONTEXT
    high_variance_questions = []
    consensus_questions = []

    for question, responses in previous_poll_results.items():
        poll_context += f"\nQuestion: {question}\n"
        total_responses = sum(r['count'] for r in responses)

        for response in responses:
            percentage = (response['count'] / total_responses) * 100
            poll_context += f"- {response['option']}: {response['count']} responses ({percentage:.1f}%)\n"

        if len(responses) >= 2:
            max_response = max(responses, key=lambda x: x['count'])
            max_percentage = (max_response['count'] / total_responses) * 100

            if max_percentage < 50:
                high_variance_questions.append(question)
                poll_context += "Note: This question shows significant response distribution across options, suggesting polarized viewpoints.\n"
            elif max_percentage > 80:
                consensus_questions.append(question)
                poll_context += "Note: This question shows strong consensus around a single viewpoint.\n"

    return poll_context
