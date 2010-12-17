missing=$(git submodule status | grep -c '^-')
if [ $missing -gt 0 ]; then
    echo git submodules need sorting >> /dev/null
    git submodule init >> /dev/null
    git submodule update >> /dev/null
fi

redis-server testconfig &
sleep 2
redis-cli -p 9736 < testdata >/dev/null
env redisport=9736 node loaddata.js >> testrun.log
env redisport=9736 ./run-tests > testrun.log
result=$?
echo shutdown | redis-cli -p 9736 >/dev/null
# this strips the colouring because it confuses integrity
if [ $result -gt 0 ]; then sed -e 's/[^m]*m//g' < testrun.log; fi
exit $result
