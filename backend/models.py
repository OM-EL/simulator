from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Literal

Base = declarative_base()

# SQLAlchemy Models
class LoanProduct(Base):
    __tablename__ = "loan_products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String)  # 'home', 'vehicle', 'personal'
    min_amount = Column(Float)
    max_amount = Column(Float)
    min_term_months = Column(Integer)
    max_term_months = Column(Integer)
    base_rate = Column(Float)  # Base annual interest rate
    max_ltv = Column(Float)  # Maximum Loan to Value ratio (for secured loans)
    max_dti = Column(Float)  # Maximum Debt to Income ratio
    origination_fee_percent = Column(Float)  # Fee percentage
    risk_bands = Column(Text)  # JSON string of risk band adjustments
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Simulation(Base):
    __tablename__ = "simulations"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("loan_products.id"))
    loan_type = Column(String)  # 'home', 'vehicle', 'personal'
    loan_amount = Column(Float)
    loan_term_months = Column(Integer)
    interest_rate = Column(Float)
    monthly_payment = Column(Float)
    total_payment = Column(Float)
    total_interest = Column(Float)
    apr = Column(Float)  # Annual Percentage Rate
    property_value = Column(Float, nullable=True)  # For home/vehicle loans
    income = Column(Float)
    ltv_ratio = Column(Float, nullable=True)  # Loan to Value ratio
    dti_ratio = Column(Float)  # Debt to Income ratio
    email = Column(String, nullable=True)  # User email if they requested a quote
    ip_address = Column(String, nullable=True)  # For GDPR tracking
    created_at = Column(DateTime, default=datetime.utcnow)
    
    product = relationship("LoanProduct")

class AdminUser(Base):
    __tablename__ = "admin_users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# Pydantic Models for API
class LoanProductBase(BaseModel):
    name: str
    type: Literal['home', 'vehicle', 'personal']
    min_amount: float
    max_amount: float
    min_term_months: int
    max_term_months: int
    base_rate: float
    max_ltv: Optional[float] = None
    max_dti: float
    origination_fee_percent: float
    risk_bands: str  # JSON string
    is_active: bool = True

class LoanProductCreate(LoanProductBase):
    pass

class LoanProductUpdate(BaseModel):
    name: Optional[str] = None
    min_amount: Optional[float] = None
    max_amount: Optional[float] = None
    min_term_months: Optional[int] = None
    max_term_months: Optional[int] = None
    base_rate: Optional[float] = None
    max_ltv: Optional[float] = None
    max_dti: Optional[float] = None
    origination_fee_percent: Optional[float] = None
    risk_bands: Optional[str] = None
    is_active: Optional[bool] = None

class LoanProduct_Pydantic(LoanProductBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class SimulationBase(BaseModel):
    product_id: int
    loan_type: Literal['home', 'vehicle', 'personal']
    loan_amount: float
    loan_term_months: int
    income: float
    property_value: Optional[float] = None  # For home/vehicle loans

class SimulationCreate(SimulationBase):
    ip_address: Optional[str] = None

class SimulationEmailRequest(BaseModel):
    simulation_id: int
    email: str

class SimulationResult(BaseModel):
    id: int
    loan_type: str
    loan_amount: float
    loan_term_months: int
    interest_rate: float
    monthly_payment: float
    total_payment: float
    total_interest: float
    apr: float
    ltv_ratio: Optional[float] = None
    dti_ratio: float
    amortization: List[dict] = []  # Will contain monthly breakdown
    created_at: datetime
    
    class Config:
        from_attributes = True

class AdminUserCreate(BaseModel):
    username: str
    email: str
    password: str

class AdminUserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str