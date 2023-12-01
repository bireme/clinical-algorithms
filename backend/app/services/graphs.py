from datetime import datetime
from app.db import conn
from app.models.algorithm import graph_model
from sqlalchemy import update, exc
from app.schemas.algorithm import AlgorithmGraphSchema
from app.services import nodes
from app.pymsql import insert, select, delete, db_error
from pymysql import Error


# TODO: USE PYMYSQL METHODS
def update_graph(algorithm_graph: AlgorithmGraphSchema):
    try:
        conn.execute(
            update(graph_model)
            .where(graph_model.c.id == algorithm_graph.id)
            .values(
                graph=algorithm_graph.graph,
                updated_at=datetime.now()
            )
        )

        conn.commit()

        nodes.map_nodes(algorithm_graph.graph, algorithm_graph.algorithm_id)

        return show(algorithm_graph.algorithm_id)
    # except exc.SQLAlchemyError as e:
    #     return e.__dict__['orig']
    except exc.SQLAlchemyError:
        conn.rollback()
        raise


def show(algorithm_id: int):
    try:
        graphs = select("SELECT * FROM graphs WHERE algorithm_id = %s", algorithm_id)

        if len(graphs):
            return graphs[0]

        return {}
    except Error as e:
        db_error(e)


def store(algorithm_id: int):
    try:
        graph_id = insert(
            "graphs",
            ["algorithm_id", "graph", "updated_at"],
            [algorithm_id, None, datetime.now()],
        )

        return graph_id
    except Error as e:
        db_error(e)


def delete_algorithm_graphs(algorithm_id: int):
    try:
        return delete("graphs", "algorithm_id", algorithm_id)
    except Error as e:
        db_error(e)
