import json
from datetime import datetime
from app.pymsql import insert, select, delete, db_error
from pymysql import Error

node_fields = ['id', 'algorithm_id', 'node_id', 'node_type', 'label']


def map_nodes(graph_string: str, algorithm_id: str):
    try:
        delete("nodes", "algorithm_id", algorithm_id)

        fields = ["algorithm_id", "node_id", "node_type", "label", "updated_at"]

        graph = json.loads(graph_string)['cells']

        for node in graph:
            data = [algorithm_id, node['id'], node['type'], "", datetime.now()]

            if "props" in node:
                if "label" in node['props']:
                    data[3] = node['props']['label']

            insert("nodes", fields, data)

        return True
    except Error as e:
        db_error(e)


def search(keyword: str):
    try:
        return select(
            "SELECT * FROM nodes WHERE label REGEXP %s",
            "[[:<:]]"+keyword+"[[:>:]]"
        )
    except Error as e:
        db_error(e)


def delete_algorithm_nodes(algorithm_id: int):
    try:
        return delete("nodes", "algorithm_id", algorithm_id)
    except Error as e:
        db_error(e)
