---
order: 2
title: "Passkeys and Phishing-Resistant Login"
objectives:
  - "Explain why a code-based second factor can still be phished, and how a passkey cannot."
  - "Describe what a passkey is: a key pair bound to the real site, with the private half never leaving your device."
  - "Recognise when to prefer a passkey or hardware key over an authenticator app."
tasks:
  - type: SINGLE_CHOICE
    title: "The Code Still Leaks"
    question: "You use an authenticator app. A fake login page asks for your password AND the 6-digit code. Why can the attacker still get in?"
    difficulty: EASY
    points: 10
    explanation: "A code is just a secret you type. If you type it into a fake page, the attacker relays it to the real site within its 30-second window -- the code never knew which site it was for."
    options:
      - text: "The code is a secret you type, so a fake page can relay it in real time"
        isCorrect: true
      - text: "Authenticator apps are the same as SMS"
        isCorrect: false
      - text: "The code is valid forever once generated"
        isCorrect: false
      - text: "The attacker guessed all million combinations"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: any factor you can read out and type can be phished by a page that forwards it instantly."
        - "They differ -- an app avoids SIM-swap -- but both still produce a code a human can be tricked into typing."
        - "TOTP codes rotate every 30 seconds; expiry is not the weakness here, relaying is."
        - "Brute force is stopped by rate limits; the attacker never needed to guess -- you typed it."

  - type: SINGLE_CHOICE
    title: "What a Passkey Is"
    question: "What actually gets stored on your device when you create a passkey?"
    difficulty: EASY
    points: 10
    explanation: "A passkey is a cryptographic key pair. The private key stays on your device and never leaves it; only the public key goes to the site. There is no shared secret to phish."
    options:
      - text: "A private key that never leaves the device, paired with a public key the site holds"
        isCorrect: true
      - text: "A very long password stored in the cloud"
        isCorrect: false
      - text: "A photo of your face"
        isCorrect: false
      - text: "A backup of all your other passwords"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: public-key cryptography means the secret half is never transmitted, so there is nothing to intercept."
        - "A passkey is not a password and is not a shared secret; that is precisely the point."
        - "Biometrics may unlock the passkey locally, but the passkey itself is a key pair, not the biometric."
        - "A passkey authenticates one account; it is not a password manager."

  - type: MULTI_CHOICE
    title: "Bound to the Real Site"
    question: "Why can't a passkey be used on a look-alike phishing domain?"
    difficulty: MEDIUM
    points: 15
    explanation: "The browser ties each passkey to the exact domain it was created for and signs a challenge only for that origin. On a look-alike domain the passkey simply does not offer itself -- there is no code for you to mistype."
    options:
      - text: "The passkey is bound to the exact domain it was registered on"
        isCorrect: true
      - text: "The browser signs a challenge only for the real origin"
        isCorrect: true
      - text: "There is no code for the user to read out and retype"
        isCorrect: true
      - text: "The user has to notice the domain is fake themselves"
        isCorrect: false
      - text: "Phishing pages are always blocked by the browser"
        isCorrect: false
      - text: "It uses a longer code that is harder to guess"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: origin binding is enforced by the browser, not by the user's vigilance."
        - "Correct: the signature is scoped to the origin, so a wrong domain gets nothing usable."
        - "Correct: removing the human-typed secret removes the thing phishing relies on."
        - "Excluded: the whole advantage is that it does NOT depend on the user spotting the fake."
        - "Excluded: browsers block some phishing, but that is a separate, imperfect layer -- not why passkeys resist it."
        - "Excluded: there is no code at all -- length is irrelevant when nothing is typed."

  - type: SHORT_ANSWER
    title: "The Phishable Factor"
    question: "One word: what does a passkey remove that SMS codes, TOTP apps, and push prompts all still rely on -- the thing a user can be tricked into revealing?"
    difficulty: MEDIUM
    points: 15
    explanation: "They all rely on a shared secret (a code) that the user handles. A passkey uses a private key that never leaves the device, so there is no secret to reveal."
    correctAnswer: "secret"
    meta:
      acceptedAnswers:
        - "secret"
        - "the secret"
        - "shared secret"
        - "code"

  - type: SINGLE_CHOICE
    title: "Choosing a Factor"
    question: "For a high-value account (email, bank), which second factor is the strongest choice today?"
    difficulty: HARD
    points: 20
    explanation: "A passkey or hardware security key is phishing-resistant by design. An authenticator app is a solid middle ground; SMS is the weakest, exposed to SIM-swap. Prefer the phishing-resistant option where the site supports it."
    options:
      - text: "A passkey or hardware security key"
        isCorrect: true
      - text: "SMS text codes"
        isCorrect: false
      - text: "No second factor, just a long password"
        isCorrect: false
      - text: "The security question about your first pet"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: origin-bound cryptography resists phishing in a way no typed code can."
        - "The weakest 2FA -- SIM-swap fraud hijacks the number and the code with it."
        - "A password alone falls to reuse and leaks; a second factor exists precisely to cover that."
        - "Security questions are guessable or findable and are not a second factor at all."

  - type: SINGLE_CHOICE
    title: "When the App Is Fine"
    question: "A site does not support passkeys yet. What is the reasonable second-best choice?"
    difficulty: HARD
    points: 20
    explanation: "An authenticator app (TOTP) avoids SIM-swap and is far better than SMS. It can still be relay-phished, so pair it with the habit of only entering codes on a site you navigated to yourself."
    options:
      - text: "An authenticator app, entered only on a site you navigated to yourself"
        isCorrect: true
      - text: "Turn off 2FA entirely for convenience"
        isCorrect: false
      - text: "Switch to SMS because it is easier"
        isCorrect: false
      - text: "Reuse the same code across every site"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: TOTP beats SMS, and the out-of-band navigation habit covers its one weakness."
        - "Removing 2FA re-exposes the account to every leaked-password attack -- the wrong direction."
        - "SMS is weaker than an app, not a step up from it."
        - "TOTP codes are per-site and per-moment; the premise of reusing one makes no sense and helps an attacker."
---

## Why a code can still be stolen

The previous lesson ranked 2FA methods and showed how SIM-swap fraud defeats SMS.
But there is a weakness shared by *every* method that produces a code you type --
SMS, authenticator app, or push prompt: the code is a secret, and a secret you can
be talked into handing over can be phished.

The attack is called a **real-time relay**. A fake login page asks for your
password and your 6-digit code. The moment you type them, a script on the
attacker's side enters them into the *real* site, inside the 30-second window
before the code expires. Your authenticator app did exactly its job -- it just had
no way to know the code was going to the wrong place. The human in the middle was
the vulnerability, and no rotating code fixes that.

## What a passkey does differently

A **passkey** removes the shared secret entirely. When you create one, your device
generates a cryptographic **key pair**. The private half never leaves your device
-- not to the site, not to the cloud in usable form, not anywhere. Only the public
half is sent to the site. To log in, the site sends a challenge; your device signs
it with the private key; the site verifies the signature with the public key it
stored. Nothing you could type, and nothing an attacker could intercept, is ever
transmitted.

The decisive property is **origin binding**. The browser ties each passkey to the
exact domain it was created on and will only sign a challenge for that origin. On a
look-alike phishing domain, the passkey simply does not offer itself -- there is no
prompt, no code, nothing for you to mistype. The defence does not depend on you
noticing the fake URL, which is exactly why it works where human vigilance fails.
Passkeys unlock with the same face or fingerprint you already use, so the stronger
option is also the more convenient one.

## Proof at scale {#case}

This is not theoretical. In 2017 Google required all **85,000+ of its employees**
to use physical FIDO security keys -- the hardware ancestor of passkeys -- as their
second factor. In the years that followed, Google reported **zero successful
phishing takeovers** of employee accounts, where before there had been a steady
trickle ([Krebs on Security](https://krebsonsecurity.com/2018/07/google-security-keys-neutralized-employee-phishing/)).

Not "fewer." Zero. The same origin-bound cryptography now ships to ordinary users
as passkeys, built into phones and browsers. The lesson is blunt: a second factor
you *type* narrows the attacker's window; a second factor bound to the real site
closes the door. Where a service offers passkeys, take them.
