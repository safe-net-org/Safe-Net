---
order: 2
title: "Antivirus and Updates"
objectives:
  - "Explain what antivirus software actually checks and blocks, versus what it has no effect on (like internet speed)."
  - "Explain why a published patch doesn't protect you until it's installed, using WannaCry as the reference case."
  - "Enable automatic updates on at least one of your own devices."
tasks:
  - type: SINGLE_CHOICE
    title: "The Role of Antivirus"
    question: "What is antivirus software's main function?"
    difficulty: EASY
    points: 10
    explanation: "Antivirus software scans files and connections for known malware patterns and blocks or removes what it finds -- it has no effect on internet speed or CPU performance."
    options:
      - text: "Speed up the computer"
        isCorrect: false
      - text: "Detect and block viruses"
        isCorrect: true
      - text: "Increase internet speed"
        isCorrect: false
      - text: "Delete unnecessary files"
        isCorrect: false
    meta:
      optionRationale:
        - "Antivirus scanning can even slow a machine down slightly during a scan -- it isn't a performance tool."
        - "Correct: detecting and blocking malicious code is the entire point of the software."
        - "Antivirus has no relationship to network speed."
        - "Removing junk files is a separate category of utility (a 'cleaner'), not what antivirus does."

  - type: SINGLE_CHOICE
    title: "What an Update Actually Does"
    question: "What does installing a security update primarily do?"
    difficulty: EASY
    points: 10
    explanation: "A security update's job is to close a specific, often already-public, vulnerability that attackers could otherwise exploit -- cosmetic changes are a side effect, not the point."
    options:
      - text: "Makes the interface look nicer"
        isCorrect: false
      - text: "Closes a specific vulnerability attackers could otherwise exploit"
        isCorrect: true
      - text: "Speeds up the processor"
        isCorrect: false
      - text: "Adds new emoji"
        isCorrect: false
    meta:
      optionRationale:
        - "Interface refreshes sometimes ride along with updates, but they aren't the security purpose."
        - "Correct: this is the actual job of a security patch."
        - "Updates aren't a performance product; any speed change is incidental."
        - "Emoji and feature updates are a different release channel from security patches, even when bundled together."

  - type: MULTI_CHOICE
    title: "Signs of a Possible Infection"
    question: "Which of these is a warning sign your device may be infected?"
    difficulty: MEDIUM
    points: 15
    explanation: "Unexplained slowdowns and antivirus disabling itself are real infection indicators. A routine update notification, normal cold-weather battery drain, and your default homepage are all unrelated to infection."
    options:
      - text: "The device runs unusually slowly with no clear reason"
        isCorrect: true
      - text: "Your antivirus turns itself off and won't stay on"
        isCorrect: true
      - text: "You get a routine notification that an OS update is available"
        isCorrect: false
      - text: "Your phone's battery drains a bit faster in cold weather"
        isCorrect: false
      - text: "Your browser opens to the homepage you set it to"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: malware running in the background is a common cause of otherwise-unexplained slowness."
        - "Correct: some malware specifically disables security tools so it can keep running undetected."
        - "An update notification is your OS working normally, not a symptom of anything."
        - "Cold reduces battery chemistry performance regardless of what software is installed -- normal physics, not malware."
        - "This is the browser behaving exactly as configured -- the concerning version is an unexpected homepage change."

  - type: SHORT_ANSWER
    title: "The Cost of Waiting"
    question: "Microsoft published a patch for the EternalBlue vulnerability before WannaCry existed. Roughly how many months passed between the patch's release and the WannaCry outbreak?"
    difficulty: HARD
    points: 15
    correctAnswer: "2"
    explanation: "Microsoft shipped the MS17-010 patch in March 2017; WannaCry hit in May 2017 -- about two months in which unpatched systems remained exposed to a fix that already existed."
    meta:
      acceptedAnswers:
        - "2"
        - "two"
        - "1-2"
        - "one to two"

  - type: SINGLE_CHOICE
    title: "Antivirus Isn't a Substitute for Patching"
    question: "Your antivirus is fully up to date, but your operating system hasn't been patched in 8 months. How protected are you against a known, already-patched vulnerability like EternalBlue?"
    difficulty: HARD
    points: 15
    explanation: "Antivirus catches known malicious files and behavior; it doesn't retroactively close a hole in the operating system itself. An unpatched, known vulnerability remains exploitable regardless of how current your antivirus signatures are."
    options:
      - text: "Fully protected -- antivirus alone covers this"
        isCorrect: false
      - text: "Not protected against that specific hole -- antivirus catches malware, it doesn't patch the OS"
        isCorrect: true
      - text: "Protected, as long as you avoid opening email attachments"
        isCorrect: false
      - text: "Protected, because Windows Update runs in the background regardless of settings"
        isCorrect: false
    meta:
      optionRationale:
        - "Antivirus and OS patching are two different, complementary layers -- one doesn't substitute for the other."
        - "Correct: a known unpatched hole in the OS stays open no matter how current your antivirus signatures are."
        - "EternalBlue-style exploits can spread over the network without any attachment being opened."
        - "Automatic updates only apply if they're enabled and the device is actually online to receive them -- 8 months unpatched implies they aren't."

  - type: MULTI_CHOICE
    title: "Actually Reducing Exposure"
    question: "Which of these changes meaningfully reduce your real exposure to an EternalBlue-style vulnerability?"
    difficulty: HARD
    points: 15
    explanation: "Automatic updates and disabling unused legacy protocols directly shrink your attack surface. Cosmetic changes and unrelated password tweaks don't touch the vulnerability at all."
    options:
      - text: "Enabling automatic OS updates"
        isCorrect: true
      - text: "Disabling unused legacy network protocols (like SMBv1)"
        isCorrect: true
      - text: "Changing your desktop wallpaper"
        isCorrect: false
      - text: "Making your password longer, without changing anything else"
        isCorrect: false
      - text: "Closing unused browser tabs"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: automatic updates mean a fix is applied the moment it ships, not months later."
        - "Correct: EternalBlue specifically targeted SMBv1 -- turning off what you don't use removes that path entirely."
        - "Cosmetic changes have zero security effect."
        - "Password length protects login attempts; it does nothing about a network-level OS vulnerability."
        - "Tab count affects memory use, not vulnerability exposure."
---

## Why Do You Need Antivirus?

Antivirus is software that protects your computer from malware. It works like a guard, checking all files and programs for threats: it scans files as they're downloaded, blocks dangerous websites, removes detected viruses, and protects in real time by watching what programs actually do once they're running, not just what they look like when they arrive. Popular options include Windows Defender (built into Windows), Kaspersky, ESET, and Avast -- and for most people, the free option already installed on their operating system is a perfectly reasonable baseline.

## System Updates

Updates close vulnerabilities in the operating system and the software running on top of it. Hackers constantly search for weak spots -- often by studying the same patch notes developers publish to be transparent about what they fixed -- and developers release patches to close those holes before they can be widely exploited. A patch sitting unapplied on Microsoft's servers protects nobody, though: the fix only counts once it's actually installed on your machine. Outdated systems remain an easy target even after a fix exists, and the gap between "a patch exists" and "everyone has installed it" is precisely where large-scale outbreaks live.

## Real-world case: WannaCry and the two-month warning {#case}

In March 2017, Microsoft shipped a patch closing a Windows networking flaw called EternalBlue. Two months later, on May 12, 2017, the WannaCry ransomware worm used that exact flaw to spread to more than 200,000 computers across 150+ countries in a single weekend ([Wikipedia summary of reporting](https://en.wikipedia.org/wiki/WannaCry_ransomware_attack), [Kaspersky](https://www.kaspersky.com/resource-center/threats/ransomware-wannacry)). The UK's National Health Service was hit hard enough that a third of its trusts were affected and roughly 19,000 appointments were cancelled, at an estimated cost of £92 million.

The patch had existed the entire time. WannaCry didn't succeed because of a secret flaw nobody could have prevented -- it succeeded because updating is easy to postpone until an ordinary Tuesday turns into the reason you can't see a doctor.

## How to Enable Automatic Updates

**Windows:** Settings → Update & Security → Automatic. **macOS:** System Settings → Software Update → Automatic. On a phone, the equivalent setting is usually under Software Update or System Update, and it's worth checking it's actually turned on rather than assumed -- some carriers and manufacturers ship devices with it off by default. Turning this on once means the next EternalBlue-style patch installs itself in the background instead of waiting for you to notice a warning, remember to check, and find the time.

This one setting is also the single most effective thing in this lesson: antivirus catches malware after something has already gone wrong, while an installed patch means the vulnerability that malware would have used simply isn't there anymore.
