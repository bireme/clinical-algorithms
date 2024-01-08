from pydantic import BaseModel

class UserSchema(BaseModel):
    id: int
    name: str
    email: str
    password: str | None = None
    phone: str
    maintainer: bool
    master: bool
    updated_at: str | None = None
