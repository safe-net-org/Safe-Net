---
order: 1
title: "HTTPS and Secure Connections"
objectives:
  - "Identify the padlock/https indicator and state precisely what it does and doesn't guarantee."
  - "Explain, using the Firesheep case, why an encrypted connection is not the same as a safe site."
  - "Avoid entering credentials over public Wi-Fi without a VPN or cellular fallback."
tasks:
  - type: SINGLE_CHOICE
    title: "A Secure Connection"
    question: "What sign indicates a secure connection?"
    difficulty: EASY
    points: 10
    explanation: "A lock icon and the https:// prefix indicate the data between your browser and that server is encrypted using TLS -- nothing about page design, load speed, or domain length signals this."
    options:
      - text: "The site loads quickly"
        isCorrect: false
      - text: "The address bar shows a lock icon and https://"
        isCorrect: true
      - text: "The site has a nice design"
        isCorrect: false
      - text: "The site is in English"
        isCorrect: false
    meta:
      optionRationale:
        - "Load speed depends on hosting and caching, not encryption."
        - "Correct: this is the actual technical indicator of an encrypted connection."
        - "Design quality is unrelated to whether traffic is encrypted."
        - "Language has no bearing on the connection's security."

  - type: SINGLE_CHOICE
    title: "What the Padlock Actually Promises"
    question: "A site shows https:// and a padlock. What does this actually guarantee?"
    difficulty: EASY
    points: 10
    explanation: "The padlock only certifies that traffic between you and that server is encrypted in transit. It says nothing about whether the operator is honest, whether the site is a scam, or whether a form on it is legitimate -- phishing sites routinely use https too."
    options:
      - text: "The site's operator is trustworthy"
        isCorrect: false
      - text: "Data between your browser and that server is encrypted in transit"
        isCorrect: true
      - text: "The site has been checked for scams"
        isCorrect: false
      - text: "The site cannot contain a phishing login form"
        isCorrect: false
    meta:
      optionRationale:
        - "Encryption says nothing about who is on the other end or their intentions."
        - "Correct: this is the entire and only guarantee https provides."
        - "Certificate authorities verify domain control, not honesty or business legitimacy."
        - "Phishing sites obtain https certificates just as easily as legitimate ones -- it's not a scam filter."

  - type: MULTI_CHOICE
    title: "Public Wi-Fi: Safe vs. Risky Habits"
    question: "Which of these are genuinely safer habits on public Wi-Fi?"
    difficulty: MEDIUM
    points: 15
    explanation: "A VPN, waiting for cellular data on sensitive logins, and disabling auto-connect all reduce real exposure. Trusting a network purely by its name, and disabling your firewall, both increase risk."
    options:
      - text: "Using a VPN before logging into anything sensitive"
        isCorrect: true
      - text: "Waiting until you're on cellular data to do any banking"
        isCorrect: true
      - text: "Turning off auto-connect to open Wi-Fi networks"
        isCorrect: true
      - text: "Connecting to any network named after the cafe you're sitting in"
        isCorrect: false
      - text: "Disabling your firewall to \"improve speed\""
        isCorrect: false
      - text: "Assuming a padlock icon means the Wi-Fi network itself is safe"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: a VPN encrypts your traffic before it ever touches the local network."
        - "Correct: cellular data isn't shared with strangers on the same access point the way open Wi-Fi is."
        - "Correct: this prevents your device from silently joining a lookalike network with the same name."
        - "Attackers frequently name rogue access points after real nearby businesses -- the name alone proves nothing."
        - "A firewall is a defensive layer; disabling it for a marginal speed gain removes real protection."
        - "The padlock only certifies the site's connection, not the Wi-Fi network carrying it."

  - type: SHORT_ANSWER
    title: "The Tool That Changed the Web"
    question: "What was the name of the 2010 Firefox extension that let anyone hijack a logged-in Facebook or Twitter session over open Wi-Fi with one click?"
    difficulty: MEDIUM
    points: 15
    correctAnswer: "firesheep"
    explanation: "Firesheep, released in 2010, captured unencrypted session cookies on open Wi-Fi and made session hijacking a one-click point-and-shoot exercise -- it's a big part of why sites now encrypt entire sessions, not just login pages."
    meta:
      acceptedAnswers:
        - "firesheep"
        - "fire sheep"

  - type: SINGLE_CHOICE
    title: "What Firesheep Actually Captured"
    question: "Firesheep didn't steal anyone's password. What did it capture to take over accounts?"
    difficulty: HARD
    points: 15
    explanation: "Firesheep sniffed the session cookie a site sent back after login, over a connection that wasn't encrypted. With that cookie, it could impersonate an already-logged-in user without ever knowing their password."
    options:
      - text: "The user's password, via a keylogger"
        isCorrect: false
      - text: "The session cookie sent after login, over an unencrypted connection"
        isCorrect: true
      - text: "The user's Wi-Fi router password"
        isCorrect: false
      - text: "The user's email address only"
        isCorrect: false
    meta:
      optionRationale:
        - "Firesheep never touched keystrokes -- it operated purely on network traffic."
        - "Correct: this is exactly the mechanism, and it's why encrypting only the login page wasn't enough."
        - "Firesheep captured cookies from web sessions, not router credentials."
        - "An email address alone isn't enough to hijack a session; the cookie was the actual key."

  - type: SINGLE_CHOICE
    title: "The Real Fix"
    question: "Which of these is the most complete defense against a Firesheep-style session-hijacking attack today?"
    difficulty: HARD
    points: 15
    explanation: "The actual fix was structural: sites now encrypt the entire session with https, not just the login form, so there's no unencrypted cookie left to intercept. Individual habits like logging out sooner or clearing a cache don't address the underlying gap."
    options:
      - text: "A site that encrypts the entire session with https, not just the login page"
        isCorrect: true
      - text: "Choosing a longer account password"
        isCorrect: false
      - text: "Logging out immediately after logging in"
        isCorrect: false
      - text: "Clearing your browser cache every day"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: this closes the actual gap Firesheep exploited -- an unencrypted cookie in transit."
        - "Password strength doesn't matter once a live session cookie is captured."
        - "Logging out immediately isn't practical and still leaves a window open while the session is active."
        - "Cache clearing doesn't affect what was already sent over the network in the moment."
---

## What Is HTTPS?

HTTPS is a secure version of the HTTP protocol -- the "S" stands for Secure. With plain HTTP, data is transmitted as plain text, readable by anything sitting between your browser and the server it's talking to; with HTTPS, that data is encrypted, so an eavesdropper on the network only sees scrambled traffic. You can check this yourself: look for a lock icon and "https://" at the start of the address bar. This matters most when the stakes are highest -- online banking, shopping, entering passwords, and private messaging -- but modern browsers now flag plain HTTP sites as "not secure" by default precisely because encryption has become the expected baseline rather than the exception.

## The Danger of Public Wi-Fi

In cafes, airports, and other places with free Wi-Fi, your data can be intercepted by anyone else on the same network, because open networks typically don't encrypt traffic between your device and the router the way your home Wi-Fi password does. A hacker on a public network can potentially capture social media passwords, bank card details, private messages, and session cookies -- the last of which can be enough to hijack an already-logged-in account without ever learning the password itself. Using a VPN, avoiding passwords on public Wi-Fi, turning off auto-connect to networks, and saving sensitive transactions for mobile data all meaningfully reduce this exposure, and none of them require any technical expertise to set up.

## Real-world case: the Firesheep wake-up call {#case}

For years, most websites only encrypted the login page, then dropped back to plain HTTP for the rest of the session -- fast, and seemingly harmless, since the password itself was safe. In October 2010, developer Eric Butler released Firesheep, a Firefox extension that captured those unencrypted session cookies on open Wi-Fi and let anyone nearby take over a logged-in Facebook or Twitter session with one click, no password required ([Wikipedia](https://en.wikipedia.org/wiki/Firesheep)).

The demonstration was blunt enough that it worked: sites began encrypting entire sessions, not just logins, and HTTPS adoption across the web went from roughly 30% in 2010 to over 95% today. The lesson generalizes past Firesheep itself -- a security gap that seems abstract stays unfixed until something makes it trivially easy to exploit.

## Staying Safe on the Move

Combine the two ideas from this lesson: check for https before you trust a page with anything sensitive, and don't assume an open Wi-Fi network is safe just because the site you're visiting is encrypted -- the network itself is a separate risk a VPN is built to cover.
