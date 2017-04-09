import http.client
import unittest
from unittest import TestCase

conn = http.client.HTTPConnection("127.0.0.1:8081")

APPLICATION_MIME = "application/com.rosettis.pizzaservice"


class TestApiCartCheckout(TestCase):
    def test_valid_checkout(self):
        payload = '{"customer":{"id":0,"type":"Person","email":"a@a.a","first_name":"sdfsdf",' \
                  '"last_name":"sdfsdf","telephone":"012345679821","address":{"addressCountry":"",' \
                  '"addressLocality":"sdfsdf","addressRegion":"","postalCode":"23456","streetAddress":"sdfsfsdf ' \
                  '234"}},"articles":[{"id":0,"article_id":0,"extra_ingredients":[],"amount":1}],' \
                  '"total_price":6.9,"payment_method_id":"0","order_method_id":"0"} '
        conn.request("POST", "/cart/checkout", body=payload, headers={'Content-Type': APPLICATION_MIME})
        res = conn.getresponse()
        self.assertEqual(res.code, http.HTTPStatus.OK)

    def test_invalid_price(self):
        payload = '{"customer":{"id":0,"type":"Person","email":"a@a.a","first_name":"sdfsdf",' \
                  '"last_name":"sdfsdf","telephone":"012345679821","address":{"addressCountry":"",' \
                  '"addressLocality":"sdfsdf","addressRegion":"","postalCode":"23456","streetAddress":"sdfsfsdf ' \
                  '234"}},"articles":[{"id":0,"article_id":0,"extra_ingredients":[],"amount":1}],' \
                  '"total_price":3.9,"payment_method_id":"0","order_method_id":"0"} '
        conn.request("POST", "/cart/checkout", body=payload, headers={'Content-Type': APPLICATION_MIME})
        res = conn.getresponse()
        self.assertEqual(res.code, http.HTTPStatus.CONFLICT)

    def test_invalid_article(self):
        payload = '{"customer":{"id":0,"type":"Person","email":"a@a.a","first_name":"sdfsdf",' \
                  '"last_name":"sdfsdf","telephone":"012345679821","address":{"addressCountry":"",' \
                  '"addressLocality":"sdfsdf","addressRegion":"","postalCode":"23456","streetAddress":"sdfsfsdf ' \
                  '234"}},"articles":[{"id":15,"article_id":0,"extra_ingredients":[],"amount":1}],' \
                  '"total_price":3.9,"payment_method_id":"0","order_method_id":"0"} '

        conn.request("POST", "/cart/checkout", body=payload, headers={'Content-Type': APPLICATION_MIME})
        res = conn.getresponse()
        self.assertEqual(res.code, http.HTTPStatus.CONFLICT)

    def test_invalid_ingredient(self):
        payload = '{"customer":{"id":0,"type":"Person","email":"a@a.a","first_name":"sdfsdf",' \
                  '"last_name":"sdfsdf","telephone":"012345679821","address":{"addressCountry":"",' \
                  '"addressLocality":"sdfsdf","addressRegion":"","postalCode":"23456","streetAddress":"sdfsfsdf ' \
                  '234"}},"articles":[{"id":0,"article_id":0,"extra_ingredients":[{"id":3}],"amount":1}],' \
                  '"total_price":3.9,"payment_method_id":"0","order_method_id":"0"} '

        conn.request("POST", "/cart/checkout", body=payload, headers={'Content-Type': APPLICATION_MIME})
        res = conn.getresponse()
        self.assertEqual(res.code, http.HTTPStatus.CONFLICT)

    def test_invalid_json(self):
        payload = '{"articles":[{"id":0,"article_id":0'  # extra_ingredient 2 is not legit for pizza id 0
        conn.request("POST", "/cart/checkout", body=payload, headers={'Content-Type': APPLICATION_MIME})
        res = conn.getresponse()
        self.assertEqual(res.code, http.HTTPStatus.BAD_REQUEST)

    def runTest(self):
        unittest.main()


if __name__ == '__main__':
    unittest.main()
