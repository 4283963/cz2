from typing import Optional, List

from sqlalchemy.orm import Session

import models
import schemas


def get_jade(db: Session, jade_id: int) -> Optional[models.JadeBasic]:
    return db.query(models.JadeBasic).filter(models.JadeBasic.id == jade_id).first()


def get_jades(
    db: Session,
    category: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
) -> List[models.JadeBasic]:
    query = db.query(models.JadeBasic)
    if category:
        try:
            cat_enum = models.JadeCategory(category)
        except ValueError:
            return []
        query = query.filter(models.JadeBasic.category == cat_enum)
    return query.order_by(models.JadeBasic.created_at.desc()).offset(skip).limit(limit).all()


def create_jade(db: Session, jade_in: schemas.JadeBasicCreate) -> models.JadeBasic:
    jade = models.JadeBasic(
        category=jade_in.category,
        weight=jade_in.weight,
        purchase_price=jade_in.purchase_price,
        note=jade_in.note,
    )
    quality = models.JadeQuality(
        transparency=jade_in.quality.transparency,
        fineness=jade_in.quality.fineness,
        bead_count=jade_in.quality.bead_count,
    )
    jade.quality = quality
    db.add(jade)
    db.commit()
    db.refresh(jade)
    return jade


def update_jade(db: Session, jade: models.JadeBasic, jade_in: schemas.JadeBasicUpdate) -> models.JadeBasic:
    data = jade_in.model_dump(exclude_unset=True)
    quality_data = data.pop("quality", None)
    for field, value in data.items():
        setattr(jade, field, value)
    if quality_data and jade.quality:
        for field, value in quality_data.items():
            setattr(jade.quality, field, value)
    db.commit()
    db.refresh(jade)
    return jade


def delete_jade(db: Session, jade: models.JadeBasic) -> None:
    db.delete(jade)
    db.commit()
