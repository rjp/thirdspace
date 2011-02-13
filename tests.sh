redisport=9736
missing=$(git submodule status | grep -c '^-')
if [ $missing -gt 0 ]; then
    echo git submodules need sorting >> /dev/null
    git submodule init >> /dev/null
    git submodule update >> /dev/null
fi

redis-server testconfig &
sleep 2
(redis-cli -p $redisport monitor > redis.log) &
redis-cli -p $redisport < testdata >/dev/null
:>testrun.log
env redisport=$redisport node loaddata.js >> testrun.log
redis-cli -p $redisport echo "----- tests start here -----"
env redisport=$redisport /usr/bin/time ./run-tests 2>&1 | tee results.html >> testrun.log
result=$?
echo shutdown | redis-cli -p $redisport >/dev/null
# this strips the colouring because it confuses integrity
if [ $result -gt 0 ]; then sed -e 's/[^m]*m//g' < testrun.log; fi
exit $result
