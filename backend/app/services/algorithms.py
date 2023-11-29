from app.models.algorithm import algorithm_model
from app.services.nodes import search_nodes
from app.schemas.algorithm import AlgorithmSchema
from app.db import conn
from .data_handler import to_iso_date
from sqlalchemy import insert, update, exc
from app.services import graphs
from app.pymsql import select, db_error
from pymysql import Error

algorithm_fields = ['id', 'title', 'description', 'version', 'updated_at']


def index():
    try:
        return select("SELECT * FROM algorithms")
    except Error as e:
        db_error(e)


def search(keyword: str, thorough=False):
    try:
        if thorough:
            return select("SELECT * FROM algorithms WHERE title REGEXP %s", "[[:<:]]"+keyword+"[[:>:]]")
        else:
            return select("SELECT * FROM algorithms WHERE title LIKE %s", "%"+keyword+"%")
    except Error as e:
        db_error(e)


def thorough_search(keyword: str):
    try:
        nodes_found = search_nodes(keyword)

        algorithms_found = search(keyword, True)

        results = {}

        for algorithm_found in algorithms_found:
            results[algorithm_found['id']] = {
                "title": algorithm_found['title'],
                "description": algorithm_found['description'],
                "nodes": []
            }

        for node_found in nodes_found:
            if node_found['algorithm_id'] not in results:
                results[node_found['algorithm_id']] = {
                    "title": "",
                    "description": "",
                    "nodes": []
                }

        for node_found in nodes_found:
            results[node_found['algorithm_id']]['nodes'].append(node_found)

            if not results[node_found['algorithm_id']]['title']:
                algorithm_found = select("SELECT * FROM algorithms WHERE id = %s", node_found['algorithm_id'])[0]

                results[node_found['algorithm_id']]['title'] = algorithm_found['title']
                results[node_found['algorithm_id']]['description'] = algorithm_found['description']

        return results
    except Error as e:
        db_error(e)


def show(algorithm_id: int):
    try:
        return select("SELECT * FROM algorithms WHERE id = %s", algorithm_id)
    except Error as e:
        db_error(e)


def store(algorithm: AlgorithmSchema):
    try:
        stored_algorithm = conn.execute(
            insert(algorithm_model).values(
                title=algorithm.title,
                description=algorithm.description,
                version=algorithm.version,
                updated_at=to_iso_date(algorithm.updated_at)
            )
        )

        conn.commit()

        graphs.store(algorithm_id=stored_algorithm.lastrowid)

        return stored_algorithm
    except exc.SQLAlchemyError:
        conn.rollback()
        raise


def update_algorithm(algorithm: AlgorithmSchema):
    try:
        updated_algorithm = conn.execute(
            update(algorithm_model)
            .where(algorithm_model.c.id == algorithm.id)
            .values(
                title=algorithm.title,
                description=algorithm.description,
                version=algorithm.version,
                updated_at=to_iso_date(algorithm.updated_at)
            )
        )

        conn.commit()

        return updated_algorithm
    except exc.SQLAlchemyError:
        conn.rollback()
        raise


def delete(algorithm_id: int):
    try:
        # delete the graph before...
        graphs.delete(algorithm_id)

        deleted_algorithm = conn.execute(
            algorithm_model.delete().where(algorithm_model.c.id == algorithm_id)
        )

        conn.commit()

        return deleted_algorithm
    except exc.SQLAlchemyError:
        conn.rollback()
        raise
