#!/bin/bash

if hash python3.6 2>/dev/null; then
    echo "is present"
    cd "$(dirname "$0")"/Server/application_server
    python3.6 app.py
else
    echo "command python3.6 not found"
    echo "Please install Python 3.6!"
fi

