---
order: 1
title: "Social Engineering Methods"
objectives:
  - "Define social engineering and name the five psychological levers it typically exploits: trust, fear, greed, curiosity, and authority."
  - "Distinguish pretexting, baiting, quid pro quo, tailgating, and authority impersonation by their underlying mechanism."
  - "Explain how the 2016 Bangladesh Bank heist combined stolen access with a procedural, human-facing weak point to move $101 million."
tasks:
  - type: SINGLE_CHOICE
    title: "Naming the Technique: Baiting"
    question: "An attacker leaves a USB drive labeled \"2024 Salaries\" in the office parking lot, hoping someone plugs it in. What technique is this?"
    difficulty: EASY
    points: 10
    explanation: "Baiting dangles something tempting -- curiosity about salary data, in this case -- to get a target to do the attacker's work for them, like plugging in an infected drive."
    options:
      - text: "Pretexting"
        isCorrect: false
      - text: "Baiting"
        isCorrect: true
      - text: "Tailgating"
        isCorrect: false
      - text: "Quid pro quo"
        isCorrect: false
    meta:
      optionRationale:
        - "Pretexting involves inventing a fabricated situation, usually over a call or email -- there's no invented story here, just a tempting object."
        - "Correct: this is the textbook definition of baiting -- an appealing physical or digital lure."
        - "Tailgating is physically following someone through a secured door -- nothing physical access related here."
        - "Quid pro quo offers a specific favor in exchange for something -- there's no exchange being offered."

  - type: MULTI_CHOICE
    title: "Spotting Authority as the Lever"
    question: "Which of these specifically exploit authority -- pretending to outrank or out-authorize the target -- rather than a different psychological lever?"
    difficulty: MEDIUM
    points: 15
    explanation: "\"This is the director\" and fake IT support both work by borrowing the weight of a role the target is reluctant to question. A USB drive relies on curiosity, and someone holding open a door relies on ordinary politeness, not authority."
    options:
      - text: "\"This is the director, transfer the money now!\""
        isCorrect: true
      - text: "A caller claiming to be IT support, asking you to \"verify\" your password"
        isCorrect: true
      - text: "A USB drive left in a parking lot labeled with something tempting"
        isCorrect: false
      - text: "Someone carrying boxes asks you to hold the office door open"
        isCorrect: false
      - text: "An unusually generous cash-back offer for signing up today"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: impersonating a senior role to pressure quick compliance is authority, directly."
        - "Correct: IT support is a role people are conditioned not to question -- that's authority being borrowed."
        - "This is baiting -- it relies on curiosity, not a claimed role."
        - "This is tailgating -- it relies on ordinary courtesy, not a position of authority."
        - "This is exploiting greed/urgency around a deal, not a claimed position of authority."

  - type: SHORT_ANSWER
    title: "Mitnick's Method"
    question: "Kevin Mitnick's social engineering attacks often worked by calling employees and posing as which department, to extract credentials over the phone?"
    difficulty: MEDIUM
    points: 15
    correctAnswer: "it"
    explanation: "Mitnick frequently posed as IT support -- a role people are trained to cooperate with quickly, which made it an effective pretext for extracting passwords and access over the phone."
    meta:
      acceptedAnswers:
        - "it"
        - "it support"
        - "tech support"
        - "information technology"

  - type: SINGLE_CHOICE
    title: "Social Engineering by Phone"
    question: "A call claiming to be from tech support asks you to read out a code from a text message. This is:"
    difficulty: HARD
    points: 15
    explanation: "This is vishing (voice phishing) -- a form of social engineering. Real tech support will never ask for a code from an SMS."
    options:
      - text: "A standard verification procedure"
        isCorrect: false
      - text: "Social engineering (vishing)"
        isCorrect: true
      - text: "A legitimate bank request"
        isCorrect: false
      - text: "Technical support doing its job"
        isCorrect: false
    meta:
      optionRationale:
        - "No legitimate verification process asks you to read a one-time code back over the phone."
        - "Correct: this is exactly the vishing pattern -- borrowing a trusted role to extract a code that proves nothing except that you were tricked into reading it."
        - "Banks don't verify identity by asking you to read out a code they didn't generate for that purpose."
        - "Genuine tech support has other ways to verify you that don't involve your one-time codes."

  - type: SINGLE_CHOICE
    title: "The Typo That Saved Most of a Billion Dollars"
    question: "In the 2016 Bangladesh Bank heist, what specifically caused most of the roughly $1 billion in fraudulent transfer requests to be blocked?"
    difficulty: HARD
    points: 20
    explanation: "A routing bank noticed the word \"fandation\" instead of \"foundation\" in one of the fraudulent requests, which triggered a manual review that stopped further transfers -- an almost accidental catch, not a technical defense working as designed."
    options:
      - text: "Antivirus software on the receiving bank's servers"
        isCorrect: false
      - text: "A spelling error (\"fandation\" instead of \"foundation\") that drew a routing bank's scrutiny"
        isCorrect: true
      - text: "Bangladesh Bank noticed the fraud immediately on February 4"
        isCorrect: false
      - text: "An AI fraud-detection system built into SWIFT"
        isCorrect: false
    meta:
      optionRationale:
        - "Antivirus wasn't the mechanism that caught this -- it was a human noticing an odd word in a routed request."
        - "Correct: an almost accidental typo, not a technical safeguard, is what stopped billions more from moving."
        - "The bank didn't discover the fraud for days, partly because the attack was timed around a weekend and a local holiday."
        - "No such AI system was involved -- the catch was a person's attention to an oddly worded line."

  - type: SINGLE_CHOICE
    title: "What Actually Broke"
    question: "SWIFT's core network itself wasn't hacked in the Bangladesh Bank heist. What made the theft possible?"
    difficulty: HARD
    points: 20
    explanation: "Attackers compromised Bangladesh Bank's own local systems with malware, including a keylogger, and then used the bank's legitimate, stolen SWIFT credentials to submit transfer requests that looked completely authentic to receiving banks -- the weak point was the bank's own environment, not SWIFT's network."
    options:
      - text: "SWIFT's core global network was directly broken into"
        isCorrect: false
      - text: "Attackers compromised the bank's own local systems and used legitimate, stolen SWIFT credentials"
        isCorrect: true
      - text: "The New York Fed approved the transfers with no verification at all"
        isCorrect: false
      - text: "The attack required no malware, only social engineering over the phone"
        isCorrect: false
    meta:
      optionRationale:
        - "SWIFT as a network wasn't breached -- the attackers operated from inside the bank, using credentials that were valid."
        - "Correct: the actual weak point was the bank's own local environment, not the shared financial messaging network everyone relies on."
        - "The Fed did apply scrutiny -- that's precisely why most of the ~$1 billion in requests were blocked."
        - "Malware, including a keystroke logger, was a core part of how the credentials were obtained in the first place."
---

## What Is Social Engineering?

Social engineering is manipulating people to obtain confidential information or access to systems, rather than breaking through a technical defense at all. Instead of purely technical methods, it works on psychology: trust, fear, greed, curiosity, and authority. Kevin Mitnick, one of the most famous examples, hacked companies for years largely by calling employees and posing as IT support -- often needing nothing more than a plausible-sounding voice and the confidence to ask directly. The reason this keeps working across decades and industries is simple: every organization eventually has to trust its own people with sensitive access, and a good enough impersonation of a trusted role borrows that access without ever needing to defeat a firewall.

## Manipulation Techniques

**Pretexting** invents a fabricated situation -- "I'm from the IT department, I urgently need to verify your password." **Baiting** offers something tempting, like an infected USB drive labeled "2024 Salaries." **Quid pro quo** trades a favor for a favor -- "I'll help you fix the problem, but I need your password." **Tailgating** is physical intrusion, like someone carrying boxes asking you to hold the office door open. **Authority** impersonates a superior -- "This is the director, transfer the money now!"

## Real-world case: the $81 million typo {#case}

On February 4, 2016, attackers who had already compromised Bangladesh Bank's own computer systems -- using malware that included a keystroke logger -- submitted roughly three dozen transfer requests through the SWIFT financial messaging network, attempting to move nearly $1 billion out of the bank's account at the Federal Reserve Bank of New York ([Wikipedia](https://en.wikipedia.org/wiki/Bangladesh_Bank_robbery)). The credentials used were entirely legitimate; nothing about the requests looked forged to systems checking only whether they came from an authorized source.

Five requests went through before the pattern was interrupted, moving $101 million: $20 million toward a Sri Lankan account, and $81 million into a bank in the Philippines, most of which quickly disappeared into local casinos. The rest of the roughly $1 billion in attempted transfers was stopped not by a technical safeguard working as designed, but because a routing bank noticed the word "fandation" instead of "foundation" in one request and flagged it for manual review. As of recent reporting, only a fraction of the $81 million routed through the Philippines has ever been recovered.

The lesson generalizes: the credentials were real, the network wasn't broken into, and the attack still worked, because the actual weak point was procedural -- how much scrutiny a routine-looking, correctly authenticated request receives before money moves.
