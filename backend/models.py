import enum
from datetime import datetime

from sqlalchemy import Column, Integer, Numeric, String, DateTime, ForeignKey, Enum, CheckConstraint
from sqlalchemy.orm import relationship

from database import Base


class JadeCategory(str, enum.Enum):
    qiemilan = "切米蓝"
    mobi = "墨碧"


class JadeForm(str, enum.Enum):
    bracelet = "手串"
    material = "料子"


class JadeBasic(Base):
    __tablename__ = "jade_basic"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(
        Enum(JadeCategory, name="jade_category", values_callable=lambda e: [m.value for m in e]),
        nullable=False,
        comment="品类",
    )
    form = Column(
        Enum(JadeForm, name="jade_form", values_callable=lambda e: [m.value for m in e]),
        nullable=False,
        comment="形态",
    )
    weight = Column(Numeric(10, 2), nullable=False, comment="克重(g)")
    purchase_price = Column(Numeric(12, 2), nullable=False, comment="买入价(元)")
    note = Column(String(255), nullable=True, comment="备注")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    quality = relationship("JadeQuality", uselist=False, back_populates="jade", cascade="all, delete-orphan")


class JadeQuality(Base):
    __tablename__ = "jade_quality"

    id = Column(Integer, primary_key=True, index=True)
    jade_id = Column(Integer, ForeignKey("jade_basic.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    transparency = Column(Integer, nullable=False, comment="透光度(0-10分)")
    fineness = Column(String(32), nullable=False, comment="细度")
    bead_count = Column(Integer, nullable=True, comment="珠子数量")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    jade = relationship("JadeBasic", back_populates="quality")

    __table_args__ = (
        CheckConstraint("transparency >= 0 AND transparency <= 10", name="ck_transparency_range"),
    )
