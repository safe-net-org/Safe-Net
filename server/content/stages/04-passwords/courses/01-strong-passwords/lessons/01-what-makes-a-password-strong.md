---
order: 1
title: "What Makes a Password Strong?"
objectives:
  - "Apply NIST's 2025 guidance -- length over complexity, no forced rotation -- instead of outdated password rules."
  - "Explain why a long passphrase resists automated guessing better than a short password stuffed with symbols."
  - "Explain what the RockYou2024 compilation demonstrates about the real danger of password reuse."
tasks:
  - type: SINGLE_CHOICE
    title: "Password Strength"
    question: "Which password is the strongest?"
    difficulty: EASY
    points: 10
    explanation: "xK8#mP2$vL9@rT4! is both the longest option and contains no dictionary words or personal details -- length combined with unpredictability, not symbol density for its own sake, is what actually resists automated guessing."
    options:
      - text: "Password123"
        isCorrect: false
      - text: "myname1990"
        isCorrect: false
      - text: "qwerty12345"
        isCorrect: false
      - text: "xK8#mP2$vL9@rT4!"
        isCorrect: true
    meta:
      optionRationale:
        - "A dictionary word plus a predictable number suffix is one of the first patterns a cracking tool tries."
        - "A name plus a birth year is exactly the kind of personal, guessable combination attackers try first."
        - "A keyboard-row pattern is among the most commonly attempted passwords in any cracking wordlist."
        - "Correct: this is the longest option here and contains no recognizable word or personal pattern."

  - type: SINGLE_CHOICE
    title: "What Matters Most, According to NIST"
    question: "According to NIST's 2025 password guidelines (SP 800-63B Revision 4), which factor matters most for password strength?"
    difficulty: EASY
    points: 10
    explanation: "NIST's 2025 revision shifts the emphasis explicitly to length, recommending at least 15 characters, and moves away from mandating specific character-mixing rules."
    options:
      - text: "Mixing uppercase, lowercase, digits, and symbols"
        isCorrect: false
      - text: "Length"
        isCorrect: true
      - text: "Changing the password every 90 days"
        isCorrect: false
      - text: "Spelling a dictionary word backwards"
        isCorrect: false
    meta:
      optionRationale:
        - "The updated guidance explicitly moves away from mandating this as a requirement."
        - "Correct: length is the single factor the 2025 revision emphasizes above all others."
        - "Forced periodic rotation is no longer recommended unless there's evidence of compromise."
        - "Reversing a dictionary word is a pattern cracking tools check for specifically -- it isn't meaningfully stronger."

  - type: MULTI_CHOICE
    title: "What Actually Changed in 2025"
    question: "Which of these are real changes in NIST's 2025 password guidance?"
    difficulty: MEDIUM
    points: 15
    explanation: "The 2025 revision raised the recommended minimum to 15 characters, dropped mandatory periodic rotation absent evidence of compromise, and now requires screening against breached-password lists. It did not make symbols mandatory or add security questions as a requirement."
    options:
      - text: "Minimum recommended length raised to 15 characters"
        isCorrect: true
      - text: "Mandatory periodic rotation removed, unless compromise is suspected"
        isCorrect: true
      - text: "Passwords must be screened against known breached or common password lists"
        isCorrect: true
      - text: "Special characters are now mandatory for every password"
        isCorrect: false
      - text: "Security questions are now required as a mandatory third factor"
        isCorrect: false
      - text: "Passwords must now be changed every 30 days"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: this is the headline change in the 2025 revision."
        - "Correct: forced rotation without cause is explicitly discouraged now, since it tends to produce weaker, predictable variations."
        - "Correct: checking against known-compromised and common passwords is now part of the guidance."
        - "The opposite happened -- mandatory composition rules were relaxed, not tightened."
        - "Security questions aren't part of this guidance at all."
        - "This is the opposite of the actual change -- rotation was relaxed, not made more frequent."

  - type: SHORT_ANSWER
    title: "The Size of RockYou2024"
    question: "Roughly how many unique passwords did the 2024 compilation known as RockYou2024 contain, to the nearest billion?"
    difficulty: MEDIUM
    points: 15
    correctAnswer: "10"
    explanation: "RockYou2024 contained just under 10 billion unique plaintext passwords -- compiled from more than two decades of prior breaches -- making it the largest such compilation ever assembled."
    meta:
      acceptedAnswers:
        - "10"
        - "9.9"
        - "nearly 10"
        - "almost 10"

  - type: SINGLE_CHOICE
    title: "What RockYou2024 Actually Demonstrates"
    question: "What does the existence of RockYou2024 mainly demonstrate about password reuse?"
    difficulty: HARD
    points: 15
    explanation: "RockYou2024 aggregated passwords from thousands of previous breaches across two decades -- a password that leaked from any one of them, even an old, seemingly irrelevant one, ends up in a single massive list attackers can test against every account you own."
    options:
      - text: "That most modern passwords are effectively unbreakable"
        isCorrect: false
      - text: "That a password leaked from any one of thousands of past breaches can end up in a single giant list attackers test everywhere"
        isCorrect: true
      - text: "That only weak, obviously bad passwords ever leak"
        isCorrect: false
      - text: "That it affects only one specific website's users"
        isCorrect: false
    meta:
      optionRationale:
        - "The scale of the compilation is exactly the opposite signal -- these passwords were breakable enough to already be known."
        - "Correct: aggregation across thousands of unrelated breaches is precisely what makes reuse so dangerous."
        - "Strong, unique passwords leak too, whenever the site storing them is itself breached."
        - "The compilation aggregates breaches from over 4,000 different sources across two decades, not one."

  - type: SINGLE_CHOICE
    title: "Why Forced Rotation Backfired"
    question: "Why does NIST's 2025 guidance recommend against forced periodic password changes for accounts with no evidence of compromise?"
    difficulty: HARD
    points: 15
    explanation: "In practice, forced frequent changes push people toward small, predictable variations of the same base password (Password1, Password2...) rather than genuinely new ones -- weakening security while adding friction, which is why the guidance changed."
    options:
      - text: "Rotation is technically impossible to enforce at scale"
        isCorrect: false
      - text: "Forced frequent changes tend to produce small, predictable variations of the same password rather than truly new ones"
        isCorrect: true
      - text: "Rotating passwords makes them easier for attackers to guess directly"
        isCorrect: false
      - text: "It was never actually a recommendation in the first place"
        isCorrect: false
    meta:
      optionRationale:
        - "Enforcement isn't the issue -- plenty of systems successfully forced rotation for years."
        - "Correct: this documented behavioral pattern is exactly why the guidance shifted."
        - "Rotation itself doesn't directly help an attacker guess -- the issue is what it does to human behavior, not the mechanism of guessing."
        - "Mandatory rotation was standard security advice for a long time before this guidance changed it."
---

## Criteria for a Strong Password

NIST's 2025 guidance (Special Publication 800-63B, Revision 4) shifts the emphasis to length: a minimum of 15 characters is now recommended, and mandatory complexity rules -- forcing specific mixes of uppercase, symbols, and digits -- have been relaxed rather than tightened. What still matters: no dictionary words, no personal information like a name or birth year, a unique password for every site, and screening against lists of known breached or commonly used passwords. Weak passwords still look like password123, qwerty, or johnsmith1990; strong ones are long, unpredictable, and never reused.

## How Hackers Crack Passwords

**Brute force** tries every possible combination -- "12345" falls instantly, while a genuinely long, random password can take millions of years. **Dictionary attacks** try common words and predictable variations first. **Credential stuffing** takes passwords already leaked from one breach and tries them everywhere else, which is why reuse is so dangerous regardless of how strong any individual password looks. **Social engineering** skips guessing entirely and simply tricks you into handing a password over.

## Real-world case: ten billion passwords in one file {#case}

In July 2024, researchers identified a compilation that came to be called RockYou2024: just under 10 billion unique plaintext passwords, assembled from more than 4,000 separate data breaches spanning over two decades, packaged into a single 145 GB file ([Cybernews' analysis](https://cybernews.com/security/rockyou2024-largest-password-compilation-leak/)). Nothing about the compilation itself was new malware or a fresh hack -- it was simply the accumulated debris of every previous breach, sorted into one list.

That's exactly what makes it dangerous: a password from a site you haven't used in a decade, that leaked in a breach you never heard about, is sitting in this file next to your current passwords on any other account that happens to reuse it. Credential-stuffing tools don't need to guess anything when a list like this already contains the real answer.

## Putting This Into Practice

Given both the NIST update and RockYou2024, the practical takeaway is the same one this course keeps returning to: length over cleverness, and uniqueness over memorability -- which is precisely the problem a password manager, covered in the next course, is built to solve.

A useful, memorable way to hit 15+ characters without relying on symbol-stuffing is a passphrase built from several unrelated words strung together -- something like four random dictionary words joined without obvious structure. It's long enough to resist brute-forcing, easier to type and recall than a random string of symbols, and avoids the exact predictable patterns -- names, keyboard rows, single dictionary words -- that both older advice and this lesson's cracking methods specifically target.
