import re

def isValidPath(url):
    try:
        return re.compile(
            r'^(?:/?|[/?]\S+)$', re.IGNORECASE).match(url)
    except ValueError:
        return False
