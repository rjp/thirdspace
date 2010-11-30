*This document is intended for guidance only and in no way represents a binding contract of functionality. Details are subject to alteration and correction without notice.*

UA3 Spec
========

UA3 presents a simple HTTP interface for reading and posting messages.

All content is in JSON format (specifically MIME type application/xml+ua3) and must be authenticated with HTTP authentication (the only exception to this is GET /system/banner). Following a successful authentication attempt the server will return the "ua3session" cookie - you may use this cookie in lieu of the username / password combination for subsequent requests.

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

All messages in folder XYZ without bodies

You receive:

        {
          "message": { "id": "I1", "subject": "S1", "from": "F1", "to": "T1", "epoch":"E1", "folder":"C1" },
          "message": { "id": "I2", "subject": "S2", "from": "F2", "to": "T2", "epoch":"E2", "folder":"C2" },
          ...
        }

## GET /folder/XYZ/all/full

        {
          "message": { "id": "I1", "subject": "S1", "from": "F1", "to": "T1", "epoch":"E1", "folder":"C1", "body": "B1" },
          "message": { "id": "I2", "subject": "S2", "from": "F2", "to": "T2", "epoch":"E2", "folder":"C2", "body": "B2" },
          ...
        }

## GET /folder/XYZ/unread

Unread messages in folder XYZ without bodies.

You receive:

        {
          "message": { "id": "I1", "subject": "S1", "from": "F1", "to": "T1", "epoch": "E1", "folder": "C1", "thread": "X1" },
          "message": { "id": "I2", "subject": "S2", "from": "F2", "to": "T2", "epoch": "E2", "folder": "C2", "thread": "X2" },
          ...
        }

## GET /folder/XYZ/unread/full

        {
          "message": { "id": "I1", "subject": "S1", "from": "F1", "to": "T1", "epoch": "E1", "folder":"C1", "body": "B1", "thread": "X1" },
          "message": { "id": "I2", "subject": "S2", "from": "F2", "to": "T2", "epoch": "E2", "folder":"C2", "body": "B2", "thread": "X2" },
          ...
        }

## GET /message/XYZ

Details of message XYZ.

You receive:

        { "subject": "S", "body": "B", "folder": "C", "inReplyTo":"P", "epoch":"E", "thread":"X" }

inReplyTo contains the message ID of the parent.

## POST /folder/XYZ

Create a message in folder XYZ.

You send:

        { "subject": "S", "to": "T", "body": "B" }

You receive:

        { "messageId": "I", "folder": "C", "epoch": "E", "thread": "X" }

## POST /message/XYZ

Create a message in reply to message XYZ. 

You send, minimally,

        { "body": "B" }

Or maximally, if you want to change to and/or subject,

        { "body": "B", "to": "T", "subject": "S" }

You receive:

        { "messageId": "I", "epoch": "E", "folder": "C", "thread": "X" }

to, subject, and thread default to the ones in XYZ. Note that any update to thread will be ignored.
