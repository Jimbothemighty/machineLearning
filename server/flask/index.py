# some_file.py
import sys
# caution: path[0] is reserved for script path (or '' in REPL)
sys.path.insert(1, 'api')

from flask import Flask
from tensorflow_simple import api_run 

app = Flask(__name__)

@app.route('/flask', methods=['GET'])
def index():
    return api_run()

if __name__ == "__main__":
    app.run(port=5000, debug=True)