In this doc: MID is a message ID, USER is a username, FOLDER is a foldername, S1 is a subscribed folder

# Messages

    message:MID     JSON dump of the message (headers?)
    mseq            Message ID sequence counter
    body:MID        (potentially) the body of message MID

(rjp: I would be tempted to split off the body of the message from the
headers - it saves a lot of traffic/memory if messages are skipped/ignored.)

rjp: Storing messages as hashes rather than JSON is starting to look sensible - removes a lot of parsing and lets us do sorting inside redis rather than fetching all messages, parsing each one, then sorting, then turning them back into JSON. redis can sort a list or set by reference to a related hash field. Which gives us:

    message:MID     redis hash of the message

Then, to get a sorted list of the messages in folder F, 
    
    SORT folder:F BY message:*->epoch # by time
    SORT folder:F BY message:*->thread # by thread
    SORT folder:F BY message:*->from # by poster

If we store a JSON representation of the message headers in a hash field, we can retrieve that in sorted order,

    SORT folder:F BY message:*->epoch GET message:*->json # headers from folder by time

This probably obviates the need for ZSET folders mentioned below.

# Users

    user:USER       user profile stored as a hash
    user:USER:read  set of message IDs the user has read
    user:USER:subs  set of subscribed foldernames
    user:USER:all   set of all messages USER can see

(techno: Will all be maintained for each user when a message is posted or built when required?)
(rjp: temporarily built as required)

# Folders

    folder:FOLDER   set of all the message IDs in this folder

# Finding all unread message IDs for USER

    smembers user:USER:subs => turn into list of folder:S1 keys
    sunionstore user:USER:all folder:S1 folder:S2 ...
    sdiff user:USER:all user:USER:read => returns unread messages

# Finding unread message IDs for USER in FOLDER
 
    sdiff folder:FOLDER user:USER:read

# ZSET folders

ZSET folders with the score being the epoch of posting or reading would be handy - you get a date-sorted list for free making date-range queries (expiry is one operation: ZREMBYSCORE, "new messages since last-login", etc.) trivial. Unfortunately, there's no ZDIFF in the mainline redis tree. Might be an idea to use a parallel zfolder:FOLDER 
