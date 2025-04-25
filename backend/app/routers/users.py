from fastapi import APIRouter, Depends
from app.services import users
from app.dependencies import get_token_header
from app.schemas.user import UserSchema

router = APIRouter(
    prefix="/users",
    tags=["users"],
    dependencies=[Depends(get_token_header)],
    responses={404: {"description": "Not found"}},
)

router_public = APIRouter(
    prefix="/users",
    tags=["users"],
    dependencies=[],
    responses={404: {"description": "Not found"}},
)


@router.get("")
def index_user():
    return users.index()


@router_public.get("/public")
def index_user_public():
    return users.index_public()


@router.post("")
def store_user(user: UserSchema):
    return users.store(user)


@router.put("")
def update_user(user: UserSchema):
    return users.update_user(user)


@router.get("/search")
def search_user(keyword: str | None = None):
    if keyword:
        return users.search_user(keyword)
    return True


@router.get("/roles/{user_id}")
def user_roles(user_id: int):
    return users.user_roles(user_id)


@router.delete("/{user_id}")
def delete_user(user_id: int):
    return users.delete_user(user_id)
