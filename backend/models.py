from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, SmallInteger
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    email = Column(String, primary_key=True, index=True)
    votes_given_count = Column(Integer, default=0)
    can_upload = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    photos = relationship("Photo", back_populates="user", cascade="all, delete-orphan")
    votes = relationship("Vote", back_populates="voter", cascade="all, delete-orphan")


class Photo(Base):
    __tablename__ = "photos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_email = Column(String, ForeignKey("users.email", ondelete="CASCADE"))
    url = Column(String, nullable=False)
    super_gay_votes = Column(Integer, default=0)
    no_gay_votes = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="photos")
    votes = relationship("Vote", back_populates="photo", cascade="all, delete-orphan")
    deletion_requests = relationship("DeletionRequest", back_populates="photo", cascade="all, delete-orphan")


class Vote(Base):
    __tablename__ = "votes"

    id = Column(Integer, primary_key=True, index=True)
    voter_email = Column(String, ForeignKey("users.email", ondelete="CASCADE"))
    photo_id = Column(UUID(as_uuid=True), ForeignKey("photos.id", ondelete="CASCADE"))
    vote_value = Column(SmallInteger) # 0: No Gay, 1: Super Gay

    voter = relationship("User", back_populates="votes")
    photo = relationship("Photo", back_populates="votes")


class DeletionRequest(Base):
    __tablename__ = "deletion_requests"

    id = Column(Integer, primary_key=True, index=True)
    photo_id = Column(UUID(as_uuid=True), ForeignKey("photos.id", ondelete="CASCADE"))
    reported_by_email = Column(String, ForeignKey("users.email", ondelete="SET NULL"), nullable=True)
    status = Column(String(50), default="pending") # pending, approved, rejected
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    photo = relationship("Photo", back_populates="deletion_requests")
    reported_by = relationship("User")
