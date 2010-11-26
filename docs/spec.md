UA3 Spec
========

UA3 presents a simple HTTP interface for reading and posting messages.

All calls accept and return JSON and must be authenticated with HTTP authentication. 

## Some conventions

Users and folders are keyed by lower-cased name. Names are case insensitive in this context but mixed case is still supported in the actual definition, so

        POST /folder/private
        
        { to:"techno", "body": "bingle" }

will be seen by Techno in Private but creating a new folder called "private" is not possible.

** It's also worth noting that JSON itself uses case sensitive keys **

## GET /folders

All folders you can access.

You receive:
        {
          "folder": {
            "name": "B", "unread": "C"
          },
          "folder": {
            "name": "E", "unread": "F",
          }
        }

This will be a flat structure.

## GET /folders/subscribed

Subscribed folders (both read and unread).

You recieve:
        { 
          "folder": { 
            "name": "B", "unread": "C" 
          }, 
          "folder": { 
            "name": "E"
          } 
        }

This will be a flat structure.

## GET /folders/unread

Subscribed folders (unread only).

You receive:

        { 
          "folder": { 
            "name": "B", "unread": "C" 
          }, 
          "folder": { 
            "name": "E", "unread": "F" 
          } 
        }

This will be a flat structure.

## GET /folder/XYZ

Details of folder XYZ

You recieve:

        { "name": "B", "unread": "C", "messages": "D" }

Messages is the total count (read and unread).

## POST /folder/XYZ/subscribe

Subscribe to folder XYZ

You send:

        { "name": "A" }

You recieve:

        { "name": "A" }

## POST /folder/XYZ/unsubscribe

Unsubscribe from folder XYZ

You send:

        { "name": "A" }

You recieve:

        { "name": "A" }

## GET /messages/XYZ

All messages in folder XYZ.

You receive:
        {
          "message": {
            "id": "A", "subject": "B", "from": "C", "to": "D", "body": "E"
          }
          "message": {
            "id": "K", "subject": "L", "from": "M", "to": "N", "body": "O"
          }
        }

This is a flat structure.

## GET /messages/XYZ/unread

Unread messages in folder XYZ.

You receive:

        {
          "message": { "id": "A", "subject": "B", "from": "C", "to": "D", "body": "E" },
          "message": { "id": "F", "subject": "G", "from": "H", "to": "I", "body": "J" }
        }

This will be a flat structure.

## GET /message/XYZ

Details of message XYZ.

You recieve:
        { "subject": "A", "body": "B", "folder": "C", "inReplyTo":"D" }

inReplyTo contains the message ID of the parent.

## POST /folder/XYZ

Create a message in folder XYZ.

You send:

        { "subject": "A", "to": "B", "body": "C" }

You recieve:

        { "messageId": "D" }

## POST /message/XYZ

Create a message in reply to message XYZ. 

You send:

        { "body": "A" }

You receive:

        { "messageId": "B" }

To and subject default to the ones in XYZ.

