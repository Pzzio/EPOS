import http.client
import http.cookies
import time



h = []
cookies = []
for i in range(1, 51):
    h.append( http.client.HTTPConnection('localhost:8081'))
i = 0

for con in h:

    con.request("GET", "/articles",{},{"Cookie":(str("SSID = 111")+str(i))})

    print(con.getresponse().status)

    con.request("GET", "/articles",{},{"Cookie":(str("SSID = 111")+str(i))})

    print(con.getresponse().status)


    i = i+1
    print(i)


for con in h:

    # con.request("GET", "/articles",{},{"Cookie":(str("SSID = 111")+str(i))})
    con.request("GET", "/articles", {}, {})
    print(con.getresponse().status)
    i = i+1
    print(i)


time.sleep(40)

i = 0

for con in h:

    con.request("GET", "/articles",{},{"Cookie":(str("SSID = 111")+str(i))})
    print(con.getresponse().status)
    i = i+1
    print(i)

