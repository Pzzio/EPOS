import http.client
import http.cookies
import time

# Testinhalt:
# es wird getestet das erst 50 request gemacht werden die ersten 25 werden mit dem selben cookeis ein 2. Request durchgeführt
# direckt darauf wird versucht 50 weitere einzufügen
# nach 40s wird nochmal versucht 50 weitere durchzuführen
# jedes mit einem anderen cookie

# erwartet:
# die ersten 50 kommen durch die nächsten 50 nicht
# die letzten 50 wieder (da nur eine anfrage ist die Lebensdauer der cookies nur 30s)


# Ergebnis:
# BESTANDEN


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

    con.request("GET", "/articles",{},{"Cookie":(str("SSID = 111")+str(i))})
    print(con.getresponse().status)
    i = i+1
    print(i)





for con in h1:
    con.request("GET", "/articles",{},{"Cookie":(str("SSID = 111")+str(i))})
    print(con.getresponse().status)
    i = i+1
    print(i)
for con in h2:
    con.request("GET", "/articles", {}, {"Cookie": (str("SSID = 111") + str(i))})
    print(con.getresponse().status)
    i = i + 1
    print(i)

time.sleep(40)

for con in h1:
    con.request("GET", "/articles",{},{"Cookie":(str("SSID = 111")+str(i))})
    print(con.getresponse().status)
    i = i+1
    print(i)
for con in h2:
    con.request("GET", "/articles", {}, {"Cookie": (str("SSID = 111") + str(i))})
    print(con.getresponse().status)
    i = i + 1
    print(i)