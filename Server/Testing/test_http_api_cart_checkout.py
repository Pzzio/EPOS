import http.client
import unittest
from unittest import TestCase

conn = http.client.HTTPConnection("127.0.0.1:8081")

APPLICATION_MIME = "application/com.rosettis.pizzaservice"


class TestApiCartCheckout(TestCase):
    def test_valid_checkout(self):
        valid_payload = '{"articles":[{"id":0,"article_id":0,"extra_ingredients":[],"amount":1}],"total_price":6.9}'
        conn.request("POST", "/cart/checkout", body=valid_payload, headers={'Content-Type': APPLICATION_MIME})
        res = conn.getresponse()
        self.assertEqual(res.code, http.HTTPStatus.OK)

    def test_invalid_price(self):
        valid_payload = '{"articles":[{"id":0,"article_id":0,"extra_ingredients":[],"amount":1}],"total_price":2.9}'
        conn.request("POST", "/cart/checkout", body=valid_payload, headers={'Content-Type': APPLICATION_MIME})
        res = conn.getresponse()
        self.assertEqual(res.code, http.HTTPStatus.CONFLICT)

    def test_invalid_article(self):
        valid_payload = '{"articles":[{"id":13,"article_id":0,"extra_ingredients":[],"amount":1}],"total_price":2.9}'  # unavailable article id
        conn.request("POST", "/cart/checkout", body=valid_payload, headers={'Content-Type': APPLICATION_MIME})
        res = conn.getresponse()
        self.assertEqual(res.code, http.HTTPStatus.CONFLICT)

    def test_invalid_ingredient(self):
        valid_payload = '{"articles":[{"id":0,"article_id":0,"extra_ingredients":[{"id":2}],"amount":1}],"total_price":2.9}'  # extra_ingredient 2 is not legit for pizza id 0
        conn.request("POST", "/cart/checkout", body=valid_payload, headers={'Content-Type': APPLICATION_MIME})
        res = conn.getresponse()
        self.assertEqual(res.code, http.HTTPStatus.CONFLICT)

    def test_invalid_json(self):
        valid_payload = '{"articles":[{"id":0,"article_id":0'  # extra_ingredient 2 is not legit for pizza id 0
        conn.request("POST", "/cart/checkout", body=valid_payload, headers={'Content-Type': APPLICATION_MIME})
        res = conn.getresponse()
        self.assertEqual(res.code, http.HTTPStatus.BAD_REQUEST)

    def runTest(self):
        unittest.main()


if __name__ == '__main__':
    unittest.main()
