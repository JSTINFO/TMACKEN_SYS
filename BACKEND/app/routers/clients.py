from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.client import Client
from app.schemas.client import ClientResponse
from fastapi import APIRouter, Depends, HTTPException
from app.schemas.client import ClientCreate, ClientUpdate, ClientResponse
from app.core.security import get_current_user
from app.core.security import require_role
from app.models.utilisateur import Utilisateur


router = APIRouter(
    prefix="/clients",
    tags=["Clients"]
)


@router.get("/", response_model=list[ClientResponse])
def get_clients(
    db: Session = Depends(get_db),
    current_user=Depends(require_role("ADMIN"))
):
    clients = db.query(Client).all()
    return clients

@router.get("/{id_client}", response_model=ClientResponse)
def get_client(
    id_client: int,
    db: Session = Depends(get_db)
):
    client = db.query(Client).filter(
        Client.id_client == id_client
    ).first()

    if client is None:
        raise HTTPException(
            status_code=404,
            detail="Client introuvable"
        )

    return client

@router.post("/", response_model=ClientResponse, status_code=201)
def create_client(
    client_data: ClientCreate,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    client = Client(
        nom=client_data.nom,
        prenom=client_data.prenom,
        telephone=client_data.telephone,
        email=client_data.email,
        adresse=client_data.adresse,
        id_utilisateur=current_user.id_utilisateur
    )

    db.add(client)
    db.commit()
    db.refresh(client)

    return client



@router.put("/{id_client}", response_model=ClientResponse)
def update_client(
    id_client: int,
    client_data: ClientUpdate,
    db: Session = Depends(get_db)
):
    client = db.query(Client).filter(
        Client.id_client == id_client
    ).first()

    if client is None:
        raise HTTPException(
            status_code=404,
            detail="Client introuvable"
        )

    data = client_data.model_dump(exclude_unset=True)

    for field, value in data.items():
        setattr(client, field, value)

    db.commit()
    db.refresh(client)

    return client



@router.delete("/{id_client}", status_code=204)
def delete_client(
    id_client: int,
    db: Session = Depends(get_db)
):
    client = db.query(Client).filter(
        Client.id_client == id_client
    ).first()

    if client is None:
        raise HTTPException(
            status_code=404,
            detail="Client introuvable"
        )

    db.delete(client)
    db.commit()