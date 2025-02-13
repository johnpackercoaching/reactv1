import os
from openai import OpenAI
from typing import List, Dict, Any
from fastapi import HTTPException
from dotenv import load_dotenv
from . import knowledge_base, socrates_system

# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = OpenAI(
    api_key=os.getenv('OPENAI_API_KEY')
)

# Use the system prompt
SYSTEM_PROMPT = socrates_system.ACTIVE_PROMPT

# Use the knowledge base
documents = knowledge_base.DOCUMENTS

async def ask_question(question: str) -> Dict[str, Any]:
    try:
        completion = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": question}
            ]
        )
        return {"response": completion.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def create_embeddings(documents: List[str]) -> Dict[str, Any]:
    try:
        embeddings = client.embeddings.create(
            model="text-embedding-ada-002",
            input=documents
        )
        return {"embeddings": embeddings}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 