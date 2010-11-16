UA3 Spec
========

UA3 presents a simple HTTP interface for reading and posting messages.

All calls return JSON and must be authenticated with HTTP authentication.

## GET /folders
You recieve:
        { "folder": { "id":"A", "name":"B", "unread":"C" } "folder": { "id":"D", "name":"E", "unread":"F" } }

Subscribed folders with unread messages

## GET /folders/subscribed
You recieve:
        { "folder": { "id":"A", "name":"B", "unread":"C" } "folder": { "id":"D", "name":"E", "unread":"F" } }

Subscribed folders (both unread and read)

## GET /folders/all
You recieve:
        { "folder": { "id":"A", "name":"B", "unread":"C" } "folder": { "id":"D", "name":"E", "unread":"F" } }

All folders you can access

## GET /folder/XYZ
You recieve:
        { "id":"A", "name":"B", "unread":"C" }

Details of folder XYZ

## POST /folder/XYZ/subscribe
Subscribe to folder XYZ

## GET /messages/XYZ
You recieve:
        { "message": { "id":"A", "subject":"B", "from":"C", "to":"D", "body":"E" "message": { "id":"F", "subject":"G", "from":"H", "to":"I", "body":"J" } } }

Unread messages in folder XYZ

## GET /messages/XYZ/all
        { "message": { "id":"A", "subject":"B", "from":"C", "to":"D", "body":"E" "message": { "id":"F", "subject":"G", "from":"H", "to":"I", "body":"J" } } }

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
        { "body": "A" }
You recieve:
        { "messageid": "B" }

Reply to message XYZ. To and subject default to the message you are replying to.