UA3 Spec
========

UA3 presents a simple HTTP interface for reading and posting messages.

All calls return JSON and must be authenticated with HTTP authentication.

## GET /folders

Subscribed folders with unread messages.

You recieve:
        { "folder": { "id":"A", "name":"B", "unread":"C" } "folder": { "id":"D", "name":"E", "unread":"F" } }

This will always be a flat structure.

## GET /folders/subscribed
Subscribed folders (both unread and read).

You recieve:
        { "folder": { "id":"A", "name":"B", "unread":"C" } "folder": { "id":"D", "name":"E"} } }

This will always be a flat structure.

## GET /folders/all

All folders you can access.

You recieve:
        { "folder": { "id":"A", "name":"B", "unread":"C" } "folder": { "id":"D", "name":"E", "unread":"F" "folder": { "id":"G", "name":"H" } }

This may be a tree structure.

## GET /folder/XYZ
Details of folder XYZ

You recieve:
        { "id":"A", "name":"B", "unread":"C" }

## POST /folder/XYZ/subscribe
Subscribe to folder XYZ

## GET /messages/XYZ
Unread messages in folder XYZ.

You recieve:
        { "message": { "id":"A", "subject":"B", "from":"C", "to":"D", "body":"E" } "message": { "id":"F", "subject":"G", "from":"H", "to":"I", "body":"J" } }

This will be a flat structure.

## GET /messages/XYZ/all

All messages in folder XYZ.

        { "message": { "id":"A", "subject":"B", "from":"C", "to":"D", "body":"E" "message": { "id":"F", "subject":"G", "from":"H", "to":"I", "body":"J" } } }

This may be a tree structure.

## GET /message/XYZ
You recieve:
        { "subject": "A", "body": "B", "folderid": "C", "parentid": "D" }

Details of message XYZ.

## POST /folder/XYZ

Create a message in folder XYZ.

You send:
        { "subject": "A", "toid": "B", "body": "C" }
You recieve:
        { "messageid": "D" }

## POST /message/XYZ

Reply to message XYZ. 

You send:
        { "body": "A" }
You recieve:
        { "messageid": "B" }

To and subject default to the message you are plying to.