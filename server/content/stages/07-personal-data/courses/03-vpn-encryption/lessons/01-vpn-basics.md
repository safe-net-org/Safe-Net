---
order: 1
title: "VPN Basics"
objectives:
  - "Explain what a VPN actually does -- and doesn't do -- to protect a user's traffic and identity."
  - "Apply criteria like an audited no-logs policy and provider reputation to distinguish trustworthy VPNs from risky ones."
  - "Explain how Hola VPN's free users unknowingly became part of a monetized exit-node network, and why free VPN business models deserve extra scrutiny."
tasks:
  - type: SINGLE_CHOICE
    title: "VPN"
    question: "A VPN's main purpose is to:"
    difficulty: EASY
    points: 15
    explanation: "A VPN encrypts your internet traffic and hides your IP address, protecting against surveillance and data interception in transit."
    options:
      - text: "Speed up the internet"
        isCorrect: false
      - text: "Encrypt traffic and hide your IP address"
        isCorrect: true
      - text: "Block ads"
        isCorrect: false
      - text: "Increase download speed"
        isCorrect: false
    meta:
      optionRationale:
        - "A VPN typically adds a small amount of latency rather than speeding up a connection."
        - "Correct: encryption and IP-masking are the actual, defining functions of a VPN."
        - "Ad blocking is a separate function, sometimes bundled in but not what a VPN fundamentally does."
        - "Routing through an extra server generally doesn't increase raw download speed."

  - type: SINGLE_CHOICE
    title: "What Your ISP Sees"
    question: "What does your internet provider (ISP) see while you're connected to a VPN?"
    difficulty: EASY
    points: 10
    explanation: "Your ISP can still see that you're connected to a VPN server, but not which specific sites you visit or what you do once your traffic is inside the encrypted tunnel."
    options:
      - text: "Only that you're connected to a VPN server, not which sites you visit"
        isCorrect: true
      - text: "Every website you visit, in plain, unencrypted form"
        isCorrect: false
      - text: "Nothing at all, including whether you're online"
        isCorrect: false
      - text: "Your saved passwords"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: the VPN connection itself is visible to your ISP, but the encrypted contents inside it are not."
        - "This is exactly what a VPN prevents -- without one, this would be true."
        - "Your ISP can still see that a connection exists; a VPN hides content, not connectivity."
        - "A VPN encrypts traffic in transit -- it has no access to credentials saved in your browser or apps."

  - type: MULTI_CHOICE
    title: "Legitimate Reasons to Use a VPN"
    question: "Which of these are legitimate, realistic reasons someone might use a VPN?"
    difficulty: MEDIUM
    points: 15
    explanation: "Protecting traffic on public Wi-Fi and hiding browsing activity from an ISP are both real, well-supported benefits. A VPN does not guarantee complete or permanent anonymity, does not make illegal activity untraceable, and does not stop browser fingerprinting or other tracking methods that don't rely on your IP address."
    options:
      - text: "Protecting your traffic on public Wi-Fi"
        isCorrect: true
      - text: "Hiding your browsing activity from your ISP"
        isCorrect: true
      - text: "Guaranteeing complete, permanent anonymity online"
        isCorrect: false
      - text: "Making illegal activity completely untraceable"
        isCorrect: false
      - text: "Eliminating browser fingerprinting and all other forms of tracking"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: this is one of the most concrete, well-supported real benefits of using a VPN."
        - "Correct: an ISP genuinely can't see the contents of encrypted VPN traffic."
        - "No VPN can guarantee this -- logs, court orders, and provider trustworthiness all still matter."
        - "Legal processes and other investigative methods can still trace activity despite a VPN."
        - "Browser fingerprinting relies on far more than IP address, and a VPN does nothing to stop it."

  - type: SINGLE_CHOICE
    title: "The Most Important Criterion"
    question: "Which of these is the most important criterion when choosing a paid VPN provider?"
    difficulty: MEDIUM
    points: 15
    explanation: "An independently audited no-logs policy is the one criterion that actually determines whether the provider itself could hand over your activity if pressured or compromised -- everything else is a secondary convenience factor."
    options:
      - text: "An independently audited no-logs policy"
        isCorrect: true
      - text: "Having the most visually appealing app icon"
        isCorrect: false
      - text: "Being the first result in a search engine ad"
        isCorrect: false
      - text: "Offering the absolute lowest price, regardless of reputation"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: an audited no-logs policy is the substantive factor that determines what the provider could expose about you."
        - "App aesthetics have no bearing on actual privacy or security."
        - "Ad placement reflects marketing budget, not trustworthiness or audit history."
        - "The cheapest option, chosen without regard to reputation, is exactly how many users have ended up with disreputable providers."

  - type: SINGLE_CHOICE
    title: "What Hola Did With Free Users"
    question: "Starting in late 2014, what did Hola VPN begin doing with its free users' internet connections, without clearly informing them?"
    difficulty: HARD
    points: 20
    explanation: "Hola began selling access to its free users' bandwidth and IP addresses as exit nodes, through a paid commercial service called Luminati, charging other customers for traffic that was actually routed through ordinary people's home connections."
    options:
      - text: "Selling access to their bandwidth and IP addresses as exit nodes through a paid service called Luminati"
        isCorrect: true
      - text: "Donating their spare bandwidth to charitable organizations"
        isCorrect: false
      - text: "Using it exclusively to improve Hola's own app performance"
        isCorrect: false
      - text: "Nothing -- this is a myth with no factual basis"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: this is the confirmed, documented mechanism -- Hola's founder acknowledged it once the practice came to light."
        - "The bandwidth was sold commercially at $20 per gigabyte, not donated."
        - "The bandwidth was resold to Luminati's paying customers, not used internally."
        - "This was confirmed directly by Hola's own co-founder, not a myth or rumor."

  - type: SINGLE_CHOICE
    title: "The Risk to Free Users"
    question: "Beyond the lack of clear informed consent, what specific risk did Hola's exit-node scheme create for its free users?"
    difficulty: HARD
    points: 20
    explanation: "Because other Luminati customers' traffic could exit through an ordinary Hola user's home IP address, that user's connection could be associated with someone else's activity entirely -- including, in the incident that exposed the practice, traffic linked to an attack on the site 8chan."
    options:
      - text: "Other people's traffic, potentially including abusive activity, could exit through an ordinary user's home IP address"
        isCorrect: true
      - text: "Their physical devices could be permanently damaged"
        isCorrect: false
      - text: "Their Hola accounts were automatically deleted"
        isCorrect: false
      - text: "No meaningful risk was created by this arrangement"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: this exit-node association is precisely the risk that came to light when the scheme was exposed via an attack traced back through Luminati."
        - "This was a software and network arrangement, with no plausible mechanism for physical hardware damage."
        - "Accounts continued operating normally -- the issue was undisclosed traffic routing, not account status."
        - "Having your home IP associated with a stranger's traffic is a real, documented risk, not a non-issue."
---

## What Is a VPN

A VPN (Virtual Private Network) encrypts your traffic and hides your IP address from the sites you visit. Once you turn it on, your traffic travels through an encrypted tunnel to a VPN server; websites then see the VPN server's IP address rather than yours, and your own ISP sees only that you're connected to a VPN, not which sites you're visiting or what you're doing. People use VPNs to bypass regional blocks, protect themselves on public Wi-Fi where traffic can otherwise be intercepted, hide activity from their ISP, or access region-locked content -- but a VPN does not make you anonymous in any absolute sense, and it does nothing to stop tracking methods, like browser fingerprinting, that don't depend on your IP address.

## Choosing a VPN

Reputable paid options include NordVPN, ExpressVPN, ProtonVPN, and Mullvad; free options with real limitations include ProtonVPN's free tier and Windscribe's 10 GB/month plan. Avoid VPNs bundled with suspicious apps, random free VPNs with no track record, and any provider with a pattern of poor independent reviews. The selection criteria that actually matter: an independently audited no-logs policy, connection speed, server count, device support, and price -- roughly in that order of importance, since a provider that logs your activity, or lies about not doing so, undermines the entire reason to use one in the first place.

## Real-world case: the free VPN that turned its users into a product {#case}

In May 2015, 8chan founder Fredrick Brennan publicly called out Hola, a free, peer-to-peer VPN browser extension with tens of millions of users, after the site was attacked using Hola's own network. The investigation that followed revealed that Hola had, since late 2014, been selling access to its free users' bandwidth and IP addresses as exit nodes through a separate paid service called Luminati, charging other customers $20 per gigabyte for traffic that was actually routed through ordinary people's home internet connections ([Wikipedia's account of Hola VPN](https://en.wikipedia.org/wiki/Hola_%28VPN%29)). Hola's co-founder confirmed the arrangement, arguing it had technically been disclosed in the service's terms -- but most of Hola's free users, reasonably, had no idea that other people's traffic, potentially including abusive or illegal activity, could exit through their own home IP address as a result. Security researchers separately found vulnerabilities in Hola's client software that could let an attacker deliver malware to its users. The lesson generalizes well beyond this one company: when a VPN, or any service, is free, the business model has to make money somewhere -- and "somewhere" is worth understanding before you install it.
