# Quickstart: Verifying the Removal of the Language Dropdown

How to confirm the feature works once it is implemented. Stored data and messages are described in
[data-model.md](data-model.md).

## Prerequisites

- Node 24, dependencies installed with `npm ci`
- Chrome with the unpacked extension loaded from the project root

## 1. Build and automated checks

```bash
npm run typecheck
npm test
npm run build
```

**Expected**: all three succeed and the same 98 tests pass, with no test changed.

## 2. No language control code left

```bash
git grep -n -i -E "LANGUAGE_CHANGE|LANGUAGE_OBSERVED|language_set|CAPTIONS_ENABLING|wantedLanguage|sentLanguage|UpdateMediaSession|encodeRtcLanguageChange|persistLanguageCode|languageByCode|recentLanguages|lang-select|textFitsLanguage" -- src
```

**Expected**: no output.

## 3. The panel

Join a Meet call and open the floating panel.

**Expected**: no language dropdown. The toolbar shows Copy and Export, laid out cleanly.

## 4. Captions are captured

Speak a few sentences.

**Expected**: captions were turned on automatically, and the sentences appear in the transcript
with your name. With a second participant, their name appears on their lines.

## 5. Meet's language is left alone

1. In Meet's caption settings, choose a language other than English. **Expected**: the transcript
   continues in that language, and the setting stays as chosen for the rest of the call.
2. Leave and rejoin the call. **Expected**: Meet is still set to the language chosen in step 1.
3. If a meeting exists for which the previous build remembered a different language, join it.
   **Expected**: the caption language is whatever Meet has set, not the remembered one.

## 6. No request to set the language

Open DevTools on the Meet tab, go to the Network tab, filter for `UpdateMediaSession`, and repeat
step 5.1.

**Expected**: any such request is one Meet itself sends when you change the setting in its
dialog. None appears at the start of the call or without a change made in Meet.

## 7. A non-Latin language

Set Meet's captions to a language written in another script and speak it.

**Expected**: the transcript shows the text without corruption.

## 8. Documentation

- `README.md` no longer mentions a language selector or "31 languages", and says the transcript
  follows Meet's caption language.
- `README.md` and `.specify/memory/constitution.md` list only the participant-list refresh as a
  request the extension makes to Google Meet.
