*This document is intended for guidance only and the functionality described in no way represents a binding contract. Details are subject to alteration and correction without notice.*

UA3 Spec
========

UA3 presents a simple HTTP interface for reading and posting messages, wholists and other functions.

All content is in JSON format (Content-Type: application/json). Requests must be authenticated with HTTP authentication.

Successful calls will get a 200 status code. Anything else will get a 500 and an error message returned as JSON.

## Some conventions

** JSON uses case sensitive keys, onetwothree is NOT the same as OneTwoThree **

Where a value appears in quotes it represents a string. Where a value does not appear in quotes it represents a number or a boolean (true|false).

Users and folders are keyed by lower-cased name with non-alphanums convert to underscores. Data sent to the server must be in this format. Names and folders can be displayed in whatever mixed-case is required.

        POST /folder/private
        
        { to:"techno", "body":"bingle" }

will be seen by Techno in Private but creating a new folder called "private" is not possible.

## GET /folders &#x2713;

All folders you can access.

You receive a list:

        [
          { "folder":"General", "unread":1, "count":6, "subcribed":true },
          { "folder":"UA", "count":5, "subcribed":false },
          { "folder":"New-Confs", "unread":3, "count":4, "subcribed":true },
          ...
        ]

Count is all the non-expired messages in a folder. Count and Unread will always be present, even if 0.

## GET /folders/subscribed &#x2713;

Identical to /folders but restricted to subscribed folders.

## GET /folders/unread &#x2713;

Identical to /folders but restricted to subscribed folders with unread messages.

You can remove the implied filter by using GET /folders/all+unread &#x2713;

## POST /folder/XYZ/subscribe &#x2713;

Subscribe to folder XYZ

You send:

        { "folder":"A" }

You receive:

        { "folder":"A" }

## POST /folder/XYZ/unsubscribe &#x2713;

Unsubscribe from folder XYZ

You send:

        { "folder":"A" }

You receive:

        { "folder":"A" }

## GET /folder/XYZ &#x2713;

All messages in folder XYZ without bodies. 

You receive a list:

        [
          { "folder":"UA-Dev", "id":2000874, "epoch":1289914330, "from":"Isvara", "subject":"DNS", "read":true },
          { "folder":"UA-Dev", "id":2000881, "epoch":1289914759, "from":"BW", "to":"Isvara", "subject":"DNS", "inReplyTo":2000874 },
          { "folder":"UA-Dev", "id":2000887, "epoch":1289914963, "from":"isoma", "to":"BW", "subject":"DNS", "inReplyTo":2000881 },
          ...
        ]

inReplyTo contains the message ID of the immediate parent.

## GET /folder/XYZ/unread

Unread messages in folder XYZ without bodies. Same response format as /folder/XYZ.

## GET /folder/XYZ/full

All non-expired messages in folder XYZ with bodies.

## POST /folder/XYZ &#x2713;

Create a message in folder XYZ.

You send:

        { "subject":"foo", "to":"techno", "body":"bar baa" }

You receive:

        { "id":"12345", "folder":"test1", "epoch":"1234567890", "thread":"23456" }

Thread is an autosequenced ID.

## GET /message/XYZ &#x2713;

Get single message XYZ.

You receive:

        { "folder":"UA-Dev", "id":2000881, "epoch":1289914759, "from":"BW", "to":"Isvara", "subject":"DNS", "inReplyTo":2000874, "body":"Hmmm, yes. One of the server's two nameservers is down." }

## POST /message/XYZ &#x2713;

Create a message in reply to message XYZ. 

You send, minimally:

        { "body":"B" }

Or maximally:

        { "folder":"test1", "subject":"foo", "to":"techno", "body":"bar baa" }

You receive:

        { "id":"12346", "folder":"test1", "epoch":"1234567890", "thread":"23456" }

to and subject default to the ones in XYZ. Attempts to change thread will be ignored.

## POST /message/read

Mark message(s) as read.

You send a list:

        [ 123, 456, 789 ]

You receive:

        { "count":3 }

count is the number of messages marked as read.
*(what about "stay caught up"? - techno)*

## POST /message/unread

Mark message(s) as unread. Same format as /read.

## GET /thread/XYZ &#x2713;

Get messages in thread XYZ without bodies. Same response format as /folder/XYZ.

## GET /thread/XYZ/full &#x2713;

Get messages in thread XYZ with bodies. Same return format as /folder/XYZ.

## POST /thread/XYZ/read

Mark all messages in thread(s) as read.

You send a list:

        [ 1001, 1002, 1003 ]

You receive:

        { "count":20 }

count is the number of messages marked as read.
*(what about "stay caught up"? - techno)*

## POST /thread/unread

Mark all messages thread(s) as unread. Same format as /read.

## GET /system

Details about the system. It will not include a banner.

You recieve:

{ epoc:1289914330 }

Epoc is the current server time.

## GET /users/online

You receive a list:

        [
          { "user":"Techno", "epoch":1289914330, "hostname":"one.two.com", "location":"The Two Place" },
          { "user":"rjp", "epoch":1289914330, "hostname":"four.two.com", "location":"The Two Place" },
          ...
        ]

epoc is the time at which the most recent request was made.
