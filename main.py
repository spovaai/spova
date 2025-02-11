from flask import Flask, render_template
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)

@app.route('/')
def index():
    api_key = 'AIzaSyC2WIamM5a3OdUUcdLp2ATmUZEmMqBhS5c'
    return render_template('index.html', api_key=api_key)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)