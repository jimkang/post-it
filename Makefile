clean-test-archive:
	rm -rf tests/test-archive/media
	rm -rf tests/test-archive/meta
	rm -rf tests/test-archive/rss
	rm -rf tests/test-archive/*html

test: clean-test-archive
	node tests/integration/post-it-tests.js

pushall:
	git push origin master && npm publish

prettier:
	prettier --single-quote --write "**/*.js"
