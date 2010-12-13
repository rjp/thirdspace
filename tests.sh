if [ ! -f testdata.rdb ]; then
    echo "making initial test database"
    redis-server testconfig &
    redis-cli -p 9736 < testdata
    mv testjunknull.rdb testdata.rdb
fi

# copy our fixed set of test data into place and start redis
cp -f testdata.rdb testjunknull.rdb
redis-server testconfig &
env redisport=9736 ./run-tests
env redisport=9736 ./run-tests-html > ua3ci.html
# only useful on tegenaria
if [ -f ~/Dropbox/Public ]; then
    cp ua3ci.html ~/Dropbox/Public/
fi
echo shutdown | redis-cli -p 9736
