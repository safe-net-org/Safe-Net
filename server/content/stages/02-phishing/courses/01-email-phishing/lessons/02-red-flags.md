---
order: 2
title: "Red Flags at a Glance"
objectives:
  - "Rapidly distinguish real red-flag patterns -- sender domain tricks, urgency framing, mismatched links -- without needing to fully read a message."
  - "Apply the same checklist from the previous lesson to a different brand and scenario than its Microsoft example."
  - "Explain why a brand's popularity makes it a bigger phishing target, not a smaller one."
tasks:
  - type: SINGLE_CHOICE
    title: "Five-Second Triage"
    question: "Which of these sender addresses can you flag as suspicious without reading the message body at all?"
    difficulty: EASY
    points: 10
    explanation: "amaz0n-delivery.net substitutes a zero for the letter o and isn't a domain Amazon owns -- that's visible before reading a single word of the message. The other three are unremarkable, ordinary sender addresses."
    options:
      - text: "order-update@amaz0n-delivery.net"
        isCorrect: true
      - text: "support@amazon.com"
        isCorrect: false
      - text: "no-reply@yourbank.com, from a bank you actually use"
        isCorrect: false
      - text: "newsletter@a-store-you-subscribed-to.com"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: the digit-for-letter swap and unfamiliar domain are visible instantly, before any content is read."
        - "This is exactly what Amazon's real support domain looks like -- nothing to flag."
        - "An expected sender you actually have a relationship with is not a red flag by itself."
        - "A subscription you actually signed up for emailing its own domain is routine."

  - type: MULTI_CHOICE
    title: "Patterns That Actually Matter"
    question: "Which of these are genuine red-flag patterns worth checking in any message, regardless of brand?"
    difficulty: MEDIUM
    points: 15
    explanation: "Lookalike characters in a domain, a mismatch between link text and destination, and manufactured urgency are all real, checkable patterns. A logo, HTML formatting, and an unsubscribe link are all present in ordinary legitimate email and carry no signal on their own."
    options:
      - text: "Lookalike or substituted characters in a domain name"
        isCorrect: true
      - text: "A mismatch between what a link says and where it actually points"
        isCorrect: true
      - text: "A countdown or \"act now\" framing"
        isCorrect: true
      - text: "The email contains a company logo image"
        isCorrect: false
      - text: "The email is formatted in HTML rather than plain text"
        isCorrect: false
      - text: "The email includes an unsubscribe link"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: this is checkable in seconds and is one of the most reliable individual signals."
        - "Correct: hovering to compare link text against the real destination catches this directly."
        - "Correct: manufactured urgency exists specifically to shorten how long you look at everything else."
        - "Virtually all commercial email, real or fake, includes a logo."
        - "Nearly all commercial email is HTML-formatted -- this is the norm, not a signal."
        - "Legitimate marketing email is legally required to include one in many jurisdictions -- it's boilerplate, not evidence."

  - type: SHORT_ANSWER
    title: "The Most-Faked Brand"
    question: "Per Check Point's Q4 2025 brand phishing report, which single brand was impersonated in roughly 22% of all brand-phishing attempts -- more than any other?"
    difficulty: MEDIUM
    points: 15
    correctAnswer: "microsoft"
    explanation: "Microsoft topped Check Point's Q4 2025 brand-phishing rankings at 22% of attempts, ahead of Google (13%) and Amazon (9%) -- consistent with it also being the brand used in this course's own simulator example."
    meta:
      acceptedAnswers:
        - "microsoft"

  - type: SINGLE_CHOICE
    title: "Why Popularity Backfires"
    question: "Why does a brand's popularity make it a BIGGER phishing target, not a smaller one?"
    difficulty: HARD
    points: 15
    explanation: "The more often people see a real brand's name and logo, the less consciously they scrutinize it -- familiarity itself lowers the amount of attention a message gets, which is precisely the condition phishing needs to work."
    options:
      - text: "Popular brands generally have weaker security teams"
        isCorrect: false
      - text: "More people instantly recognize and trust the name, so fewer people scrutinize a spoofed version"
        isCorrect: true
      - text: "Popular brands don't use spam filters"
        isCorrect: false
      - text: "Attackers are paid more for impersonating well-known brands"
        isCorrect: false
    meta:
      optionRationale:
        - "Security posture isn't the mechanism here -- attention and familiarity are."
        - "Correct: familiarity reduces scrutiny, and that reduced scrutiny is exactly what gets exploited at scale."
        - "Major brands generally run substantial email security infrastructure -- this isn't the relevant factor."
        - "There's no such payment mechanism; the incentive is simply a larger pool of people who'll recognize the name."

  - type: PHISHING_EMAIL
    title: "Simulator: A Different Brand, Same Pattern"
    question: "Click every part of this email that's a red flag."
    difficulty: HARD
    points: 20
    explanation: "The lookalike domain, the countdown, the generic greeting despite claiming to know your order, and the matching lookalike link all reproduce the exact same structure as the Microsoft example earlier in this course -- proving the pattern, not the brand, is what to watch for."
    meta:
      email:
        displayName: "Amazon.com"
        from: "Amazon Order Support <order-update@amaz0n-delivery-center.net>"
        subject: "We could not deliver your package -- action needed within 24 hours"
        body: |
          Hello,

          We attempted to deliver your package today but were unable to complete delivery.

          Your order will be returned to the sender if you do not confirm your delivery address within 24 hours.

          Confirm now: http://amaz0n-delivery-center.net/confirm-address

          Thank you for shopping with us.

          Amazon Delivery Team
      redFlags:
        - id: "lookalike-domain"
          location: "from"
          span: "amaz0n-delivery-center.net"
          reason: "amaz0n substitutes a zero for the letter o, and delivery-center.net isn't a domain Amazon owns."
        - id: "urgency-deadline"
          location: "subject"
          span: "within 24 hours"
          reason: "A short deadline is designed to rush a decision before you'd otherwise check the sender."
        - id: "generic-greeting"
          location: "body"
          span: "Hello,"
          reason: "Amazon's real order emails address you by name; a generic greeting suggests the sender doesn't actually have your account details."
        - id: "suspicious-link"
          location: "body"
          span: "http://amaz0n-delivery-center.net/confirm-address"
          reason: "The same lookalike domain as the sender, over plain http rather than https."

  - type: MULTI_CHOICE
    title: "After Spotting It"
    question: "You've identified the email above as phishing. Select every appropriate next step."
    difficulty: HARD
    points: 15
    explanation: "Reporting it and checking your real order history directly on Amazon's own site or app both address the actual situation without engaging with anything the email provided. Clicking to \"double check,\" or replying, do the opposite."
    options:
      - text: "Report it using your email client's phishing report option"
        isCorrect: true
      - text: "Open Amazon's site or app directly (not through the email) and check your real orders"
        isCorrect: true
      - text: "Click the link just to see if it looks real"
        isCorrect: false
      - text: "Reply asking them to confirm the order number"
        isCorrect: false
      - text: "Forward it to a friend to ask if it looks legitimate"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: reporting helps your provider block the sender and protects others who got the same message."
        - "Correct: this resolves the actual question -- is a package really pending -- without touching anything the email supplied."
        - "\"Just looking\" still exposes you to tracking, credential harvesting, or malware -- there's no safe way to click to verify."
        - "Replying confirms your address is live and monitored, which is useful information to an attacker, not to you."
        - "A friend's opinion doesn't resolve anything -- it delays the two actions that actually matter: reporting it and checking your real account."
---

## The Five-Second Triage

You don't need to read an entire message to catch most phishing attempts. Three checks cover a large share of real cases, in order of speed: does the sender's domain have an odd substitution or an unfamiliar add-on; does the message create urgency around a deadline you didn't set; and does a link's visible text match where it actually points when you hover over it. Running through these three takes seconds and catches most of what matters before you've read a single sentence of the body.

This isn't about becoming suspicious of everything -- most email is exactly what it claims to be, and treating every message as an attack is its own kind of exhausting overcorrection. The triage is specifically for the subset of messages asking you to act: click something, confirm something, or send something, under some kind of time pressure. Ordinary newsletters and notifications you didn't act on don't need the same scrutiny as a message asking you to do something right now, so the habit costs you almost nothing in day-to-day time once it's automatic.

## Why Familiar Brands Are Actually Riskier

It's tempting to assume a well-known company's name is itself a kind of protection -- that you'd notice if "Amazon" or "Microsoft" were faked. In practice, the opposite is true: the more often you see a real brand's logo and name, the less consciously you evaluate any single instance of it. Recognition becomes automatic, and automatic processing is exactly what a spoofed sender is built to exploit. That's precisely why attackers concentrate on the handful of brands nearly everyone already trusts, rather than obscure ones nobody would recognize anyway.

## Real-world case: the brand most worth faking {#case}

Check Point's phishing brand-impersonation tracking for Q4 2025 found Microsoft was impersonated in about 22% of all brand-phishing attempts it observed -- more than any other company, ahead of Google at 13% and Amazon at 9% ([Check Point Research](https://blog.checkpoint.com/research/microsoft-remains-the-most-imitated-brand-in-phishing-attacks-in-q4-2025/)). The ranking shifts a little quarter to quarter, but the same handful of globally recognized names -- Microsoft, Google, Amazon, Apple, PayPal -- occupy the top of it consistently, for the exact reason described above: broad recognition means broad opportunity.

## Same Checklist, Different Brand

The simulator in this lesson swaps Microsoft for Amazon, but nothing about the underlying checklist changes. If you found yourself checking the sender's domain, the deadline, and the link before reading this sentence, the habit from the previous lesson is already transferring -- which is the actual goal, since the next lookalike email you see in real life won't announce which brand it's borrowing.
