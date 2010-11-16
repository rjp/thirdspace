UA3 Spec
========

UA3 presents a simple HTTP interface for reading and posting messages.

All calls return JSON and must be authenticated with HTTP authentication.

## GET /folders

All folders you can access.

You recieve:
        {
          "folder": {
            "id":"A", "name":"B", "unread":"C"
          },
          "folder": {
            "id":"D", "name":"E", "unread":"F",
            "folder": {
              "id":"G", "name":"H"
            }
          }
        }

This may be a tree structure.

## GET /folders/subscribed

Subscribed folders (both unread and read).

You recieve:
        { "folder": { "id":"A", "name":"B", "unread":"C" }, "folder": { "id":"D", "name":"E"} } }

This will always be a flat structure.

## GET /folders/unread

Subscribed folders with unread messages.

You recieve:
        { "folder": { "id":"A", "name":"B", "unread":"C" }, "folder": { "id":"D", "name":"E", "unread":"F" } }

This will always be a flat structure.

## GET /folder/XYZ

Details of folder XYZ

You recieve:
        { "id":"A", "name":"B", "unread":"C" }

## POST /folder/XYZ/subscribe

Subscribe to folder XYZ

## GET /messages/XYZ

All messages in folder XYZ.

You recieve:
        {
          "message": {
            "id":"A", "subject":"B", "from":"C", "to":"D", "body":"E",
            "message": {
              "id":"F", "subject":"G", "from":"H", "to":"I", "body":"J"
            },
            "message": {
              "id":"K", "subject":"L", "from":"M", "to":"N", "body":"O"
            }
          }
        }

This may be a tree structure.

## GET /messages/XYZ/unread
Unread messages in folder XYZ.

You recieve:
        {
          "message": { "id":"A", "subject":"B", "from":"C", "to":"D", "body":"E" },
          "message": { "id":"F", "subject":"G", "from":"H", "to":"I", "body":"J" }
        }

This will be a flat structure.

## GET /message/XYZ

Details of message XYZ.

You recieve:
        { "subject": "A", "body": "B", "folderid": "C", "parentid": "D" }

## POST /folder/XYZ

Create a message in folder XYZ.

You send:
        { "subject": "A", "toid": "B", "body": "C" }
You recieve:
        { "messageid": "D" }

## POST /message/XYZ

Create a message in reply to message XYZ. 

You send:
        { "body": "A" }
You recieve:
        { "messageid": "B" }

To and subject default to the ones in XYZ.