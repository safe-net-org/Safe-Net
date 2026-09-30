# Safe-Net — research and product brief

Author: Volkov Artem Aleksandrovich.

Prepared for feedback on the evaluation design, updated 2026-09-30. Safe-Net runs locally. A public demo and human study are still planned. The [English presentation package](presentation/README.md) includes slides, a mindmap and defense notes.

## Question

Can a learner transfer a phishing cue from a short explanation to a simulated decision and then recognize the same cue in a browser warning? Safe-Net joins a bilingual course, server-graded simulations, a web URL scanner and a Chrome extension to explore that question.

## System and my contribution

The Next.js interface presents lessons and scanning explanations. A NestJS/PostgreSQL service stores content and grades tasks without sending answer keys to the client. A dependency-free TypeScript rules package scores URL structure, lookalike domains and selected homographs in the web app and extension. The optional Python service mirrors these rules and can add a model result when enabled. I built the project-specific teaching flow, rule logic, extension integration and privacy boundaries. The model integration uses a third-party BERT checkpoint; I did not train it.

## Evidence currently available

The repository contains 8 stages, 21 courses, 27 lessons, 163 tasks and 21 tests. Local server tests pass (98 tests in 15 suites). A 30-URL curated corpus compares TypeScript and Python rule outputs. The downloadable extension ZIP has a reproducible SHA-256 and a synthetic fresh-install privacy check. An isolated PostgreSQL/HTTP check covered auth, grading, concurrent XP and certificate ownership. A synthetic learner completed six lesson tasks and an eight-question test in the browser, received one certificate, and reloaded persisted progress in a fresh tab. Local Mailpit received EN/RU account lifecycle emails. These checks cover the listed software behaviors. Learning improvement and detection accuracy still require separate evaluations. [Detailed evidence and limitations](EVIDENCE_AND_LIMITATIONS.md).

## Proposed study

I would compare the interactive sequence with an equal-duration text lesson, using distinct baseline, immediate and delayed item sets. Planned outcomes include balanced accuracy, phishing recall, benign false alarms, time and confidence calibration. Assignment, exclusions and treatment of missing delayed responses should be fixed before collection. The study route, consent flow and dataset still need to be built. Recruitment has not started. [Protocol draft](RESEARCH_PROTOCOL_DRAFT.md).

## Limits and next steps

The rules-only 16-item regression set is not an independent benchmark. The optional third-party model has not been independently evaluated. Real Chrome installation, hosted CI, email delivery, deployment and accessibility journeys remain to be verified. I would first finish those release checks, then build the consented study route and source-separated detector benchmark. The brief will be updated as release checks and study preparation are completed.

## Feedback requested

1. How would you separate learning transfer from simple memorization of phishing cues in this design?
2. Which outcome and item-splitting choices would make the pre/post/delayed comparison credible with a small pilot?
3. Which next step would most improve the value of the work: user study, independent detector benchmark, or deeper error analysis?

Source code: [repository entry point](../README.md). Product narrative: [project story](PROJECT_STORY.md). Detector details: [model card](../ml-service/MODEL_CARD.md).

## Cover email draft (unsent)

Subject: Request for feedback on a cybersecurity learning study design

Dear Professor,

I am a high-school student building Safe-Net, a bilingual cybersecurity learning project that connects short explanations, phishing simulations and explainable browser warnings. I am planning a small study of whether this sequence helps learners identify unfamiliar phishing examples better than a text lesson.

I would value your feedback on the study design and measures before recruiting participants. The attached brief describes the local prototype, its checks and the proposed study. In particular, I would appreciate your view on transfer versus memorization, item splitting and the most useful next experiment.

Thank you for considering it.

Sincerely,
Volkov Artem Aleksandrovich
