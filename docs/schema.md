In this doc: MID is a message ID, USER is a username, FOLDER is a foldername

# Messages

    message:MID     JSON dump of the message (inc headers)
    mseq            Message ID sequence counter

# Users

    user:USER       user profile stored as a hash
    user:USER:read  set of message IDs the user has read
    user:USER:subs  set of subscribed foldernames
    user:USER:all   set of all messages USER can see

# Folders

    folder:FOLDER   set of all the message IDs in this folder
