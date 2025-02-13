from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, Union, List
from pydantic import BaseModel
from dotenv import load_dotenv
from . import ai_service

# Load environment variables
load_dotenv()

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local development
        "https://reactv1-chi.vercel.app",  # Vercel production URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# This is a Pydantic model
class Item(BaseModel):
    id: int                              # Must be an integer
    name: str                            # Must be a string
    description: Union[str, None] = None # Optional string, defaults to None

class Question(BaseModel):
    text: str

@app.get("/api/hello")
async def hello() -> Dict[str, str]:
    return {"message": "Hello from FastAPI!"}

@app.get("/api/another")
async def another_endpoint() -> Dict[str, str]:
    return {"data": "More data from backend"}

@app.get("/api/data")
async def data_function() -> Dict[str, Union[str, int]]:
    return {"number": 42}  # This is now valid

@app.get("/api/items")
async def get_items() -> Dict[str, List[Item]]:
    items = [
        Item(id=1, name="First Item", description="This is item 1"),
        Item(id=2, name="Second Item"),
    ]
    return {"items": items}

@app.post("/api/ask")
async def ask_question(question: Question) -> Dict[str, str]:
    return await ai_service.ask_question(question.text)

@app.get("/api/system-prompt")
async def get_system_prompt() -> Dict[str, str]:
    return {"prompt": ai_service.get_system_prompt()}

@app.post("/api/system-prompt")
async def update_system_prompt(data: Dict[str, str]) -> Dict[str, str]:
    new_prompt = data.get("prompt")
    if not new_prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")
    ai_service.update_system_prompt(new_prompt)
    return {"message": "Prompt updated successfully"}

@app.get("/api/model")
async def get_model() -> Dict[str, str]:
    return {"model": ai_service.get_model()}

@app.post("/api/model")
async def update_model(data: Dict[str, str]) -> Dict[str, str]:
    new_model = data.get("model")
    if not new_model:
        raise HTTPException(status_code=400, detail="Model is required")
    ai_service.update_model(new_model)
    return {"message": "Model updated successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5002)