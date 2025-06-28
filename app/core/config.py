from pydantic_settings import BaseSettings
from openai import OpenAI
import os

class Settings(BaseSettings):
    app_name: str = "Expl-AI-nly"
    database_url: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    OPENAI_API_KEY: str
    
    @property
    def openai_client(self):
        return OpenAI(api_key=self.OPENAI_API_KEY)
    
    class Config:
        env_file = ".env"

settings = Settings()