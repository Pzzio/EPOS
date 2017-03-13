import cgi
import http.server
import logging
import mimetypes
import os
import time
from datetime import datetime
from http.server import HTTPServer
from socketserver import ThreadingMixIn

from datastore import JsonDto, Datastore  # will work even if PyCharm cries

virtual_routes = ["articles", "article", "cart"]

VERSION = 1.1


class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
  pass

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

  def get_articles_revision(self):
    articles_info = self.datastore.get_articles_info().articles_info['revision']
    return articles_info

  def get_ingredients_revision(self):
    ingredients_info = self.datastore.get_ingredients_info().ingredients_info['revision']
    return ingredients_info

  def get_order_methods_revision(self):
    order_methods_info = self.datastore.get_order_methods_info().order_methods_info['revision']
    return order_methods_info

  def get_payment_methods_revision(self):
    payment_methods_info = self.datastore.get_payment_methods_info().payment_methods_info['revision']
    return payment_methods_info

  def get_taxes_revision(self):
    taxes_info = self.datastore.get_taxes_info().taxes_info['revision']
    return taxes_info


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

          rev = str(business_data.get_articles_revision())
          req_etag = self.headers['If-None-Match']
          if req_etag and req_etag == rev:
            self.send_response(http.HTTPStatus.NOT_MODIFIED)
            self.send_header('ETag', rev)
            self.send_header('Cache-control', "public, max-age=60")
            self.end_headers()
            return

          articles = business_data.get_all_articles()
          self.send_response(200)  # OK
          self.send_header('ETag', rev)
          self.send_header('Content-type', self.APPLICATION_MIME)
          self.end_headers()
          self.wfile.write(bytes(articles, "utf-8"))
          print((datetime.now() - starttime).microseconds)

        elif len(paths) == 1 and paths[0] == "ingredients":
          rev = str(business_data.get_ingredients_revision())
          req_etag = self.headers['If-None-Match']
          if req_etag and req_etag == rev:
            self.send_response(http.HTTPStatus.NOT_MODIFIED)
            self.send_header('ETag', rev)
            self.send_header('Cache-control', "public, max-age=60")

            self.end_headers()
            return

          self.send_response(200)  # OK
          self.send_header('ETag', rev)
          self.send_header('Content-type', self.APPLICATION_MIME)
          self.end_headers()
          ingredients = business_data.get_all_ingredients()
          self.wfile.write(bytes(ingredients, "utf-8"))
          print((datetime.now() - starttime).microseconds)

        elif len(paths) == 1 and paths[0] == "taxes":
          rev = str(business_data.get_taxes_revision())
          req_etag = self.headers['If-None-Match']
          if req_etag and req_etag == rev:
            self.send_response(http.HTTPStatus.NOT_MODIFIED)
            self.send_header('ETag', rev)
            self.send_header('Cache-control', "public, max-age=60")

            self.end_headers()
            return

          articles = business_data.get_all_taxes()
          self.send_response(200)  # OK
          self.send_header('Content-type', self.APPLICATION_MIME)
          self.send_header('ETag', rev)
          self.end_headers()
          self.wfile.write(bytes(articles, "utf-8"))
          print((datetime.now() - starttime).microseconds)

        elif len(paths) == 1 and paths[0] == "ordermethods":
          rev = str(business_data.get_order_methods_revision())
          req_etag = self.headers['If-None-Match']
          if req_etag and req_etag == rev:
            self.send_response(http.HTTPStatus.NOT_MODIFIED)
            self.send_header('ETag', rev)
            self.send_header('Cache-control', "public, max-age=60")

            self.end_headers()
            return
          articles = business_data.get_all_order_methods()
          self.send_response(200)  # OK
          self.send_header('Content-type', self.APPLICATION_MIME)
          self.send_header('ETag', rev)
          self.end_headers()
          self.wfile.write(bytes(articles, "utf-8"))
          print((datetime.now() - starttime).microseconds)

        elif len(paths) == 1 and paths[0] == "paymentmethods":
          rev = str(business_data.get_payment_methods_revision())
          req_etag = self.headers['If-None-Match']
          if req_etag and req_etag == rev:
            self.send_response(http.HTTPStatus.NOT_MODIFIED)
            self.send_header('ETag', rev)
            self.send_header('Cache-control', "public, max-age=60")
            self.end_headers()
            return
          articles = business_data.get_all_payment_methods()
          self.send_response(200)  # OK
          self.send_header('Content-type', self.APPLICATION_MIME)
          self.send_header('ETag', rev)
          self.end_headers()
          self.wfile.write(bytes(articles, "utf-8"))
          print((datetime.now() - starttime).microseconds)

        # elif len(paths) == 2 and paths[0] == "article" and re.compile("^[0-9]+$").match(paths[1]):
        #     article_id = paths[1]
        #     self.send_response(200)  # OK
        #     self.send_header('Content-type', self.APPLICATION_MIME)
        #     self.end_headers()
        #     article = business_data.get_article(article_id)
        #     self.wfile.write(bytes(article, "utf-8"))
        #     print((datetime.now() - starttime).microseconds)

        else:
          self.send_response(404)  # OK
          self.send_header('Content-type', self.APPLICATION_MIME)
          self.end_headers()

      else:  # serve static files & handle virtual routes
        # Get the file path.
        # dem = paths.
        cache_it = True
        if len(paths) == 1 and paths[0] in virtual_routes:
          cache_it = False
          rpath = "/"

        path = "../Client" + rpath

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

          with open(path, 'rb') as ifp:
            payload = ifp.read()
            req_etag = str(self.headers['If-None-Match'])
            if req_etag and req_etag == str(hash(payload)):
              self.send_response(http.HTTPStatus.NOT_MODIFIED)
              self.send_header('ETag', hash(payload))
              self.send_header('Cache-control', "public, max-age=60")
              self.send_header('Expires', str(time.strftime("%a, %d %b %Y %T GMT", time.gmtime(time.time() + 60))))
              self.send_header('Last-Modified', 0)
              self.end_headers()
              return
            self.send_response(200)  # OK
            self.send_header('Content-type', content_type)
            # self.send_header('Content-Encoding', 'gzip')

            if cache_it:
              self.send_header('ETag', hash(payload))
              self.send_header('Cache-control', "public, max-age=60")
              self.send_header('Expires', str(time.strftime("%a, %d %b %Y %T GMT", time.gmtime(time.time() + 60))))
              self.send_header('Last-Modified', 0)
            self.end_headers()
            # self.wfile.write(gzip.compress(ifp.read()))
            self.wfile.write(payload)
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

      if ctype == self.APPLICATION_MIME and self.path == "/cart/checkout":
        try:
          length = int(self.headers['content-length'])
          body = self.rfile.read(length)
          checkout = JsonDto(body)
          # TODO;validate checkout
          if datastore.insert_full_checkout(checkout):
            self.send_response(http.HTTPStatus.OK)
            self.send_header('Content-type', self.APPLICATION_MIME)
            self.end_headers()
        except ValueError or TypeError:  # TODO; expect all errors here
          self.send_response(http.HTTPStatus.BAD_REQUEST)
          self.send_header('Content-type', self.APPLICATION_MIME)
          self.end_headers()
          # TODO, create & send JsonError

          # TODO; send http.HTTPStatus.CONFLICT if validation raised "EPOSCheckoutPriceConflictError" or "EPOSCheckoutArticleIngredientConflict"
          # TODO; send http.HTTPStatus.NOT_FOUND if validation raised "EPOSCheckoutArticleNotFoundError" or "EPOSCheckoutIngredientNotFoundError"

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
  RequestHandlerClass.server_version = "EPOS Master Server"
  RequestHandlerClass.sys_version = str(VERSION)

  server = ThreadedHTTPServer(("", port), RequestHandlerClass)
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
