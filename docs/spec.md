UA3 Spec
========

UA3 presents a simple HTTP interface for reading and posting messages.

All calls accept and return JSON and must be authenticated with HTTP authentication. The server will return a session cookie which should be used after the first successful request using username / password.

## Some conventions

Users and folders are keyed by name (numeric IDs are maintained for UA2 backwards compatibility but they are deprecated and you should not rely on them forever). Where you previously posted a message using toid:4 you should now use to:techno. Names are case insensitive in this context but mixed case is still supported in the actual definition, so a post request /folder/private to:techno will be seen by Techno in Private but creating a new folder called private is not possible.

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

Subscribed folders (both read and unread).

You recieve:
        { "folder": { "id":"A", "name":"B", "unread":"C" }, "folder": { "id":"D", "name":"E"} } }

This will always be a flat structure.

## GET /folders/unread

Subscribed folders (unread only).

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
        { "subject": "A", "body": "B", "folder": "C", "inReplyTo": "D", "inReplyTo": "E" }

Folder is the name
inReplyTo is a message ID of the parent where D is the parent of XYZ, E is the parent of D.

## POST /folder/XYZ

Create a message in folder XYZ.

You send:
        { "subject": "A", "to": "B", "body": "C" }
You recieve:
        { "messageid": "D" }

## POST /message/XYZ

Create a message in reply to message XYZ. 

You send:
        { "body": "A" }
You recieve:
        { "messageid": "B" }

To and subject default to the ones in XYZ.