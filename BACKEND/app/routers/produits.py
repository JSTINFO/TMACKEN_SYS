from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.produit import Produit
from app.models.stock import Stock
from app.schemas.produit import ProduitCreate, ProduitUpdate, ProduitResponse
from app.core.security import require_role


router = APIRouter(
    prefix="/produits",
    tags=["Produits"]
)


@router.get("/", response_model=list[ProduitResponse])
def get_produits(
    db: Session = Depends(get_db)
):
    produits = db.query(Produit).all()

    return produits


@router.get("/{id_produit}", response_model=ProduitResponse)
def get_produit(
    id_produit: int,
    db: Session = Depends(get_db)
):
    produit = db.query(Produit).filter(
        Produit.id_produit == id_produit
    ).first()

    if produit is None:
        raise HTTPException(
            status_code=404,
            detail="Produit introuvable"
        )

    return produit


@router.post("/", response_model=ProduitResponse, status_code=201)
def create_produit(
    produit_data: ProduitCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role("ADMIN", "GESTIONNAIRE")
    )
):

    # Créer le produit
    produit = Produit(
        nom=produit_data.nom,
        description=produit_data.description,
        prix=produit_data.prix,
        seuil_alerte=produit_data.seuil_alerte,
        statut=produit_data.statut
    )

    db.add(produit)

    # Obtenir l'id du produit avant le commit
    db.flush()

    # Créer automatiquement son stock
    stock = Stock(
        id_produit=produit.id_produit,
        quantite=0
    )

    db.add(stock)

    db.commit()

    db.refresh(produit)

    return produit


@router.put("/{id_produit}", response_model=ProduitResponse)
def update_produit(
    id_produit: int,
    produit_data: ProduitUpdate,
    db: Session = Depends(get_db)
):
    produit = db.query(Produit).filter(
        Produit.id_produit == id_produit
    ).first()

    if produit is None:
        raise HTTPException(
            status_code=404,
            detail="Produit introuvable"
        )

    data = produit_data.model_dump(exclude_unset=True)

    for field, value in data.items():
        setattr(produit, field, value)

    db.commit()
    db.refresh(produit)

    return produit

@router.delete("/{id_produit}", status_code=204)
def delete_produit(
    id_produit: int,
    db: Session = Depends(get_db)
):
    produit = db.query(Produit).filter(
        Produit.id_produit == id_produit
    ).first()

    if produit is None:
        raise HTTPException(
            status_code=404,
            detail="Produit introuvable"
        )

    db.delete(produit)
    db.commit()