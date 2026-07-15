---
order: 1
title: "Checking for Breaches"
objectives:
  - "Identify major historical data breaches and the categories of data they typically exposed."
  - "Use a breach-checking service like Have I Been Pwned to check whether your own data has been exposed."
  - "Explain what happened in the 2024 National Public Data breach and why its headline '2.9 billion records' figure requires more scrutiny than it first appears."
tasks:
  - type: SINGLE_CHOICE
    title: "Data Breaches"
    question: "You find out your password leaked in a data breach. What should you do first?"
    difficulty: EASY
    points: 10
    explanation: "A leaked password needs to be changed immediately, before someone else can use it to log in ahead of you."
    options:
      - text: "Nothing, let them try to hack it"
        isCorrect: false
      - text: "Change your password immediately"
        isCorrect: true
      - text: "Delete the account"
        isCorrect: false
      - text: "Wait a week"
        isCorrect: false
    meta:
      optionRationale:
        - "Every day the old password stays active is an open window for someone else to use it first."
        - "Correct: an immediate password change closes the window before it can be exploited."
        - "Deleting the account doesn't undo the fact that the password is already exposed elsewhere it was reused."
        - "Any delay is time an attacker can use the still-valid password."

  - type: SINGLE_CHOICE
    title: "Checking Your Exposure"
    question: "What's a reliable free way to check whether your email has appeared in a known data breach?"
    difficulty: EASY
    points: 10
    explanation: "Have I Been Pwned is a free, well-established service built specifically for this -- you enter an email and it checks it against a large, continuously updated database of known breaches."
    options:
      - text: "A dedicated service like Have I Been Pwned"
        isCorrect: true
      - text: "A random third-party app that asks for your password to \"check\" it"
        isCorrect: false
      - text: "Posting your email publicly and waiting for responses"
        isCorrect: false
      - text: "There's no way to check this"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: this is exactly the free, purpose-built tool for checking breach exposure by email."
        - "Any tool that asks for your actual password to \"check\" it is very likely harvesting it -- a legitimate check never needs your password."
        - "This exposes your email further without checking anything."
        - "Purpose-built, free checking tools exist and are widely used for this."

  - type: MULTI_CHOICE
    title: "After Confirming a Breach"
    question: "You confirm your email and password appeared in a data breach. What should you do? (multiple):"
    difficulty: MEDIUM
    points: 15
    explanation: "Changing the password on the breached site, plus anywhere else you reused it, closes the actual exposure. Ignoring an old breach or waiting to see what happens both leave a valid, working credential in an attacker's hands for no reason."
    options:
      - text: "Change the password on the breached site immediately"
        isCorrect: true
      - text: "Change the same password anywhere else you reused it"
        isCorrect: true
      - text: "Ignore it if the breach happened more than a year ago"
        isCorrect: false
      - text: "Wait to see if anything bad happens first"
        isCorrect: false
      - text: "Delete your email address entirely"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: this directly closes the exposure on the account the breach actually affected."
        - "Correct: password reuse means the same exposure applies everywhere that password was used."
        - "A password doesn't become safe again just because time has passed -- if it still works, it's still a risk."
        - "Waiting for visible harm means acting only after the damage is already done."
        - "This is a drastic, unnecessary step -- changing the password addresses the actual exposure without losing your email address."

  - type: SINGLE_CHOICE
    title: "What Breaches Typically Contain"
    question: "Which category of data most commonly appears together in large breaches?"
    difficulty: MEDIUM
    points: 15
    explanation: "Email addresses, passwords, and phone numbers are the most common combination across major breaches -- not because more exotic data like biometrics or medical records never leaks, but because ordinary account databases are both the most common target and the most commonly reused across services."
    options:
      - text: "Email address, password, and phone number"
        isCorrect: true
      - text: "Exclusively banking PINs"
        isCorrect: false
      - text: "Exclusively biometric data"
        isCorrect: false
      - text: "Exclusively medical records"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: this combination is the single most common pattern across major breaches, from Yahoo to LinkedIn to Twitter/X."
        - "PINs are far less commonly stored this way, and banking-specific breaches are a small fraction of the total."
        - "Biometric breaches are comparatively rare and specific to certain platforms, not the typical case."
        - "Medical-record breaches are a distinct, less common category compared to ordinary account databases."

  - type: SINGLE_CHOICE
    title: "The Scale of the Claim"
    question: "In the 2024 National Public Data breach, a seller calling themselves \"USDoD\" advertised roughly how many records for sale?"
    difficulty: HARD
    points: 20
    explanation: "The seller advertised approximately 2.9 billion records on the hacking forum BreachForums -- an enormous headline figure, though as with many such claims, the number of records doesn't directly equal the number of unique people affected."
    options:
      - text: "About 2.9 billion"
        isCorrect: true
      - text: "About 2.9 million"
        isCorrect: false
      - text: "About 29,000"
        isCorrect: false
      - text: "About 290 million"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: 2.9 billion is the figure advertised by the seller and widely reported at the time."
        - "This understates the advertised figure by roughly three orders of magnitude."
        - "This understates the advertised figure by roughly five orders of magnitude."
        - "This understates the advertised figure by roughly an order of magnitude."

  - type: SINGLE_CHOICE
    title: "Reading the Headline Number Critically"
    question: "Why does the National Public Data breach's headline figure of \"2.9 billion records\" require more scrutiny than it first appears?"
    difficulty: HARD
    points: 20
    explanation: "Security researchers who examined the leaked data found large amounts of duplication -- multiple records per person covering past addresses and old information -- meaning the number of unique people affected is meaningfully smaller than the raw record count, even though the exposure was still serious."
    options:
      - text: "The records include duplicate and historical entries per person, so the number of unique people affected is far lower than 2.9 billion"
        isCorrect: true
      - text: "The figure was later proven to be entirely fabricated, with no real data involved"
        isCorrect: false
      - text: "2.9 billion actually understates the true, even larger total"
        isCorrect: false
      - text: "The records only ever affected fictional test accounts"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: independent analysis found substantial duplication, which is exactly why raw record counts overstate unique individuals affected."
        - "Real, sensitive personal data was confirmed present in the leak -- the issue is over-counting, not fabrication."
        - "There's no credible evidence the true unique-person total exceeds the advertised record count -- if anything, it's the reverse."
        - "The exposed records included real people's actual information, not fictional test data."
---

## What Is a Data Breach

A data breach happens when attackers break into a service and obtain its user database, which is then often published, sold, or both. Among the largest on record: Yahoo (2013, roughly 3 billion accounts), Facebook (2019, 533 million users), LinkedIn (2021, 700 million profiles), and Twitter/X (2023, over 200 million accounts). What typically ends up exposed includes an email address paired with a password, a phone number, a full name, a date of birth, a home address, or purchase history -- the exact combination varies by breach, but email-plus-password is close to universal.

## How to Check Your Data

Have I Been Pwned lets you enter an email address to check it against a large, continuously updated database of known breaches, entirely free. LeakCheck.io checks by email, phone number, or username, with some features behind a paywall. Firefox Monitor is Mozilla's free breach-checking service, built into the browser for some users. If you find a breach affecting you: change your password on that specific site immediately, change the same password anywhere else you reused it, turn on two-factor authentication if you haven't already, review your active sessions for anything unfamiliar, and keep an eye on your bank statements for a while afterward. The underlying prevention is the same advice as always -- unique passwords everywhere, so one breach doesn't cascade into every account you own.

## Real-world case: when a data broker's headline number was bigger than it looked {#case}

In August 2024, National Public Data, a data broker that aggregates public records, confirmed a breach after a seller using the name "USDoD" listed data for sale on the hacking forum BreachForums, advertising approximately 2.9 billion records containing full names, addresses, Social Security numbers, and dates of birth for people across the US, UK, and Canada ([Wikipedia's account of the 2024 National Public Data breach](https://en.wikipedia.org/wiki/2024_National_Public_Data_breach)). The 2.9 billion figure made headlines everywhere, but security researchers who examined the actual leaked files found something more complicated: large-scale duplication, with multiple records per person covering old and current addresses, meant the raw record count didn't translate directly into 2.9 billion distinct people. Independent estimates suggested the real number of unique individuals affected was more likely in the range of tens to low hundreds of millions -- still an enormous breach, but a meaningfully different number than the headline suggested. The lesson isn't that the breach wasn't serious; it's that a record count and an affected-person count are different measurements, and breach reporting -- including in this lesson -- deserves the same scrutiny you'd apply to any other statistic before you repeat it.
