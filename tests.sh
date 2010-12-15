missing=$(git submodule status | grep -c '^-')
if [ $missing -gt 0 ]; then
    echo git submodules need sorting
    git submodule init
    git submodule update
fi

redis-server testconfig &
sleep 2
redis-cli -p 9736 < testdata >/dev/null
env redisport=9736 ./run-tests
result=$?
echo shutdown | redis-cli -p 9736
exit $result
