import http.client
import http.cookies
import time

# Testinhalt:
# es wird getestet das erst 50 request gemacht werden dann mit dem selben 50 Cookies wird direckt nochmal ein request durchgeführt
# direckt darauf noch mal 50
# nach 40s wird nochmal versucht 50 weitere durchzuführen


# erwartet:
# die ersten 50 kommen durch, die 50 mit den selben cookies auch. die nächsten 50 nicht
# die letzten 50 auch wieder nicht (durch die 2. anfrage ist die Lebensdauer der Cookies 600s)


# Ergebnis:
# BESTANDEN

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


for con in h:

    # con.request("GET", "/articles",{},{"Cookie":(str("SSID = 111")+str(i))})
    con.request("GET", "/articles", {}, {})
    print(con.getresponse().status)
    i = i+1
    print(i)

