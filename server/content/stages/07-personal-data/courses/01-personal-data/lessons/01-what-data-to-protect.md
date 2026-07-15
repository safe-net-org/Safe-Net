---
order: 1
title: "What Data to Protect"
objectives:
  - "Distinguish data that should never be posted publicly -- ID numbers, card details, passwords -- from data that merely warrants caution, like date of birth or workplace."
  - "Explain concretely what an attacker can do with a name, date of birth, and phone number combined, versus a scanned ID document."
  - "Explain how the 2017 Equifax breach happened and why its scale made it a landmark case in data-protection regulation."
tasks:
  - type: MULTI_CHOICE
    title: "Data Protection"
    question: "Which of this data is dangerous to post publicly? (multiple):"
    difficulty: EASY
    points: 15
    explanation: "ID numbers, home addresses, and card CVV codes are all critical data directly usable for fraud or identity theft. A pet photo, your general city, or a favorite book carry essentially no exploitable risk on their own."
    options:
      - text: "Your passport/ID number"
        isCorrect: true
      - text: "Your home address"
        isCorrect: true
      - text: "Your bank card's CVV code"
        isCorrect: true
      - text: "Your favorite book"
        isCorrect: false
      - text: "A photo of your pet"
        isCorrect: false
      - text: "Your general city or metro area, without a street address"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: an ID number is exactly the identifier needed to open accounts or take out loans in your name."
        - "Correct: a home address enables real-world risks like stalking or burglary, beyond digital fraud."
        - "Correct: a CVV code is one of the few pieces of information that can directly enable a fraudulent card charge."
        - "A favorite book reveals nothing usable for fraud or impersonation."
        - "A pet photo carries no identity-fraud risk on its own."
        - "A general city, without a specific address, is broad enough to not meaningfully narrow down your location."

  - type: SINGLE_CHOICE
    title: "The Safer Option"
    question: "Which of these is safest to mention on a public profile?"
    difficulty: EASY
    points: 10
    explanation: "Your general city or region, without a specific street address, gives away very little. A full address, a passport scan, or a card number are all directly usable for fraud or real-world harm."
    options:
      - text: "Your general city or region, without a street address"
        isCorrect: true
      - text: "Your full home address"
        isCorrect: false
      - text: "A scan of your passport"
        isCorrect: false
      - text: "Your bank card number"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: broad location information, without a specific address, doesn't meaningfully expose you."
        - "A full address enables real-world risks like stalking or burglary, not just digital fraud."
        - "A passport scan is a critical identity document that enables loans, SIM swaps, or fraud in your name."
        - "A card number is directly usable for unauthorized charges."

  - type: SINGLE_CHOICE
    title: "Why Your Birthday Matters"
    question: "Why is your date of birth considered sensitive, even though sharing it feels harmless?"
    difficulty: MEDIUM
    points: 15
    explanation: "Date of birth is one of the most commonly used fields in identity-verification and account-recovery processes -- banks, phone carriers, and support teams routinely use it to confirm you are who you say you are, which means anyone else who has it can use it the same way."
    options:
      - text: "It's commonly used as a security-verification field for account and password recovery"
        isCorrect: true
      - text: "It has no real practical use to anyone"
        isCorrect: false
      - text: "It's only relevant for accessing age-restricted content"
        isCorrect: false
      - text: "Platforms are legally required to make it public"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: this is exactly why it's treated as sensitive -- it's a verification field, not just trivia."
        - "It has clear practical use in identity verification, which is precisely the risk."
        - "Age-gating is one narrow use case; account-recovery verification is the broader, more common risk."
        - "No such legal requirement exists -- platforms typically let you hide your birth date."

  - type: MULTI_CHOICE
    title: "What the Combination Enables"
    question: "What can someone realistically do with your full name, date of birth, and phone number combined?"
    difficulty: MEDIUM
    points: 15
    explanation: "This specific combination is frequently enough to pass identity checks used to take out a loan or to convince a support team to hand over account access. It doesn't, by itself, let someone guess a Wi-Fi password or do anything without any further effort -- but \"no risk at all\" understates what these three fields together actually enable."
    options:
      - text: "Attempt to take out a loan in your name"
        isCorrect: true
      - text: "Impersonate you to a support team to recover access to your accounts"
        isCorrect: true
      - text: "Send you a birthday card"
        isCorrect: false
      - text: "Nothing at all without your explicit consent"
        isCorrect: false
      - text: "Guess your home Wi-Fi password directly"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: lenders commonly rely on exactly this combination for identity verification."
        - "Correct: support teams at many services use these same fields to verify a caller's identity."
        - "This is the harmless, non-risk interpretation this task is testing against."
        - "This understates the real risk -- these three fields are precisely what several verification processes rely on."
        - "A Wi-Fi password isn't derived from personal identity fields like these."

  - type: SINGLE_CHOICE
    title: "The Scale of Equifax"
    question: "Roughly how many Americans had their personal data exposed in the 2017 Equifax breach?"
    difficulty: HARD
    points: 20
    explanation: "The breach exposed data on approximately 147.9 million Americans, along with 15.2 million UK citizens and about 19,000 Canadians -- among the largest breaches of financial identity data in history."
    options:
      - text: "About 147 million"
        isCorrect: true
      - text: "About 14.7 million"
        isCorrect: false
      - text: "About 1.47 million"
        isCorrect: false
      - text: "About 1.4 billion"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: roughly 147.9 million Americans were affected, making this one of the largest breaches of financial identity data on record."
        - "This understates the confirmed figure by a full order of magnitude."
        - "This understates the confirmed figure by two orders of magnitude."
        - "This overstates the confirmed figure roughly tenfold."

  - type: SINGLE_CHOICE
    title: "Why It Was a Landmark Case"
    question: "Beyond its size, why did the Equifax breach become a landmark case in data-protection regulation?"
    difficulty: HARD
    points: 20
    explanation: "Equifax held detailed financial identity data on people who were never its customers and had no direct relationship with it, and thus no way to opt out -- a structural problem regulators pointed to directly when designing the eventual $575-700 million settlement and pushing for tighter data-broker oversight."
    options:
      - text: "Equifax held the data as a credit bureau without a direct consumer relationship -- people had no way to opt out"
        isCorrect: true
      - text: "It was the first data breach of any kind in history"
        isCorrect: false
      - text: "No personal data was actually exposed, only internal company records"
        isCorrect: false
      - text: "It only affected Equifax's own employees"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: this structural lack of consent or opt-out is precisely what regulators emphasized as uniquely troubling about a credit bureau breach."
        - "Major breaches predate Equifax by years -- its significance was its scale and structural nature, not being first."
        - "Names, Social Security numbers, birth dates, and addresses were confirmed exposed -- this was genuinely personal, sensitive data."
        - "The exposed data belonged to ordinary consumers whose credit Equifax tracked, not to its employees."
---

## Critical Data

Never post your passport or ID number, bank card details (full number, CVV, PIN), passwords, home address, your home's precise geolocation, or photos of official documents. Be more cautious than you might think with your date of birth, since it's routinely used as a verification field for password and account recovery, along with your full legal name, personal email, workplace or school, and your regular routes and schedule -- none of these are as sensitive as an ID number on their own, but together they build a profile useful to an attacker.

## What Can Be Done With Your Data

With your full name, date of birth, and phone number, someone can attempt to take out a loan in your name, register new accounts, or convince a support team to hand over access to your social media by impersonating you convincingly enough. With a scan of your ID document, the stakes rise further: loans, company registration, SIM card purchases, or in serious cases, crimes committed under your identity that you'd then have to prove weren't yours. Protecting against this doesn't require paranoia -- avoid sending ID scans to strangers, add a visible watermark to any document image you do have to share, check your credit history at least once a year for accounts you didn't open, and avoid posting tickets or boarding passes that show a barcode or reference number.

## Real-world case: the credit bureau breach that changed data-breach law {#case}

In September 2017, Equifax, one of the three major U.S. credit bureaus, disclosed that attackers had exploited an unpatched web application vulnerability months earlier, between May and July, to access sensitive financial identity data on approximately 147.9 million Americans, 15.2 million UK citizens, and about 19,000 Canadians ([Wikipedia's account of the 2017 Equifax data breach](https://en.wikipedia.org/wiki/2017_Equifax_data_breach)). The exposed data included Social Security numbers, birth dates, addresses, and in some cases driver's license numbers -- precisely the fields that verify identity for loans, credit cards, and account recovery. What made the case unusual, beyond its scale, is that Equifax had no direct relationship with most of the people affected: it collects and sells data about consumers as a credit bureau, not as a service people sign up for, so those 147.9 million Americans had no way to have opted out even if they'd wanted to. Equifax eventually agreed to a settlement worth $575 million, potentially rising to $700 million, including $425 million in direct consumer relief and a $100 million civil penalty -- among the largest data-breach settlements ever reached in the United States.
