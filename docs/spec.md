UA3 Spec
========

UA3 presents a simple HTTP interface for reading and posting messages.

All calls return JSON and must be authenticated with HTTP authentication.

## GET /folders
Subscribed folders with unread messages

## GET /folders/subscribed
Subscribed folders (both unread and read)

## GET /folders/all
All folders you can access

## GET /folder/XYZ
Details of folder XYZ

## POST /folder/XYZ/subscribe
Subscribe to folder XYZ

## GET /messages/XYZ
Unread messages in folder XYZ

## GET /messages/XYZ/all
All messages in folder XYZ

## GET /message/XYZ
You recieve:
        { "subject": "W", "body": "X", "folderid": "Y", "parentid": "Z" }

Details of message XYZ

## POST /folder/XYZ
You send:
        { "subject": "A", "toid": "B", "body": "C" }
You recieve:
        { "messageid": "D" }

Create a message in folder XYZ.

## POST /message/XYZ
You send:
        { "body": "C" }
You recieve:
        { "messageid": "D" }

Reply to message XYZ. To and subject default to the message you are replying to.