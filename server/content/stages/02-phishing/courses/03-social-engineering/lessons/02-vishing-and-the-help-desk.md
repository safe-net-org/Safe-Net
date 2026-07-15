---
order: 2
title: "Vishing and the Help-Desk Attack"
objectives:
  - "Explain why a phone call can defeat security that email filters and passwords cannot."
  - "Describe the help-desk reset attack: impersonate an employee, get a factor reset, walk in."
  - "Recognise the defensive habit -- verify the caller through a channel they did not choose."
tasks:
  - type: SINGLE_CHOICE
    title: "Why the Phone Works"
    question: "Why can a phone call succeed where a phishing email might be filtered or ignored?"
    difficulty: EASY
    points: 10
    explanation: "A live voice adds real-time pressure, authority, and rapport that a static email can't. There is no spam filter on a phone call, and a person put on the spot tends to help."
    options:
      - text: "A live voice applies real-time pressure and rapport, with no spam filter in the way"
        isCorrect: true
      - text: "Phones cannot be traced at all"
        isCorrect: false
      - text: "Email is always more dangerous than a call"
        isCorrect: false
      - text: "Calls are automatically trusted by company policy"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: the human on the line improvises, pressures, and builds trust in a way a filter never sees."
        - "Caller ID is trivially spoofed, but 'untraceable' is not the reason the attack works -- the manipulation is."
        - "Neither channel is inherently worse; the point is that voice adds pressure email lacks."
        - "No such policy exists; the attacker manufactures the trust, they are not granted it."

  - type: SINGLE_CHOICE
    title: "The Reset Attack"
    question: "An attacker calls the IT help desk pretending to be an employee who is locked out. What is the prize they are usually after?"
    difficulty: EASY
    points: 10
    explanation: "A password or, more valuably, a reset of the second factor (MFA). Reset the factor, and the attacker's own device becomes the trusted one -- they log in as the employee."
    options:
      - text: "A password or MFA reset that makes the attacker's device the trusted one"
        isCorrect: true
      - text: "The help-desk worker's home address"
        isCorrect: false
      - text: "A refund to a gift card"
        isCorrect: false
      - text: "The company's stock price"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: resetting the second factor hands the attacker a working login, bypassing the password entirely."
        - "Not the goal -- the target is access to the account, granted by the reset."
        - "That is a consumer-scam ending; the help-desk attack aims at corporate account access."
        - "Public information; the attack is about getting inside, not reading a stock ticker."

  - type: MULTI_CHOICE
    title: "Signs of a Pretext Call"
    question: "Which of these, together, should make a help-desk worker slow down and verify?"
    difficulty: MEDIUM
    points: 15
    explanation: "Urgency, a request to reset or bypass a security control, pressure not to follow the normal process, and reluctance to verify identity are the fingerprints of a pretext call."
    options:
      - text: "Urgency -- \"I have a meeting in two minutes\""
        isCorrect: true
      - text: "A request to reset or bypass MFA"
        isCorrect: true
      - text: "Pushback when asked to verify identity the normal way"
        isCorrect: true
      - text: "The caller knows the company's public website address"
        isCorrect: false
      - text: "The call comes during business hours"
        isCorrect: false
      - text: "The caller readily gives their employee ID when asked"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: manufactured time pressure is designed to skip the verification step."
        - "Correct: the whole attack turns on getting a security control lifted."
        - "Correct: a genuine employee expects to prove who they are; resistance is the tell."
        - "Excluded: public information proves nothing -- anyone can read the website."
        - "Excluded: legitimate calls happen during business hours too; timing alone means nothing."
        - "Excluded: cooperating with verification is what a real employee does -- it is reassuring, not a red flag."

  - type: SHORT_ANSWER
    title: "The One Defence"
    question: "In two or three words: to defeat a pretext call, verify the caller through a channel they did NOT ______."
    difficulty: MEDIUM
    points: 15
    explanation: "Verify through a channel the caller did not choose -- call back the number in the employee directory, not one they gave you. The attacker controls the channel they picked."
    correctAnswer: "choose"
    meta:
      acceptedAnswers:
        - "choose"
        - "pick"
        - "select"
        - "control"

  - type: SINGLE_CHOICE
    title: "Verifying Out of Band"
    question: "A caller claims to be a senior manager and needs an urgent MFA reset. What is the correct response?"
    difficulty: HARD
    points: 20
    explanation: "Call the manager back on the number in the company directory, not one the caller provided. Verifying through a channel the caller does not control removes their ability to keep impersonating."
    options:
      - text: "Call them back on the number in the company directory to confirm"
        isCorrect: true
      - text: "Reset it immediately -- they sound senior and it's urgent"
        isCorrect: false
      - text: "Ask them to confirm the company's public address"
        isCorrect: false
      - text: "Reset it but send a warning email afterwards"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: an out-of-band callback the attacker did not choose is the control that breaks the pretext."
        - "Seniority and urgency are the levers being pulled; obeying them is exactly the mistake."
        - "Public information proves nothing -- it is not identity verification."
        - "The damage is done at reset; a warning afterwards is too late to stop the login."

  - type: SINGLE_CHOICE
    title: "When It Works at Scale"
    question: "In the 2023 casino attacks, how did the intrusion reportedly begin?"
    difficulty: HARD
    points: 20
    explanation: "With a phone call to the IT help desk. Attackers impersonated employees, got credentials or MFA reset, and used that foothold to deploy ransomware -- no software exploit needed to get in."
    options:
      - text: "A phone call to the IT help desk impersonating an employee"
        isCorrect: true
      - text: "A zero-day exploit in the casino's firewall"
        isCorrect: false
      - text: "A USB stick left in the car park"
        isCorrect: false
      - text: "Guessing the CEO's password"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: the entry point was social, not technical -- a help-desk call that led to a factor reset."
        - "No firewall zero-day was needed; the humans were the way in."
        - "Baiting with USBs is a real technique, but not how these intrusions reportedly started."
        - "No password was guessed; it was reset by a help desk that trusted the caller."
---

## The channel with no filter

Every defence in this stage so far has assumed the attack arrives as text -- an
email, a message, a link. But the oldest social-engineering channel is a voice on
the phone, and it sidesteps the tools built for text entirely. There is no spam
filter on a phone call. There is a live human who can improvise, apply pressure,
build rapport, and adjust to your hesitation in real time. **Vishing** -- voice
phishing -- works precisely because a person put on the spot, by someone who sounds
authoritative and in a hurry, tends to help.

Caller ID does not save you: the number a call appears to come from is trivially
spoofed, so "it showed our internal number" proves nothing. The manipulation, not
the technology, is the attack.

## The help-desk reset

The most damaging corporate version targets the **IT help desk** -- the team whose
entire job is to help locked-out employees. The attacker calls, impersonates an
employee, and manufactures urgency: "I'm about to present to the board and I'm
locked out." The prize is not the password itself but a **reset of the second
factor**. If the help desk resets MFA, the attacker enrols *their own* device as
the trusted one and simply logs in. The password barely matters; the reset handed
them a working session.

The signs cluster: urgency, a request to reset or bypass a security control,
pressure to skip the normal process, and reluctance to verify identity properly. A
real employee expects to prove who they are. Resistance to that is the tell.

## The one habit that breaks it {#case}

The defence is a single reflex: **verify the caller through a channel they did not
choose.** Do not trust the number they called from or one they give you. Call back
the number in the employee directory. The attacker controls the channel they
picked; an out-of-band callback removes their ability to keep impersonating,
because the real person answers -- or does not.

> **Real case -- the 2023 casino attacks.**
> Two of the largest casino operators in the world were hit within weeks of each
> other by a group that reportedly began each intrusion with a **phone call to the
> IT help desk**, impersonating an employee to get credentials or an MFA reset.
> That foothold led to ransomware. One company's disruption was estimated in the
> hundreds of millions of dollars ([Reuters](https://www.reuters.com/technology/mgm-caesars-attacked-by-same-group-cyber-experts-say-2023-09-14/)).

No firewall was breached and no password was cracked. A help desk trusted a caller.
The most sophisticated security stack in the building was walked around by a phone
call -- which is why the out-of-band callback is not bureaucratic friction, it is
the control that actually holds.
