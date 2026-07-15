---
order: 1
title: "VirusTotal and Other Services"
objectives:
  - "Use a link-checking service like VirusTotal or URLScan.io appropriately, including its privacy tradeoff."
  - "List at least three signals of a suspicious domain registration: age, privacy settings, hosting reputation, and report history."
  - "Recognize QR-code phishing (quishing) as the same trick delivered through a different, less-scrutinized medium."
tasks:
  - type: SINGLE_CHOICE
    title: "Checking Links"
    question: "Which service is NOT meant for checking link safety?"
    difficulty: EASY
    points: 10
    explanation: "Instagram is a social network, not a link safety checking tool."
    options:
      - text: "VirusTotal"
        isCorrect: false
      - text: "URLScan.io"
        isCorrect: false
      - text: "PhishTank"
        isCorrect: false
      - text: "Instagram"
        isCorrect: true
    meta:
      optionRationale:
        - "This is a real, widely used multi-engine link and file scanner."
        - "This is a real tool for analyzing a site's structure and behavior."
        - "This is a real, community-run database of reported phishing sites."
        - "Correct: this is a social platform with no link-safety-checking function."

  - type: SINGLE_CHOICE
    title: "The Privacy Tradeoff"
    question: "Before pasting a link into a public checker like VirusTotal, what should you keep in mind?"
    difficulty: EASY
    points: 10
    explanation: "Links submitted to public scanning services can become visible to others -- avoid pasting personal or private links, and stick to links you weren't going to keep confidential anyway."
    options:
      - text: "Nothing -- submissions are completely private"
        isCorrect: false
      - text: "The link can become visible to others once submitted"
        isCorrect: true
      - text: "It automatically deletes your link after checking"
        isCorrect: false
      - text: "Only paid accounts are allowed to use it"
        isCorrect: false
    meta:
      optionRationale:
        - "Public scanners are, by design, at least partly public -- this assumption is wrong."
        - "Correct: submitted URLs can be visible in the service's public results, which matters if the link contains anything personal."
        - "Submissions typically remain retrievable, not automatically deleted."
        - "Free, unauthenticated use is the norm for these services."

  - type: MULTI_CHOICE
    title: "Signs of a Suspicious Domain"
    question: "Which of these are genuine signals a domain might be suspicious?"
    difficulty: MEDIUM
    points: 15
    explanation: "Recent registration, hidden ownership combined with a recognizable brand name, and existing phishing reports are all real signals a WHOIS lookup or a service like PhishTank can surface. HTTPS, load speed, and a polished logo say nothing about legitimacy."
    options:
      - text: "The domain was registered less than a month ago"
        isCorrect: true
      - text: "Registration details are hidden, despite the site claiming to be a known brand"
        isCorrect: true
      - text: "The domain already has multiple community-submitted phishing reports"
        isCorrect: true
      - text: "The site uses https"
        isCorrect: false
      - text: "The site has a professional-looking logo"
        isCorrect: false
      - text: "The page loads quickly"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: legitimate, long-established brands rarely operate on domains registered days or weeks ago."
        - "Correct: real companies don't typically hide who owns their primary domain."
        - "Correct: this is exactly what PhishTank-style community reporting is for."
        - "https only certifies encryption in transit, not who owns the site or their intent."
        - "Logos are trivially easy to copy and carry no security signal."
        - "Load speed depends on hosting, not legitimacy."

  - type: SHORT_ANSWER
    title: "Naming the Scanner"
    question: "What free, Google-owned service lets you paste a URL to check it against 90+ antivirus engines at once?"
    difficulty: MEDIUM
    points: 15
    correctAnswer: "virustotal"
    explanation: "VirusTotal aggregates dozens of antivirus and threat-intelligence engines behind one submission, returning results in roughly 30 seconds -- useful precisely because no single engine catches everything."
    meta:
      acceptedAnswers:
        - "virustotal"
        - "virus total"

  - type: PHISHING_SITE
    title: "Simulator: Inspect This Login Page"
    question: "Click every part of this page -- including the address bar -- that's a red flag."
    difficulty: HARD
    points: 20
    explanation: "Every visual element here is copied faithfully from the real PayPal site -- the logo, the colors, the footer -- because appearance was never the actual signal to check. The domain, the manufactured account restriction, and the artificial deadline are the only things that differ from a genuine page, and they're exactly what a URL check and a moment of skepticism would catch."
    meta:
      site:
        url: "https://paypal-account-secure-verify.com/login"
        title: "PayPal - Log In to Your Account"
        page: |
          Address bar shows: https://paypal-account-secure-verify.com/login

          Page content:
          - PayPal logo, in the brand's usual blue and white
          - Heading: "Unusual activity detected on your account"
          - Body text: "We've limited your account until we hear from you. Log in below to restore full access within 24 hours."
          - Email field, Password field
          - Button labeled "Log In and Restore Access"
          - Small footer text: "(c) PayPal. All rights reserved."
      redFlags:
        - id: "lookalike-domain"
          location: "url"
          span: "paypal-account-secure-verify.com"
          reason: "Not paypal.com -- padding words like \"account-secure-verify\" are added to look official while being a completely different, unrelated domain."
        - id: "urgency-restriction"
          location: "page"
          span: "limited your account until we hear from you"
          reason: "A manufactured account restriction creates pressure to act immediately, regardless of how polished the rest of the page looks."
        - id: "deadline"
          location: "page"
          span: "within 24 hours"
          reason: "An artificial short deadline exists to shorten how much scrutiny you apply before typing your password."
        - id: "login-harvest-button"
          location: "page"
          span: "Log In and Restore Access"
          reason: "The entire page exists to collect your email and password on a domain PayPal doesn't own -- submitting sends your real credentials straight to the attacker."

  - type: MULTI_CHOICE
    title: "After Spotting a Fake Login Page"
    question: "You've identified the page above as fake. Select every appropriate next step."
    difficulty: HARD
    points: 15
    explanation: "Closing the tab without entering anything, and reporting the URL through a channel like Google Safe Browsing or the real brand's abuse address, both address the situation directly. Testing it with a fake password, or bookmarking it, both add risk or delay for no benefit."
    options:
      - text: "Close the tab without entering anything"
        isCorrect: true
      - text: "Report the URL to a service like Google Safe Browsing or the real brand's abuse team"
        isCorrect: true
      - text: "Enter a fake password just to see what happens"
        isCorrect: false
      - text: "Bookmark it to check again later"
        isCorrect: false
      - text: "Forward the link to a friend to get their opinion"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: this ends your exposure immediately, with no further risk."
        - "Correct: reporting helps get the domain flagged or taken down before it reaches others."
        - "Even a fake password submission can trigger tracking or exploit attempts on a malicious page -- there's no informational upside."
        - "There's no reason to revisit a page you've already confirmed is malicious, and doing so only risks another accidental click."
        - "This just exposes another person to the same risk instead of using a proper reporting channel."
---

## VirusTotal

VirusTotal is a free Google service for checking files and links for viruses. Paste a link at virustotal.com, and the service checks the URL against 90+ antivirus engines, with results appearing within about 30 seconds. It checks for malicious code, signs of phishing, domain reputation, and history of incidents. Important: don't paste in personal links -- they can become visible to others once submitted.

## Other Tools

**URLScan.io** analyzes a site's structure, takes screenshots, and identifies the technologies a page uses. **Google Safe Browsing** is built into Chrome and checks automatically as you browse. **PhishTank** is a community-driven database of reported phishing sites. **WHOIS** provides information about a domain's owner and registration date. Together, the signs of a suspicious domain include: registration within the last month, privacy-shielded ownership paired with a claimed brand identity, hosting in a jurisdiction with a poor reputation, and multiple existing phishing reports.

## Real-world case: the QR code blind spot {#case}

Every check in this lesson assumes you can actually see the URL before deciding whether to trust it. QR codes break that assumption entirely -- scanning one takes you straight to a destination you never read. Attackers have noticed: QR-based phishing, or "quishing," increased roughly fivefold during 2025, reaching about 12% of all phishing attacks that included a link of any kind by the end of the year, with over 4 million QR-code phishing attempts identified in just the first part of the year ([Keepnet's analysis of the trend](https://keepnetlabs.com/blog/qr-code-phishing-trends-in-depth-analysis-of-rising-quishing-statistics)). Executives specifically were found to be far more likely to fall for a quishing attempt than a typical employee, likely because a printed QR code on a parking notice or a conference flyer carries none of the visual cues -- a domain, a sender address -- that email training focuses on.

The underlying trick is identical to everything else in this lesson: a link designed to be trusted without being read. The only thing that changed is the medium it arrives through, and the tools in this lesson -- scanning the decoded URL through VirusTotal or checking it against PhishTank before visiting -- work exactly the same way once you have the actual link in front of you.

Most phone cameras and QR scanner apps will show you the decoded URL before opening it, if you look, in the same way a browser shows a link's real destination when you hover over it. Building the habit of pausing on that preview screen -- reading the domain the way you would in an email -- closes the gap a QR code otherwise opens, without needing a different toolset than the one already covered in this lesson.
