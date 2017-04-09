import http.client
import http.cookies
import time

# Testinhalt:
# es wird getestet das erst 50 request gemacht werden   direckt darauf noch mal 50
# nach 40s wird nochmal versucht 50 weitere durchzuführen
# jedes mit einem anderen cookie

# erwartet:
# die ersten 50 kommen durch die nächsten 50 nicht
# die letzten 50 wieder (da nur eine anfrage ist die Lebensdauer der cookies nur 30s)


# Ergebnis:
# BESTANDEN


h = []
cookies = []
for i in range(1, 51):
    h.append( http.client.HTTPConnection('localhost:8081'))
i = 0

for con in h:

    # con.request("GET", "/articles",{},{"Cookie":(str("SSID = 111")+str(i))})
    con.request("GET", "/articles", {},{})
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


for con in h:

    # con.request("GET", "/articles",{},{"Cookie":(str("SSID = 111")+str(i))})
    con.request("GET", "/articles", {}, {})
    print(con.getresponse().status)
    i = i+1
    print(i)

