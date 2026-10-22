from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from sqlmodel import Session, select, func, delete
from collections import defaultdict
from typing import List
from datetime import datetime
import calendar
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

COLORS = ['#f59e0b', '#3b82f6', '#ec4899', '#06b6d4', '#8b5cf6', '#ef4444', '#10b981']

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

# Commit to Database Route
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

# Read Database Route (For Dashboard)
@app.get("/api/transactions", response_model=List[Transaction])
def get_transactions(session: Session = Depends(get_session)):
    statement = select(Transaction).order_by(Transaction.date.desc())
    return session.exec(statement).all()

@app.get("/api/analytics/dashboard")
def get_dashboard_analytics(year: int, month: str, session: Session = Depends(get_session)):
    statement = select(Transaction).where(Transaction.date.startswith(str(year)))
    transactions = session.exec(statement).all()
    
    month_map = {name: f"{i:02d}" for i, name in enumerate(calendar.month_name) if i > 0}
    month_num_to_abbr = {f"{i:02d}": abbr for i, abbr in enumerate(calendar.month_abbr) if i > 0}
    
    target_month_num = month_map.get(month, "09")
    target_month_prefix = f"{year}-{target_month_num}"
    
    yearly_out = 0.0
    monthly_out = 0.0
    monthly_in = 0.0
    cat_yearly = defaultdict(float)
    cat_monthly = defaultdict(float)
    
    trend_data = {abbr: {"month": abbr, "cash_in": 0.0, "cash_out": 0.0} for abbr in calendar.month_abbr[1:]}
    
    # --- NEW DATA STRUCTURES ---
    target_month_txns = []
    dow_totals = {i: 0.0 for i in range(7)}
    dow_counts = {i: set() for i in range(7)}
    daily_spend = defaultdict(float)  # Tracks amount spent per MM-DD
    
    for t in transactions:
        amt = float(t.amount)
        txn_month_num = t.date[5:7] if len(t.date) >= 7 else ""
        txn_month_abbr = month_num_to_abbr.get(txn_month_num)
        
        is_target_month = t.date.startswith(target_month_prefix)
        is_expense = (t.transaction_type.upper() == "EXPENSE")
        
        if is_expense:
            yearly_out += amt
            cat_yearly[t.category] += amt
            
            if txn_month_abbr in trend_data:
                trend_data[txn_month_abbr]["cash_out"] += amt
                
            if is_target_month:
                monthly_out += amt
                cat_monthly[t.category] += amt
                # Track for Top 5
                target_month_txns.append({
                    "date": t.date[:10],
                    "category": t.category,
                    "description": t.description or "Transaction",
                    "amount": amt
                })
                
            # Track for Day of Week
            try:
                dt = datetime.strptime(t.date[:10], "%Y-%m-%d")
                dow = dt.weekday() # 0 = Mon, 6 = Sun
                dow_totals[dow] += amt
                dow_counts[dow].add(t.date[:10]) # Count unique days to find the average
            except ValueError:
                pass
                
            # Track for Pacing
            if len(t.date) >= 10:
                mm_dd = t.date[5:10]
                daily_spend[mm_dd] += amt
                
        else: # INCOME
            if txn_month_abbr in trend_data:
                trend_data[txn_month_abbr]["cash_in"] += amt
            if is_target_month:
                monthly_in += amt

    # formating of responses
    
    # Donuts
    yearly_donut_data = [
        {"name": cat, "value": round(val, 2), "color": COLORS[i % len(COLORS)]}
        for i, (cat, val) in enumerate(sorted(cat_yearly.items(), key=lambda x: x[1], reverse=True))
    ]
    monthly_donut_data = [
        {"name": cat, "value": round(val, 2), "color": COLORS[i % len(COLORS)]}
        for i, (cat, val) in enumerate(sorted(cat_monthly.items(), key=lambda x: x[1], reverse=True))
    ]
    
    # Monthly Comparison (Keeping your original logic)
    comparison_data = []
    for cat in cat_yearly.keys():
        comparison_data.append({
            "category": cat[:7],
            "selected": round(cat_monthly[cat], 2),
            "avg": round(cat_yearly[cat] / 12, 2)
        })
    comparison_data = sorted(comparison_data, key=lambda x: x["selected"], reverse=True)[:5]
    
    # Day of Week Average
    dow_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    day_of_week = []
    for i in range(7):
        avg_spend = dow_totals[i] / len(dow_counts[i]) if len(dow_counts[i]) > 0 else 0
        day_of_week.append({"day": dow_names[i], "amount": round(avg_spend, 2)})
        
    # Top Transactions
    top_transactions = sorted(target_month_txns, key=lambda x: x["amount"], reverse=True)[:5]
    
    # Pacing Data
    days_in_target_month = calendar.monthrange(year, int(target_month_num))[1]
    pacing_data = []
    current_month_cum = 0.0
    avg_month_cum = 0.0
    
    for d in range(1, days_in_target_month + 1):
        day_str = f"{d:02d}"
        
        # Today's spend for target month
        target_mm_dd = f"{target_month_num}-{day_str}"
        current_month_cum += daily_spend.get(target_mm_dd, 0.0)
        
        # Average spend for this day across all 12 months
        day_sum = sum(daily_spend.get(f"{m:02d}-{day_str}", 0.0) for m in range(1, 13))
        avg_month_cum += (day_sum / 12.0)
        
        pacing_data.append({
            "day": d,
            "current_month": round(current_month_cum, 2),
            "average_month": round(avg_month_cum, 2)
        })

    # Savings Rate
    savings_rate = 0
    if monthly_in > 0:
        savings_rate = max(0, round(((monthly_in - monthly_out) / monthly_in) * 100))

    return {
        "yearly_total": round(yearly_out, 2),
        "yearly_donut": yearly_donut_data,
        "monthly_total": round(monthly_out, 2),
        "monthly_donut": monthly_donut_data,      
        "monthly_comparison": comparison_data,
        "yearly_trend": list(trend_data.values()),
        "day_of_week": day_of_week,                 
        "pacing_data": pacing_data,                 
        "top_transactions": top_transactions,       
        "savings_rate": savings_rate
    }

@app.get("/api/analytics/available-years")
def get_available_years(session: Session = Depends(get_session)):
    statement = select(Transaction.date)
    dates = session.exec(statement).all()
    
    if not dates:
        return [datetime.now().year]
        
    # Extract the 'YYYY' from 'YYYY-MM-DD', convert to int, remove duplicates, and sort descending
    years = sorted(list(set([int(d[:4]) for d in dates if len(d) >= 4])), reverse=True)
    return years
    
@app.delete("/api/transactions/clear")
def clear_all_transactions(session: Session = Depends(get_session)):
    """Wipes all transactions from the database."""
    statement = delete(Transaction)
    session.exec(statement)
    session.commit()
    return {"status": "success", "message": "Database wiped clean!"}