# To open this file in VIM, just enter :e ocp://pi@192.168.0.21/RetroPie/Dev/hello.py

from flask import Flask
from flask_cors import CORS, cross_origin

app = Flask(__name__)
CORS(app)

@app.route("/")
def root():
    return "hello world"

@app.route("/test")
def test():
    return "Cross Domain AJAX working :)"

if __name__ == "__main__":
    app.run("0.0.0.0")
