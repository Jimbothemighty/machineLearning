# some_file.py
import sys
# caution: path[0] is reserved for script path (or '' in REPL)
sys.path.insert(1, 'api')

from flask import Flask
from tensorflow_grid import api_run 

app = Flask(__name__)

@app.route('/tensorflow_simple', methods=['GET'])
def index():
    model_path = 'models/tensorflow_simple/'
    return api_run(model_path, 5, [])

@app.route('/tensorflow_simple_obstacles', methods=['GET'])
def index2():
    model_path = 'models/tensorflow_simple_obstacles/'

    obstacles = [
        {"row": 3, "col": 0},
        {"row": 4, "col": 0},
        {"row": 5, "col": 0},
        {"row": 6, "col": 0},
        {"row": 5, "col": 2},
        {"row": 5, "col": 3},
        {"row": 5, "col": 4},
        {"row": 5, "col": 5},
        {"row": 5, "col": 7},
        {"row": 2, "col": 3},
        {"row": 3, "col": 2},
    ]

    return api_run(model_path, 5, obstacles)

@app.route('/tensorflow_medium_obstacles', methods=['GET'])
def index3():
    model_path = 'models/tensorflow_medium_obstacles/'

    obstacles = [
        {"row": 2, "col": 0},
        {"row": 3, "col": 0},
        {"row": 4, "col": 0},
        {"row": 5, "col": 0},
        {"row": 6, "col": 0},
        {"row": 5, "col": 4},
        {"row": 5, "col": 5},
        {"row": 5, "col": 6},
        {"row": 5, "col": 7},
        {"row": 0, "col": 4},
        {"row": 0, "col": 6},
        {"row": 1, "col": 6},
    ]

    return api_run(model_path, 8, obstacles)

if __name__ == "__main__":
    app.run(port=5000, debug=True)