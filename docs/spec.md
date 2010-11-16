UA3 Spec
========

UA3 presents a simple HTTP interface for reading and posting messages.

All calls return JSON and must be authenticated with HTTP authentication.

## GET /folders
Subscribed folders

## GET /folders/unread
Subscribed folders with unread messages

## GET /folders/all
All accessible folders

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

## POST /message
  { "subject": "X", "body": "Y", "parentid": "Z" }

Create a new message. New thread if Z is a folder, follow up if Z is a message (mw: is having one field change purpose depending on context stupid?)