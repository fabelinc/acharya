from pydantic_settings import BaseSettings
from openai import OpenAI
import os

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    app_name: str = "Aacharya"
    DATABASE_URL: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    OPENAI_API_KEY: str
    react_app_backend_url: str 
    
    @property
    def openai_client(self):
        return OpenAI(api_key=self.OPENAI_API_KEY)
    
    class Config:
        env_file = ".env"

settings = Settings()