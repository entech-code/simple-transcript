// Fills the extension with invented meetings, for taking screenshots without
// showing a real call. Every name and sentence here is made up.
//
// Use a separate Chrome profile: this REPLACES the saved meetings.
//   1. Load the extension unpacked in that profile.
//   2. chrome://extensions -> Simple Transcript -> "service worker" -> Console.
//   3. Paste this whole file and press Enter. The extension reloads itself.
// To run it where meetings already exist, type `demoForce = true` first.
(async () => {
  const stored = (await chrome.storage.local.get('meetings')).meetings ?? {};
  const existing = Object.values(stored).filter((m) => !String(m.id).startsWith('demo-'));
  if (existing.length > 0 && !globalThis.demoForce) {
    console.warn(
      `[demo] This profile has ${existing.length} saved meeting(s), which this script would delete. ` +
      'Nothing was changed. Use a separate Chrome profile, or type `demoForce = true` and paste again.',
    );
    return;
  }

  const ME = 'Dana Whitfield';
  const MIN = 60_000;
  const today = new Date();
  /** A time `workdaysAgo` working days back, at the given hour and minute. */
  const at = (workdaysAgo, hour, minute) => {
    const day = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, minute);
    for (let left = workdaysAgo; left > 0;) {
      day.setDate(day.getDate() - 1);
      if (day.getDay() !== 0 && day.getDay() !== 6) left--;
    }
    return day.getTime();
  };

  // Each line: [speaker, text]. Lines are spread evenly over the meeting.
  const meetings = [
    {
      title: 'Weekly planning', code: 'kxp-mwrd-tzb', start: at(0, 10, 2), minutes: 24,
      people: [ME, 'Marcus Oyelaran', 'Priya Raman'],
      lines: [
        [ME, "Thanks for joining. Let's start with the release, then look at next week."],
        ['Marcus Oyelaran', 'The build went out yesterday afternoon, and all the checks passed.'],
        ['Priya Raman', 'Support has had two questions about the new export, both easy to answer.'],
        [ME, 'Good. Can you add those to the help page so we stop getting them?'],
        ['Priya Raman', 'Yes, I will have that done by Wednesday.'],
        ['Marcus Oyelaran', 'For next week, the search work is the big one. I think it needs four days.'],
        [ME, 'Four days is fine. What do you need from design?'],
        ['Marcus Oyelaran', 'Only the empty state. Everything else follows the list we already have.'],
        ['Priya Raman', 'I can send a draft of the empty state tomorrow morning.'],
        [ME, 'Then we review search on Thursday. Anything blocking anyone?'],
        ['Marcus Oyelaran', 'Nothing from me.'],
        ['Priya Raman', 'Nothing here either.'],
        [ME, "Great. I'll send the notes after this. Thanks, both."],
      ],
    },
    {
      title: 'Q4 roadmap review', code: 'bnd-qsha-wre', start: at(1, 15, 30), minutes: 47,
      people: [ME, 'Marcus Oyelaran', 'Priya Raman', 'Tomás Herrera', 'Aiko Tanaka'],
      lines: [
        ['Tomás Herrera', 'We have three themes for the quarter: search, sharing and reliability.'],
        ['Aiko Tanaka', 'Reliability first, in my view. Two outages last month is two too many.'],
        [ME, 'Agreed. What would it take to get to zero?'],
        ['Aiko Tanaka', 'Better alerts and a second region. About five weeks for both.'],
        ['Marcus Oyelaran', 'Search can run alongside that. It touches different code.'],
        ['Priya Raman', 'Customers ask for sharing more than anything else, though.'],
        ['Tomás Herrera', 'Then sharing starts in November, once reliability has landed.'],
        [ME, "That works. Let's write it up and confirm on Friday."],
      ],
    },
    {
      title: 'All-hands: October', code: 'zvu-hcmb-kse', start: at(1, 10, 0), minutes: 52,
      people: [ME, 'Marcus Oyelaran', 'Priya Raman', 'Tomás Herrera', 'Aiko Tanaka', 'Elena Rossi', 'Samuel Okafor', 'Ingrid Larsen'],
      lines: [
        [ME, 'Welcome, everyone. Three things today: the quarter so far, two new joiners, and questions.'],
        ['Tomás Herrera', 'Revenue is up eleven percent on last quarter, and churn is the lowest we have seen.'],
        ['Samuel Okafor', 'Hello all. I joined support last week, after six years in logistics.'],
        ['Ingrid Larsen', 'And I started in engineering on Monday. Glad to be here.'],
        ['Elena Rossi', 'Will the roadmap be shared before the planning week?'],
        [ME, 'Yes. Tomás will send it on Friday, and we walk through it on Monday.'],
        ['Aiko Tanaka', 'One request: please add your holidays to the calendar before then.'],
        [ME, 'Good point. Thanks, everyone. See you in two weeks.'],
      ],
    },
    {
      title: 'Design sync: onboarding flow', code: 'fdo-yjcn-pqk', start: at(2, 11, 0), minutes: 31,
      people: [ME, 'Priya Raman', 'Aiko Tanaka'],
      lines: [
        ['Priya Raman', 'The new flow is three screens where the old one had seven.'],
        ['Aiko Tanaka', 'Which four did you cut?'],
        ['Priya Raman', 'The tour. People skipped it, so now we show tips where they are needed.'],
        [ME, 'I like that. How do we know it is better?'],
        ['Priya Raman', 'We measure how many people finish setup in their first session.'],
        ['Aiko Tanaka', 'I can have that number on the dashboard by Monday.'],
        [ME, 'Then we ship it to half of new accounts and compare.'],
      ],
    },
    {
      title: 'Customer call: Harbor Supply', code: 'hsu-vbke-cmn', start: at(3, 14, 0), minutes: 38,
      people: [ME, 'Tomás Herrera', 'Elena Rossi'],
      lines: [
        ['Elena Rossi', 'We have about forty people using it now, mostly in operations.'],
        ['Tomás Herrera', 'What is the one thing they ask you for?'],
        ['Elena Rossi', 'Exporting a whole month at once. Today they do it day by day.'],
        [ME, 'That is on our list for this quarter. Would a single file per month work?'],
        ['Elena Rossi', 'A single file would be perfect.'],
        ['Tomás Herrera', 'We can show you a first version in three weeks.'],
        ['Elena Rossi', 'Wonderful. Send me the invitation and I will bring two of the team.'],
      ],
    },
    {
      // No title: shown as "Untitled meeting", and saved as "Meeting with Marcus Oyelaran".
      title: '', code: 'qtr-lpzd-fga', start: at(4, 9, 15), minutes: 12,
      people: [ME, 'Marcus Oyelaran'],
      lines: [
        ['Marcus Oyelaran', 'Quick one: can I take Friday off? I will finish the search review on Thursday.'],
        [ME, 'Of course. Is anything waiting on you for Friday?'],
        ['Marcus Oyelaran', 'Only the release notes, and Priya has offered to cover them.'],
        [ME, 'Then enjoy the long weekend.'],
      ],
    },
    {
      title: 'Hiring: frontend engineer debrief', code: 'wem-xdot-ryu', start: at(5, 16, 0), minutes: 26,
      people: [ME, 'Aiko Tanaka', 'Tomás Herrera'],
      lines: [
        ['Aiko Tanaka', 'Strong on fundamentals. She explained her choices clearly in the exercise.'],
        ['Tomás Herrera', 'I agree. Less experience with testing, but she was honest about it.'],
        [ME, 'Would you both be glad to work with her?'],
        ['Aiko Tanaka', 'Yes, without hesitation.'],
        ['Tomás Herrera', 'Yes.'],
        [ME, "Then let's make the offer this week."],
      ],
    },
  ];

  const saved = {};
  meetings.forEach((m, i) => {
    const id = `demo-${i + 1}`;
    const participants = Object.fromEntries(m.people.map((name, n) => [`@spaces/demo${i + 1}/devices/${n + 1}`, name]));
    const deviceOf = (name) => Object.keys(participants).find((d) => participants[d] === name);
    const step = (m.minutes * MIN) / (m.lines.length + 1);
    saved[id] = {
      id,
      meetingCode: m.code,
      title: m.title,
      description: m.people.join(', '),
      startTime: m.start,
      endTime: m.start + m.minutes * MIN,
      participants,
      selfName: ME,
      entries: m.lines.map(([speaker, text], n) => ({
        id: `${id}-entry-${n + 1}`,
        text,
        speaker,
        timestamp: Math.round(m.start + step * (n + 1)),
        deviceId: deviceOf(speaker),
      })),
    };
  });

  await chrome.storage.local.set({ meetings: saved });
  console.log(`[demo] Saved ${meetings.length} invented meetings. Reloading the extension...`);
  chrome.runtime.reload();
})();
