from app import app
from waitress import serve


if __name__ == '__main__':
    app.run(port=3300, debug=True, host='0.0.0.0')
    serve(app, url_scheme='http')
