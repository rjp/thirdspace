In this doc: MID is a message ID, USER is a username, FOLDER is a foldername, S1 is a subscribed folder

# Messages

    message:MID     JSON dump of the message (headers?)
    mseq            Message ID sequence counter
    body:MID        (potentially) the body of message MID

(rjp: I would be tempted to split off the body of the message from the
headers - it saves a lot of traffic/memory if messages are skipped/ignored.)

# Users

    user:USER       user profile stored as a hash
    user:USER:read  set of message IDs the user has read
    user:USER:subs  set of subscribed foldernames
    user:USER:all   set of all messages USER can see

(techno: Will all be maintained for each user when a message is posted or built when required?)

# Folders

    folder:FOLDER   set of all the message IDs in this folder

# Finding all unread message IDs for USER

    sunionstore user:USER:all folder:S1 folder:S2 ...
    sdiff user:USER:all user:USER:read

# Finding unread message IDs for USER in FOLDER
 
    sdiff folder:FOLDER user:USER:read

