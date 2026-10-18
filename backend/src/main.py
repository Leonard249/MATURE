from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from sqlmodel import Session, select, func
from typing import List
from pydantic import BaseModel

from .models import (
    create_db_and_tables, get_session, 
    Transaction, TransactionBase, ExtractionPayload
)
from .llm import extract_transactions_from_text

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

# LLM Extraction Route
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

@app.get("/api/analytics/dashboard")
def get_dashboard_stats(session: Session = Depends(get_session)):
    """Aggregates all transaction data for the frontend dashboard."""
    
    # 1. Calculate Total Income (Handle None if DB is empty)
    income_stmt = select(func.sum(Transaction.amount)).where(Transaction.transaction_type == "INCOME")
    total_income = session.exec(income_stmt).first() or 0.0
    
    # 2. Calculate Total Expenses
    expense_stmt = select(func.sum(Transaction.amount)).where(Transaction.transaction_type == "EXPENSE")
    total_expenses = session.exec(expense_stmt).first() or 0.0
    
    # 3. Group Spending by Category (For Recharts Donut Chart)
    category_stmt = (
        select(Transaction.category, func.sum(Transaction.amount))
        .where(Transaction.transaction_type == "EXPENSE")
        .group_by(Transaction.category)
    )
    category_breakdown = [{"name": row[0], "value": row[1]} for row in session.exec(category_stmt).all()]

    # 4. Group Spending by Date (For Recharts Bar/Line Chart)
    # This formats the data perfectly for a time-series graph
    daily_stmt = (
        select(Transaction.date, func.sum(Transaction.amount))
        .where(Transaction.transaction_type == "EXPENSE")
        .group_by(Transaction.date)
        .order_by(Transaction.date)
    )
    daily_breakdown = [{"date": row[0], "amount": row[1]} for row in session.exec(daily_stmt).all()]

    # Calculate Savings Rate Safely
    savings_rate = 0.0
    if total_income > 0:
        savings_rate = round(((total_income - total_expenses) / total_income) * 100, 1)

    return {
        "kpis": {
            "total_income": total_income,
            "total_expenses": total_expenses,
            "net_cash_flow": total_income - total_expenses,
            "savings_rate": savings_rate
        },
        "charts": {
            "category_donut": category_breakdown,
            "daily_trend": daily_breakdown
        }
    }