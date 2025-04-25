from fastapi import FastAPI
from .routers import account, algorithms, users
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.include_router(account.router)
app.include_router(algorithms.public_router)
app.include_router(algorithms.router)
app.include_router(users.router_public)
app.include_router(users.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"Hello": "World"}
