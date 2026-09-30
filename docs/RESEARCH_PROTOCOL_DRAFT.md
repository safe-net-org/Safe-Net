# Research protocol draft

Status: design only, 2026-09-29. No recruitment or pilot has started. Do not present this as approved research involving people.

## Question and comparison

Does the Safe-Net sequence of explanation, simulated practice and explainable warning help learners identify unfamiliar phishing examples better than an equal-duration text lesson? The comparison should use the same baseline, immediate and delayed assessment schedule. Assignment should be fixed in advance and recorded; the two conditions should receive equal time and similar topics.

## Planned procedure

1. Obtain the relevant review and consent before recruitment, especially for minors. Refusal must leave ordinary learning available.
2. Assign a random pseudonymous participant ID and a predeclared condition. Keep any contact information outside the answer dataset.
3. Give a baseline set, the assigned learning material, and an immediate assessment. Give a separate delayed set after a fixed interval. Do not repeat exact items or domains across sets.
4. Ask for confidence on a fixed 0–100 scale before showing feedback on each assessment item. Store the answer and confidence once; later corrections are separate events.
5. Collect a short usability response after the learning session. Record withdrawals and missing delayed tests without fabricating scores.

All examples should be synthetic or used with explicit permission. Do not collect real browsing history, submitted user URLs, credentials, or page content. Store only participant ID, condition, item version, phase, answer, confidence and elapsed time. Define retention and deletion mechanics before real collection.

## Predeclared analysis

Primary outcome: change in balanced accuracy from baseline to delayed assessment on unseen items. Report phishing recall and legitimate-example false-positive rate separately, with the confusion matrix and sample sizes. Secondary outcomes: immediate score, time per item, mean confidence on correct versus incorrect answers, and the share of high-confidence errors (for example, confidence at least 80). Missing delayed assessments remain missing; report attrition by condition and do not count them as incorrect or silently omit them from denominators. Freeze exclusions and decision thresholds before reading outcomes.

Use separate benign examples, including legitimate subdomains, internationalized domains and long URLs. Record source, label review and item version. A warning score is not a probability and must not be mixed with learner confidence.

## Prerequisites still missing

The research route, consent flow, pseudonymous storage, role-limited export, deletion path, item banks and analysis script are not implemented. Independent detector benchmarking is a separate experiment. A small pilot can test procedure and usability, but cannot establish a broad causal effect or production detector accuracy.
