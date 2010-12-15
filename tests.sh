if ! git submodule --quiet status; then
    echo git submodules need sorting
    git submodule init
    git submodule update
fi

redis-server testconfig &
sleep 2
redis-cli -p 9736 < testdata >/dev/null
env redisport=9736 ./run-tests
result=$?
redis-cli -p 9736 < testdata >/dev/null
env redisport=9736 ./run-tests-html > ua3ci.html
# only useful on tegenaria
if [ -d ~/Dropbox/Public/ ]; then
    cp ua3ci.html ~/Dropbox/Public/
fi
echo shutdown | redis-cli -p 9736
exit $result
