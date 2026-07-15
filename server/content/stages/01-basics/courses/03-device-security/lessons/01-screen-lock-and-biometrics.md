---
order: 1
title: "Screen Lock and Biometrics"
objectives:
  - "List common device-lock methods and rank them by resistance to a casual versus a determined attacker."
  - "Explain, using the 2013 Touch ID bypass, why fingerprint biometrics alone aren't the strongest possible lock."
  - "Enable a PIN or passphrase alongside biometrics on your own primary device."
tasks:
  - type: SINGLE_CHOICE
    title: "Why You Can't \"Reset\" a Fingerprint"
    question: "Why can't you reset a compromised fingerprint the way you'd reset a leaked password?"
    difficulty: EASY
    points: 10
    explanation: "A password is a secret you chose and can replace. A fingerprint is a fixed physical trait -- if a copy of it is ever compromised, you can't generate a new one."
    options:
      - text: "Fingerprints expire automatically after a few years"
        isCorrect: false
      - text: "A fingerprint is a fixed physical trait, not a secret you can change"
        isCorrect: true
      - text: "Apple's policy simply doesn't allow it"
        isCorrect: false
      - text: "It requires an in-person store visit to change"
        isCorrect: false
    meta:
      optionRationale:
        - "Fingerprints don't expire -- the physical pattern stays the same for life."
        - "Correct: unlike a password, you only get the ten you were born with."
        - "This isn't a policy limitation -- it's a fact about biology."
        - "The issue isn't process friction, it's that there's no new fingerprint to switch to."

  - type: SINGLE_CHOICE
    title: "Lock Methods"
    question: "Which lock method is the most secure?"
    difficulty: MEDIUM
    points: 10
    explanation: "Combining biometrics with a strong PIN creates two independent layers of protection -- each covering the other's weak point."
    options:
      - text: "Pattern lock"
        isCorrect: false
      - text: "A simple PIN like 1234"
        isCorrect: false
      - text: "Fingerprint alone"
        isCorrect: false
      - text: "Biometrics plus a strong PIN"
        isCorrect: true
    meta:
      optionRationale:
        - "Patterns are easy to shoulder-surf and often leave a visible smudge trail on the screen."
        - "A common 4-digit PIN is guessable in seconds."
        - "A fingerprint alone can be used on you while you're asleep or unconscious, without your consent."
        - "Correct: combining an unlock method you have (biometrics) with one you know (a strong PIN) covers each method's individual weakness."

  - type: MULTI_CHOICE
    title: "What Biometrics Actually Do (and Don't)"
    question: "Which of these are real, documented limitations of fingerprint biometrics?"
    difficulty: MEDIUM
    points: 15
    explanation: "Someone can press a sleeping person's finger to a sensor, and a lifted print can sometimes be replicated. Biometrics don't make PIN brute-forcing impossible, don't automatically encrypt your files, and Face ID/Touch ID use entirely different sensor technologies."
    options:
      - text: "Someone can unlock your phone by pressing your finger to it while you sleep"
        isCorrect: true
      - text: "A fingerprint lifted from a glass or photograph can sometimes be replicated"
        isCorrect: true
      - text: "Biometrics make brute-force PIN guessing impossible"
        isCorrect: false
      - text: "Biometrics automatically encrypt your files"
        isCorrect: false
      - text: "Face ID and Touch ID use the exact same underlying sensor technology"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: a fingerprint doesn't require consent in the moment, unlike a password you have to be conscious to type."
        - "Correct: this is exactly what the Touch ID bypass in this lesson's case demonstrated."
        - "Biometrics are an unlock method, not a PIN-guessing rate limiter -- those are separate features."
        - "Encryption depends on the device's security architecture, not on which unlock method you chose."
        - "Face ID uses infrared depth-mapping cameras; Touch ID uses a capacitive fingerprint sensor -- different hardware entirely."

  - type: SHORT_ANSWER
    title: "The Group That Beat Touch ID"
    question: "What's the name of the German hacker group (commonly known by its English initials) that bypassed Touch ID two days after the iPhone 5S launched in 2013?"
    difficulty: HARD
    points: 15
    correctAnswer: "ccc"
    explanation: "The Chaos Computer Club (CCC), a well-known German hacker association, demonstrated the Touch ID bypass within 48 hours of the iPhone 5S's release."
    meta:
      acceptedAnswers:
        - "ccc"
        - "chaos computer club"

  - type: SINGLE_CHOICE
    title: "What the Touch ID Bypass Actually Proved"
    question: "The Chaos Computer Club unlocked an iPhone 5S using a fake finger made from a photographed print. What does this demonstrate about fingerprint sensors used alone?"
    difficulty: HARD
    points: 15
    explanation: "A high-resolution photograph of a print, printed and cast in a material like latex or wood glue, was enough to fool the sensor -- proving a convincing physical copy can substitute for the real finger, which is why biometrics alone aren't the strongest possible lock."
    options:
      - text: "They are unbreakable in practice"
        isCorrect: false
      - text: "A convincing physical copy of a print can substitute for the actual finger"
        isCorrect: true
      - text: "Only government agencies have the tools to replicate a fingerprint"
        isCorrect: false
      - text: "It only ever worked on that specific 2013 iPhone model"
        isCorrect: false
    meta:
      optionRationale:
        - "The bypass happened within 48 hours of release, using materials available to a hobbyist."
        - "Correct: this is exactly what the CCC demonstrated, and later researchers repeated similar spoofs on other devices."
        - "The technique used a camera, a printer, and household materials -- no government-grade equipment."
        - "Similar spoofing techniques have been demonstrated against fingerprint sensors on other devices and brands since."

  - type: SINGLE_CHOICE
    title: "The Strongest Realistic Setup"
    question: "What's the strongest realistic lock setup for a phone that holds your banking apps?"
    difficulty: HARD
    points: 15
    explanation: "Biometrics as the fast daily unlock, backed by a strong PIN or passphrase as the fallback and for high-risk moments, gets you convenience without relying on a single, spoofable factor."
    options:
      - text: "Fingerprint only, for speed"
        isCorrect: false
      - text: "A plain 4-digit PIN alone"
        isCorrect: false
      - text: "Biometrics for daily unlock, backed by a strong PIN or passphrase as fallback"
        isCorrect: true
      - text: "No lock at all, since you rarely leave the house"
        isCorrect: false
    meta:
      optionRationale:
        - "Fast, but a single spoofable factor with no fallback strategy."
        - "Secure only if long and non-obvious -- a plain 4-digit PIN is not that."
        - "Correct: this combination covers convenience and the failure mode of each method individually."
        - "A lost or borrowed phone doesn't care how often you leave the house."
---

## Why Screen Lock Matters

Screen lock is the first line of defense for your device, and it's the one control that matters regardless of how careful you are about everything else online -- it's what stands between a stranger and your data the moment a phone is lost, stolen, or simply left on a table. If your phone ends up in the wrong hands, the lock prevents access to your data: photos and videos, messenger conversations, banking apps, email and social media, and files and documents. Common lock types include a PIN code, a pattern, a fingerprint, Face ID, or a password, each trading off convenience against how hard it is for someone else to reproduce.

## Biometrics: Pros and Cons

Biometrics offer real advantages: fast access, no password to remember, and a print or face that's hard to casually fake in the moment. But they carry real disadvantages too -- a fingerprint can be used on you without your consent while you're asleep or otherwise unable to object, you can't change a compromised print the way you'd change a leaked password, and once biometric data is compromised, it's compromised permanently rather than for one account. That asymmetry -- infinite passwords you can rotate, versus ten fingerprints you're born with -- is the core argument for treating biometrics as a convenience layer rather than your only line of defense.

## Real-world case: cracking Touch ID in 48 hours {#case}

Apple launched Touch ID on the iPhone 5S in September 2013, marketing it as a fast, secure way to unlock a phone. Two days later, the German hacker collective Chaos Computer Club published a bypass: they photographed a fingerprint left on a glass surface at 2400 dpi, cleaned up the image, laser-printed it onto a transparent sheet, and cast a fake finger from the resulting mold using latex milk or wood glue ([CCC's own writeup](https://www.ccc.de/en/updates/2013/ccc-breaks-apple-touchid), [Forbes](https://www.forbes.com/sites/andygreenberg/2013/09/22/german-hackers-say-theyve-broken-the-iphones-touchid-fingerprint-reader/)). The fake finger unlocked the phone.

The point wasn't that Apple's sensor was unusually weak -- it was that fingerprint recognition, as a category, authenticates a pattern rather than a living person, and a good enough copy of the pattern is enough. That's exactly why security guidance treats biometrics as a convenience layer to combine with a real secret, not a replacement for one.

## Setting It Up

Whatever device you're on, turn on both a biometric unlock and a strong PIN or passphrase as the fallback -- not a simple 4-digit code. The biometric handles the 50 times a day you unlock your phone; the PIN is what actually stands between an attacker and your accounts if the biometric layer is ever defeated.
