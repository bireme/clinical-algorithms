from app.services.pymsql import insert, update, select, delete, db_error
from app.schemas.user import UserSchema
from .data_handler import to_iso_date
from datetime import datetime
from pymysql import Error


def index():
    try:
        return select("SELECT * FROM users")
    except Error as e:
        db_error(e)


def store(user_data: UserSchema):
    try:
        user_id = insert(
            "users",
            ["name", "email", "password", "phone", "maintainer", "master", "updated_at"],
            [
                user_data.name,
                user_data.email,
                user_data.password,
                user_data.phone,
                user_data.maintainer,
                user_data.master,
                datetime.today().strftime('%Y-%m-%d'),
            ],
        )

        return {"user_id": user_id}
    except Error as e:
        db_error(e)


def update_user(user: UserSchema):
    try:
        fields = ["name", "email", "phone", "maintainer", "master", "updated_at"]
        values = [
            user.name,
            user.email,
            user.phone,
            user.maintainer,
            user.master,
            datetime.today().strftime('%Y-%m-%d'),
        ]

        updated_user_id = update("users", fields, values, "id", user.id)

        if user.password:
            updated_user_id = update("users", ["password"], [user.password], "id", user.id)

        return {"id": updated_user_id}
    except Error as e:
        db_error(e)


def search_user(keyword: str):
    try:
        like = "%"+keyword+"%"

        return select("SELECT * FROM users WHERE name LIKE %s OR email LIKE %s", [like, like])
    except Error as e:
        db_error(e)


def delete_user(user_id: int):
    try:
        delete("users", 'id', user_id)
    except Error as e:
        db_error(e)
