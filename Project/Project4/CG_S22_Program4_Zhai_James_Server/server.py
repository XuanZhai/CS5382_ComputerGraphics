from http.server import HTTPServer, SimpleHTTPRequestHandler
#from http.server import test
import sys

class CORSRequestHandler (SimpleHTTPRequestHandler):
    def end_headers (self):
        self.send_header('Access-Control-Allow-Origin', '*')
        SimpleHTTPRequestHandler.end_headers(self)

if __name__ == '__main__':
    #test(CORSRequestHandler, HTTPServer, port=int(sys.argv[1]) if len(sys.argv) > 1 else 3100)
    server = HTTPServer(('localhost', 3100), CORSRequestHandler)
    server.serve_forever()