from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, computed_field, field_validator, model_validator
from typing_extensions import Self

from grading import compute_grade, compute_score
from models import JadeCategory, JadeForm


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

    @computed_field
    @property
    def score(self) -> int:
        return compute_score(self.transparency, self.fineness)

    @computed_field
    @property
    def grade(self) -> str:
        return compute_grade(self.transparency, self.fineness)


class JadeBasicBase(BaseModel):
    category: JadeCategory
    form: JadeForm
    weight: Decimal = Field(..., gt=0, description="克重(g)")
    purchase_price: Decimal = Field(..., ge=0, description="买入价(元)")
    note: Optional[str] = Field(None, max_length=255)


class JadeBasicCreate(JadeBasicBase):
    quality: JadeQualityCreate

    @model_validator(mode="after")
    def check_bead_count(self) -> Self:
        if self.form == JadeForm.bracelet and (self.quality is None or self.quality.bead_count is None):
            raise ValueError("手串必须填写珠子数量")
        if self.form == JadeForm.material and self.quality and self.quality.bead_count is not None:
            raise ValueError("料子不需要填写珠子数量")
        return self


class JadeBasicUpdate(BaseModel):
    category: Optional[JadeCategory] = None
    form: Optional[JadeForm] = None
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
