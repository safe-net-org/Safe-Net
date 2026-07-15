---
order: 1
title: "What Is Digital Safety?"
objectives:
  - "Define digital safety and name the four broad categories of threat it defends against: malware, phishing, surveillance, and data breaches."
  - "Distinguish protective actions with a real, measurable effect (updates, 2FA, backups) from ones that only feel protective."
  - "Cite a current authoritative estimate of cybercrime's financial scale instead of relying on intuition."
tasks:
  - type: SINGLE_CHOICE
    title: "Main Threats"
    question: "Which of these is NOT a digital safety threat?"
    difficulty: EASY
    points: 10
    explanation: "Operating system updates are not a threat -- on the contrary, they close vulnerabilities and protect against attacks."
    options:
      - text: "A phishing email from a \"bank\""
        isCorrect: false
      - text: "A virus on a USB drive"
        isCorrect: false
      - text: "An operating system update"
        isCorrect: true
      - text: "An account hack"
        isCorrect: false
    meta:
      optionRationale:
        - "This is a real, common attack vector -- it belongs on the threat list."
        - "Removable media can carry autorun malware -- a genuine threat."
        - "Correct: updates close the holes attackers exploit; they reduce risk, they don't create it."
        - "Losing control of an account is the definition of a successful attack, not a safety measure."

  - type: MULTI_CHOICE
    title: "Protection Methods"
    question: "Select the correct protection methods (multiple answers):"
    difficulty: EASY
    points: 15
    explanation: "Two-factor authentication and security updates are the main protection methods. Using one password everywhere and disabling antivirus make you vulnerable."
    options:
      - text: "Use one password everywhere"
        isCorrect: false
      - text: "Enable two-factor authentication"
        isCorrect: true
      - text: "Install security updates"
        isCorrect: true
      - text: "Disable antivirus to speed up the PC"
        isCorrect: false
      - text: "Write your password down on a sticky note on your monitor"
        isCorrect: false
    meta:
      optionRationale:
        - "Password reuse means one leaked site compromises every other account using it."
        - "Correct: a second factor stops most automated account takeovers even if the password leaks."
        - "Correct: this is how known vulnerabilities actually get closed on your device."
        - "Antivirus checks files and connections in real time; disabling it removes a real layer of defense for a marginal speed gain."
        - "A visible sticky note turns a strong password into a public one for anyone who walks past your desk."

  - type: SINGLE_CHOICE
    title: "The One Preparation That Actually Works"
    question: "Ransomware encrypts every file on your laptop. Which single preparation guarantees you don't have to pay to get your files back?"
    difficulty: MEDIUM
    points: 15
    explanation: "Antivirus, passwords, and 2FA all help prevent an infection, but once files are already encrypted, only a backup made before the attack -- stored somewhere the ransomware couldn't reach -- restores them without paying."
    options:
      - text: "Running antivirus after you notice the encrypted files"
        isCorrect: false
      - text: "Having used a strong, unique password for your laptop login"
        isCorrect: false
      - text: "A recent backup stored offline or in a separate account the ransomware can't touch"
        isCorrect: true
      - text: "Having two-factor authentication turned on for your email"
        isCorrect: false
    meta:
      optionRationale:
        - "By the time files are encrypted, antivirus can remove the malware but can't reverse the encryption."
        - "A strong login password doesn't help once malware is already running under your own account."
        - "Correct: a backup made before the attack, kept somewhere the ransomware can't reach, is the only guaranteed way back into your files."
        - "2FA on email protects your inbox; it does nothing for files already encrypted on the device."

  - type: MULTI_CHOICE
    title: "What Counts as \"the Human Element\"?"
    question: "Security researchers often say breaches involve a 'human element.' Which of these are examples of that, rather than a purely technical failure?"
    difficulty: MEDIUM
    points: 15
    explanation: "Clicking a phishing link, reusing a password, and misconfiguring a storage bucket are all decisions a person made. An unpatched zero-day and hardware failure are technical, not human, even though a person may be affected by them."
    options:
      - text: "An employee clicks a phishing link in an email"
        isCorrect: true
      - text: "Someone reuses their email password on a shopping site that later leaks it"
        isCorrect: true
      - text: "A developer leaves a cloud storage bucket publicly readable by mistake"
        isCorrect: true
      - text: "An attacker exploits a zero-day vulnerability nobody knew existed"
        isCorrect: false
      - text: "A hard drive fails after years of normal use"
        isCorrect: false
      - text: "A data center loses power during a storm"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: clicking is a human decision, which is exactly what phishing is designed to trigger."
        - "Correct: reuse is a choice, and it's how one small leak becomes many compromised accounts."
        - "Correct: a misconfiguration is a person setting something up incorrectly, not a flaw being exploited."
        - "A zero-day is a technical flaw in software; no human error was required for the vulnerability to exist."
        - "Hardware wear is a mechanical failure, not a decision anyone made."
        - "A power outage during a storm is an environmental/infrastructure event, not a human error."

  - type: SHORT_ANSWER
    title: "Cybercrime by the Numbers"
    question: "According to the FBI's 2025 Internet Crime Report, which type of fraud was the single largest component of the $20.9 billion in reported losses?"
    difficulty: HARD
    points: 15
    correctAnswer: "investment fraud"
    explanation: "Investment-related fraud (much of it cryptocurrency-based 'pig butchering' schemes) was the largest single component of the FBI IC3's $20.9 billion in reported 2025 losses -- ahead of business email compromise and tech support scams."
    meta:
      acceptedAnswers:
        - "investment fraud"
        - "investment"
        - "investment scams"

  - type: SINGLE_CHOICE
    title: "Best Use of 20 Minutes"
    question: "You have 20 minutes to spend improving your digital safety today. Which single action gives the best return?"
    difficulty: HARD
    points: 15
    explanation: "Two-factor authentication on your email account protects the one account almost every other account's password-reset flow depends on -- a single 20-minute change with outsized downstream effect, unlike narrower or purely cosmetic actions."
    options:
      - text: "Buy a premium antivirus subscription"
        isCorrect: false
      - text: "Turn on two-factor authentication on your primary email account"
        isCorrect: true
      - text: "Memorize a longer password for one single website"
        isCorrect: false
      - text: "Read the terms of service of an app you already use"
        isCorrect: false
    meta:
      optionRationale:
        - "A paid antivirus is a marginal upgrade over a free, reputable one -- not the highest-leverage 20 minutes."
        - "Correct: email is the recovery path for most other accounts, so protecting it protects everything downstream."
        - "Improving one password helps only that one site, not your overall exposure."
        - "Reading a ToS rarely changes what you'll actually do, and doesn't reduce any concrete risk."
---

## Introduction to Digital Safety

Digital safety is the protection of your data, devices, and personal information online. In today's world, we store photos, messages, banking details, and much more on our phones and computers -- often without ever consciously deciding to trust those devices with so much of our lives. That trust is exactly what attackers are counting on.

Without proper protection, attackers can steal your money, gain access to your private messages, use your data for fraud, or lock you out of your own files. None of this requires you to be a specific, high-value target: most attacks are automated and untargeted, cast wide against millions of people at once on the assumption that a small percentage will fail to notice something is wrong.

## Main Threats

**Viruses and malware** are programs that infect your device and steal data, often running quietly in the background long after the initial infection. **Phishing** is when scammers pose as banks or well-known companies to trick you into revealing your passwords or payment details, usually by manufacturing urgency. **Surveillance** is collecting information about you without your consent, whether by an app, a network operator, or an attacker who's compromised your device. **Data breaches** happen when companies lose databases containing users' passwords and personal information -- an event entirely outside your control that still puts your accounts at risk.

## How to Protect Yourself

None of these threats require you to become a security expert -- a handful of habits close most of the practical gap between an easy target and a hard one: use strong, unique passwords for each site; turn on two-factor authentication wherever it's offered; install system updates promptly instead of postponing them; don't open suspicious links or attachments; run antivirus software; and back up your important files somewhere the rest of a compromise can't reach. Each of these addresses a different threat category above -- there's no single fix that covers all four.

## Real-world case: cybercrime by the numbers {#case}

It's easy to assume this mostly happens to other people. The [FBI's 2025 Internet Crime Report](https://www.ic3.gov/AnnualReport/Reports/2025_IC3Report.pdf) says otherwise: over 1,000,000 complaints and $20.9 billion in reported losses in a single year, a 26% increase over 2024. Investment fraud -- much of it cryptocurrency-related -- was the single largest category, ahead of business email compromise and tech support scams. Americans over 60 alone reported $7.7 billion in losses, up 37% year over year.

These are only the losses people actually reported. The real number is higher, and it keeps climbing every year the report has existed. The rest of this course is about the specific habits that keep you out of that statistic.
