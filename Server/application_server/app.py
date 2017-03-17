import argparse
import cgi
import gzip
import http.server
import logging
import mimetypes
import os
import re
import sys
from datetime import datetime

from Server.application_server.datastore import Datastore
import cookies
import time


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

        def get_all_order_methods(self):
            order_methods = self.datastore.get_all_order_methods()

        return order_methods.serialize()

        def get_all_payment_methods(self):
            payment_methods = self.datastore.get_all_payment_methods()

        return payment_methods.serialize()


def make_request_handler_class():
    '''
    Factory to make the request handler and add arguments to it.

    It exists to allow the handler to access the opts.path variable
    locally.
    '''

    datastore = Datastore()
    business_data = BusinessData(datastore)

    #TODO schaun ob das die richtige stelle ist
    c = cookies.Cookiemanager()

    class MyRequestHandler(http.server.BaseHTTPRequestHandler):
        '''
        Factory generated request handler class that contain
        additional class variables.
        '''

        APPLICATION_MIME = "application/com.rosettis.pizzaservice+json"

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
                self.send_error(http.HTTPStatus.UNSUPPORTED_MEDIA_TYPE, 'Unsupported content-type: ')
                return False
            return True

        def do_GET(self):
            # logging.debug('Init Time: %s' % str(int(1360287003083988472 % 1000000000)).zfill(9))


            #TODO Davids Zeugs


            if "Cookie" in self.headers:
                cookie = self.headers["cookies"]
                #TODO cookie in unsere form bringen ( cookie = {"cookie_value":1 , "exp_date": (time.time() + 5 ) *1000} )
            else:
                neuescookie = {"cookie_value": 1, "exp_date": (time.time() + 5) * 1000}
                # TODO neues Cookie erstellen (neuescookie)
                if (c.neuescookieeinfuegen(neuescookie)):
                    #TODO send set_Cookie
                else:
                    #TODO send error kein neuer cookie konnte erstellt werden (zu viele sesions)

            if not c.cookietestobvalid(cookie):
                neuescookie = {"cookie_value": 1, "exp_date": (time.time() + 5) * 1000}
                #TODO neues Cookie erstellen (neuescookie)
                if(c.neuescookieeinfuegen(neuescookie)):
                    #TODO send set_Cookie
                else:
                    #TODO send error kein neuer cookie konnte erstellt werden (zu viele sesions)





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
            if len(paths) == 1 and paths[0] == "articles":
                if not self.check_content_type(content_type):
                    return
                self.send_response(200)  # OK
                self.send_header('Content-type', self.APPLICATION_MIME)
                self.end_headers()
                articles = business_data.get_articles()
                self.wfile.write(bytes(articles, "utf-8"))
                print((datetime.now() - starttime).microseconds)

            elif len(paths) == 1 and paths[0] == "ingredients":
                if not self.check_content_type(content_type):
                    return
                self.send_response(200)  # OK
                self.send_header('Content-type', self.APPLICATION_MIME)
                self.end_headers()
                articles = business_data.get_all_ingredients()
                self.wfile.write(bytes(articles, "utf-8"))
                print((datetime.now() - starttime).microseconds)

            elif len(paths) == 1 and paths[0] == "taxes":
                if not self.check_content_type(content_type):
                    return
                self.send_response(200)  # OK
                self.send_header('Content-type', self.APPLICATION_MIME)
                self.end_headers()
                articles = business_data.get_all_taxes()
                self.wfile.write(bytes(articles, "utf-8"))
                print((datetime.now() - starttime).microseconds)

            elif len(paths) == 1 and paths[0] == "ordermethods":
                if not self.check_content_type(content_type):
                    return
                self.send_response(200)  # OK
                self.send_header('Content-type', self.APPLICATION_MIME)
                self.end_headers()
                articles = business_data.get_all_order_methods()
                self.wfile.write(bytes(articles, "utf-8"))
                print((datetime.now() - starttime).microseconds)
            elif len(paths) == 1 and paths[0] == "paymentmethods":
                if not self.check_content_type(content_type):
                    return
                self.send_response(200)  # OK
                self.send_header('Content-type', self.APPLICATION_MIME)
                self.end_headers()
                articles = business_data.get_all_payment_methods()
                self.wfile.write(bytes(articles, "utf-8"))
                print((datetime.now() - starttime).microseconds)
            elif (len(paths) >= 1) and (paths[0] == "article"):
                article_id = paths[1]
                if len(paths) == 3 and re.compile("^[0-9]+$").match(paths[1]) and paths[2] is "ingredients":
                    if not self.check_content_type(content_type):
                        return

                    ingredients = business_data.get_ingredients(article_id)
                    self.wfile.write(bytes(ingredients, "utf-8"))
                    print((datetime.now() - starttime).microseconds)

                else:
                    if not self.check_content_type(content_type):
                        return

                    self.send_response(200)  # OK
                    self.send_header('Content-type', self.APPLICATION_MIME)
                    self.end_headers()
                    article = business_data.get_article(article_id)
                    self.wfile.write(bytes(article, "utf-8"))
                    print((datetime.now() - starttime).microseconds)

            else:
                # Get the file path.
                # dem = paths.
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
                    # content_type = {
                    #     '.css': 'text/css',
                    #     '.gif': 'image/gif',
                    #     '.htm': 'text/html',
                    #     '.html': 'text/html',
                    #     '.jpeg': 'image/jpeg',
                    #     '.jpg': 'image/jpg',
                    #     '.js': 'text/javascript',
                    #     '.png': 'image/png',
                    #     '.text': 'text/plain',
                    #     '.txt': 'text/plain',
                    # }

                    content_type = mimetypes.types_map[ext]
                    if not content_type:
                        # Unknown file type or a directory.
                        # Treat it as plain text.
                        self.send_response(200)  # OK
                        self.send_header('Content-type', 'text/plain')
                        self.send_header('Content-Encoding', 'gzip')
                        self.end_headers()
                        with open(path, 'rb') as ifp:
                            self.wfile.write(gzip.compress(ifp.read()))
                        print((datetime.now() - starttime).microseconds)
                        return

                    self.send_response(200)  # OK
                    self.send_header('Content-type', content_type)
                    self.send_header('Content-Encoding', 'gzip')
                    self.end_headers()
                    with open(path, 'rb') as ifp:
                        self.wfile.write(gzip.compress(ifp.read()))
                    print((datetime.now() - starttime).microseconds)
                    # If it is a known extension, set the correct
                    # content type in the response.
                    # if ext in content_type:
                    #     self.send_response(200)  # OK
                    #     self.send_header('Content-type', content_type[ext])
                    #     self.end_headers()
                    #
                    #     with open(path) as ifp:
                    #         self.wfile.write(bytes(ifp.read(), "utf-8"))
                    # else:
                    #     # Unknown file type or a directory.
                    #     # Treat it as plain text.
                    #     self.send_response(200)  # OK
                    #     self.send_header('Content-type', 'text/plain')
                    #     self.end_headers()
                    #
                    #     with open(path) as ifp:
                    #         self.wfile.write(bytes(ifp.read(), "utf-8"))

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

            # Print out logging information about the path and args.
            logging.debug('TYPE %s' % (ctype))
            logging.debug('PATH %s' % (self.path))
            logging.debug('ARGS %d' % (len(postvars)))
            if len(postvars):
                i = 0
                for key in sorted(postvars):
                    logging.debug('ARG[%d] %s=%s' % (i, key, postvars[key]))
                    i += 1

            # Tell the browser everything is okay and that there is
            # HTML to display.
            self.send_response(200)  # OK
            self.send_header('Content-type', 'text/html')
            self.end_headers()

            # Display the POST variables.
            self.wfile.write('<html>')
            self.wfile.write('  <head>')
            self.wfile.write('    <title>Server POST Response</title>')
            self.wfile.write('  </head>')
            self.wfile.write('  <body>')
            self.wfile.write('    <p>POST variables (%d).</p>' % (len(postvars)))

            if len(postvars):
                # Write out the POST variables in 3 columns.
                self.wfile.write('    <table>')
                self.wfile.write('      <tbody>')
                i = 0
                for key in sorted(postvars):
                    i += 1
                    val = postvars[key]
                    self.wfile.write('        <tr>')
                    self.wfile.write('          <td align="right">%d</td>' % (i))
                    self.wfile.write('          <td align="right">%s</td>' % key)
                    self.wfile.write('          <td align="left">%s</td>' % val)
                    self.wfile.write('        </tr>')
                self.wfile.write('      </tbody>')
                self.wfile.write('    </table>')

            self.wfile.write('    <p><a href="%s">Back</a></p>' % (back))
            self.wfile.write('  </body>')
            self.wfile.write('</html>')

    return MyRequestHandler


def err(msg):
    '''
    Report an error message and exit.
    '''
    print('ERROR: %s' % (msg))
    sys.exit(1)


def getopts():
    '''
    Get the command line options.
    '''

    # Get the help from the module documentation.
    this = os.path.basename(sys.argv[0])
    description = ('description:%s' % '\n  '.join(__doc__.split('\n')))
    epilog = ' '
    rawd = argparse.RawDescriptionHelpFormatter
    parser = argparse.ArgumentParser(formatter_class=rawd,
                                     description=description,
                                     epilog=epilog)

    parser.add_argument('-d', '--daemonize',
                        action='store',
                        type=str,
                        default='.',
                        metavar='DIR',
                        help='daemonize this process, store the 3 run files (.log, .err, .pid) in DIR (default "%(default)s")')

    parser.add_argument('-H', '--host',
                        action='store',
                        type=str,
                        default='localhost',
                        help='hostname, default=%(default)s')

    parser.add_argument('-l', '--level',
                        action='store',
                        type=str,
                        default='info',
                        choices=['notset', 'debug', 'info', 'warning', 'error', 'critical', ],
                        help='define the logging level, the default is %(default)s')

    parser.add_argument('--no-dirlist',
                        action='store_true',
                        help='disable directory listings')

    parser.add_argument('-p', '--port',
                        action='store',
                        type=int,
                        default=8080,
                        help='port, default=%(default)s')

    parser.add_argument('-r', '--rootdir',
                        action='store',
                        type=str,
                        default=os.path.abspath('.'),
                        help='web directory root that contains the HTML/CSS/JS files %(default)s')

    parser.add_argument('-v', '--verbose',
                        action='count',
                        help='level of verbosity')

    parser.add_argument('-V', '--version',
                        action='version',
                        version='%(prog)s - v' + VERSION)

    opts = parser.parse_args()
    opts.rootdir = os.path.abspath(opts.rootdir)
    if not os.path.isdir(opts.rootdir):
        err('Root directory does not exist: ' + opts.rootdir)
    if opts.port < 1 or opts.port > 65535:
        err('Port is out of range [1..65535]: %d' % (opts.port))
    return opts


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


def get_logging_level(opts):
    '''
    Get the logging levels specified on the command line.
    The level can only be set once.
    '''
    if opts.level == 'notset':
        return logging.NOTSET
    elif opts.level == 'debug':
        return logging.DEBUG
    elif opts.level == 'info':
        return logging.INFO
    elif opts.level == 'warning':
        return logging.WARNING
    elif opts.level == 'error':
        return logging.ERROR
    elif opts.level == 'critical':
        return logging.CRITICAL


def main():
    ''' main entry '''
    httpd()


if __name__ == '__main__':
    main()  # this allows library functionality