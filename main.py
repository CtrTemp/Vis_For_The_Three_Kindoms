import flask
#import http.server
from flask_cors import CORS
from flask import Flask


app = Flask(__name__)
app.config['TEMPLATES_AUTO_RELOAD'] = True
CORS(app)

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

 
@app.route("/hhh")
def any_world():
    return "<p>any, World!</p>"


@app.route("/chord")
def get_chord():
    return flask.send_from_directory('static', 'html/chord.html')

@app.route("/data")
def get_data():
    return flask.send_from_directory('static', 'html/data_test.html')


app.run(host='0.0.0.0', port=3333, debug=True)
