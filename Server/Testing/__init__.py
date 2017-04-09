import concurrent.futures
import http.client
import http.cookies

URLS = ["127.0.0.1"]  # [some list of urls]


# Retrieve a single page and report the url and contents
def load_url(url, timeout):
    return http.client.HTTPConnection(url, 8081).request("GET", "/")


# We can use a with statement to ensure threads are cleaned up promptly
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
    # Start the load operations and mark each future with its URL
    future_to_url = {executor.submit(load_url, url, 60): url for url in URLS}
    for future in concurrent.futures.as_completed(future_to_url):
        url = future_to_url[future]
        
        try:
            data = future.result()
            # do json processing here
        except Exception as exc:
            print('%r generated an exception: %s' % (url, exc))
        # else:
            # print('%r page is %d bytes' % (url, len(data)))
