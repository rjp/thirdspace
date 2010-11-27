UA3 Spec
========

UA3 presents a simple HTTP interface for reading and posting messages.

All calls accept and return JSON and must be authenticated with HTTP authentication. 

## Some conventions

** JSON uses case sensitive keys, messageid is NOT the same as messageId **

Users and folders are keyed by lower-cased name. Names are case insensitive in this context but mixed case is still supported in the actual definition, so

        POST /folder/private
        
        { to:"techno", "body": "bingle" }

will be seen by Techno in Private but creating a new folder called "private" is not possible.

## GET /folders

All folders you can access.

You receive:
        {
          "folder": { "name": "B", "unread": "C" },
          "folder": { "name": "E", "unread": "F" },
          ...
        }

## GET /folders/subscribed

Subscribed folders (both read and unread).

You receive:
        { 
          "folder": { "name": "B", "unread": "C" }, 
          "folder": { "name": "E" },
          ...
        }

## GET /folders/unread

Subscribed folders (unread only).

You receive:

        { 
          "folder": { "name": "B", "unread": "C" }, 
          "folder": { "name": "E", "unread": "F" },
          ...
        }

## GET /folder/XYZ

Details of folder XYZ

You receive:

        { "name": "B", "unread": "C", "messages": "D" }

Messages is the total count (read and unread).

## POST /folder/XYZ/subscribe

Subscribe to folder XYZ

You send:

        { "name": "A" }

You receive:

        { "name": "A" }

## POST /folder/XYZ/unsubscribe

Unsubscribe from folder XYZ

You send:

        { "name": "A" }

You receive:

        { "name": "A" }

## GET /folder/XYZ/all

All messages in folder XYZ.

You receive:

        {
          "message": { "id": "A", "subject": "B", "from": "C", "to": "D", "body": "E", "epoch":"F", "folder":"G" },
          "message": { "id": "F", "subject": "G", "from": "H", "to": "I", "body": "J", "epoch":"K", "folder":"L" },
          ...
        }

## GET /folder/XYZ/unread

Unread messages in folder XYZ.

You receive:

        {
          "message": { "id": "A", "subject": "B", "from": "C", "to": "D", "body": "E", "epoch":"F", "folder":"G" },
          "message": { "id": "F", "subject": "G", "from": "H", "to": "I", "body": "J", "epoch":"K", "folder":"L" },
          ...
        }

## POST /folder/XYZ

Create a message in folder XYZ.

You send:

        { "subject": "A", "to": "B", "body": "C" }

You receive:

        { "messageId": "D", "folder":"E", "epoch":"F" }

## GET /message/XYZ

Details of message XYZ.

You receive:

        { "subject": "A", "body": "B", "folder": "C", "inReplyTo":"D", "epoch":"E", "folder":"F" }

inReplyTo contains the message ID of the parent.

## POST /message/XYZ

Create a message in reply to message XYZ. 

You send:

        { "body": "A" }

You receive:

        { "messageId": "B", "epoch":"C", "folder":"D" }

To and subject default to the ones in XYZ.
