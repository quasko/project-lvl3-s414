install:
	npm install
build: 
	rm -rf dist
	NODE_ENV=production npx webpack
develop: 
	npx webpack-dev-server
publish:
	npm publish
lint:
	npx eslint .
test:
	npm test