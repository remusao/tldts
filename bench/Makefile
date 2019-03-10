
all: run

requests.json:
	curl https://cdn.cliqz.com/adblocking/requests_top500.json.gz | gunzip > requests.json

run: requests.json
	NODE_ENV=production node benchmark.js
