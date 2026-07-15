---
order: 2
title: "Analyzing Phishing Emails"
objectives:
  - "Apply a four-step check -- sender address, links, grammar, logical plausibility -- before trusting an unexpected email."
  - "Explain why hovering over a link is safer than clicking it to verify a destination."
  - "Explain how a single convincing email turned into an account-wide compromise in the 2017 Google Docs worm."
tasks:
  - type: SINGLE_CHOICE
    title: "Checking Links"
    question: "What is the correct way to check a link in an email?"
    difficulty: EASY
    points: 10
    explanation: "Hovering over a link shows the real URL at the bottom of your browser. There's no need to click it -- that can be dangerous."
    options:
      - text: "Click the link and see where it goes"
        isCorrect: false
      - text: "Hover over the link and check the URL at the bottom"
        isCorrect: true
      - text: "Paste the link into Google"
        isCorrect: false
      - text: "Ask your friends"
        isCorrect: false
    meta:
      optionRationale:
        - "Clicking first means you've already visited whatever the destination is, defeating the point of checking."
        - "Correct: hovering reveals the real address without exposing you to it."
        - "Searching the link's text doesn't reveal what the link itself actually points to."
        - "Friends aren't a verification method, and asking wastes the narrow window before you'd otherwise act."

  - type: SINGLE_CHOICE
    title: "Reading a Fake Bank Email"
    question: "\"Dear customer! Your card has been blocked. Follow this link and confirm your details.\" Which detail here is the clearest tell?"
    difficulty: EASY
    points: 10
    explanation: "A real bank that has your account addresses you by name -- \"Dear customer\" is what a scam template defaults to when the sender doesn't actually know who you are."
    options:
      - text: "The message mentions a blocked card at all"
        isCorrect: false
      - text: "It addresses you as \"customer\" instead of by name"
        isCorrect: true
      - text: "It uses the word \"Dear\""
        isCorrect: false
      - text: "It's formatted with an exclamation point"
        isCorrect: false
    meta:
      optionRationale:
        - "Banks do sometimes contact you about card issues -- the topic alone isn't the tell."
        - "Correct: an institution that has your account on file would use your actual name."
        - "\"Dear\" is a normal salutation used in both legitimate and fake mail."
        - "Punctuation style says nothing about legitimacy."

  - type: MULTI_CHOICE
    title: "Fake Tax Refund"
    question: "\"You're entitled to a $500 tax refund. Enter your card details to receive the transfer.\" Select every reason this is phishing."
    difficulty: MEDIUM
    points: 15
    explanation: "Real tax authorities don't request card details by email, and refunds are processed through your existing account on file, not a new one you type in over email -- both are structural tells, independent of the specific dollar amount used."
    options:
      - text: "Tax authorities don't request card details over email"
        isCorrect: true
      - text: "Refunds are processed through your account on file, not entered via email"
        isCorrect: true
      - text: "The amount mentioned ($500) is unrealistic for any refund"
        isCorrect: false
      - text: "Government agencies never send email at all"
        isCorrect: false
      - text: "The email uses the word \"refund\""
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: this is a structural fact about how tax authorities actually operate, regardless of wording."
        - "Correct: legitimate refunds don't require you to newly submit payment details by email."
        - "There's nothing inherently unrealistic about that specific figure -- the mechanism is the tell, not the amount."
        - "Government agencies do send legitimate email; the false premise here is what they'd ask you to do in one."
        - "Real refund notifications do use that word -- it's the requested action, not the vocabulary, that's the problem."

  - type: SHORT_ANSWER
    title: "The Fake Security Team"
    question: "\"Your account has been hacked! Urgently change your password via this link.\" Besides urgency, what should you do INSTEAD of clicking that link to change your password? (one word: where you should go)"
    difficulty: MEDIUM
    points: 15
    correctAnswer: "site"
    explanation: "Passwords should only ever be changed by navigating directly to the official site yourself -- typed in or opened from a bookmark -- never through a link supplied by the message claiming there's a problem."
    meta:
      acceptedAnswers:
        - "site"
        - "website"
        - "official site"
        - "the official website"

  - type: SINGLE_CHOICE
    title: "The Logic Check"
    question: "You get a shipping notification for a package. What's the single fastest logic check to apply before clicking anything?"
    difficulty: HARD
    points: 15
    explanation: "The fastest, most reliable check doesn't require any technical skill: did you actually order something that matches this? If not, the email's entire premise is false, regardless of how convincing the rest of it looks."
    options:
      - text: "Check whether the email's font matches the courier's brand"
        isCorrect: false
      - text: "Ask whether you ordered anything that this could plausibly be about"
        isCorrect: true
      - text: "Check how many other people got the same email"
        isCorrect: false
      - text: "Check whether the email arrived during business hours"
        isCorrect: false
    meta:
      optionRationale:
        - "Fonts and branding are trivial for an attacker to copy convincingly."
        - "Correct: if you didn't order anything, the entire premise is already false -- no further analysis needed."
        - "You have no way to know this, and it wouldn't tell you anything useful if you did."
        - "Automated phishing sends around the clock; timing carries no signal."

  - type: SINGLE_CHOICE
    title: "How One Click Became a Million"
    question: "In the 2017 Google Docs phishing worm, what made it spread so fast compared to an ordinary phishing email?"
    difficulty: HARD
    points: 20
    explanation: "The malicious app requested account permissions rather than a password, and once granted, it automatically emailed the same lure to the victim's entire contact list from their real account -- turning every successful click into a new, trusted-looking wave of the same attack."
    options:
      - text: "It used an unusually large, one-time bulk email blast"
        isCorrect: false
      - text: "Granting the fake app permission let it auto-send the same lure to the victim's own contacts"
        isCorrect: true
      - text: "It exploited a flaw in Gmail's spam filter specifically"
        isCorrect: false
      - text: "It was spread only through paid advertising"
        isCorrect: false
    meta:
      optionRationale:
        - "The initial wave was ordinary in size -- the growth came from what happened after someone clicked, not the first blast."
        - "Correct: this self-propagation through real contact lists is exactly what made it a worm rather than a one-shot campaign."
        - "The mechanism was OAuth permission abuse, not a spam filter bypass."
        - "There was no advertising involved -- it spread entirely through compromised accounts emailing real contacts."
---

## How to Check an Email

**Step 1: Check the sender's address.** Hover over the sender's name -- a real Amazon email comes from @amazon.com, not @amazonsupport.tk. **Step 2: Analyze links.** Hover over the link, don't click it. The real address appears at the bottom of your browser; if it says "Log in to PayPal" but the link goes to a strange domain, it's phishing. **Step 3: Check the grammar.** Banks and large companies proofread their text carefully -- errors are a sign of scammers. **Step 4: Think logically.** If you didn't order a package, why would you get a notification? If you never signed up on a site, why would it email you?

## Phishing Examples

**A fake bank:** "Dear customer! Your card has been blocked. Follow this link and confirm your details." The bank addresses you as "customer," not by name, and banks don't ask you to confirm details via a link. **A fake tax office:** "You're entitled to a $500 tax refund. Enter your card details to receive the transfer." Tax offices don't request card details, and refunds go through your account on file. **A fake security team:** "Your account has been hacked! Urgently change your password via this link." This creates panic and urgency -- passwords should only be changed on the official site, typed in directly, never through a supplied link.

## Real-world case: the email that emailed itself {#case}

On May 3, 2017, a wave of emails went out inviting people to open a shared "Google Docs" document -- sent from real people's actual, already-compromised Google accounts, which is exactly what made it convincing. Clicking through led to a genuine Google permissions screen asking to let a fake app called "Google Docs" read and send email and manage contacts on the victim's behalf. Anyone who approved it had unknowingly handed over exactly that access, and the fake app immediately used it to email the same invitation to every one of that person's contacts, from their real account ([Auth0's technical writeup](https://auth0.com/blog/all-you-need-to-know-about-the-google-docs-phishing-attack/), [CNN](https://money.cnn.com/2017/05/03/technology/google-docs-phishing-attack/index.html)). Google said about 0.1% of Gmail users -- roughly one million people -- received the emails before the company revoked the fake app's access about an hour after the first message went out.

Nobody's password was stolen in this attack; the entire mechanism ran on a permissions grant, not a login form, which is why "check the sender" alone wouldn't have caught it -- the sender really was your contact. The additional check that would have: pausing on an unexpected permissions request, the same instinct as pausing on an unexpected link.
