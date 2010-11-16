UA3 Spec
========

UA3 presents a simple HTTP interface for reading and posting messages.

All calls return JSON and must be authenticated with HTTP authentication.

## GET /folders
Subscribed folders with unread messages

## GET /folders/subscribed
Subscribed folders (unread or not)

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
Details of message XYZ
You recieve:
        { "subject": "W", "body": "X", "folderid": "Y", "parentid": "Z" }

## POST /message
You send:
        { "subject": "W", "body": "X", "parentid": "Y" }
You recieve:
        { "messageid": "Z" }

Create a new message. New thread if Y is a folder, follow up if Y is a message (mw: is having one field change purpose depending on context stupid?)