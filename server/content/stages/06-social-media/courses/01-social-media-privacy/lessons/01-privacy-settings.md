---
order: 1
title: "Privacy Settings"
objectives:
  - "Identify what social media posts can reveal to employers, scammers, marketers, and strangers, and the real consequences of that exposure."
  - "Configure privacy settings on major platforms to limit visibility to people outside your circle."
  - "Explain how the Cambridge Analytica scandal turned an ordinary quiz app into a mass data-harvesting operation, and what it changed about platform data policy."
tasks:
  - type: SINGLE_CHOICE
    title: "Social Media Privacy"
    question: "Which of these is safer to post on a public profile?"
    difficulty: EASY
    points: 10
    explanation: "A photo without geotags carries relatively little risk. Documents, your address, and travel bookings with reference numbers can all be used directly by scammers."
    options:
      - text: "Your passport number"
        isCorrect: false
      - text: "Your home address"
        isCorrect: false
      - text: "A photo with no geotags attached"
        isCorrect: true
      - text: "A photo of plane tickets showing the booking number"
        isCorrect: false
    meta:
      optionRationale:
        - "A government ID number is exactly the kind of critical identifier that enables fraud in someone else's name."
        - "A home address, once public, can't be taken back and enables real-world risks like stalking or burglary timing."
        - "Correct: without location data or identifying text, a plain photo reveals comparatively little."
        - "A visible booking reference can sometimes be used to look up or even modify someone else's travel booking."

  - type: MULTI_CHOICE
    title: "What to Lock Down"
    question: "Which of these are worth hiding or disabling on a social media profile? (multiple):"
    difficulty: EASY
    points: 15
    explanation: "Geotags and a visible friends list both give strangers real leverage -- geotags reveal patterns in where you are, and a friends list is often used to build fake profiles for impersonation scams. A profile photo and display name are, by contrast, generally the point of having a public-facing account at all."
    options:
      - text: "Automatic geolocation tagging on posts"
        isCorrect: true
      - text: "Your full friends/followers list"
        isCorrect: true
      - text: "Your profile photo"
        isCorrect: false
      - text: "Your display name"
        isCorrect: false
      - text: "The date you created the account"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: geotags let anyone reconstruct your regular locations and routines over time."
        - "Correct: a visible friends list is routinely used to build convincing impersonation profiles for scams."
        - "A profile photo is generally the point of a public account -- it's not itself a meaningful risk."
        - "A display name is expected to be visible on any social platform."
        - "Account creation date carries essentially no exploitable information on its own."

  - type: SINGLE_CHOICE
    title: "Timing Your Posts"
    question: "Why do security-conscious people wait until after a trip to post vacation photos, rather than posting in real time?"
    difficulty: MEDIUM
    points: 15
    explanation: "Posting in real time effectively broadcasts that your home is currently unoccupied -- burglars have used exactly this kind of public posting to time break-ins. Posting after returning removes that signal entirely while still sharing the trip."
    options:
      - text: "Real-time posts broadcast that your home is currently empty"
        isCorrect: true
      - text: "Photos posted later look higher quality"
        isCorrect: false
      - text: "Platforms require a delay before travel photos can be posted"
        isCorrect: false
      - text: "Delayed posts get better engagement from the algorithm"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: this is the actual, documented risk -- vacation posts in real time are a known signal used to time burglaries."
        - "Photo quality has nothing to do with when a photo is posted relative to the trip."
        - "No platform enforces a posting delay for travel content."
        - "Engagement timing is unrelated to the actual security reasoning here."

  - type: MULTI_CHOICE
    title: "What Your Data Adds Up To"
    question: "Which combinations of information, if exposed together, let someone impersonate you or take over your accounts?"
    difficulty: MEDIUM
    points: 15
    explanation: "Your full legal name plus date of birth is frequently enough to answer identity-verification questions used by banks and lenders. Phone number plus recovery email are exactly what most account-recovery flows rely on. A favorite movie or a follower count carry essentially no exploitable value on their own."
    options:
      - text: "Full legal name plus date of birth"
        isCorrect: true
      - text: "Phone number plus the email used for account recovery"
        isCorrect: true
      - text: "Your favorite movie"
        isCorrect: false
      - text: "Your total follower count"
        isCorrect: false
      - text: "Your profile's color scheme"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: this combination is frequently sufficient to pass identity checks used for loans or account recovery."
        - "Correct: these are precisely the fields most account-recovery flows are built around."
        - "A favorite movie has no use in identity verification or account takeover."
        - "Follower count reveals nothing usable for impersonation."
        - "Cosmetic profile choices carry no exploitable identity information."

  - type: SINGLE_CHOICE
    title: "How the Data Was Obtained"
    question: "How did Cambridge Analytica initially obtain data on approximately 87 million Facebook users?"
    difficulty: HARD
    points: 20
    explanation: "A personality-quiz app, built by researcher Aleksandr Kogan, used Facebook's then-existing API to pull data not just from the roughly 270,000 people who installed it, but from all of their friends too -- none of whom had consented or even knew the app existed."
    options:
      - text: "Through a personality-quiz app that harvested data from users and their friends, most of whom never consented"
        isCorrect: true
      - text: "By directly hacking Facebook's servers"
        isCorrect: false
      - text: "By purchasing the data on the dark web"
        isCorrect: false
      - text: "Users voluntarily uploaded their own data directly to Cambridge Analytica"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: this friends-of-users data pull, via a now-discontinued Facebook API permission, is exactly the documented mechanism."
        - "No server breach was involved -- the access was through a legitimate, if since-restricted, API permission."
        - "The data was harvested directly through the app's API access, not purchased afterward."
        - "The ~270,000 quiz-takers didn't realize their friends' data was being pulled too -- this wasn't a direct, informed handover by 87 million people."

  - type: SINGLE_CHOICE
    title: "What Changed Afterward"
    question: "What was one major, concrete consequence of the Cambridge Analytica scandal?"
    difficulty: HARD
    points: 20
    explanation: "Meta agreed in December 2022 to a $725 million settlement over the data-sharing practices exposed by the scandal, and platforms broadly locked down how much data third-party apps could pull about a user's friends -- the exact permission Kogan's app had relied on."
    options:
      - text: "Meta agreed to a $725 million settlement, and platforms broadly restricted how much friend data third-party apps could access"
        isCorrect: true
      - text: "Facebook was permanently shut down as a company"
        isCorrect: false
      - text: "The scandal had no lasting effect on platform policy"
        isCorrect: false
      - text: "It only ever affected users outside the United States"
        isCorrect: false
    meta:
      optionRationale:
        - "Correct: both the financial settlement and the API restrictions are real, documented outcomes."
        - "Facebook continued operating -- the consequences were financial and regulatory, not a shutdown."
        - "The API changes restricting friend-data access were a direct, lasting policy response."
        - "The settlement covered U.S. Facebook account holders specifically, and the policy changes were global."
---

## Why Privacy Matters

What you post can be seen well beyond your intended audience: employers screening candidates, scammers gathering profile details, marketers building ad targeting, and strangers with no particular reason to be looking. From ordinary posts, a stranger can often work out where you live from geotags, when your home is empty from real-time vacation posts, where you work or study, and who your close contacts are. That information doesn't stay abstract -- it enables social-engineering attacks against you, identity theft, and in some documented cases stalking or burglary timed around a post. None of this requires any special skill on the attacker's part; it's often just a matter of scrolling through a public profile and taking notes over time.

## How to Configure Privacy

Every major platform has a private-account or restricted-visibility setting: Instagram and TikTok both offer a straightforward "Private Account" toggle, Facebook lets you restrict post visibility to friends only, and Telegram lets you hide your phone number and profile photo from non-contacts. Beyond the basic toggle, turning off automatic geolocation tagging, hiding your friends or followers list, periodically reviewing old public posts, and declining follow requests from strangers all meaningfully reduce what an outside observer can piece together about you. None of these settings make a profile un-searchable or eliminate risk entirely -- the goal is narrowing your audience to people who already have a real reason to see your posts, rather than leaving everything open to anyone who happens to look.

## Real-world case: when a quiz app became a data-harvesting operation {#case}

In March 2018, reporting revealed that Cambridge Analytica, a political consulting firm, had obtained personal data from roughly 87 million Facebook users. The data didn't come from a breach -- it came from a personality-quiz app, built by researcher Aleksandr Kogan, that around 270,000 people installed. At the time, Facebook's API let an installed app pull data not just from the person who installed it, but from all of that person's friends as well, none of whom had agreed to anything. Cambridge Analytica used the resulting dataset to build detailed psychological and political profiles used for targeted advertising during the 2016 U.S. presidential campaign ([Wikipedia's account of the Facebook–Cambridge Analytica data scandal](https://en.wikipedia.org/wiki/Facebook%E2%80%93Cambridge_Analytica_data_scandal)). In December 2022, Meta agreed to a $725 million settlement over the practices the scandal exposed -- one of the largest privacy settlements in U.S. history -- with payments to affected users beginning in 2025 and a second round in 2026.

The scandal is worth remembering less for its political specifics than for the general lesson it demonstrates: privacy isn't only about what you personally choose to share. Kogan's app never asked the 87 million affected friends for anything -- their exposure came entirely from a permission someone else in their network granted, without their knowledge. The same structural risk exists in a smaller way whenever any app or quiz asks for social-login permissions today.
