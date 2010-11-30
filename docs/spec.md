*This document is intended for guidance only and the functionality described in no way represents a binding contract. Details are subject to alteration and correction without notice.*

UA3 Spec
========

UA3 presents a simple HTTP interface for reading and posting messages, wholists and other functions.

All content is in JSON format (Content-Type: application/xml+ua3). Requests must be authenticated with HTTP authentication (see detailed spec for exceptions). Following a successful authentication attempt the server will return the "ua3session" cookie - you may use this cookie in lieu of the username / password combination for subsequent requests.

## Some conventions

** JSON uses case sensitive keys, onetwothree is NOT the same as OneTwoThree **

Where a value appears in quotes it represents a string. Where a value does not appear in quotes it represents a number or a boolean (true|false).

Users and folders are keyed by lower-cased name. Names are case insensitive in this context but mixed case is still supported in the actual definition, so

        POST /folder/private
        
        { to:"techno", "body":"bingle" }

will be seen by Techno in Private but creating a new folder called "private" is not possible.

## GET /folders

All folders you can access. This is the default, you can also use /folders/all explicitly.

You receive:
        { "folders": [
            { "name":"General", "unread":1, "count":6 },
            { "name":"UA", "count":5 },
            { "name":"New-Confs", "unread":3, "count":4 },
            ...
          ]
        }

Count is all the messages in a folder. Unread is zero if not present *(always include it? - techno)*.

## GET /folders/subscribed

Subscribed folders (both read and unread).

You receive:
        { "folders": [
            { "name":"General", "unread":1, "count":6 },
            { "name":"UA", "count":5 },
            ...
          ]
        }

## GET /folders/unread

Subscribed folders (unread only).

You receive:

        { "folders": [
            { "name":"General", "unread":1, "count":6 },
            ...
          ]
        }

Because unread implies subscribed you can do /all/unread to remove the filter.

## POST /folder/XYZ/subscribe

Subscribe to folder XYZ

You send:

        { "name":"A" }

You receive:

        { "name":"A" }

## POST /folder/XYZ/unsubscribe

Unsubscribe from folder XYZ

You send:

        { "name":"A" }

You receive:

        { "name":"A" }

## GET /folder/XYZ

All messages in folder XYZ without bodies. This is the default, you can also use /folder/XYZ/all explicitly.

You receive:

        { "folder":"UA-Dev", "count":20, "unread":10,
          "messages": [
            { "id":2000874, "epoch":1289914330, "from":"Isvara", "subject":"DNS", "read":true },
            { "id":2000881, "epoch":1289914759, "from":"BW", "to":"Isvara", "subject":"DNS", "inReplyTo":2000874 },
            { "id":2000887, "epoch":1289914963, "from":"isoma", "to":"BW", "subject":"DNS", "inReplyTo":2000881 },
            ...
          ]
        }

inReplyTo contains the message ID of the immediate parent.

## GET /folder/XYZ/unread

Unread messages in folder XYZ without bodies.

You receive:

        { "folder":"UA-Dev", "count":20, "unread":10,
          "messages": [
            { "id":2000881, "epoch":1289914759, "from":"BW", "to":"Isvara", "subject":"DNS", "inReplyTo":2000874 },
            { "id":2000887, "epoch":1289914963, "from":"isoma", "to":"BW", "subject":"DNS", "inReplyTo":2000881 },
            ...
          ]
        }

## GET /folder/XYZ/full

All messages in folder XYZ with bodies.

        { "folder":"UA-Dev", "count":20, "unread":10,
          "messages": [
            { "id":2000874, "epoch":1289914330, "from":"Isvara", "subject":"DNS", "read":true, "body":"Is it broken? It seems very slow." },
            { "id":2000881, "epoch":1289914759, "from":"BW", "to":"Isvara", "subject":"DNS", "inReplyTo":2000874, "body":"Hmmm, yes. One of the server's two nameservers is down." },
            { "id":2000887, "epoch":1289914963, "from":"isoma", "to":"BW", "subject":"DNS", "inReplyTo":2000881, "body":"Install unbound locally? It's very light on memory." },
            ...
          ]
        }

You can combine the above filters - /unread/full *(should the order matter? - techno)*

## POST /folder/XYZ

Create a message in folder XYZ.

You send:

        { "subject":"foo", "to":"techno", "body":"bar baa" }

You receive:

        { "id":"12345", "folder":"test1", "epoch":"1234567890", "thread":"23456" }

Thread is an autosequenced ID.

## GET /message/XYZ

Get single message XYZ.

You receive:

        { "id":2000881, "epoch":1289914759, "from":"BW", "to":"Isvara", "subject":"DNS", "inReplyTo":2000874, "folder":"UA-Dev", "body":"Hmmm, yes. One of the server's two nameservers is down." }

## POST /message/XYZ

Create a message in reply to message XYZ. 

You send, minimally:

        { "body":"B" }

Or maximally, if you want to change to and/or subject:

        { "subject":"foo", "to":"techno", "body":"bar baa" }

You receive:

        { "id":"12346", "folder":"test1", "epoch":"1234567890", "thread":"23456" }

to, subject, and thread default to the ones in XYZ. Note that any update to thread will be ignored.

## GET /system

Details about the system.

You receive:

        { "banner":"Hello, this is UA" }

You can use this request without authentication.