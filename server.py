#! /usr/bin/python

import os
import BaseHTTPServer
import SimpleHTTPServer

PORT = 8000
ROOT = os.path.dirname(os.path.abspath(__file__))

types = {
    '.manifest': 'text/cache-manifest',
    '.webm': 'video/webm'
}

SimpleHTTPServer.SimpleHTTPRequestHandler.extensions_map.update(types)

path = lambda *x: os.path.join(ROOT, *x)

def run(server_class=BaseHTTPServer.HTTPServer,
        handler_class=SimpleHTTPServer.SimpleHTTPRequestHandler,
        port=PORT):
    server_address = ('', port)
    print "Serving files in '%s' on port %d." % (os.getcwd(), port)
    httpd = server_class(server_address, handler_class)
    httpd.serve_forever()

if __name__ == '__main__':
    os.chdir(path('static-files'))
    run()
