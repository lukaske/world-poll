import os
import json
import re
from openai import OpenAI

from dotenv import load_dotenv

load_dotenv()

def extract_json_from_report(readme_content, ):
    api_key = os.environ.get("OPENAI_API_KEY")
    if api_key is None:
        raise ValueError("OpenAI API key must be provided or set as OPENAI_API_KEY environment variable")

    client = OpenAI(api_key=api_key)

    prompt = f"""
    You are a helpful assistant. You will receive a report, and your task is to convert it into structured JSON format. The JSON structure should include:
        - A title of the report
        - An introduction
        - Multiple sections (each with a heading and content)
        - Sources for each section (with title and URL)
        - Conclusion section
        - Poll questions and options

    Here is the report you need to structure:
    {readme_content}
    """

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

    # Parse the JSON
    parsed_json = json.loads(result)
    return parsed_json