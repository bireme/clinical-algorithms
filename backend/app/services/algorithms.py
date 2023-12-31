from app.services import nodes
from app.schemas.algorithm import AlgorithmSchema
from .data_handler import to_iso_date
from app.services import graphs
from app.services.pymsql import insert, update, select, delete, db_error
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
        nodes_found = nodes.search(keyword)

        algorithms_found = search(keyword, True)

        results = {}

        for algorithm_found in algorithms_found:
            results[algorithm_found['id']] = {
                "id": algorithm_found['id'],
                "title": algorithm_found['title'],
                "description": algorithm_found['description'],
                "nodes": []
            }

        for node_found in nodes_found:
            if node_found['algorithm_id'] not in results:
                results[node_found['algorithm_id']] = {
                    "id": "",
                    "title": "",
                    "description": "",
                    "nodes": []
                }

        for node_found in nodes_found:
            results[node_found['algorithm_id']]['nodes'].append(node_found)

            if not results[node_found['algorithm_id']]['title']:
                algorithm_found = select(
                    "SELECT * FROM algorithms WHERE id = %s",
                    node_found['algorithm_id'],
                )[0]

                results[node_found['algorithm_id']]['id'] = algorithm_found['id']
                results[node_found['algorithm_id']]['title'] = algorithm_found['title']
                results[node_found['algorithm_id']]['description'] = algorithm_found['description']

        return results
    except Error as e:
        db_error(e)


def show(algorithm_id: int):
    try:
        return select("SELECT * FROM algorithms WHERE id = %s", algorithm_id)[0]
    except Error as e:
        db_error(e)


def store(algorithm: AlgorithmSchema):
    try:
        algorithm_id = insert(
            "algorithms",
            ["title", "description", "version", "updated_at"],
            [algorithm.title, algorithm.description, algorithm.version, to_iso_date(algorithm.updated_at)],
        )

        graphs.store(algorithm_id)

        return {"algorithm_id": algorithm_id}
    except Error as e:
        db_error(e)


def update_algorithm(algorithm: AlgorithmSchema):
    try:
        fields = ["title", "description", "version", "updated_at"]
        values = [algorithm.title, algorithm.description, algorithm.version, to_iso_date(algorithm.updated_at)]
        
        updated_algorithm_id = update("algorithms", fields, values, "id", algorithm.id)

        return {"id": updated_algorithm_id}
    except Error as e:
        db_error(e)


def delete_algorithm(algorithm_id: int):
    try:
        # delete nodes
        nodes.delete_algorithm_nodes(algorithm_id)

        # delete graph
        graphs.delete_algorithm_graphs(algorithm_id)

        # then delete graph itself
        delete('algorithms', 'id', algorithm_id)
    except Error as e:
        db_error(e)
