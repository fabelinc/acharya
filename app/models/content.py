from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Content(Base):
    __tablename__ = "content"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    content_type = Column(String)  # question, topic, explanation
    body = Column(Text)
    assistant_id = Column(Integer, ForeignKey("assistants.id"))
    
    assistant = relationship("Assistant", back_populates="content_items")