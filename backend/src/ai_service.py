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
def get_system_prompt() -> str:
    try:
        assistant = client.beta.assistants.retrieve(
            assistant_id=os.getenv('OPENAI_ASSISTANT_ID')
        )
        # First handle None case
        if assistant.instructions is None:
            return socrates_system.ACTIVE_PROMPT
            
        # Force convert to string, no matter what type we get
        return str(assistant.instructions)
            
    except Exception as e:
        print(f"Error getting system prompt: {str(e)}")
        return socrates_system.ACTIVE_PROMPT

def update_system_prompt(new_prompt: str) -> None:
    try:
        # Update the OpenAI Assistant
        client.beta.assistants.update(
            assistant_id=os.getenv('OPENAI_ASSISTANT_ID'),
            instructions=new_prompt
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Use the knowledge base
documents = knowledge_base.DOCUMENTS

# Add model management
CURRENT_MODEL = "gpt-4o"

def get_model() -> str:
    return CURRENT_MODEL

def update_model(new_model: str) -> None:
    global CURRENT_MODEL
    CURRENT_MODEL = new_model

async def ask_question(question: str) -> Dict[str, Any]:
    try:
        completion = client.chat.completions.create(
            model=CURRENT_MODEL,  # Use the selected model
            messages=[
                {"role": "system", "content": get_system_prompt()},
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