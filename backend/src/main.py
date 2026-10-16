from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from typing import List
from pydantic import BaseModel

from src.models import (
    create_db_and_tables, get_session, 
    Transaction, TransactionBase, ExtractionPayload
)
from src.llm import extract_transactions_from_text

app = FastAPI(title="M.A.T.U.R.E Financial API")

# Allow frontend React app to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In prod must restrict to localhost:5173
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

class TextRequest(BaseModel):
    text: str

# 1. LLM Extraction Route
@app.post("/api/extract", response_model=ExtractionPayload)
def extract_data(payload: TextRequest):
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")
    try:
        result = extract_transactions_from_text(payload.text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 2. Commit to Database Route
@app.post("/api/transactions", response_model=dict)
def save_transactions(transactions: List[TransactionBase], session: Session = Depends(get_session)):
    count = 0
    for tx_data in transactions:
        # Convert the LLM Base schema into a Database schema
        db_transaction = Transaction.model_validate(tx_data)
        session.add(db_transaction)
        count += 1
    session.commit()
    return {"status": "success", "inserted": count}

# 3. Read Database Route (For Dashboard)
@app.get("/api/transactions", response_model=List[Transaction])
def get_transactions(session: Session = Depends(get_session)):
    statement = select(Transaction).order_by(Transaction.date.desc())
    return session.exec(statement).all()