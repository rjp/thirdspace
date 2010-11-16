UA3 Spec
========

UA3 presents a simple HTTP interface for reading and posting messages.

All calls return JSON and must be authenticated with HTTP authentication.

Message Functions
-----------------

## GET /folders
subscribed folders

## GET /folders/unread
subscribed folders with unread messages

## GET /folders/all
all folders

## GET /folder/XYZ
details of folder XYZ  POST /folder/XYZ/subscribe  subscribe to folder XYZ

## GET /messages/XYZ
get all messages in folder XYZ

## GET /messages/XYZ/unread
get all unread messages in folder XYZ

## GET /message/1234
get a single message

## POST /message
{ subject: X, body: Y, replyid: ID }

post a message. New thread in folder if ID is a folder, follow up if ID is a message (mw: is having one field change purpose depending on context a stupid thing?)

User Functions
--------------
