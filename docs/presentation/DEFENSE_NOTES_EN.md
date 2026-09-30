# Safe-Net: short defense notes

Suggested delivery: about five minutes. Use your own words and accurately identify which parts you built, any collaborators and AI assistance. Do not read every item on each slide.

## 1. Safe-Net

Safe-Net is a cybersecurity learning prototype. I wanted to connect explanations in a course with decisions in a simulated phishing task and with the reasons shown by a URL warning. The current project runs locally. I am looking for feedback on the system and the next evaluation.

## 2. The research question

My question is whether practice with explanations helps people recognize unfamiliar phishing cues. A correct answer on a familiar example could reflect memorization, so I would compare interactive practice with an equal-duration text lesson and assess different examples after a delay. This is a proposed study. I have not yet measured learning gains.

## 3. How the system works

The web app presents English and Russian learning content. The learning API grades answers and stores progress in PostgreSQL. The web URL scanner and the Chrome extension import the same TypeScript rules package. An optional Python service mirrors those rules and can add a model opinion. The shared package helps keep the scanner and extension consistent.

## 4. The learning experience

The repository contains 21 courses, 27 lessons, 163 tasks and 21 final tests. This screenshot comes from a synthetic local account. I completed six lesson tasks and an eight-question test, then received one certificate. The purpose was to check the course flow. The 100% score is not a participant outcome or evidence that the course improves learning.

## 5. Server-side assessment

For a phishing simulation, the learner selects suspicious text. The server compares that selection against an answer key that is excluded from the learner's payload. Progress is tied to the account, so a fresh tab can restore completed tasks. Database constraints also prevent duplicate task XP awards and duplicate course certificates.

## 6. An explainable warning

This is an illustrative URL, not a site to visit. The local rule engine returns 88 out of 100 because a brand name contains a zero instead of the letter o, and the path contains a suspicious word. The important output is the explanation. The score expresses a product policy; it is not a calibrated probability of an attack.

## 7. Privacy and model boundaries

The default URL rules run locally. The optional model endpoint requires opt-in and receives a sanitized URL. Credentials, query values and fragments are removed, but the host and path can still contain sensitive information. The BERT checkpoint is a third-party component. I have not independently established its accuracy for the Safe-Net use case.

## 8. Engineering evidence

The local API regression suite has 98 tests. A curated set of 30 URLs compares the TypeScript and Python rule outputs. Local builds, package checks and HTTP integration checks passed. A local SMTP inbox received account emails in both languages. These checks support engineering correctness for those cases; they do not establish real-world detection accuracy.

## 9. Evidence limits

The current scope is a local prototype. Installed Chrome behavior, external email delivery, hosted CI and broader browser and accessibility scenarios remain release acceptance work. No human study or independent detector benchmark has been completed. I am keeping those distinctions explicit so feedback can focus on the next useful contribution.

## 10. Proposed learning-transfer study

I would use different item banks for baseline, immediate and delayed assessment, with separate domains and templates. Participants would receive either interactive practice or text material with comparable time and content. The proposed primary outcome is change in balanced accuracy at the delayed assessment. I would also report phishing recall, legitimate-example false alarms and missing follow-ups. The interval, sample size and consent process still need justification.

## 11. A reproducible next contribution

The fastest substantial next artifact may be an independent detector evaluation. I would compare rules, the optional model and their blend on a versioned test procedure with source-separated data. I would publish the analysis and failure cases before claiming accuracy. This experiment is separate from evaluating whether learners improve.

## 12. Feedback requested

My first request is methodological. How should I distinguish learning transfer from recognizing familiar examples? Which assessment choice would most strengthen a small pilot? I would also value advice on whether detector error analysis or the learner study should come first.

# Questions you should be ready to answer

**What did you personally contribute?** Explain a real decision in the rule engine, simulation flow, privacy boundary or assessment logic. Identify external dependencies, collaborators and AI help. Do not claim sole authorship of work you cannot explain.

**Why is this different from existing phishing training?** The design connects course cues with simulations and shared warning explanations. Its usefulness is still a hypothesis, and novelty needs a literature review. Do not claim it is the first system to do this.

**What does 88/100 mean?** A deterministic combination of risk signals under product thresholds, not an 88% chance that a website is phishing.

**How accurate is it?** There is no independent accuracy estimate yet. Regression and parity tests establish behavior for selected cases. A separately labelled benchmark is planned.

**Did you train the model?** The BERT checkpoint is from a third party. Describe only the integration or rule work that you actually did.

**What happens without ML?** Local rules still produce a result. The optional model contributes an opinion under the documented blend policy.

**What data would you collect in a study?** A pseudonymous participant ID, condition, item version, phase, answer, confidence and elapsed time. The protocol proposes no real credentials or browsing history. The research collection flow is not implemented yet.

**Can I try it remotely?** The current demo is local. Provide screenshots or a recording; do not present localhost as a usable link for the professor.
