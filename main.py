import os
import sys
import time
import subprocess
from flask import Flask, send_from_directory

app = Flask(__name__)

# Set up static file serving from the public directory
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_static(path):
    if path == '':
        return send_from_directory('public', 'index.html')
    elif path == 'stats':
        return send_from_directory('public', 'stats.html')
    else:
        # Try to serve the file from public
        try:
            return send_from_directory('public', path)
        except:
            # If file not found, send index.html (for SPA routing)
            return send_from_directory('public', 'index.html')

# API routes
@app.route('/api/<path:endpoint>', methods=['GET', 'POST'])
def api_routes(endpoint):
    # Temporary implementation for demo - normally would call Node.js server
    if endpoint == 'health':
        return {"status": "ok", "message": "Currency converter API is running"}
    elif endpoint in ['conversions', 'stats', 'distribution']:
        # Return empty list for now (since we're using Flask not Node.js)
        return []
    else:
        return {"error": "Unknown endpoint"}, 404

if __name__ == "__main__":
    # This won't be called by Gunicorn, but useful for direct execution
    app.run(debug=True, host="0.0.0.0", port=5000)

# Start Node.js server when this module is loaded by Gunicorn
print("Starting Node.js server in background...")
node_process = subprocess.Popen(["node", "server.js"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
time.sleep(1)  # Give Node.js time to start