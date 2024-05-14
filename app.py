from flask import Flask, jsonify, render_template
import requests

app = Flask(__name__)

API_URL = "https://api.anilibria.tv/v2/getRandomTitle"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/random-title')
def random_title():
    params = {
        'filter': 'names,description,posters.original.url,season.year,genres,player.series.string',
        'description_type': 'plain'
    }
    response = requests.get(API_URL, params=params)
    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({"error": "Failed to fetch data"}), response.status_code

if __name__ == '__main__':
    app.run(debug=False)
