# Serve the game at http://localhost:8000
run port="8000":
    python3 -m http.server {{port}}

# Run the jsdom tests, installing jsdom on the first run
test:
    cd tests && (test -d node_modules || npm install --silent) && npm test --silent

# Rewrite tests/snapshot.txt after an intended change to the screens
snapshot:
    cd tests && UPDATE=1 node snapshot.test.js
