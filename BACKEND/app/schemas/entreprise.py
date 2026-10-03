from pydantic import BaseModel, EmailStr
from typing import Optional


class EntrepriseResponse(BaseModel):
    id_entreprise: int
    nom: str
    adresse: Optional[str] = None
    telephone: Optional[str] = None
    email: Optional[EmailStr] = None
    site_web: Optional[str] = None
    logo: Optional[str] = None

    class Config:
        from_attributes = True


class EntrepriseUpdate(BaseModel):
    nom: str
    adresse: Optional[str] = None
    telephone: Optional[str] = None
    email: Optional[EmailStr] = None
    site_web: Optional[str] = None