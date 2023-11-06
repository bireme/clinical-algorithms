from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import dotenv_values

config = dotenv_values(".env")

SQLALCHEMY_DATABASE_URL = "mysql+mysqldb://"+config.DB_USER+":"+config.DB_PASS+"@"+config.DB_HOST+":"+config.DB_PORT+"/"+config.DB_NAME

print(config)

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
