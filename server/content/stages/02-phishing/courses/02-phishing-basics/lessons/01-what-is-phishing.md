---
order: 1
title: "What Is Phishing?"
objectives:
  - "Define phishing and explain the metaphor behind the name."
  - "Distinguish email phishing, smishing, vishing, spear phishing, and whaling by delivery channel and target."
  - "Cite the current, sourced share of breaches that begin with phishing, instead of an inflated, unsourced figure."
tasks:
  - type: SINGLE_CHOICE
    title: "Recognizing Phishing"
    question: "Which email is definitely phishing?"
    difficulty: EASY
    points: 10
    explanation: "Legitimate services never urgently ask you to confirm your password via a link. This is a classic sign of phishing."
    options:
      - text: "A package delivery notice from a courier service"
        isCorrect: false
      - text: "A demand to urgently confirm your password or your account will be deleted"
        isCorrect: true
      - text: "A newsletter from a store"
        isCorrect: false
      - text: "An order confirmation from a well-known site"
        isCorrect: false
    meta:
      optionRationale:
        - "Delivery notices are routine, if occasionally faked -- this one alone isn't damning."
        - "Correct: the combination of urgency, a threat, and a password request via link is the tell."
        - "Newsletters are low-stakes and expected if you subscribed."
        - "Order confirmations from a site you actually used are normal, unremarkable email."

  - type: MULTI_CHOICE
    title: "Signs of Phishing"
    question: "Select ALL signs of a phishing email:"
    difficulty: EASY
    points: 15
    explanation: "Urgency, errors, and requests to enter your password are classic signs of phishing. A personal greeting can also appear in legitimate emails, so it isn't diagnostic on its own."
    options:
      - text: "Urgency and threats"
        isCorrect: true
      - text: "Errors in the text"
        isCorrect: true
      - text: "Personal greeting by name"
        isCorrect: false
      - text: "A request to enter your password via a link"
        isCorrect: true
      - text: "The email having any links at all"
        isCorrect: false
      - text: "The email including images or a logo"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: manufactured urgency exists to shorten how long you spend checking anything else."
        - "Correct: large legitimate organizations proofread; scam templates often don't."
        - "Real companies that already have your name on file greet you by it too -- this isn't unique to phishing."
        - "Correct: legitimate services don't ask you to re-enter credentials through an emailed link."
        - "Plenty of legitimate email contains links -- it's what the link asks you to do that matters."
        - "Nearly all commercial email, real or fake, includes images and a logo -- this carries no signal."

  - type: SINGLE_CHOICE
    title: "Naming the Channel"
    question: "A call claims to be your bank's fraud department and asks you to read back a code that was just texted to you. What is this technique called?"
    difficulty: MEDIUM
    points: 15
    explanation: "This is vishing -- voice phishing. Real fraud departments never ask you to read back a one-time code; that code exists specifically to prove a request came from you, not from someone impersonating your bank."
    options:
      - text: "A standard, legitimate verification call"
        isCorrect: false
      - text: "Vishing"
        isCorrect: true
      - text: "Whaling"
        isCorrect: false
      - text: "Spam"
        isCorrect: false
    meta:
      optionRationale:
        - "No legitimate fraud department asks you to read a one-time code back over the phone."
        - "Correct: vishing is phishing conducted by voice call rather than email or text."
        - "Whaling specifically targets senior executives with tailored pretexts, not a random customer."
        - "Spam is unsolicited bulk messaging; this is a targeted, active attempt to extract a code."

  - type: SHORT_ANSWER
    title: "Where the Name Comes From"
    question: "\"Phishing\" is a deliberate misspelling of which English word?"
    difficulty: MEDIUM
    points: 10
    correctAnswer: "fishing"
    explanation: "Attackers \"cast a line\" in the form of a fake message and wait to see who bites -- the same logic as fishing, spelled with a ph as an homage to 1970s \"phone phreaking\" culture."
    meta:
      acceptedAnswers:
        - "fishing"

  - type: SINGLE_CHOICE
    title: "The Real Number"
    question: "According to Verizon's 2025 Data Breach Investigations Report, what share of breaches began with phishing directly?"
    difficulty: HARD
    points: 15
    explanation: "Verizon's 2025 DBIR puts phishing as the direct starting point for 16% of breaches -- still significant, but a long way from the 90%-style figures that circulate informally without a source."
    options:
      - text: "About 90%"
        isCorrect: false
      - text: "About 16%"
        isCorrect: true
      - text: "About 50%"
        isCorrect: false
      - text: "About 2%"
        isCorrect: false
    meta:
      optionRationale:
        - "This figure gets repeated often but isn't supported by the current DBIR data -- treat round, dramatic numbers with no source as a flag in themselves."
        - "Correct: this is the sourced, current figure for phishing as a direct breach vector."
        - "Credential abuse (22%) and vulnerability exploitation (20%) are each larger than phishing alone in the 2025 data."
        - "This understates it -- phishing is a meaningful, not marginal, share of breaches."

  - type: MULTI_CHOICE
    title: "Spotting Targeted Attacks"
    question: "Which of these describe spear phishing or whaling, specifically -- not just ordinary mass phishing?"
    difficulty: HARD
    points: 15
    explanation: "Spear phishing and whaling are defined by personalization and a specific, valuable target -- a real job title, a real project, or a senior executive's authority being impersonated. Mass, generic offers sent to random addresses are ordinary phishing, not a targeted attack."
    options:
      - text: "An email personalized with the target's real job title and a real recent project name"
        isCorrect: true
      - text: "An email impersonating the CEO, urgently asking the CFO to wire funds"
        isCorrect: true
      - text: "A mass email offering a free iPhone to 10 million random addresses"
        isCorrect: false
      - text: "A company-wide newsletter about new benefits"
        isCorrect: false
      - text: "A generic \"your package is waiting\" text sent to random phone numbers"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: this level of specific research into one person is exactly what defines spear phishing."
        - "Correct: impersonating an executive to target another executive with financial authority is the classic whaling pattern."
        - "Breadth without personalization is ordinary phishing -- the opposite of \"spear.\""
        - "A real internal newsletter isn't an attack at all."
        - "This is ordinary smishing sent at random, with no personalization -- not a targeted attack on a specific individual."
---

## Defining Phishing

Phishing is a type of fraud where attackers pose as trusted organizations to trick you into revealing passwords, bank card details, personal information, or money. The name comes from "fishing" -- scammers "cast a line" in the form of a fake message and wait to see who "bites," with the "ph" borrowed from 1970s "phone phreaking" slang. The core mechanism hasn't changed since: it's cheaper and more reliable for an attacker to trick one person into handing over access voluntarily than to break through a technical defense, which is why phishing remains the entry point of choice even as the specific channels it travels through keep expanding.

## Types of Phishing

**Email phishing** uses fake emails from "banks" and "support teams." **Smishing** (SMS phishing) uses fraudulent texts like "Your package is waiting for pickup, follow this link." **Vishing** (voice phishing) uses calls claiming to be from a bank, asking you to read out a code from a text message. **Spear phishing** is a targeted attack against a specific person, often an executive, built around real details about them. **Whaling** specifically targets top company executives, usually to authorize a fraudulent payment.

## Signs of Phishing

Watch for urgency ("Your account will be locked in 24 hours!"), threats ("If you don't confirm your details, your account will be closed"), offers that are too good ("You've won an iPhone!"), errors in spelling and grammar, a strange sender address (support@amaz0n.com instead of amazon.com), suspicious links (gooogle.com, paypa1.com), and any request to enter your password -- real companies never ask for it this way.

## Real-world case: how common is this, really? {#case}

Figures like "90% of attacks start with phishing" circulate widely without a clear source, and they don't hold up against current data. Verizon's [2025 Data Breach Investigations Report](https://www.verizon.com/business/resources/reports/2025-dbir-data-breach-investigations-report.pdf) puts phishing as the direct starting point for 16% of breaches -- smaller than credential abuse (22%) or vulnerability exploitation (20%) alone, though the broader "human element" category, which includes phishing alongside errors and misuse, is a factor in 60% of all breaches analyzed.

That doesn't make phishing rare. The [Anti-Phishing Working Group](https://apwg.org/trendsreports) tracked roughly 3.8 million phishing attacks across 2025 alone, arriving at a fairly steady pace of 850,000 to 1.1 million per quarter. The accurate picture is: not the dominant cause of every breach, but a large, steady, unglamorous volume of attempts landing in inboxes every single day, at a scale that makes "I probably won't ever see one" a much riskier assumption than "I'll see one eventually, so it's worth knowing what to check."
