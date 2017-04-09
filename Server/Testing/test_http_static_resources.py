import http.client
import unittest
from unittest import TestCase

conn = http.client.HTTPConnection("127.0.0.1:8081")


class TestStaticResource(TestCase):
    def test_validate(self):
        conn.request("GET", "")
        res = conn.getresponse()
        self.assertEqual(res.code, http.HTTPStatus.OK)

    def test_invalid_path(self):
        conn.request("GET", "////////////asdasdas///adsd//asd7asd7asd7(/07&&()63$76%587)8/)")
        res = conn.getresponse()
        self.assertEqual(res.code, http.HTTPStatus.NOT_FOUND)

    def test_not_found_ressource(self):
        conn.request("GET", "/article/neverforget")
        res = conn.getresponse()
        self.assertEqual(res.code, http.HTTPStatus.NOT_FOUND)

    def test_not_implemented_method(self):
        conn.request("HEAD", "/article/neverforget")
        res = conn.getresponse()
        self.assertEqual(res.code, http.HTTPStatus.NOT_IMPLEMENTED)

    def runTest(self):
        unittest.main()


if __name__ == '__main__':
    unittest.main()
