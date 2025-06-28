from sqlalchemy import Column, Integer, String, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Assistant(Base):
    __tablename__ = "assistants"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(String)
    teaching_style = Column(String)
    tone = Column(String)
    configuration = Column(JSON)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    user = relationship("User", back_populates="assistants")