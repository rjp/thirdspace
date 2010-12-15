redis-server testconfig &
sleep 2
redis-cli -p 9736 < testdata >/dev/null
env redisport=9736 ./run-tests
echo shutdown | redis-cli -p 9736
