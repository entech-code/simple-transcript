# Chrome Web Store Listing - Simple Transcript

## Title
Simple Transcript – Copy & Save for Google Meet

## Summary (132 chars max)
A transcript of your Google Meet call with speaker names. Copy it or save it as a text file. Everything stays in your browser.

## Description

Simple Transcript turns Google Meet's own captions into a transcript, with each line under the name of the person who said it. Copy it or save it as a text file, during the call or afterwards. No bot joins your call, no audio is recorded, and nothing leaves your browser.

HOW IT WORKS

1. Join a Google Meet call. The extension turns on Meet's captions for you and starts the transcript.
2. A small panel on the Meet page shows each line as it is spoken, with the speaker's name and the time.
3. Copy the transcript or download it as a text file, during the call or later.

WHAT YOU GET

- Speaker names on every line, as Google Meet shows them
- Plain text that pastes cleanly into email, chat and documents: the meeting's name, date and attendees at the top, then the conversation
- Your past meetings, each kept with its title, date, length and attendees: open one from the toolbar icon to read, copy, save or delete it
- Sensible file names, such as "Weekly planning - 2026-10-08 10-02 - Transcript.txt"
- Meetings titled with their calendar event's name; a call without a title is saved under the names of the people you met with
- Any language Google Meet can caption: the transcript follows the caption language you choose in Meet
- Chat messages from the meeting, saved in the transcript and marked as chat
- Rejoin a call within ten minutes and the transcript continues in the same meeting
- A panel you can move and resize, or hide with the toolbar icon; it keeps transcribing while hidden
- A call that ended with nothing said in it is removed, so joining the wrong call by mistake leaves nothing behind

PRIVATE BY DESIGN

Your transcripts are stored in your own browser, on your own computer. There is no account and no server of ours: the extension talks to no site other than Google Meet. No audio or video is recorded; the text comes from the captions Google Meet already produces.

It asks only for what it needs: access to meet.google.com, storage for your meetings, and a timer to close a meeting after its tab is closed.

GOOD TO KNOW

- A transcript includes what other people say. Tell the people you meet with, and make sure you have any consent the law requires where you and they are.
- The transcript is as accurate as Google Meet's captions.
- Simple Transcript is not made by or affiliated with Google. Google Meet is a trademark of Google LLC.

SUPPORT

Questions and problems: https://entech-code.github.io/simple-transcript/support.html

## URLs

- Homepage: https://entech-code.github.io/simple-transcript/
- Support: https://entech-code.github.io/simple-transcript/support.html
- Privacy policy: https://entech-code.github.io/simple-transcript/privacy.html
- Support email: support@entechsolutions.com

## Privacy practices form

Answers for the "Privacy practices" tab of the developer dashboard.

### Single purpose

Simple Transcript has one purpose: to turn the captions of the Google Meet call you are in into a transcript with speaker names, which you can read, copy or save as a text file.

### Permission justifications

**Host permission: `https://meet.google.com/*`**

The extension works only on Google Meet. It needs access to Meet pages to read the captions, chat messages and participant names of the call the user is in, to turn captions on, and to show the transcript panel on the page. It also uses this access to tell a Meet tab from any other tab, so that the toolbar icon shows the panel on Meet and the list of saved meetings elsewhere. It requests no other site.

**`storage`**

To save the user's meetings (transcript, title, date, attendees) and a few settings, such as the panel's position, in the browser's local storage, so that past meetings can be read, copied, downloaded or deleted later. Nothing is stored anywhere else.

**`alarms`**

To end a meeting a short while after its Meet tab has been closed. A timer inside the service worker would be lost when Chrome puts the worker to sleep, leaving the meeting marked as in progress; an alarm still fires.

### Remote code

No. All code is in the extension package. It loads and runs no code from elsewhere.

### Data usage

What the extension handles: the text of the call's captions and chat, the participants' display names (including the user's), and the meeting's title, code and times. All of it is read from the Google Meet page the user has open, kept in the browser's local storage on the user's computer, and never sent to Entech Solutions or anyone else.

Types of data to tick, if the form is answered on the basis of what the extension handles:

- Personally identifiable information: participants' names
- Personal communications: the transcript and chat messages
- Website content: text read from the Google Meet page

Leave the others unticked: health, financial and payment, authentication, location, web history, user activity.

Certifications (tick all three):

- I do not sell or transfer user data to third parties, outside of the approved use cases
- I do not use or transfer user data for purposes that are unrelated to my item's single purpose
- I do not use or transfer user data to determine creditworthiness or for lending purposes

Privacy policy URL: https://entech-code.github.io/simple-transcript/privacy.html

## Category
Productivity > Communication

## Language
English (United States)
