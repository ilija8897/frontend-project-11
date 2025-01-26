install:
	npm ci

publish:
	npm publish --dry-run

lint:
	npx eslint . --fix

format:
	npx prettier --config .prettierrc '.' --write
