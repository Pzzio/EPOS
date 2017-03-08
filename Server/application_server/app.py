import cgi
import http.server
import logging
import mimetypes
import os
import re
from datetime import datetime

from datastore import Datastore  # will work even if PyCharm cries

VERSION = 1.0

class BusinessData():
  def __init__(self, datastore):
    self.datastore = datastore

  def get_articles(self):
    articles = self.datastore.get_articles()
    return articles.serialize()

  def get_ingredients(self, id):
    ingredients = self.datastore.get_ingredients(id)
    return ingredients.serialize()

  def get_all_ingredients(self):
    all_ingredients = self.datastore.get_all_ingredients()
    return all_ingredients.serialize()

  def get_article(self, id):
    article = self.datastore.get_article(id)
    return article.serialize()

  def get_all_taxes(self):
    taxes = self.datastore.get_all_taxes()
    return taxes.serialize()

  def get_all_articles(self):
    articles = self.datastore.get_all_articles()
    return articles.serialize()

  def get_all_order_methods(self):
    order_methods = self.datastore.get_all_order_methods()
    return order_methods.serialize()

  def get_all_payment_methods(self):
    payment_methods = self.datastore.get_all_payment_methods()
    return payment_methods.serialize()


datastore = Datastore()
business_data = BusinessData(datastore)


def make_request_handler_class():
  '''
  Factory to make the request handler and add arguments to it.

  It exists to allow the handler to access the opts.path variable
  locally.
  '''

  class MyRequestHandler(http.server.BaseHTTPRequestHandler):
    '''
    Factory generated request handler class that contain
    additional class variables.
    '''

    APPLICATION_MIME = "application/com.rosettis.pizzaservice"

    def do_HEAD(self):
      '''
      Handle a HEAD request.
      '''
      logging.debug('HEADER %s' % (self.path))
      self.send_response(http.HTTPStatus.OK)
      self.send_header('Content-type', self.APPLICATION_MIME)
      self.end_headers()

    def check_content_type(self, type):
      if not type or not type.startswith(self.APPLICATION_MIME):
        # self.send_error(http.HTTPStatus.UNSUPPORTED_MEDIA_TYPE, 'Unsupported content-type: ')
        return False
      return True

    def do_GET(self):
      # logging.debug('Init Time: %s' % str(int(1360287003083988472 % 1000000000)).zfill(9))
      starttime = datetime.now()
      '''
      Handle a GET request.
      '''
      logging.debug('GET %s' % (self.path))

      content_type = self.headers['content-type']

      # Parse out the arguments.
      # The arguments follow a '?' in the URL. Here is an example:
      #   http://example.com?arg1=val1
      args = {}
      idx = self.path.find('?')
      if idx >= 0:
        rpath = self.path[:idx]
        args = cgi.parse_qs(self.path[idx + 1:])
      else:
        rpath = self.path

      # Print out logging information about the path and args.
      if 'content-type' in self.headers:
        ctype, _ = cgi.parse_header(self.headers['content-type'])
        logging.debug('TYPE %s' % (ctype))

      logging.debug('PATH %s' % (rpath))
      logging.debug('ARGS %d' % (len(args)))
      if len(args):
        i = 0
        for key in sorted(args):
          logging.debug('ARG[%d] %s=%s' % (i, key, args[key]))
          i += 1

      # Check to see whether the file is stored locally,
      # if it is, display it.
      # There is special handling for http://127.0.0.1/info. That URL
      # displays some internal information.

      paths = list(filter(None, self.path.split("/")))
      if self.check_content_type(content_type):
        if len(paths) == 1 and paths[0] == "articles":
          self.send_response(200)  # OK
          self.send_header('Content-type', self.APPLICATION_MIME)
          self.end_headers()
          articles = business_data.get_articles()
          self.wfile.write(bytes(articles, "utf-8"))
          print((datetime.now() - starttime).microseconds)

        elif len(paths) == 1 and paths[0] == "ingredients":
          self.send_response(200)  # OK
          self.send_header('Content-type', self.APPLICATION_MIME)
          self.end_headers()
          articles = business_data.get_all_ingredients()
          self.wfile.write(bytes(articles, "utf-8"))
          print((datetime.now() - starttime).microseconds)

        elif len(paths) == 1 and paths[0] == "allArticles":
          self.send_response(200)  # OK
          self.send_header('Content-type', self.APPLICATION_MIME)
          self.end_headers()
          articles = business_data.get_all_articles()
          self.wfile.write(bytes(articles, "utf-8"))
          print((datetime.now() - starttime).microseconds)

        elif len(paths) == 1 and paths[0] == "taxes":
          self.send_response(200)  # OK
          self.send_header('Content-type', self.APPLICATION_MIME)
          self.end_headers()
          articles = business_data.get_all_taxes()
          self.wfile.write(bytes(articles, "utf-8"))
          print((datetime.now() - starttime).microseconds)

        elif len(paths) == 1 and paths[0] == "ordermethods":
          self.send_response(200)  # OK
          self.send_header('Content-type', self.APPLICATION_MIME)
          self.end_headers()
          articles = business_data.get_all_order_methods()
          self.wfile.write(bytes(articles, "utf-8"))
          print((datetime.now() - starttime).microseconds)
        elif len(paths) == 1 and paths[0] == "paymentmethods":
          self.send_response(200)  # OK
          self.send_header('Content-type', self.APPLICATION_MIME)
          self.end_headers()
          articles = business_data.get_all_payment_methods()
          self.wfile.write(bytes(articles, "utf-8"))
          print((datetime.now() - starttime).microseconds)
        elif (len(paths) >= 1) and (paths[0] == "article"):
          article_id = paths[1]
          if len(paths) == 3 and re.compile("^[0-9]+$").match(paths[1]) and paths[2] is "ingredients":
            ingredients = business_data.get_ingredients(article_id)
            self.wfile.write(bytes(ingredients, "utf-8"))
            print((datetime.now() - starttime).microseconds)

          else:
            self.send_response(200)  # OK
            self.send_header('Content-type', self.APPLICATION_MIME)
            self.end_headers()
            article = business_data.get_article(article_id)
            self.wfile.write(bytes(article, "utf-8"))
            print((datetime.now() - starttime).microseconds)

      else:
        # Get the file path.
        # dem = paths.
        path = "../Client/static" + rpath

        logging.debug('FILE %s' % (path))

        # If it is a directory look for index.html
        # or process it directly if there are 3
        # trailing slashed.
        if rpath[-3:] == '///':
          dirpath = path
        elif os.path.exists(path) and os.path.isdir(path):
          dirpath = path  # the directory portion
          index_files = ['index.html', 'index.htm', ]
          for index_file in index_files:
            tmppath = path + index_file
            if os.path.exists(tmppath):
              path = tmppath
              break

        # Allow the user to type "///" at the end to see the
        # directory listing.
        if os.path.exists(path) and os.path.isfile(path):
          # This is valid file, send it as the response
          # after determining whether it is a type that
          # the server recognizes.
          _, ext = os.path.splitext(path)
          ext = ext.lower()

          content_type = mimetypes.types_map[ext]
          # content_type = mimes.mimes[ext]
          if not content_type:
            # Unknown file type or a directory.
            # Treat it as plain text.
            self.send_response(200)  # OK
            self.send_header('Content-type', 'text/plain')
            # self.send_header('Content-Encoding', 'gzip')
            self.end_headers()

            # f = open(path, 'rb')
            # shutil.copyfile(f, self.wfile)
            # f.close()

            with open(path, 'rb') as ifp:
              # self.wfile.write(gzip.compress(ifp.read()))
              # shutil.copyfile(ifp.read(), self.wfile)
              self.wfile.write(ifp.read())
            print((datetime.now() - starttime).microseconds)
            return

          self.send_response(200)  # OK
          self.send_header('Content-type', content_type)
          # self.send_header('Content-Encoding', 'gzip')

          self.end_headers()
          # f = open(path, 'rb')
          # shutil.copyfile(f, self.wfile)
          # f.close()

          with open(path, 'rb') as ifp:
            # self.wfile.write(gzip.compress(ifp.read()))
            self.wfile.write(ifp.read())
            # shutil.copyfile(ifp.read(), self.wfile)
          print((datetime.now() - starttime).microseconds)
        else:
          self.send_error(http.HTTPStatus.NOT_FOUND, 'Could not find ' + rpath)  # Send 404 Error

    def do_POST(self):
      '''
      Handle POST requests.
      '''
      logging.debug('POST %s' % (self.path))

      # CITATION: http://stackoverflow.com/questions/4233218/python-basehttprequesthandler-post-variables
      ctype, pdict = cgi.parse_header(self.headers['content-type'])
      if ctype == 'multipart/form-data':
        postvars = cgi.parse_multipart(self.rfile, pdict)
      elif ctype == 'application/x-www-form-urlencoded':
        length = int(self.headers['content-length'])
        postvars = cgi.parse_qs(self.rfile.read(length), keep_blank_values=1)
      else:
        postvars = {}

      # Get the "Back" link.
      back = self.path if self.path.find('?') < 0 else self.path[:self.path.find('?')]

      # ...

  return MyRequestHandler

def httpd():
  '''
  HTTP server
  '''
  try:
    port = int(os.environ['PORT'])
  except KeyError:
    port = 8081

  RequestHandlerClass = make_request_handler_class()
  server = http.server.HTTPServer(("", port), RequestHandlerClass)
  logging.info('Server starting %s:%s (level=%s)' % ("", port, ""))
  try:
    server.serve_forever()
  except KeyboardInterrupt:
    pass
  server.server_close()
  logging.info('Server stopping %s:%s' % ("", port))


def main():
  ''' main entry '''
  httpd()


if __name__ == '__main__':
  main()  # this allows library functionality
