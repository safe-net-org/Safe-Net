---
order: 1
title: "URL Structure"
objectives:
  - "Parse a URL into its components and identify the one part -- the domain -- that actually determines where you're going."
  - "Explain, using the 2017 IDN homograph demonstration, why a URL can look completely correct and still be fake."
  - "Recognize decoy subdomains, shortened links, and raw IP addresses as distinct, separate domain-obscuring tricks."
tasks:
  - type: SINGLE_CHOICE
    title: "Identifying the Domain"
    question: "What is the real domain in this link: https://amazon.fake-store.com/products"
    difficulty: EASY
    points: 10
    explanation: "A domain is read right to left. fake-store.com is the real domain, while \"amazon\" is just a subdomain set up by scammers."
    options:
      - text: "amazon"
        isCorrect: false
      - text: "fake-store.com"
        isCorrect: true
      - text: "amazon.fake-store.com"
        isCorrect: false
      - text: "products"
        isCorrect: false
    meta:
      optionRationale:
        - "This is only the subdomain label -- a decoy an attacker can set to anything."
        - "Correct: this is the actual registered domain that controls the site."
        - "This names the full subdomain path, not the domain that actually owns the registration."
        - "This is a path segment, unrelated to which domain the site belongs to."

  - type: SINGLE_CHOICE
    title: "Reading a Real Example"
    question: "In https://mail.google.com/inbox, what is the actual domain?"
    difficulty: EASY
    points: 10
    explanation: "google.com is the registered domain; \"mail\" is a subdomain of it, and \"inbox\" is just a path -- this one happens to be genuine, which is exactly why the same reading method needs to work on both real and fake examples."
    options:
      - text: "mail"
        isCorrect: false
      - text: "google.com"
        isCorrect: true
      - text: "inbox"
        isCorrect: false
      - text: "mail.google"
        isCorrect: false
    meta:
      optionRationale:
        - "This is the subdomain label, not the domain itself."
        - "Correct: this is the actual registered domain controlling the whole address."
        - "This is a path, describing a location within the site, not the domain."
        - "Truncating before \".com\" isn't how domains are read -- the full registered string matters."

  - type: MULTI_CHOICE
    title: "Spotting Decoy Subdomains"
    question: "Which of these use the \"decoy subdomain\" trick, where a familiar brand name is placed in front of an unrelated real domain?"
    difficulty: MEDIUM
    points: 15
    explanation: "apple.com.fake-site.com and secure-paypal.phishing.net both bury a familiar name as a subdomain of a domain the brand doesn't own. mail.google.com and online.yourbank.com are genuine subdomains of domains those brands actually control, and a shortened link is a different technique entirely."
    options:
      - text: "apple.com.fake-site.com"
        isCorrect: true
      - text: "secure-paypal.phishing.net"
        isCorrect: true
      - text: "mail.google.com"
        isCorrect: false
      - text: "online.yourbank.com, from a bank that really owns yourbank.com"
        isCorrect: false
      - text: "A bit.ly shortened link"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: fake-site.com is the real domain here; \"apple.com\" is just a decoy label in front of it."
        - "Correct: phishing.net is the real domain; \"secure-paypal\" is the decoy."
        - "This is a real subdomain of a domain Google actually owns -- not a decoy."
        - "This is a real subdomain of a domain the bank actually owns -- not a decoy."
        - "A shortener hides the destination entirely rather than dressing up a fake one -- a related but different risk."

  - type: SHORT_ANSWER
    title: "Naming the Encoding"
    question: "What is the encoding scheme called that converts Unicode domain characters (like lookalike Cyrillic letters) into an ASCII string starting with \"xn--\"?"
    difficulty: MEDIUM
    points: 15
    correctAnswer: "punycode"
    explanation: "Punycode is how browsers represent internationalized domain names internally -- a domain that displays as familiar Latin letters can decode to an \"xn--\" string that looks nothing like the brand it's impersonating."
    meta:
      acceptedAnswers:
        - "punycode"

  - type: SINGLE_CHOICE
    title: "Why the Fake Apple Domain Fooled Browsers"
    question: "Security researcher Xudong Zheng registered a domain that displayed as \"apple.com\" using Cyrillic characters, and several major browsers showed it exactly that way. Why?"
    difficulty: HARD
    points: 15
    explanation: "Browsers render internationalized domain characters visually, and several Cyrillic letters are visually identical to Latin ones -- so the browser wasn't malfunctioning, it was accurately displaying characters that happen to look like something else entirely."
    options:
      - text: "It was a bug unique to one obscure browser"
        isCorrect: false
      - text: "Browsers render Unicode domain characters visually, and some Cyrillic letters are visually identical to Latin ones"
        isCorrect: true
      - text: "Apple had accidentally authorized the registration"
        isCorrect: false
      - text: "It required directly modifying the browser's source code"
        isCorrect: false
    meta:
      optionRationale:
        - "The underlying rendering behavior affected multiple major browsers, not one obscure edge case."
        - "Correct: this is precisely the mechanism -- visual rendering of characters that are genuinely indistinguishable to the eye."
        - "Apple has no role in third-party domain registration outside its own actual domain."
        - "No modification of any browser was needed -- the domain was registered normally and rendered exactly as designed."

  - type: MULTI_CHOICE
    title: "Real Defenses Against Lookalike Domains"
    question: "Which of these are genuine defenses against a homograph-style lookalike domain?"
    difficulty: HARD
    points: 15
    explanation: "Checking for an unexpected \"xn--\" prefix and typing important domains directly both address the actual mechanism. Trusting a domain because it looks right, or assuming HTTPS rules this out, both miss the point -- a homograph domain can obtain a valid HTTPS certificate just as easily as a real one."
    options:
      - text: "Checking whether an oddly-behaving domain decodes to an \"xn--\" punycode string"
        isCorrect: true
      - text: "Typing known important domains directly instead of clicking a link to them"
        isCorrect: true
      - text: "Trusting a domain because it visually looks like the brand name"
        isCorrect: false
      - text: "Assuming HTTPS rules out this specific trick"
        isCorrect: false
      - text: "Relying on your browser to always flag this automatically"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: this directly exposes the trick, since the visual rendering is exactly what's being exploited."
        - "Correct: this sidesteps the visual-lookalike problem entirely by not relying on reading the domain at all."
        - "Looking right is exactly what this attack is designed to achieve -- it's not evidence of anything."
        - "A homograph domain can get a completely valid HTTPS certificate; encryption says nothing about which domain you're actually on."
        - "Not every browser catches every homograph pattern, and protections have varied significantly across browsers and versions."
---

## Anatomy of a URL

A URL (Uniform Resource Locator) is the address of a resource on the internet: `https://www.example.com:443/path/page?id=123#section`. Reading it left to right: the protocol (https:// for secure, http:// for insecure), a subdomain (www), the domain (example.com -- the main part), a port (:443, usually hidden), a path (/path/page), parameters (?id=123), and an anchor (#section). The most important part is the domain -- everything else can be set to anything an attacker wants, because none of those other pieces require owning or registering anything. Anyone can create a path, a parameter, or a subdomain label pointing wherever they like; only the domain itself has to actually be registered and owned by whoever controls the destination.

## Scammers' Tricks

**Character substitution** swaps a letter for a lookalike: gооgle.com (a Cyrillic "о" instead of "o"), paypa1.com (the digit 1 instead of l), αpple.com (a Greek alpha). **Decoy subdomains** bury the real domain: apple.com.fake-site.com is actually owned by fake-site.com, not Apple. **Shortened links** like bit.ly/abc123 hide the destination entirely until you click. **Raw IP addresses** like http://192.168.1.1/login are almost never how legitimate sites present themselves -- real sites use domains, not bare numbers.

## Real-world case: fooling three browsers at once {#case}

In April 2017, security researcher Xudong Zheng registered а domain that, in a browser's address bar, displayed as `apple.com` -- indistinguishable from the real thing at a glance. The trick relied on Cyrillic characters that render visually identical to their Latin counterparts, converted by the domain system into a punycode string starting with "xn--" that bore no resemblance to "apple" at all. The proof-of-concept page was, at the time, nearly impossible to detect on Chrome, Firefox, and Opera, all of which rendered the fake domain exactly as if it were genuine ([the researcher's own writeup](https://www.xudongz.com/blog/2017/idn-phishing/), [The Hacker News coverage](https://thehackernews.com/2017/04/unicode-Punycode-phishing-attack.html)).

The point wasn't that Apple was targeted specifically -- any recognizable brand name works the same way. It's that "the address bar shows the right name" stopped being sufficient proof on its own, for any domain, the moment this technique became public.

## Why This Still Matters

Every trick in this lesson shares one property: none of them require breaking anything technical. They rely entirely on how domains are read and rendered, which means the defense is also entirely about how you read them -- checking the actual registered domain, not the label sitting in front of it. That single habit, applied consistently, covers substitution tricks, decoy subdomains, and homograph attacks all at once, because all three depend on you not looking closely enough at the same one piece of the address.

None of this requires memorizing a list of bad domains, which would be a losing game anyway since new ones appear constantly. It requires knowing which single question to ask -- what domain actually owns this -- and asking it before clicking, every time, regardless of how convincing everything else on the page looks.
