UA3 spec
--------

UA3 presents a simple HTTP interface for reading and posting messages.

All calls return JSON and must be authenticated with HTTP Authentication.

Reading messages
================

GET /folders             subscribed folders

GET /folders/unread      subscribed folders with unread messages

GET /folder/XYZ          details of folder XYZ

GET /message/1234        get a single message

GET /messages            get all unread messages

POST /folder/XYZ/join    subscribe to folder XYZ

POST /folder/XYZ/add     post a message
{ subject: X, body: Y, replyto: ID }
