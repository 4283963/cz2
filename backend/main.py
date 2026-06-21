from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import crud
import schemas
from database import engine, Base, get_db
from models import JadeCategory, JadeForm

Base.metadata.create_all(bind=engine)

app = FastAPI(title="和田玉藏品管理系统", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/categories", response_model=List[str])
def list_categories():
    return [c.value for c in JadeCategory]


@app.get("/api/forms", response_model=List[str])
def list_forms():
    return [f.value for f in JadeForm]


@app.post("/api/jades", response_model=schemas.JadeBasicOut, status_code=status.HTTP_201_CREATED)
def create_jade(jade_in: schemas.JadeBasicCreate, db: Session = Depends(get_db)):
    return crud.create_jade(db, jade_in)


@app.get("/api/jades", response_model=List[schemas.JadeBasicOut])
def list_jades(category: Optional[str] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_jades(db, category=category, skip=skip, limit=limit)


@app.get("/api/jades/{jade_id}", response_model=schemas.JadeBasicOut)
def get_jade(jade_id: int, db: Session = Depends(get_db)):
    jade = crud.get_jade(db, jade_id)
    if not jade:
        raise HTTPException(status_code=404, detail="玉石记录不存在")
    return jade


@app.put("/api/jades/{jade_id}", response_model=schemas.JadeBasicOut)
def update_jade(jade_id: int, jade_in: schemas.JadeBasicUpdate, db: Session = Depends(get_db)):
    jade = crud.get_jade(db, jade_id)
    if not jade:
        raise HTTPException(status_code=404, detail="玉石记录不存在")
    return crud.update_jade(db, jade, jade_in)


@app.delete("/api/jades/{jade_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_jade(jade_id: int, db: Session = Depends(get_db)):
    jade = crud.get_jade(db, jade_id)
    if not jade:
        raise HTTPException(status_code=404, detail="玉石记录不存在")
    crud.delete_jade(db, jade)
    return None
