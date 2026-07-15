---
order: 1
title: "Breaking Down Real Cases"
objectives:
  - "Walk through a realistic phishing email line by line and identify each individual red flag."
  - "Explain how a one-word slip in an internal reply turned a suspicious email into a successful, real-world breach."
  - "State the two independent checks -- hovering a link, calling a number you already trust -- that would have stopped the case in this lesson."
tasks:
  - type: SINGLE_CHOICE
    title: "Analyzing Phishing"
    question: "Which domain is definitely NOT phishing for a bank called \"YourBank\"?"
    difficulty: EASY
    points: 10
    explanation: "online.yourbank.com is the bank's official subdomain. The others use hyphens and unusual arrangements designed to look plausible at a glance."
    options:
      - text: "yourbank-secure.com"
        isCorrect: false
      - text: "online.yourbank.com"
        isCorrect: true
      - text: "your-bank.com"
        isCorrect: false
      - text: "yourbank.online.com"
        isCorrect: false
    meta:
      optionRationale:
        - "A hyphenated add-on to the brand name is a common lookalike pattern, not the real domain."
        - "Correct: this is a genuine subdomain of the actual yourbank.com."
        - "Inserting a hyphen between the two words creates a different, unrelated domain."
        - "Here \"yourbank\" is demoted to a subdomain of online.com -- the real domain is online.com, not yourbank.com."

  - type: SINGLE_CHOICE
    title: "Why the Greeting Matters Here"
    question: "The fake bank email below claims a specific $500 transaction was flagged, but greets you with \"Dear customer.\" Why is that combination suspicious?"
    difficulty: EASY
    points: 10
    explanation: "A bank that genuinely detected a specific transaction on your account already has your name attached to that account -- there's no reason for a real alert about your own activity to address you generically."
    options:
      - text: "\"Dear customer\" is grammatically incorrect"
        isCorrect: false
      - text: "A bank that flagged a transaction on your specific account already has your name on file"
        isCorrect: true
      - text: "Banks never use the word \"dear\""
        isCorrect: false
      - text: "It's simply too polite for a bank"
        isCorrect: false
    meta:
      optionRationale:
        - "The phrase is grammatically fine -- the issue is what it implies about whether the sender actually has your account."
        - "Correct: specificity about your account paired with a generic greeting is an internal contradiction."
        - "\"Dear\" is a completely normal, common salutation in legitimate correspondence."
        - "Politeness carries no information about legitimacy either way."

  - type: MULTI_CHOICE
    title: "Red Flags in a Real Spear-Phishing Email"
    question: "A 2016 email impersonated a Google security alert about a suspicious sign-in. Select every genuine red flag it contained."
    difficulty: MEDIUM
    points: 15
    explanation: "A shortened link masking the real destination, and a fake login page collecting the very credentials the \"alert\" claimed to protect, are both real red flags. Using the recipient's real name and referencing account security are both normal in legitimate alerts too, and arriving on a weekday is not a signal either way."
    options:
      - text: "A security alert used a shortened bit.ly link instead of a real Google domain"
        isCorrect: true
      - text: "The link led to a fake login page asking for the same Gmail credentials the alert was supposedly about"
        isCorrect: true
      - text: "The email was addressed to the recipient by their real name"
        isCorrect: false
      - text: "The email mentioned account security at all"
        isCorrect: false
      - text: "It arrived on a weekday"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: a genuine Google alert links to a google.com domain, not a shortened, destination-hidden link."
        - "Correct: asking you to \"secure your account\" by re-entering the password that same page is stealing is the actual attack."
        - "Spear phishing specifically uses a real name to look more convincing -- this by itself isn't the tell here."
        - "Real security alerts do exist and are routine; the topic alone says nothing."
        - "Timing carries no diagnostic value for phishing."

  - type: SHORT_ANSWER
    title: "The One-Word Slip"
    question: "In the 2016 case, an IT staffer meant to describe the email as \"illegitimate\" but a one-word slip in their reply instead called it something else. What word did they actually type?"
    difficulty: MEDIUM
    points: 15
    correctAnswer: "legitimate"
    explanation: "The reply reportedly said the email was \"legitimate\" -- the opposite of what was intended -- and that single word was enough for staff to forward the credential-harvesting link onward as safe to click."
    meta:
      acceptedAnswers:
        - "legitimate"

  - type: SINGLE_CHOICE
    title: "The Check That Doesn't Depend on Anyone Else's Reply"
    question: "Given the internal miscommunication in this case, what single check would have caught the problem regardless of what IT staff wrote back?"
    difficulty: HARD
    points: 15
    explanation: "Hovering over the shortened link to see it didn't resolve to an actual Google domain is a check any individual recipient could do themselves, independent of whatever an internal reply said."
    options:
      - text: "Using a longer Gmail password"
        isCorrect: false
      - text: "Hovering over the shortened link to see it didn't lead to an actual Google domain"
        isCorrect: true
      - text: "Switching to a different email provider entirely"
        isCorrect: false
      - text: "Ignoring every security alert as a precaution"
        isCorrect: false
    meta:
      optionRationale:
        - "Password length has no bearing on whether you click a malicious link."
        - "Correct: this single, individual check doesn't depend on anyone else's judgment or reply."
        - "The provider wasn't the point of failure -- the human decision to click was."
        - "Ignoring all alerts means missing the real ones too -- overcorrection isn't a fix."

  - type: SINGLE_CHOICE
    title: "What Both Cases Have in Common"
    question: "The fictional bank email and the real 2016 case in this lesson share what underlying structure?"
    difficulty: HARD
    points: 15
    explanation: "Both rely on a spoofed trusted identity (a bank; Google) paired with a link to a convincing but fake action page -- the specific target and stakes differ, but the mechanism is identical."
    options:
      - text: "Both used a malicious file attachment"
        isCorrect: false
      - text: "Both used a spoofed trusted identity plus a link to a fake but convincing action page"
        isCorrect: true
      - text: "Both specifically targeted senior company executives"
        isCorrect: false
      - text: "Both were caught before any real damage occurred"
        isCorrect: false
    meta:
      optionRationale:
        - "Neither case used an attachment -- both relied entirely on a link."
        - "Correct: this is the shared mechanism underneath two very different-looking messages."
        - "The bank case targets an ordinary customer, not an executive -- the technique isn't limited to high-value targets."
        - "The real case succeeded -- the account was actually compromised, which is exactly why it's the more instructive of the two."
---

## Case 1: A Fake Bank

**Email received:** Subject: "Urgent! Confirm your transaction." From: security@yourbank-online.com. "Dear customer! A suspicious transaction of $500 has been detected. If this wasn't you, follow this link and cancel the transaction: http://your-bank.com.secure-check.com/cancel. You have 2 hours."

**Analysis:** the domain secure-check.com isn't the actual bank at all -- "your-bank.com" is just a subdomain dressing it up. The message manufactures panic and a deadline, and it addresses you as "customer" rather than by name, despite claiming to already know about a specific transaction on your account. A correct domain would look like yourbank.com or online.yourbank.com -- not a lookalike hanging off an unrelated domain.

## Real-world case: the phishing email that leaked a campaign {#case}

On March 19, 2016, a spear-phishing email designed to look like a Google security alert arrived in the inbox of a U.S. presidential campaign's chairman, John Podesta, warning that someone had used his password and urging him to change it immediately ([CNN](https://www.cnn.com/2016/10/28/politics/phishing-email-hack-john-podesta-hillary-clinton-wikileaks/index.html), [CBS News](https://www.cbsnews.com/news/the-phishing-email-that-hacked-the-account-of-john-podesta/)). The "change your password" link was a shortened bit.ly URL, not an actual Google address, and it led to a fake login page built to harvest exactly the Gmail credentials the email claimed to be protecting.

The email was actually flagged and sent to IT before anyone clicked it -- the process worked, up to a point. A staff member meant to reply that it was "illegitimate," typed "legitimate" instead, and that single word was enough for the campaign's cybersecurity team to treat a textbook phishing email as safe. The credentials were entered, the account was compromised, and the leaked contents became a major story in their own right -- a separate matter from the mechanism that got the attacker in, which is what this lesson focuses on.

## What Both Cases Share

Different targets, wildly different stakes, and the exact same shape: a trusted name attached to a link that doesn't go where it claims, wrapped in urgency designed to shorten how long anyone looks at it. The fake bank email is stopped by the same two checks that would have stopped the real one -- hover the link before trusting it, and verify anything sensitive through a channel you already trust, not one the message hands you.

Neither case required the target to be careless in any general sense. Both required one specific moment of not applying a check that, in hindsight, took only seconds -- which is exactly why this lesson treats "breaking down a case" as a repeatable skill rather than a one-time warning: the goal isn't to remember these two stories, it's to be able to run the same two checks automatically on the next message, regardless of who it appears to be from.
