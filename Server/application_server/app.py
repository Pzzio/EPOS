import cgi
import http.cookies
import http.server
import logging
import mimetypes
import os
import re
import time
from datetime import datetime
from http.server import HTTPServer
from socketserver import ThreadingMixIn

from cookies import *
from datastore import *

# from cookies import Cookiemanager
# from datastore import JsonDto, Datastore  # will work even if PyCharm cries

#from Server.application_server.datastore import Datastore

#from Server.application_server import cookies

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

    def get_all_shipping_methods(self):
        shipping_methods = self.datastore.get_all_shipping_methods()
        return shipping_methods.serialize()

    def get_all_payment_methods(self):
        payment_methods = self.datastore.get_all_payment_methods()
        return payment_methods.serialize()

    def get_articles_revision(self):
        articles_info = self.datastore.get_articles_info().articles_info['revision']
        return articles_info

    def get_ingredients_revision(self):
        ingredients_info = self.datastore.get_ingredients_info().ingredients_info['revision']
        return ingredients_info

    def get_shipping_methods_revision(self):
        shipping_methods_info = self.datastore.get_shipping_methods_info().shipping_methods_info['revision']
        return shipping_methods_info

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


    datastore = Datastore()
    business_data = BusinessData(datastore)

    #TODO schaun ob das die richtige stelle ist
    c = Cookiemanager()


    class MyRequestHandler(http.server.BaseHTTPRequestHandler):
        '''
        Factory generated request handler class that contain
        additional class variables.
        '''

        APPLICATION_MIME = "application/com.rosettis.pizzaservice"

        intermediate_headers = []

        def check_content_type(self, type):
            if not type or not type.startswith(self.APPLICATION_MIME):
                # self.send_error(http.HTTPStatus.UNSUPPORTED_MEDIA_TYPE, 'Unsupported content-type: ')
                return False
            return True

        def handle_cookie(self):
            cookie = http.cookies.SimpleCookie()
            if self.headers["cookie"] and not self.headers["cookie"] == "":

                cookie.load(self.headers["cookie"])

                cookie_internal = c.cookieerzeugenmitValue(cookie['SSID'].value)

                if not c.cookietestobvalid(cookie_internal):

                    neuescookie = c.neuenCookieerzeugen()

                    if (c.neuescookieeinfuegen(neuescookie)):

                        cookie['SSID'] = neuescookie['cookie_value']

                        self.intermediate_headers.append(("Set-Cookie", "SSID=" + cookie['SSID'].value + "; Path=/"))

                        return True
                    else:
                        self.finalize_header(503, "")
                        return False

                else:
                    return True

                    # pass to resource
            else:
                neuescookie = c.neuenCookieerzeugen()
                if (c.neuescookieeinfuegen(neuescookie)):
                    self.intermediate_headers.append(
                        ("Set-Cookie", "SSID=" + c.CookieValueausgeben(neuescookie) + "; Path=/"))
                    return True
                else:
                    self.finalize_header(503, "")
                    return False

        def finalize_header(self, status, message):
            self.send_response(status)
            for header in self.intermediate_headers:
                self.send_header(header[0], header[1])
            self.end_headers()
            self.intermediate_headers.clear()

        def do_GET(self):
            # logging.debug('Init Time: %s' % str(int(1360287003083988472 % 1000000000)).zfill(9))
            starttime = datetime.now()
            response_status = 200

            # TODO Davids Zeugs


            if not self.handle_cookie():
                return
            '''
            Handle a GET request.
            '''
            logging.debug('GET %s' % (self.path))

            content_type = self.headers['content-type']

            args = {}
            idx = self.path.find('?')
            if idx >= 0:
                rpath = self.path[:idx]
                args = cgi.parse_qs(self.path[idx + 1:])
            else:
                rpath = self.path

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

            paths = list(filter(None, self.path.split("/")))
            if self.check_content_type(content_type):
                if len(paths) == 1 and paths[0] == "articles":

                    rev = str(business_data.get_articles_revision())
                    req_etag = self.headers['If-None-Match']
                    if req_etag and req_etag == rev:
                        response_status = http.HTTPStatus.NOT_MODIFIED
                        self.intermediate_headers.append(('ETag', rev))
                        self.intermediate_headers.append(('Cache-control', "public, max-age=60"))
                        self.finalize_header(response_status, "")
                        return

                    articles = business_data.get_all_articles()
                    response_status = 200  # OK
                    self.intermediate_headers.append(('ETag', rev))
                    self.intermediate_headers.append(('Content-type', self.APPLICATION_MIME))
                    self.finalize_header(response_status, "")
                    self.wfile.write(bytes(articles, "utf-8"))
                    print((datetime.now() - starttime).microseconds)
                    return

                elif len(paths) == 1 and paths[0] == "ingredients":
                    rev = str(business_data.get_ingredients_revision())
                    req_etag = self.headers['If-None-Match']
                    if req_etag and req_etag == rev:
                        response_status = http.HTTPStatus.NOT_MODIFIED
                        self.intermediate_headers.append(('ETag', rev))
                        self.intermediate_headers.append(('Cache-control', "public, max-age=60"))
                        self.finalize_header(response_status, "")
                        return

                    response_status = 200  # OK
                    self.intermediate_headers.append(('ETag', rev))
                    self.intermediate_headers.append(('Content-type', self.APPLICATION_MIME))
                    self.finalize_header(response_status, "")
                    ingredients = business_data.get_all_ingredients()
                    self.wfile.write(bytes(ingredients, "utf-8"))
                    print((datetime.now() - starttime).microseconds)
                    return

                elif len(paths) == 1 and paths[0] == "taxes":
                    rev = str(business_data.get_taxes_revision())
                    req_etag = self.headers['If-None-Match']
                    if req_etag and req_etag == rev:
                        response_status = http.HTTPStatus.NOT_MODIFIED
                        self.intermediate_headers.append(('ETag', rev))
                        self.intermediate_headers.append(('Cache-control', "public, max-age=60"))

                        self.finalize_header(response_status, "")
                        return

                    articles = business_data.get_all_taxes()
                    response_status = 200  # OK
                    self.intermediate_headers.append(('Content-type', self.APPLICATION_MIME))
                    self.intermediate_headers.append(('ETag', rev))
                    self.finalize_header(response_status, "")
                    self.wfile.write(bytes(articles, "utf-8"))
                    print((datetime.now() - starttime).microseconds)
                    return

                elif len(paths) == 1 and paths[0] == "shippingmethods":
                    rev = str(business_data.get_shipping_methods_revision())
                    req_etag = self.headers['If-None-Match']
                    if req_etag and req_etag == rev:
                        response_status = http.HTTPStatus.NOT_MODIFIED
                        self.intermediate_headers.append(('ETag', rev))
                        self.intermediate_headers.append(('Cache-control', "public, max-age=60"))

                        self.finalize_header(response_status, "")
                        return
                    articles = business_data.get_all_shipping_methods()
                    response_status = 200  # OK
                    self.intermediate_headers.append(('Content-type', self.APPLICATION_MIME))
                    self.intermediate_headers.append(('ETag', rev))
                    self.finalize_header(response_status, "")
                    self.wfile.write(bytes(articles, "utf-8"))
                    print((datetime.now() - starttime).microseconds)

                elif len(paths) == 1 and paths[0] == "paymentmethods":
                    rev = str(business_data.get_payment_methods_revision())
                    req_etag = self.headers['If-None-Match']
                    if req_etag and req_etag == rev:
                        response_status = http.HTTPStatus.NOT_MODIFIED
                        self.intermediate_headers.append(('ETag', rev))
                        self.intermediate_headers.append(('Cache-control', "public, max-age=60"))
                        self.finalize_header(response_status, "")
                        return
                    articles = business_data.get_all_payment_methods()
                    response_status = 200  # OK
                    self.intermediate_headers.append(('Content-type', self.APPLICATION_MIME))
                    self.intermediate_headers.append(('ETag', rev))
                    self.finalize_header(response_status, "")
                    self.wfile.write(bytes(articles, "utf-8"))
                    print((datetime.now() - starttime).microseconds)

                # elif len(paths) == 2 and paths[0] == "article" and re.compile("^[0-9]+$").match(paths[1]):
                #     article_id = paths[1]
                #     response_status =200)  # OK
                #     self.intermediate_headers.append(('Content-type', self.APPLICATION_MIME)
                #     self.finalize_header(response_status, "")
                #     article = business_data.get_article(article_id)
                #     self.wfile.write(bytes(article, "utf-8"))
                #     print((datetime.now() - starttime).microseconds)

                else:
                    response_status = 404  # OK
                    self.intermediate_headers.append(('Content-type', self.APPLICATION_MIME))
                    self.finalize_header(response_status, "")

            else:  # serve static files & handle virtual routes  # Get the file path.
                # dem = paths.
                cache_it = True
                if (0 < len(paths) < 3) and paths[0] in virtual_routes:
                    if len(paths) == 2 and (
                                    paths[0] != virtual_routes[1] or not re.compile("^[0-9]+$").match(paths[1])):
                        self.send_error(http.HTTPStatus.NOT_FOUND, 'Could not find ' + rpath)
                        return
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
                        response_status = 200  # OK
                        self.intermediate_headers.append(('Content-type', 'text/plain'))
                        # self.intermediate_headers.append(('Content-Encoding', 'gzip')
                        self.finalize_header(response_status, "")

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
                            response_status = http.HTTPStatus.NOT_MODIFIED
                            self.intermediate_headers.append(('ETag', hash(payload)))
                            self.intermediate_headers.append(('Cache-control', "public, max-age=60"))
                            self.intermediate_headers.append(('Expires',
                                                              str(time.strftime("%a, %d %b %Y %T GMT",
                                                                                time.gmtime(time.time() + 60)))))
                            self.intermediate_headers.append(('Last-Modified', 0))
                            return
                        self.intermediate_headers.append(('Content-type', content_type))
                        # self.intermediate_headers.append(('Content-Encoding', 'gzip')

                        if cache_it:
                            self.intermediate_headers.append(('ETag', hash(payload)))
                            self.intermediate_headers.append(('Cache-control', "public, max-age=60"))
                            self.intermediate_headers.append(('Expires',
                                                              str(time.strftime("%a, %d %b %Y %T GMT",
                                                                                time.gmtime(time.time() + 60)))))
                            self.intermediate_headers.append(('Last-Modified', 0))

                        self.finalize_header(200, "")
                        
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
                        response_status = http.HTTPStatus.OK
                        self.intermediate_headers.append(('Content-type', self.APPLICATION_MIME))
                        self.finalize_header(response_status, "")
                except ValueError or TypeError:  # TODO; expect all errors here
                    response_status = http.HTTPStatus.BAD_REQUEST
                    self.intermediate_headers.append(('Content-type', self.APPLICATION_MIME))
                    self.finalize_header(response_status, "")
                    # TODO, create & send JsonError

                    # TODO; send http.HTTPStatus.CONFLICT if validation
                    # raised "EPOSCheckoutPriceConflictError" or "EPOSCheckoutArticleIngredientConflict"
                    # TODO; send http.HTTPStatus.NOT_FOUND if validation
                    # raised "EPOSCheckoutArticleNotFoundError" or "EPOSCheckoutIngredientNotFoundError"

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
