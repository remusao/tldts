#!/bin/sh


echo "Reference"
bench 'node noop_test.js'

echo
echo 'tldts-experimental'
bench 'node tldts-experimental_test.js'

echo
echo 'psl'
bench 'node psl_test.js'

echo
echo 'tldjs'
bench 'node tldjs_test.js'

echo
echo 'parse-domain'
bench 'node parse-domain_test.js'

echo
echo 'tldts'
bench 'node tldts_test.js'


echo
echo 'ublock'
bench 'node ublock_psl_test.js'

echo
echo 'haraka'
bench 'node haraka_test.js'
