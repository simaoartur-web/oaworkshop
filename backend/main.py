from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import os
from dotenv import load_dotenv

load_dotenv()

import models, schemas
from database import engine, get_db

# Create DB tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="O+A Architects API", version="1.0.0")

# CORS config
origins = [
    "http://localhost:5173", # Vite React default
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to O+A Architects API"}

# --- PROJECTS ---

@app.post("/api/projects", response_model=schemas.Project, status_code=status.HTTP_201_CREATED)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db)):
    db_project = models.Project(**project.model_dump())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@app.get("/api/projects", response_model=List[schemas.Project])
def read_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    projects = db.query(models.Project).offset(skip).limit(limit).all()
    return projects

@app.get("/api/projects/{project_id}", response_model=schemas.Project)
def read_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@app.put("/api/projects/{project_id}", response_model=schemas.Project)
def update_project(project_id: int, project: schemas.ProjectCreate, db: Session = Depends(get_db)):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    for key, value in project.model_dump().items():
        setattr(db_project, key, value)
        
    db.commit()
    db.refresh(db_project)
    return db_project

@app.delete("/api/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: int, db: Session = Depends(get_db)):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db.delete(db_project)
    db.commit()
    return None

# --- LEADS / MESSAGES ---

import html
import smtplib
from email.message import EmailMessage

@app.post("/api/leads", response_model=schemas.Lead, status_code=status.HTTP_201_CREATED)
def create_lead(lead: schemas.LeadCreate, db: Session = Depends(get_db)):
    # 1. Prevent XSS by escaping HTML characters before saving to DB
    clean_name = html.escape(lead.name)
    clean_subject = html.escape(lead.subject) if lead.subject else ""
    clean_message = html.escape(lead.message)
    
    # Update lead object with sanitized data
    db_lead = models.Lead(
        name=clean_name,
        email=lead.email,
        subject=clean_subject,
        message=clean_message
    )
    
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    
    # 2. Logic to actually send the email to the company
    try:
        msg = EmailMessage()
        msg.set_content(f"Novo Formulário de Contacto Recebido!\n\nNome: {clean_name}\nEmail: {lead.email}\nAssunto: {clean_subject}\nMensagem:\n{clean_message}")
        
        msg['Subject'] = f"Contact Form: {clean_subject}"
        msg['From'] = os.getenv("SMTP_USER", "website@oa-workshop.com")
        msg['To'] = os.getenv("RECEIVER_EMAIL", "oa@oa-workshop.com")
        
        smtp_host = os.getenv("SMTP_HOST")
        smtp_user = os.getenv("SMTP_USER")
        smtp_pass = os.getenv("SMTP_PASS")
        smtp_port = int(os.getenv("SMTP_PORT", 465))
        
        # Só tenta enviar de verdade à internet se houver password configurada
        if smtp_pass and smtp_pass != "sua_password_de_aplicacao_aqui":
            with smtplib.SMTP_SSL(smtp_host, smtp_port) as server:
                server.login(smtp_user, smtp_pass)
                server.send_message(msg)
            print("--> [EMAIL] Enviado com sucesso via SMTP!")
        else:
            print(f"--> [EMAIL_MOCK] Simulacao de Envio (Falta Configurar .env). De: {lead.email} Para: {msg['To']}")
            
    except Exception as e:
        print(f"Failed to send email: {e}")
        # We don't raise an HTTPException here, because we still saved the lead in DB successfully.
        
    return db_lead

@app.get("/api/admin/leads", response_model=List[schemas.Lead])
def read_leads(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # In a real app, this should be protected by authentication
    leads = db.query(models.Lead).order_by(models.Lead.created_at.desc()).offset(skip).limit(limit).all()
    return leads
