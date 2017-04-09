import http.client
import http.cookies
import time


# TEST ID: B5

h1 = []
h2 = []
cookies = []
for i in range(1, 26):
    h1.append( http.client.HTTPConnection('localhost:8081'))
for i in range(1, 26):
    h2.append( http.client.HTTPConnection('localhost:8081'))
i = 0

for con in h1:

    con.request("GET", "/articles",{},{"Cookie":(str("SSID = 111")+str(i))})

    print(con.getresponse().status)

    con.request("GET", "/articles",{},{"Cookie":(str("SSID = 111")+str(i))})

    print(con.getresponse().status)

    i = i+1
    print(i)


for con in h2:

    # con.request("GET", "/articles",{},{"Cookie":(str("SSID = 111")+str(i))})
    con.request("GET", "/articles", {}, {})
    print(con.getresponse().status)
    i = i+1
    print(i)





for con in h1:
    # con.request("GET", "/articles",{},{"Cookie":(str("SSID = 111")+str(i))})
    con.request("GET", "/articles", {}, {})
    print(con.getresponse().status)
    i = i+1
    print(i)
for con in h2:
    # con.request("GET", "/articles", {}, {"Cookie": (str("SSID = 111") + str(i))})
    con.request("GET", "/articles", {}, {})
    print(con.getresponse().status)
    i = i + 1
    print(i)

time.sleep(40)

for con in h1:
    # con.request("GET", "/articles",{},{"Cookie":(str("SSID = 111")+str(i))})
    con.request("GET", "/articles", {}, {})
    print(con.getresponse().status)
    i = i+1
    print(i)
for con in h2:
    # con.request("GET", "/articles", {}, {"Cookie": (str("SSID = 111") + str(i))})
    con.request("GET", "/articles", {}, {})
    print(con.getresponse().status)
    i = i + 1
    print(i)