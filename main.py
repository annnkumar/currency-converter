import os
import sys
import subprocess
from flask import Flask

app = Flask(__name__)

# Start Node.js server as a subprocess
node_process = None

@app.route('/')
def index():
    return "Node.js server is running. Please access the actual application at this URL."

if __name__ == "__main__":
    # This won't be called by Gunicorn, but useful for direct execution
    app.run(debug=True, host="0.0.0.0", port=5000)
    
# Start Node.js server when this module is loaded by Gunicorn
print("Starting Node.js server...")
node_process = subprocess.Popen(["node", "server.js"], stdout=subprocess.PIPE, stderr=subprocess.STDOUT)

# Forward Node.js output to Python stdout
for line in iter(node_process.stdout.readline, b''):
    sys.stdout.write(line.decode('utf-8'))