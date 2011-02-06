redisport=6379
#redisport=9736
missing=$(git submodule status | grep -c '^-')
if [ $missing -gt 0 ]; then
    echo git submodules need sorting >> /dev/null
    git submodule init >> /dev/null
    git submodule update >> /dev/null
fi

#redis-server testconfig &
sleep 2
redis-cli -p $redisport < testdata >/dev/null
:>testrun.log
env redisport=$redisport node loaddata.js >> testrun.log
env redisport=$redisport ./run-tests 2>&1 > testrun.log
result=$?
#echo shutdown | redis-cli -p $redisport >/dev/null
# this strips the colouring because it confuses integrity
if [ $result -gt 0 ]; then sed -e 's/[^m]*m//g' < testrun.log; fi
exit $result
