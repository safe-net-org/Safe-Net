---
order: 2
title: "How a Detector Reads a URL"
objectives:
  - "Apply the same four automated checks a phishing detector runs: registrable domain, homograph, look-alike distance, and digit substitution."
  - "Explain why matching the technique catches a brand-new phishing domain that no blocklist has ever seen."
  - "Judge a URL the way the engine does -- and recognise when a suspicious-looking address is actually a brand's own subdomain."
tasks:
  - type: SINGLE_CHOICE
    title: "The Part That Decides"
    question: "In login.microsoft.com.account-verify.net, which label decides who you are really talking to?"
    difficulty: EASY
    points: 10
    explanation: "The registrable domain -- the label right before the first single slash -- is account-verify.net. Everything to its left is a subdomain the attacker controls."
    options:
      - text: "microsoft"
        isCorrect: false
      - text: "login"
        isCorrect: false
      - text: "account-verify.net"
        isCorrect: true
      - text: "com"
        isCorrect: false
    meta:
      optionRationale:
        - "A subdomain label -- anyone who owns account-verify.net can put the word microsoft in front of it."
        - "Also a subdomain, and an obvious lure; it decides nothing."
        - "Correct: read right to left and stop at the domain+TLD -- account-verify.net owns this address."
        - "That is the TLD of a decoy label, not the registrable domain on its own."

  - type: SINGLE_CHOICE
    title: "Same Technique, New Address"
    question: "Why can a detector flag a phishing site created one hour ago that no blocklist contains?"
    difficulty: EASY
    points: 10
    explanation: "Blocklists match known-bad addresses; a technique detector matches the trick itself -- a homograph or look-alike -- so a never-before-seen domain is still caught."
    options:
      - text: "It matches the technique (homograph, look-alike), not the specific address"
        isCorrect: true
      - text: "Every new domain is automatically added to a blocklist instantly"
        isCorrect: false
      - text: "It waits for other users to report the site first"
        isCorrect: false
      - text: "New domains are always blocked by default"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: the rules describe what makes a domain deceptive, independent of whether anyone has seen it before."
        - "Blocklists lag reality by hours to days -- that gap is exactly what fresh phishing exploits."
        - "That is a slow, reactive signal; the point of local rules is an instant verdict with no report needed."
        - "Blocking all new domains would break the web; the detector judges the address, not its age."

  - type: MULTI_CHOICE
    title: "What Reads the Address Itself"
    question: "Which checks look at the domain's own characters and shape, needing no external list or network call?"
    difficulty: MEDIUM
    points: 15
    explanation: "Homograph detection, edit-distance to a brand, and digit-substitution all inspect the address itself, offline. A blocklist lookup, waiting for user reports, and scanning page scripts all need something beyond the URL's characters."
    options:
      - text: "Mixed-alphabet (homograph) detection"
        isCorrect: true
      - text: "Edit distance to a known brand (typosquatting)"
        isCorrect: true
      - text: "Digit-for-letter substitution (paypa1, g00gle)"
        isCorrect: true
      - text: "Looking the URL up in a reputation blocklist"
        isCorrect: false
      - text: "Waiting for other users to report the site"
        isCorrect: false
      - text: "Downloading and scanning the page's JavaScript"
        isCorrect: false
    meta:
      optionRationale:
        - "Inspects the script of each character -- pure, offline analysis of the address."
        - "Measures how few edits turn the domain into a real brand -- character analysis."
        - "Normalises digits back to letters, then compares -- character analysis."
        - "Excluded: this consults an external list, not the address's own shape."
        - "Excluded: a slow, reactive signal that needs other people, not the characters in front of you."
        - "Excluded: that inspects page contents after loading, not the URL before it."

  - type: SINGLE_CHOICE
    title: "Reading the Distance"
    question: "The domain paypa1.com de-normalises to paypal.com after undoing one digit swap. What kind of attack is this?"
    difficulty: MEDIUM
    points: 15
    explanation: "Replacing letters with look-alike digits (1 for l, 0 for o) is leet-squatting -- a deliberate attempt to slip past both the human eye and a naive text match."
    options:
      - text: "Leet-squatting (digit-for-letter substitution)"
        isCorrect: true
      - text: "An IDN homograph attack"
        isCorrect: false
      - text: "A legitimate regional domain"
        isCorrect: false
      - text: "A shortened link"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: the 1 stands in for l -- a digit chosen because it looks like the letter."
        - "Homographs use letters from another alphabet (Cyrillic а), not digits; different trick."
        - "No brand registers its own name with a digit in place of a letter -- that is the tell."
        - "There is no redirection here; the deception is in the spelling of the domain itself."

  - type: SHORT_ANSWER
    title: "Name the Registrable Domain"
    question: "For the URL https://sberbank.com.secure-login.ru/account, type the registrable domain (the part that decides who owns it)."
    difficulty: HARD
    points: 20
    explanation: "Reading right to left, the domain+TLD is secure-login.ru. The sberbank.com in front is a subdomain designed to reassure a reader who stops too early."
    correctAnswer: "secure-login.ru"
    meta:
      acceptedAnswers:
        - "secure-login.ru"
        - "secure-login"

  - type: SINGLE_CHOICE
    title: "When Suspicious Is Actually Safe"
    question: "A detector sees mail.google.com and a neural net rates it 98% phishing. Why should the final verdict be safe?"
    difficulty: HARD
    points: 20
    explanation: "The registrable domain google.com is a known brand, and mail is simply its own subdomain -- a brand under itself is not impersonation. Deterministic rules override a jumpy model here."
    options:
      - text: "google.com is a known brand and mail is its own subdomain -- not impersonation"
        isCorrect: true
      - text: "Neural networks are always wrong about Google"
        isCorrect: false
      - text: "Any address containing the word mail is trusted"
        isCorrect: false
      - text: "The site is on a blocklist of safe domains"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: a brand's own subdomain is legitimate; blocking it would make the tool unusable and it would be uninstalled."
        - "The net is not always wrong -- it is noisy, which is exactly why deterministic rules temper it at the extremes."
        - "The word mail alone means nothing; login.microsoft.com is safe but mail-login-secure.tk is not. The registrable domain decides."
        - "There is no such blocklist doing the work here; the verdict comes from recognising the domain as a known brand."
---

## The four questions a detector asks

When SafeNet Guard sees a URL, it does not consult a list of bad websites first.
It reads the address itself and asks four questions -- the same ones you learned
to ask in the previous lesson, now stated the way code checks them:

1. **What is the registrable domain?** Strip the path and query, read the host
   right to left, and stop at the domain plus its top-level suffix. That label,
   and only that label, says who controls the site. `login.microsoft.com` is
   Microsoft; `microsoft.com.verify.net` is `verify.net`.
2. **Do the letters mix alphabets?** A domain that blends Cyrillic and Latin
   characters -- so `а` sits inside an otherwise-Latin word -- is an IDN
   homograph, and there is almost never an innocent reason for it.
3. **How far is it from a real brand?** Count the single-character edits needed to
   turn the domain into a known name. `tinkkoff` is one edit from `tinkoff`; that
   closeness, on a domain that is not the real one, is typosquatting.
4. **Does it use digits as letters?** Undo the common substitutions -- `1`→`l`,
   `0`→`o`, `3`→`e` -- and check again. `paypa1` becomes `paypal`; `g00gle`
   becomes `google`. This is leet-squatting.

## Why the address, not a list

Blocklists are reactive: a site has to be seen, reported, and catalogued before it
appears on one, which takes hours to days. Phishing campaigns are built precisely
for that window -- a domain registered this morning, used for one afternoon, gone
by evening. Matching the *technique* closes the window, because a homograph is a
homograph the first time it is ever used. This is the whole reason the local rule
layer runs on your device with zero network calls: it needs no list and no
lookup, just the characters in front of it.

## Precision, not paranoia {#case}

A detector that shouts at everything is worse than useless, because people
uninstall it. In real testing the fine-tuned neural network in SafeNet Guard rated
`mail.google.com` at **0.98 phishing** and `ozon.ru` at **0.99** -- two of the
most-visited sites in the country ([HuggingFace model card](https://huggingface.co/ealvaradob/bert-finetuned-phishing)).
A tool that blocked Gmail on a model's nervous hunch would be gone by lunchtime.

So the final verdict blends the model with the deterministic rules: the rules
recognise that `google.com` is a known brand and `mail` is its own subdomain, and
they override the model down to safe. The same rules floor the score the other way
when they are certain -- a homograph cannot be argued down. Recognising what is
*normal* is as much a skill as spotting what is not, for a detector exactly as for
a person.
