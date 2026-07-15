---
order: 1
title: "An Action Plan After Being Hacked"
objectives:
  - "Recognize the behavioral signs that an account or a device has been compromised."
  - "Execute the correct first steps immediately after discovering a compromise: isolate, change credentials, enable 2FA, notify, preserve evidence."
  - "Compare the MGM Resorts and Caesars Entertainment 2023 ransomware incidents and explain how their different responses led to different outcomes."
tasks:
  - type: SINGLE_CHOICE
    title: "What to Do After a Hack"
    question: "What should you do FIRST if your account is hacked?"
    difficulty: EASY
    points: 15
    explanation: "Isolating the device from the network and changing your password from a clean device first prevents further damage before anything else, including contacting support, matters."
    options:
      - text: "Message support"
        isCorrect: false
      - text: "Disconnect from the internet and change your password from another device"
        isCorrect: true
      - text: "Delete the account"
        isCorrect: false
      - text: "Wait a few days"
        isCorrect: false
    meta:
      optionRationale:
        - "Support can help, but it doesn't stop an attacker's access in the moment the way isolating and changing credentials does."
        - "Correct: this immediately cuts off the attacker's access and secures the account before anything else."
        - "Deleting the account doesn't address stolen data or credentials already in an attacker's hands."
        - "Every hour of delay is additional time for an attacker to act."

  - type: MULTI_CHOICE
    title: "Recognizing the Signs"
    question: "Which of these are real signs your account may have been hacked?"
    difficulty: EASY
    points: 15
    explanation: "Posts you didn't make and an unrequested password-change notification are both concrete, common signs of compromise. A routine update notification or a friend count that grew normally over time are unrelated to any compromise."
    options:
      - text: "Posts appear that you didn't make"
        isCorrect: true
      - text: "You get a \"your password was changed\" email you didn't request"
        isCorrect: true
      - text: "You received a routine software update notification"
        isCorrect: false
      - text: "Your friend count increased gradually over time"
        isCorrect: false
      - text: "You logged in successfully using your usual password"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: content you didn't post is one of the clearest possible signs someone else has account access."
        - "Correct: an unrequested password-change notification means someone else initiated that change, not you."
        - "This is routine, expected platform behavior unrelated to account security."
        - "Gradual, organic follower growth is normal and carries no signal of compromise."
        - "A successful login with your own known password is, if anything, a sign nothing has changed."

  - type: SINGLE_CHOICE
    title: "Why the Device Matters"
    question: "Why should you change your password from a different, clean device rather than the possibly-compromised one?"
    difficulty: MEDIUM
    points: 15
    explanation: "If the compromised device has malware like a keylogger recording keystrokes, typing your brand-new password on that same device exposes the new password to the same attacker just as quickly as the old one was."
    options:
      - text: "If the compromised device has a keylogger, typing your new password there exposes it too"
        isCorrect: true
      - text: "It isn't actually necessary -- any device works equally well"
        isCorrect: false
      - text: "Changing it from the same device is always faster and just as safe"
        isCorrect: false
      - text: "It has no security implication either way"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: this is exactly the mechanism that makes a clean device necessary -- otherwise the new password is compromised the moment it's typed."
        - "The device you use for this specific step matters a great deal if the original device is compromised."
        - "Speed doesn't offset the risk of immediately re-exposing a freshly changed password to the same malware."
        - "This has a direct, concrete security implication, not none."

  - type: MULTI_CHOICE
    title: "If Money Was Stolen"
    question: "What should you do if money was stolen as a result of a hack?"
    difficulty: MEDIUM
    points: 15
    explanation: "Freezing your card and contacting your bank, plus filing a police report, are the concrete, actionable steps that give you a real chance at recovery or documentation. Waiting to see if it happens again, or only posting about it on social media, both delay the actions that actually matter."
    options:
      - text: "Freeze your card and contact your bank"
        isCorrect: true
      - text: "File a police report"
        isCorrect: true
      - text: "Wait to see if it happens again before acting"
        isCorrect: false
      - text: "Only post about it on social media"
        isCorrect: false
      - text: "Avoid contacting your bank to prevent embarrassment"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: this is the direct, concrete step that can stop further unauthorized charges."
        - "Correct: a police report is often required for banks or insurers to process a claim or dispute."
        - "Waiting risks additional, preventable losses while the account remains exposed."
        - "A social media post does nothing to freeze funds or formally document the incident."
        - "Embarrassment isn't a reason to skip the one step most likely to help you recover funds."

  - type: SINGLE_CHOICE
    title: "Two Casinos, Two Choices"
    question: "In the September 2023 ransomware attacks, how did Caesars Entertainment's response differ from MGM Resorts'?"
    difficulty: HARD
    points: 20
    explanation: "Caesars reportedly paid a $15 million ransom and avoided major disruption to its casino floors and booking systems, while MGM refused to pay, worked with law enforcement instead, and suffered roughly 10 days of significant operational outages as a result."
    options:
      - text: "Caesars paid a reported $15 million ransom and avoided major disruption, while MGM refused to pay and suffered about 10 days of outages"
        isCorrect: true
      - text: "Both companies paid the exact same ransom amount"
        isCorrect: false
      - text: "Neither company suffered any operational disruption"
        isCorrect: false
      - text: "MGM paid the ransom while Caesars refused"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: this pay-versus-refuse split, and the differing operational outcomes that followed, is exactly what the two incidents demonstrated side by side."
        - "The two companies took different approaches with different reported costs, not identical ones."
        - "MGM specifically suffered substantial, well-documented operational outages."
        - "This reverses the actual, reported roles -- Caesars paid, MGM refused."

  - type: SINGLE_CHOICE
    title: "The Cost of Refusing"
    question: "What was the approximate financial impact on MGM Resorts from its 2023 ransomware incident?"
    difficulty: HARD
    points: 20
    explanation: "MGM reported roughly $100 million in losses for the third quarter of 2023 as a direct result of the attack and the operational outages that followed -- the cost of the approach it chose, even without paying a ransom."
    options:
      - text: "About $100 million in Q3 2023 losses"
        isCorrect: true
      - text: "No measurable financial impact"
        isCorrect: false
      - text: "About $1,000"
        isCorrect: false
      - text: "About $100 billion"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: MGM reported this figure directly as the quarter's incident-related loss."
        - "The impact was substantial and well documented in MGM's own financial disclosures."
        - "This dramatically understates the reported, disclosed figure."
        - "This overstates the reported figure by roughly three orders of magnitude."
---

## Signs of a Hack

Your account may be compromised if posts appear that you didn't make, your password changed without your action, you receive a "your password was changed" email you didn't request, active sessions show up from unfamiliar cities, or friends start receiving spam that appears to come from you. Your computer may be compromised if files become encrypted without explanation, unfamiliar programs are set to launch at startup, your webcam activates on its own, money disappears from a linked account, or your network traffic spikes for no clear reason.

## What to Do Immediately

Disconnect the affected device from the internet first. Change your passwords from a different, clean device -- not the one that may still be compromised. End all active sessions, then enable two-factor authentication if it isn't already on. Scan the affected computer with antivirus software. Notify friends if your account sent them spam on your behalf. If money was stolen, freeze your card and contact your bank immediately. Save evidence, such as screenshots, before anything changes further. Contact the affected service's support team, and if money was stolen, file a police report -- both for your own recovery options and because your report contributes to a wider record of the incident.

## Real-world case: two casinos, two responses, two different outcomes {#case}

In September 2023, both MGM Resorts and Caesars Entertainment were hit by ransomware attacks tied to the same threat actor, a group known as Scattered Spider, within days of each other -- and each company made a different choice about how to respond. Caesars disclosed a breach on September 7 after attackers used a social engineering attack against a third-party IT vendor, and reportedly paid a $15 million ransom; its physical properties and online booking systems continued operating with minimal visible disruption. MGM was hit days later, on September 11, refused to pay, and instead worked with law enforcement -- but suffered roughly 10 days of significant outages affecting slot machines, hotel room keys, and casino floor systems across its properties ([Forbes' comparison of the two incidents](https://www.forbes.com/sites/suzannerowankelleher/2023/09/14/2-casino-ransomware-attacks-caesars-mgm/)). MGM later reported approximately $100 million in losses for the third quarter of 2023 as a direct result. Both companies also had customer data stolen -- Caesars confirmed its loyalty program database, including driver's license and Social Security numbers for a significant number of members, was taken regardless of the ransom payment. Neither outcome was free of cost, and neither choice, paying or refusing, guaranteed a clean result -- which is precisely why incident response plans are typically decided in advance, not improvised during the attack itself.
