---
order: 1
title: "What Is 2FA?"
objectives:
  - "Explain what 2FA adds beyond a password, and why it stops most automated account-takeover attempts."
  - "Rank 2FA methods -- SMS, authenticator app, push notification, hardware key -- by resistance to interception."
  - "Explain how SIM-swap fraud specifically defeats SMS-based 2FA, using current data on its rise."
tasks:
  - type: SINGLE_CHOICE
    title: "2FA Methods"
    question: "Which 2FA method is the most secure?"
    difficulty: EASY
    points: 10
    explanation: "Hardware keys (like YubiKey) are the most reliable 2FA method since they verify the actual domain you're logging into and can't be intercepted or read out over the phone the way a code can."
    options:
      - text: "Hardware key (YubiKey)"
        isCorrect: true
      - text: "SMS code"
        isCorrect: false
      - text: "Email with a code"
        isCorrect: false
      - text: "A secret question"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: a hardware key checks the actual site's domain cryptographically, which defeats even convincing phishing pages."
        - "SMS can be intercepted through SIM-swap fraud, among other techniques."
        - "Email accounts are themselves password-protected, single points of failure if compromised."
        - "Secret questions are often guessable or discoverable from public information."

  - type: SINGLE_CHOICE
    title: "The Two Factors"
    question: "Conceptually, what are the two factors in \"two-factor authentication\"?"
    difficulty: EASY
    points: 10
    explanation: "2FA combines something you know (a password) with something you have (a phone, an app, or a physical key) -- so a stolen password alone isn't enough to log in."
    options:
      - text: "Two different passwords"
        isCorrect: false
      - text: "Something you know (a password) and something you have (a phone or key)"
        isCorrect: true
      - text: "Two separate email addresses"
        isCorrect: false
      - text: "The same password, typed twice"
        isCorrect: false
    meta:
      optionRationale:
        - "Two passwords are still just one category of factor -- both are things you know."
        - "Correct: combining a category you know with a category you physically have is the actual definition of 2FA."
        - "Two email addresses don't constitute a second, independent factor."
        - "Repetition doesn't add a second, independent category of proof."

  - type: MULTI_CHOICE
    title: "Comparing 2FA Methods Honestly"
    question: "Which of these statements about 2FA methods are accurate?"
    difficulty: MEDIUM
    points: 15
    explanation: "SMS codes are genuinely vulnerable to SIM-swap fraud, and hardware keys resist phishing specifically because they cryptographically verify the real domain. SMS isn't unbreakable, authenticator apps generate codes offline using time-based math rather than a network connection, and push notifications can be mistakenly approved -- exactly what \"MFA fatigue\" attacks exploit."
    options:
      - text: "SMS codes are vulnerable to SIM-swap attacks"
        isCorrect: true
      - text: "Hardware keys resist phishing because they verify the actual domain being logged into"
        isCorrect: true
      - text: "SMS-based 2FA is completely unbreakable"
        isCorrect: false
      - text: "Authenticator apps require an active internet connection to generate a code"
        isCorrect: false
      - text: "Push notifications can never be approved by mistake"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: this is precisely the mechanism covered later in this lesson."
        - "Correct: this cryptographic domain check is what makes hardware keys resistant even to a convincing fake login page."
        - "SMS is meaningfully better than no 2FA at all, but it has documented, exploitable weaknesses."
        - "Authenticator apps use time-based codes generated locally on the device -- no network connection is required."
        - "\"MFA fatigue\" attacks specifically exploit users approving a push notification they didn't request, out of habit or annoyance."

  - type: SHORT_ANSWER
    title: "The Microsoft Statistic"
    question: "Per Microsoft, turning on multi-factor authentication blocks roughly what percentage of automated account attacks?"
    difficulty: MEDIUM
    points: 15
    correctAnswer: "99.9"
    explanation: "Microsoft's own research, publicized by Alex Weinert in 2019, states an account is more than 99.9% less likely to be compromised with MFA turned on -- a figure still cited as the baseline case for enabling it."
    meta:
      acceptedAnswers:
        - "99.9"
        - "99.9%"
        - "99"
        - "almost 100"

  - type: SINGLE_CHOICE
    title: "How a SIM Swap Actually Works"
    question: "In a SIM-swap attack, what does the attacker actually do to defeat SMS-based 2FA?"
    difficulty: HARD
    points: 15
    explanation: "SIM-swap fraud works by convincing or tricking a mobile carrier into transferring the victim's phone number onto a SIM card the attacker controls -- after which any SMS code sent to \"your\" number goes straight to the attacker's device."
    options:
      - text: "They intercept the code using malware installed on the victim's phone"
        isCorrect: false
      - text: "They convince or trick a mobile carrier into porting the victim's number onto a SIM the attacker controls"
        isCorrect: true
      - text: "They brute-force guess the six-digit code"
        isCorrect: false
      - text: "They physically steal the victim's phone"
        isCorrect: false
    meta:
      optionRationale:
        - "This describes a different attack category -- SIM swapping doesn't require malware on the victim's device at all."
        - "Correct: this social-engineering-of-the-carrier is the actual mechanism, and it requires no access to the victim's device."
        - "Codes are short-lived and rate-limited specifically to make brute-forcing impractical."
        - "The victim typically keeps their physical phone the entire time -- the number itself is what's redirected."

  - type: SINGLE_CHOICE
    title: "Reading the SIM-Swap Trend"
    question: "UK reports of SIM-swap fraud rose roughly 1,055% in a single year. What does this trend suggest about SMS as a 2FA method?"
    difficulty: HARD
    points: 15
    explanation: "It suggests SMS is a meaningfully weaker 2FA option than app-based or hardware methods, and one that's increasingly, specifically targeted -- not that SMS 2FA is worthless, since it still stops a large share of purely automated, non-targeted attacks."
    options:
      - text: "SMS 2FA is now completely obsolete and provides zero protection"
        isCorrect: false
      - text: "SMS is a meaningfully weaker 2FA method and a growing, specifically targeted weak point"
        isCorrect: true
      - text: "The rise is unrelated to 2FA and purely about phone carriers"
        isCorrect: false
      - text: "Carriers have made SIM swapping essentially impossible to attempt"
        isCorrect: false
    meta:
      optionRationale:
        - "SMS still stops plenty of purely automated, non-targeted attacks -- \"zero protection\" overstates the case."
        - "Correct: this reflects the actual documented trend, without overclaiming SMS is entirely useless."
        - "The entire reason attackers pursue this is to defeat SMS-based account security -- it's directly related."
        - "The dramatic rise in reported cases contradicts this directly."
---

## 2FA -- Double Protection

2FA (Two-Factor Authentication) means logging in requires two confirmations: something you know (a password) and something you have (a phone, a security key). Even if a hacker learns your password, they can't log in without the second factor. Common examples include banking apps paired with an SMS code, email paired with a code from an app, and social media paired with biometrics. Microsoft's own data puts the effect at blocking roughly 99.9% of automated account-takeover attempts once MFA is enabled ([Microsoft Security Blog](https://www.microsoft.com/en-us/security/blog/2019/08/20/one-simple-action-you-can-take-to-prevent-99-9-percent-of-account-attacks/)).

## Types of 2FA

**SMS codes** are the simplest to set up, but the least secure, since they depend on your phone number rather than your device. **Authenticator apps** (Google Authenticator, Authy) generate codes locally, offline. **Push notifications** ask you to confirm on your phone directly -- convenient, though vulnerable if you get used to tapping "approve" without reading it. **Hardware keys** (YubiKey) are physical devices and the most phishing-resistant option, since they cryptographically check the real domain rather than just producing a code that could be typed anywhere. Recommended order of preference: hardware key, then authenticator app, then push notification, then SMS -- still meaningfully better than nothing.

## Real-world case: when SMS becomes the target {#case}

SMS-based 2FA has a specific, documented weak point: SIM-swap fraud, where an attacker convinces or tricks a mobile carrier into transferring a victim's phone number onto a SIM card the attacker controls. Once that's done, any SMS code meant for "your" number goes straight to the attacker instead. In the UK, reports of SIM-swap fraud rose roughly 1,055% in a single year -- from around 289 incidents to nearly 3,000 -- making it one of the fastest-growing forms of account takeover on record ([Cifas reporting](https://www.cifas.org.uk/newsroom/huge-surge-see-sim-swaps-hit-telco-and-mobile)). In the US, the FBI's Internet Crime Complaint Center tracked roughly $26 million in reported SIM-swap losses in 2024 alone, and one high-profile case resulted in a $33 million arbitration award against a carrier after a single SIM-swap attack.

This doesn't mean SMS 2FA is worthless -- it still blocks large volumes of purely automated attacks that never involve a human targeting your specific phone number. It does mean that for anything genuinely high-value, an authenticator app or hardware key removes the phone-number dependency entirely.

## Choosing Your Setup

Given the tradeoffs in this lesson, a reasonable default is: hardware key or authenticator app for your most important accounts (email, banking, your password manager itself), push notifications where offered for convenience, and SMS only as a fallback rather than your primary method.
