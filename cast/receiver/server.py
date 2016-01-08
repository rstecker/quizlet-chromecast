from flask import Flask
from flask import Response
from flask import stream_with_context

import requests

app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello World!"

@app.route('/proxy/<path:url>')
def home(url):
    print "Trying to hit/proxy : " + url
    url += '?client_id=BcpDSe7sYr'
    req = requests.get(url, stream = True)
    return Response(stream_with_context(req.iter_content()), content_type = req.headers['content-type'])


if __name__ == "__main__":
  app.debug = True
  app.run(host='0.0.0.0')
