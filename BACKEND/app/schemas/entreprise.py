from typing import Optional

from pydantic import BaseModel, EmailStr


class EntrepriseResponse(BaseModel):
    id_entreprise: int
    nom: str
    adresse: Optional[str] = None
    telephone: Optional[str] = None
    email: Optional[EmailStr] = None
    site_web: Optional[str] = None
    has_logo: bool = False

    class Config:
        from_attributes = True


class EntrepriseUpdate(BaseModel):
    nom: str
    adresse: Optional[str] = None
    telephone: Optional[str] = None
    email: Optional[EmailStr] = None
    site_web: Optional[str] = None