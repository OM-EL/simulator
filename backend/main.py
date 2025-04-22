import json
import math
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import engine, get_db
from models import Base, AdminUser, LoanProduct, Simulation
from models import (
    LoanProductCreate, LoanProduct_Pydantic,
    LoanProductUpdate, SimulationCreate,
    SimulationResult, SimulationEmailRequest,
    AdminUserCreate, Token
)
from auth import (
    get_password_hash, authenticate_user,
    create_access_token, get_current_active_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

# Création des tables dans la base de données
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Bank Loan Simulator API",
    description="API for simulating home, vehicle and personal loans with Revolut-style interface",
    version="1.0.0"
)

# Configuration CORS pour permettre les requêtes du frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En production, limitez aux domaines autorisés
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Route d'accueil
@app.get("/")
def read_root():
    return {"message": "Bank Loan Simulator API", "version": "1.0.0"}

# Routes pour l'authentification
@app.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/users/", response_model=dict)
async def create_user(
    user: AdminUserCreate,
    db: Session = Depends(get_db)
):
    # Vérifie si l'utilisateur existe déjà
    db_user = db.query(AdminUser).filter(AdminUser.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Crée un nouvel utilisateur
    hashed_password = get_password_hash(user.password)
    db_user = AdminUser(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"message": "User created successfully"}

# Routes pour les produits de prêt
@app.post("/loan-products/", response_model=LoanProduct_Pydantic)
async def create_loan_product(
    product: LoanProductCreate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_active_user)
):
    # Convertit le modèle Pydantic en modèle SQLAlchemy
    db_product = LoanProduct(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.get("/loan-products/", response_model=List[LoanProduct_Pydantic])
async def get_loan_products(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    products = db.query(LoanProduct).filter(LoanProduct.is_active == True).offset(skip).limit(limit).all()
    return products

@app.get("/loan-products/{product_id}", response_model=LoanProduct_Pydantic)
async def get_loan_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = db.query(LoanProduct).filter(LoanProduct.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Loan product not found")
    return product

@app.put("/loan-products/{product_id}", response_model=LoanProduct_Pydantic)
async def update_loan_product(
    product_id: int,
    product_update: LoanProductUpdate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_active_user)
):
    db_product = db.query(LoanProduct).filter(LoanProduct.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Loan product not found")
    
    # Met à jour uniquement les champs fournis
    update_data = product_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)
    
    db_product.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_product)
    return db_product

@app.delete("/loan-products/{product_id}", response_model=dict)
async def delete_loan_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_active_user)
):
    db_product = db.query(LoanProduct).filter(LoanProduct.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Loan product not found")
    
    # Soft delete: marque comme inactif plutôt que de supprimer
    db_product.is_active = False
    db_product.updated_at = datetime.utcnow()
    db.commit()
    return {"message": "Loan product deactivated"}

# Utilitaires pour le calcul du prêt
def calculate_monthly_payment(principal, annual_interest_rate, term_months):
    """Calcule le paiement mensuel d'un prêt."""
    monthly_rate = annual_interest_rate / 12 / 100
    if monthly_rate == 0:
        return principal / term_months
    return principal * monthly_rate * (1 + monthly_rate) ** term_months / ((1 + monthly_rate) ** term_months - 1)

def calculate_apr(loan_amount, term_months, monthly_payment, fees):
    """Calcule le taux annuel effectif global (APR) d'un prêt."""
    # Méthode de Newton pour trouver le taux d'intérêt mensuel
    tolerance = 0.0000001
    guess = 0.01  # Commencer avec 1%
    total_with_fees = loan_amount + fees
    
    for _ in range(100):  # Max 100 itérations
        guess_payment = total_with_fees * guess * (1 + guess) ** term_months / ((1 + guess) ** term_months - 1)
        derivative = (total_with_fees * ((1 + guess) ** term_months) * (term_months * guess * (1 + guess) ** (term_months - 1) - ((1 + guess) ** term_months - 1))) / (((1 + guess) ** term_months - 1) ** 2)
        next_guess = guess - (guess_payment - monthly_payment) / derivative
        if abs(next_guess - guess) < tolerance:
            return next_guess * 12 * 100
        guess = next_guess
    
    return guess * 12 * 100  # Convertit le taux mensuel en APR

def calculate_amortization_schedule(loan_amount, annual_interest_rate, term_months):
    """Génère un tableau d'amortissement complet pour un prêt."""
    monthly_rate = annual_interest_rate / 12 / 100
    monthly_payment = calculate_monthly_payment(loan_amount, annual_interest_rate, term_months)
    
    schedule = []
    balance = loan_amount
    
    for month in range(1, term_months + 1):
        interest_payment = balance * monthly_rate
        principal_payment = monthly_payment - interest_payment
        balance -= principal_payment
        
        schedule.append({
            "month": month,
            "payment": round(monthly_payment, 2),
            "principal": round(principal_payment, 2),
            "interest": round(interest_payment, 2),
            "balance": max(0, round(balance, 2))  # Évite les balances négatives dues aux arrondis
        })
    
    return schedule

# Routes pour les simulations de prêt
@app.post("/simulations/", response_model=SimulationResult)
async def create_simulation(
    simulation: SimulationCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    # Récupère le produit de prêt
    product = db.query(LoanProduct).filter(LoanProduct.id == simulation.product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Loan product not found")
    
    # Valide les paramètres du prêt
    if (simulation.loan_amount < product.min_amount or 
        simulation.loan_amount > product.max_amount or
        simulation.loan_term_months < product.min_term_months or
        simulation.loan_term_months > product.max_term_months):
        raise HTTPException(status_code=400, detail="Loan parameters out of allowed range")
    
    # Calcule le LTV (Loan-to-Value) si applicable
    ltv_ratio = None
    if simulation.property_value and simulation.property_value > 0:
        ltv_ratio = (simulation.loan_amount / simulation.property_value) * 100
        if product.max_ltv and ltv_ratio > product.max_ltv:
            raise HTTPException(status_code=400, detail="Loan-to-Value ratio exceeds maximum allowed")
    
    # Calcule le DTI (Debt-to-Income) ratio
    # Simplifié: Suppose que le paiement mensuel est 100% de la dette
    monthly_income = simulation.income / 12
    monthly_payment = calculate_monthly_payment(simulation.loan_amount, product.base_rate, simulation.loan_term_months)
    dti_ratio = (monthly_payment / monthly_income) * 100
    if dti_ratio > product.max_dti:
        raise HTTPException(status_code=400, detail="Debt-to-Income ratio exceeds maximum allowed")
    
    # Calcule les frais d'origine
    origination_fee = simulation.loan_amount * (product.origination_fee_percent / 100)
    
    # Calcule les autres métriques du prêt
    total_payment = monthly_payment * simulation.loan_term_months
    total_interest = total_payment - simulation.loan_amount
    apr = calculate_apr(simulation.loan_amount, simulation.loan_term_months, monthly_payment, origination_fee)
    
    # Génère le tableau d'amortissement
    amortization = calculate_amortization_schedule(simulation.loan_amount, product.base_rate, simulation.loan_term_months)
    
    # Enregistre la simulation
    client_ip = simulation.ip_address or request.client.host
    db_simulation = Simulation(
        product_id=simulation.product_id,
        loan_type=simulation.loan_type,
        loan_amount=simulation.loan_amount,
        loan_term_months=simulation.loan_term_months,
        interest_rate=product.base_rate,
        monthly_payment=monthly_payment,
        total_payment=total_payment,
        total_interest=total_interest,
        apr=apr,
        property_value=simulation.property_value,
        income=simulation.income,
        ltv_ratio=ltv_ratio,
        dti_ratio=dti_ratio,
        ip_address=client_ip
    )
    
    db.add(db_simulation)
    db.commit()
    db.refresh(db_simulation)
    
    # Ajoute le tableau d'amortissement au résultat
    result = SimulationResult.from_orm(db_simulation)
    result.amortization = amortization
    
    return result

@app.post("/simulations/{simulation_id}/email", response_model=dict)
async def email_simulation(
    email_request: SimulationEmailRequest,
    db: Session = Depends(get_db)
):
    # Récupère la simulation
    simulation = db.query(Simulation).filter(Simulation.id == email_request.simulation_id).first()
    if simulation is None:
        raise HTTPException(status_code=404, detail="Simulation not found")
    
    # Met à jour l'email dans la base de données
    simulation.email = email_request.email
    db.commit()
    
    # Mock d'envoi d'email
    print(f"\n[EMAIL MOCK] Simulation sent to {email_request.email} for simulation ID {email_request.simulation_id}\n")
    print(f"Loan Type: {simulation.loan_type.capitalize()} Loan")
    print(f"Amount: ${simulation.loan_amount:,.2f}")
    print(f"Term: {simulation.loan_term_months} months")
    print(f"Monthly Payment: ${simulation.monthly_payment:,.2f}")
    print(f"Total Interest: ${simulation.total_interest:,.2f}")
    print(f"APR: {simulation.apr:.2f}%\n")
    
    return {"message": "Simulation sent by email", "email": email_request.email}

@app.get("/simulations/", response_model=List[SimulationResult])
async def get_simulations(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_active_user)
):
    # Seulement les admins peuvent voir toutes les simulations
    simulations = db.query(Simulation).offset(skip).limit(limit).all()
    # Note: Pour être complet, il faudrait ajouter le tableau d'amortissement à chaque simulation
    return simulations

@app.delete("/simulations/purge-gdpr", response_model=dict)
async def purge_old_simulations(
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_active_user)
):
    # Supprime les simulations de plus de 90 jours (GDPR)
    ninety_days_ago = datetime.utcnow() - timedelta(days=90)
    result = db.query(Simulation).filter(Simulation.created_at < ninety_days_ago).delete()
    db.commit()
    return {"message": f"Purged {result} old simulations for GDPR compliance"}

# Ajoutez des produits de prêt de départ
@app.on_event("startup")
async def startup_db_client():
    db = SessionLocal()
    try:
        # Vérifie s'il y a des produits dans la base de données
        products_exist = db.query(LoanProduct).first() is not None
        admin_exists = db.query(AdminUser).first() is not None
        
        if not products_exist:
            # Crée des produits de prêt par défaut
            home_loan = LoanProduct(
                name="Home Loan Standard",
                type="home",
                min_amount=50000,
                max_amount=1000000,
                min_term_months=60,
                max_term_months=360,
                base_rate=4.5,
                max_ltv=80.0,
                max_dti=36.0,
                origination_fee_percent=0.5,
                risk_bands=json.dumps({
                    "excellent": -0.5,  # Taux de base -0.5%
                    "good": 0,          # Taux de base
                    "fair": 1.0,        # Taux de base +1%
                    "poor": 2.5         # Taux de base +2.5%
                })
            )
            
            vehicle_loan = LoanProduct(
                name="Auto Loan Standard",
                type="vehicle",
                min_amount=5000,
                max_amount=100000,
                min_term_months=12,
                max_term_months=84,
                base_rate=3.9,
                max_ltv=90.0,
                max_dti=40.0,
                origination_fee_percent=1.0,
                risk_bands=json.dumps({
                    "excellent": -0.4,
                    "good": 0,
                    "fair": 1.5,
                    "poor": 3.0
                })
            )
            
            personal_loan = LoanProduct(
                name="Personal Loan Standard",
                type="personal",
                min_amount=1000,
                max_amount=50000,
                min_term_months=12,
                max_term_months=60,
                base_rate=6.9,
                max_ltv=None,  # Non applicable pour les prêts personnels
                max_dti=43.0,
                origination_fee_percent=2.0,
                risk_bands=json.dumps({
                    "excellent": -1.0,
                    "good": 0,
                    "fair": 2.0,
                    "poor": 5.0
                })
            )
            
            db.add_all([home_loan, vehicle_loan, personal_loan])
            db.commit()
        
        if not admin_exists:
            # Crée un utilisateur administrateur par défaut
            hashed_password = get_password_hash("admin@123")
            admin_user = AdminUser(
                username="admin",
                email="admin@example.com",
                hashed_password=hashed_password
            )
            db.add(admin_user)
            db.commit()
            print("Created default admin user: admin / admin@123")
    finally:
        db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)