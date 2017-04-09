import unittest

from test_http_api_cart_checkout import *
from test_http_api_get_data_calls import *
from test_http_static_resources import *


def suite():
    suite = unittest.TestSuite()
    suite.addTest(TestDatastore())
    suite.addTest(TestApiCartCheckout())
    suite.addTest(TestApiGetDataCalls())
    suite.addTest(TestStaticResource())
    suite.addTest(TestRequestValidator())
    return suite


if __name__ == '__main__':
    runner = unittest.TextTestRunner()
    test_suite = suite()
    runner.run(test_suite)
    # process.kill()
