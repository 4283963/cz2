from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from models import JadeCategory


class JadeQualityBase(BaseModel):
    transparency: int = Field(..., ge=0, le=10, description="透光度(0-10分)")
    fineness: str = Field(..., max_length=32, description="细度")
    bead_count: Optional[int] = Field(None, ge=0, description="珠子数量")


class JadeQualityCreate(JadeQualityBase):
    pass


class JadeQualityOut(JadeQualityBase):
    id: int
    jade_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class JadeBasicBase(BaseModel):
    category: JadeCategory
    weight: Decimal = Field(..., gt=0, description="克重(g)")
    purchase_price: Decimal = Field(..., ge=0, description="买入价(元)")
    note: Optional[str] = Field(None, max_length=255)


class JadeBasicCreate(JadeBasicBase):
    quality: JadeQualityCreate


class JadeBasicUpdate(BaseModel):
    category: Optional[JadeCategory] = None
    weight: Optional[Decimal] = Field(None, gt=0)
    purchase_price: Optional[Decimal] = Field(None, ge=0)
    note: Optional[str] = Field(None, max_length=255)
    quality: Optional[JadeQualityCreate] = None


class JadeBasicOut(JadeBasicBase):
    id: int
    created_at: datetime
    updated_at: datetime
    quality: Optional[JadeQualityOut] = None

    model_config = ConfigDict(from_attributes=True)

    @field_validator("weight", "purchase_price", mode="before")
    @classmethod
    def to_decimal(cls, v):
        return Decimal(str(v)) if v is not None else v
