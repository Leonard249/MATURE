from enum import Enum
from datetime import datetime, timezone
from typing import Optional, List
from sqlmodel import SQLModel, Field, create_engine, Session

# ENUMS 
class TransactionType(str, Enum):
    EXPENSE = "EXPENSE"
    INCOME = "INCOME"

class Category(str, Enum):
    SALARY = "Salary & Wages"
    GROCERIES = "Groceries"
    DINING = "Dining & Food"
    TRANSPORT = "Transportation"
    UTILITIES = "Utilities & Bills"
    ENTERTAINMENT = "Entertainment"
    SHOPPING = "Shopping"
    HEALTH = "Health & Fitness"
    INVESTMENT = "Investment"
    OTHER_EXPENSE = "Other Expense"
    OTHER_INCOME = "Other Income"

# UNIFIED SCHEMAS 
class TransactionBase(SQLModel):
    transaction_type: TransactionType = Field(description="Incoming or outgoing money")
    date: str = Field(description="ISO date string in YYYY-MM-DD format")
    description: str = Field(description="Short summary of the transaction or vendor")
    category: Category = Field(description="Primary financial category classification")
    amount: float = Field(description="Positive numerical value")

class Transaction(TransactionBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ExtractionPayload(SQLModel):
    transactions: List[TransactionBase]

# DATABASE ENGINE 
sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"
connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session