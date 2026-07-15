---
order: 1
title: "Anatomy of a Phishing Email"
objectives:
  - "Identify the structural elements of an email -- display name, sender domain, links, and urgency language -- that attackers manipulate to impersonate a trusted sender."
  - "Explain why a single character swap or an added subdomain (e.g. micros0ft-alerts.com, netflix.com.billing-verify.net) defeats a casual glance but fails a deliberate domain check."
  - "Apply a hover-and-verify check before clicking a link or replying to an unexpected urgent email, instead of reacting to the pressure it creates."
tasks:
  - type: SINGLE_CHOICE
    title: "Spotting the Strongest Signal"
    question: "You get an email that looks like it's from your bank. Which single detail is the most reliable signal that it's phishing?"
    difficulty: EASY
    points: 10
    explanation: "A request to enter your password through an emailed link, combined with an artificial deadline, is the one combination legitimate banks never use -- they never ask you to re-confirm credentials by email, and urgency is a pressure tactic, not a banking process."
    options:
      - text: "The email uses a generic greeting like 'Dear Customer'"
        isCorrect: false
      - text: "It asks you to confirm your password by clicking a link within 2 hours"
        isCorrect: true
      - text: "The logo looks slightly different from what you remember"
        isCorrect: false
      - text: "It was sent on a Sunday"
        isCorrect: false
    meta:
      optionRationale:
        - "Generic greetings are weak evidence alone -- plenty of legitimate automated mail (shipping updates, newsletters) uses them too."
        - "Correct: no bank asks you to re-confirm a password via a link, and the artificial deadline is a classic urgency lever."
        - "Minor visual drift happens with real rebrands and email clients that recompress images -- not reliable by itself."
        - "Send time carries no diagnostic value; automated systems send at all hours."

  - type: SINGLE_CHOICE
    title: "Reading the Real Domain"
    question: "Netflix's real domain is netflix.com. Which of these sender addresses is genuinely theirs?"
    difficulty: EASY
    points: 10
    explanation: "A domain is read from the first single slash back to the nearest dot -- not by which recognizable brand name appears somewhere in the string. Only one option here is the bare, unmodified netflix.com."
    options:
      - text: "account@netflix.com.billing-verify.net"
        isCorrect: false
      - text: "account@netflix.com"
        isCorrect: true
      - text: "account@netfliix.com"
        isCorrect: false
      - text: "account@netflix-support.com"
        isCorrect: false
    meta:
      optionRationale:
        - "This is a subdomain of billing-verify.net -- 'netflix.com' is just a decoy label here, not the real domain."
        - "Correct: exactly the real registered domain, with nothing added."
        - "An extra 'i' (netfliix) is a classic typosquat built to survive a quick glance."
        - "netflix-support.com is a different, unrelated domain that simply contains the word netflix."

  - type: MULTI_CHOICE
    title: "Finding Every Red Flag"
    question: "Read this snippet: \"Dear Valued Member, we detected unusual sign-in activity. Verify your identity within 24 hours at secure-login-appleid.com or your account will be permanently suspended.\" Select every red flag actually present."
    difficulty: MEDIUM
    points: 15
    explanation: "Urgency, a fabricated deadline, an impersonal greeting, and a lookalike domain are manufactured pressure signals. The topic of the message, its formal tone, and which folder it landed in tell you nothing about legitimacy by themselves."
    options:
      - text: "A generic greeting ('Valued Member') instead of your name"
        isCorrect: true
      - text: "A 24-hour deadline meant to rush your decision"
        isCorrect: true
      - text: "A domain that only resembles Apple's but isn't apple.com"
        isCorrect: true
      - text: "The email mentions 'unusual sign-in activity'"
        isCorrect: false
      - text: "The message is written in formal English"
        isCorrect: false
      - text: "The email landed in your primary inbox rather than spam"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: legitimate providers that already have your account greet you by name, so a generic greeting here is a real red flag."
        - "Correct: the countdown exists to make you act before you check anything else."
        - "Correct: 'secure-login-appleid.com' is not apple.com -- it just contains a familiar word."
        - "Legitimate alerts describe sign-in activity routinely; the topic alone isn't evidence either way."
        - "Formality signals nothing -- scam templates are often more formal than real support emails."
        - "Inbox placement depends on filters, not on whether the sender is who they claim to be."

  - type: SHORT_ANSWER
    title: "Naming the Real Domain"
    question: "An email arrives from 'billing@paypa1-secure-center.com'. Type the brand name being impersonated (lowercase, no extension)."
    difficulty: HARD
    points: 15
    correctAnswer: "paypal"
    explanation: "Stripping the padding ('-secure-center') and the digit-for-letter swap (the numeral 1 standing in for a lowercase l) reveals the brand being impersonated: PayPal. The real paypal.com is not part of this domain at all."
    meta:
      acceptedAnswers:
        - "paypal"
        - "pay pal"

  - type: SINGLE_CHOICE
    title: "Not Every Alarming Email Is Phishing"
    question: "Your actual bank emails you: 'We noticed a sign-in from a new device (Chrome on Windows, Berlin, Germany) at 14:02. If this was you, no action is needed. If not, contact us using the number on the back of your card.' What should you do?"
    difficulty: HARD
    points: 15
    explanation: "This message has none of the usual pressure markers -- no link, no countdown, no request for credentials -- and it deliberately points you to a number you already have rather than one it supplies. The safe response mirrors that: verify through a channel you independently trust, rather than treating every security notice as an attack."
    options:
      - text: "Ignore it -- any message mentioning 'sign-in activity' is a phishing template"
        isCorrect: false
      - text: "Click the link in the email and change your password right away"
        isCorrect: false
      - text: "If you recognize the device, do nothing; otherwise call the number on your card"
        isCorrect: true
      - text: "Reply to the email confirming your name, date of birth, and card number"
        isCorrect: false
    meta:
      optionRationale:
        - "Treating every security notice as fake is its own risk -- this alert is exactly what a legitimate one looks like."
        - "There is no link described in this message, and 'change it immediately via email' is the attacker's move, not the bank's."
        - "Correct: recognize-and-ignore or verify-through-a-trusted-channel is the actual safe default here."
        - "No legitimate bank asks you to reply with your card number and date of birth by email."

  - type: PHISHING_EMAIL
    title: "Simulator: Inspect This Message"
    question: "Click every part of this email that's a red flag before you decide whether to trust it."
    difficulty: HARD
    points: 20
    explanation: "Every element here is manufactured: a spoofed display name riding on a lookalike domain, a same-day countdown, a non-Microsoft link padded with Microsoft's product names, and a threat of irreversible loss. Real Microsoft storage notices arrive in-product and from outlook.com or microsoft.com addresses, never with a 12-hour ultimatum."
    meta:
      email:
        displayName: "Microsoft 365 Security"
        from: "IT-Security Team <it-support@micros0ft-alerts.com>"
        subject: "Action required: your mailbox storage will be suspended in 12 hours"
        body: |
          Dear User,

          Your mailbox has exceeded its storage quota and will be suspended within 12 hours unless you verify your account.

          Click here to verify now: http://outlook-office365-verify.com/login

          Failure to verify will result in permanent loss of all emails and attachments.

          Microsoft 365 Security Team
      redFlags:
        - id: "display-name-mismatch"
          location: "from"
          span: "micros0ft-alerts.com"
          reason: "The display name claims to be Microsoft 365 Security, but the actual address uses a lookalike domain (a zero for the 'o' in Microsoft) that Microsoft doesn't own."
        - id: "urgency-deadline"
          location: "subject"
          span: "suspended in 12 hours"
          reason: "A same-day countdown is designed to trigger a fast, unexamined reaction."
        - id: "suspicious-link"
          location: "body"
          span: "http://outlook-office365-verify.com/login"
          reason: "The link domain isn't Microsoft's -- it just wears Microsoft product names as padding -- and it uses plain http, not https."
        - id: "threat-of-loss"
          location: "body"
          span: "permanent loss of all emails and attachments"
          reason: "Threatening severe, irreversible consequences is a pressure tactic; real quota warnings give you time and appear in-product, not as ultimatums."

  - type: MULTI_CHOICE
    title: "After the Simulator: What Now?"
    question: "You've decided the previous message is phishing. Select every appropriate next step."
    difficulty: HARD
    points: 15
    explanation: "Reporting and escalating preserves the message as evidence and protects colleagues who likely received the same email; clicking, replying, or silently deleting it either confirms you as a live target to the attacker or destroys the trail without warning anyone else."
    options:
      - text: "Report it using your email client's 'Report phishing' button"
        isCorrect: true
      - text: "Forward it to your IT or security team"
        isCorrect: true
      - text: "Click the link to confirm your suspicion before reporting it"
        isCorrect: false
      - text: "Reply to the sender asking them to stop"
        isCorrect: false
      - text: "Delete it immediately without telling anyone"
        isCorrect: false
      - text: "Independently confirm the sender's real domain through your IT helpdesk before assuming"
        isCorrect: true
    meta:
      optionRationale:
        - "Correct: this flags it for your provider and often triggers a broader block."
        - "Correct: your security team can warn others and check for further targeting."
        - "Clicking the link isn't confirmation -- it can trigger tracking, credential theft, or malware."
        - "Replying confirms your address is active and monitored, which is useful information to an attacker."
        - "Deleting it quietly leaves colleagues who got the same email unwarned."
        - "Correct: an independent check (not a link in the email) is exactly how you verify without taking the bait."
---

## Why the trick still works

Phishing succeeds by hijacking fast, automatic judgment instead of attacking your device. A familiar logo and sender name trigger instant trust; a countdown ("within 24 hours") pushes you toward a quick decision before the slower, skeptical part of your thinking gets a chance to check anything. That combination -- borrowed trust plus manufactured urgency -- is doing all the actual work, not some technical exploit.

It also still matters at scale. In its [2025 Data Breach Investigations Report](https://www.verizon.com/business/resources/reports/2025-dbir-data-breach-investigations-report.pdf), Verizon found phishing was the direct starting point for 16% of breaches, and the broader human element -- phishing included, alongside errors and misuse -- was a factor in 60% of all the breaches it analyzed.

## Anatomy of a phishing message

Every phishing email leans on the same four movable parts:

- **Display name** -- the friendly name your inbox shows (e.g. "Microsoft 365 Security"). The sender picks this text freely; it is never verified against the real address.
- **Sender domain** -- the part after the @ in the real address. This is the one part that's hard to fake convincingly, so attackers disguise it instead: adding characters (netfliix.com), swapping a letter for a lookalike digit (micros0ft.com), or burying the real brand as a subdomain of an unrelated site (netflix.com.billing-verify.net, where the actual domain is billing-verify.net).
- **Link text vs. link target** -- the blue underlined words can say anything at all; only hovering, never clicking, reveals where the link actually leads.
- **Urgency language** -- deadlines, suspension threats, and "final notice" wording exist to shorten the time you spend checking the first three items.

These tricks survive a glance because your eyes only sharply resolve a handful of characters at a time; the rest of a word gets filled in by pattern-matching against words you already know. paypa1.com and micros0ft.com are built specifically to exploit that fill-in-the-blanks reading.

## Real-world case: the $120M invoice scam {#case}

Between 2013 and 2015, Evaldas Rimasauskas ran a scheme against two of the most security-conscious companies in the world. He incorporated a shell company in Latvia under the same name as Quanta Computer, a real Taiwan-based hardware supplier both Google and Facebook actually worked with, then sent forged invoices, contracts, and corporate letters through that lookalike identity. Accounts-payable staff at both companies paid them: Facebook wired $99 million and Google wired $23 million before anyone caught on ([NPR](https://www.npr.org/2019/03/25/706715377/man-pleads-guilty-to-phishing-scheme-that-fleeced-facebook-google-of-100-million), [CNBC](https://www.cnbc.com/2019/03/27/phishing-email-scam-stole-100-million-from-facebook-and-google.html)). Rimasauskas pleaded guilty in 2019, forfeited $49.7 million, and was sentenced to five years; both companies say they recovered most or all of the money.

No malware, no hacked servers -- just a spoofed identity trusted enough that nobody double-checked the invoice. It's the same mechanism as a fake bank email, aimed at a company's accounts-payable inbox instead of a person's.

## What this means for your inbox

This isn't a rare event you might avoid by luck. APWG's monitoring counted roughly 3.8 million phishing attacks across 2025 alone ([APWG Trends Reports](https://apwg.org/trendsreports)). The defense that actually scales is boring and mechanical: before you click a link or act on urgency, hover to check the real domain, and verify unexpected requests through a channel you already trust -- never one the message itself provides.
