import http.client
import mimetypes
import unittest
from unittest import TestCase

conn = http.client.HTTPConnection("127.0.0.1:8081")

APPLICATION_MIME = "application/com.rosettis.pizzaservice"


class TestApiGetDataCalls(TestCase):
    def test_get_articles(self):
        conn.request("GET", "/articles", headers={'Content-Type': APPLICATION_MIME})
        res = conn.getresponse()
        self.assertEqual(res.code, http.HTTPStatus.OK)
        data = res.read()
        self.assertIsNotNone(data)

    def test_get_ingredients(self):
        conn.request("GET", "/ingredients", headers={'Content-Type': APPLICATION_MIME})
        res = conn.getresponse()
        self.assertEqual(res.code, http.HTTPStatus.OK)
        data = res.read()
        self.assertIsNotNone(data)

    def test_get_taxes(self):
        conn.request("GET", "/taxes", headers={'Content-Type': APPLICATION_MIME})
        res = conn.getresponse()
        self.assertEqual(res.code, http.HTTPStatus.OK)
        data = res.read()
        self.assertIsNotNone(data)

    def test_get_shipping_methods(self):
        conn.request("GET", "/shippingmethods", headers={'Content-Type': APPLICATION_MIME})
        res = conn.getresponse()
        self.assertEqual(res.code, http.HTTPStatus.OK)
        data = res.read()
        self.assertIsNotNone(data)

    def test_get_payment_methods(self):
        conn.request("GET", "/paymentmethods", headers={'Content-Type': APPLICATION_MIME})
        res = conn.getresponse()
        self.assertEqual(res.code, http.HTTPStatus.OK)
        data = res.read()
        self.assertIsNotNone(data)

    ''' Nun die API Calls mit Cache Mechanismus'''

    def test_get_cached_articles(self):
        conn.request("GET", "/articles", headers={'Content-Type': APPLICATION_MIME})
        res = conn.getresponse()
        self.assertEqual(res.code, http.HTTPStatus.OK)
        data = res.read()
        self.assertIsNotNone(data)
        etag = res.getheader('Etag')
        self.assertIsNotNone(etag)
        conn.request("GET", "/articles", headers={'Content-Type': APPLICATION_MIME, 'If-None-Match': etag})
        res_cache = conn.getresponse()
        self.assertEqual(res_cache.code, http.HTTPStatus.NOT_MODIFIED)

    def test_get_cached_ingredients(self):
        conn.request("GET", "/ingredients", headers={'Content-Type': APPLICATION_MIME})
        res = conn.getresponse()
        self.assertEqual(res.code, http.HTTPStatus.OK)
        data = res.read()
        self.assertIsNotNone(data)
        etag = res.getheader('Etag')
        self.assertIsNotNone(etag)
        conn.request("GET", "/articles", headers={'Content-Type': APPLICATION_MIME, 'If-None-Match': etag})
        res_cache = conn.getresponse()
        self.assertEqual(res_cache.code, http.HTTPStatus.NOT_MODIFIED)

    def test_get_cached_taxes(self):
        conn.request("GET", "/taxes", headers={'Content-Type': APPLICATION_MIME})
        res = conn.getresponse()
        self.assertEqual(res.code, http.HTTPStatus.OK)
        data = res.read()
        self.assertIsNotNone(data)
        etag = res.getheader('Etag')
        self.assertIsNotNone(etag)
        conn.request("GET", "/articles", headers={'Content-Type': APPLICATION_MIME, 'If-None-Match': etag})
        res_cache = conn.getresponse()
        self.assertEqual(res_cache.code, http.HTTPStatus.NOT_MODIFIED)

    def test_get_cached_shipping_methods(self):
        conn.request("GET", "/articles", headers={'Content-Type': APPLICATION_MIME})
        res = conn.getresponse()
        self.assertEqual(res.code, http.HTTPStatus.OK)
        data = res.read()
        self.assertIsNotNone(data)
        etag = res.getheader('Etag')
        self.assertIsNotNone(etag)
        conn.request("GET", "/shippingmethods", headers={'Content-Type': APPLICATION_MIME, 'If-None-Match': etag})
        res_cache = conn.getresponse()
        self.assertEqual(res_cache.code, http.HTTPStatus.NOT_MODIFIED)

    def test_get_cached_payment_methods(self):
        conn.request("GET", "/paymentmethods", headers={'Content-Type': APPLICATION_MIME})
        res = conn.getresponse()
        self.assertEqual(res.code, http.HTTPStatus.OK)
        data = res.read()
        self.assertIsNotNone(data)
        etag = res.getheader('Etag')
        self.assertIsNotNone(etag)
        conn.request("GET", "/articles", headers={'Content-Type': APPLICATION_MIME, 'If-None-Match': etag})
        res_cache = conn.getresponse()
        self.assertEqual(res_cache.code, http.HTTPStatus.NOT_MODIFIED)

    '''Allgemeine Test Cases zum unerwünschten Verhalten'''

    def test_get_api_call_invalid_mime(self):
        conn.request("GET", "/articles", headers={'Content-Type': "application/invalid"})
        res = conn.getresponse()
        self.assertEqual(res.code, http.HTTPStatus.OK)  # wird statische resource zurückliefern daher OK
        self.assertEqual(res.getheader('Content-Type'), mimetypes.types_map[".html"])

    def test_get_api_call_not_found(self):
        conn.request("GET", "/artart", headers={'Content-Type': APPLICATION_MIME})
        res = conn.getresponse()
        self.assertEqual(res.code, http.HTTPStatus.NOT_FOUND)

    def test_get_api_not_implemented_method(self):
        conn.request("PUT", "/articles", headers={'Content-Type': APPLICATION_MIME})
        res = conn.getresponse()
        self.assertEqual(res.code, http.HTTPStatus.NOT_IMPLEMENTED)

    def runTest(self):
        unittest.main()


if __name__ == '__main__':
    unittest.main()
