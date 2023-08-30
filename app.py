from flask import Flask, render_template
import asyncio
from websockets.server import serve

app = Flask(__name__,
    static_url_path='',
    static_folder="static")

@app.route('/')
def home():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)