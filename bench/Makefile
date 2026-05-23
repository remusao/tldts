
all: run

requests.json:
	curl https://cdn.cliqz.com/adblocking/requests_top500.json.gz | gunzip > requests.json

run: requests.json
	NODE_ENV=production node benchmark.js

allocations: requests.json
	NODE_ENV=production node --expose-gc --predictable allocations.js

bench-all: run allocations
