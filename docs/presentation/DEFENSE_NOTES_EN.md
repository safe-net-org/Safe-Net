# Safe-Net — English defense notes

Presenter: **Volkov Artem Aleksandrovich**. This script follows the 15-slide visual edition. Aim for 5–6 minutes and pause on the screenshots.

## 1. Safe-Net

I'm Volkov Artem Aleksandrovich, a high-school student. Safe-Net is my cybersecurity learning project. It combines a learning web app with Guard, a browser extension that explains URL warnings. I'll show the local prototype, how it is structured, and the evaluation I would like to conduct next.

## 2. The research question

My question is whether practice with explanations helps people recognise phishing cues in examples they have not seen before. I have not measured that yet. I would compare interactive practice with a text lesson of equal duration, then assess new examples immediately and after a delay.

## 3. How the system works

The web app handles courses and practice. The learning API grades answers and saves progress in PostgreSQL. The web scanner and extension import the same TypeScript URL rules. An optional Python service mirrors those rules and can add a model opinion.

## 4. Inside the repository

The code separates the web interface, API, extension, shared rules and optional model service. Course material is versioned separately and validated before it enters the database. This structure lets me change the interface without duplicating URL checks. The BERT checkpoint comes from a third party; I did not train it.

## 5. The learning experience

The current content includes 21 courses, 27 lessons, 163 tasks and 21 final tests. The interface supports English and Russian. The screenshot shows the actual local catalog, not a design mockup.

## 6. Practice, then an explanation

Here the learner answers a question about what an internet provider can see when a VPN is used. The server returns an explanation. This task was already completed in the demo account, so the repeated answer earns zero additional XP.

## 7. Server-side assessment

The API keeps answer keys out of the learner payload and checks submitted answers on the server. Progress and awards belong to the authenticated account. Database constraints prevent repeated XP awards and duplicate certificates.

## 8. Guard: the reasons behind a warning

This example changes the spelling of Microsoft by replacing an “o” with zero. Guard gives it a score of 88 and lists the signals that caused the warning. The URL is analysed as text; it is not opened. The score reflects the rule policy, not a calibrated probability of phishing.

## 9. Progress and course completion

The local demo account completed six tasks and an eight-question final test in the VPN course. The app saved the result and issued one certificate. That certificate records completion within SafeNet. The demonstration uses known answers and is not evidence of learning improvement.

## 10. Privacy and model boundaries

Local URL checks do not need a request to the model service. The optional request requires a separate action and removes credentials, query values and fragments. Hostnames and paths remain, so the request still has a privacy cost. The model is an upstream checkpoint whose independent evaluation remains open.

## 11. Engineering evidence

The recorded local checks include 98 API regression tests and a 30-URL rule parity corpus. Local builds passed, and Mailpit received account emails in both languages. These checks support the engineering implementation; they do not measure detection accuracy or learning outcomes.

## 12. Current scope and remaining checks

The project is ready for feedback on its local implementation and proposed study. Installed Chrome behavior, external email delivery, hosted CI and broader browser coverage still need release checks. I have not run a user study or an independent detector benchmark.

## 13. Proposed learning-transfer study

I would use separate example sets at baseline, immediately after learning, and after a delay. The primary outcome would be change in balanced accuracy on unfamiliar delayed examples. I would also report phishing recall, benign false alarms and attrition. Recruitment, sample size and consent procedures need review before data collection.

## 14. Next step: evaluate the detector

A separate detector evaluation would compare rules, the optional model and their blend on independently labelled URLs. I would separate sources between training or tuning and evaluation, report false positives, and analyse errors by attack family and language. This is planned work.

## 15. Feedback requested

I'd appreciate feedback on how to distinguish learning transfer from memorising familiar cues, and which assessment design would make a small pilot credible. I would also like to know whether detector error analysis or a learning study would be the more useful next step.

## Likely questions

**What is original here?** The project combines learning tasks, server grading, account progress and explainable URL checks. The contribution I can show now is the implemented system and its documented checks. Any scientific contribution depends on the planned evaluation.

**How accurate is Guard?** I do not have an independent accuracy estimate. Rule regression tests and cross-language parity checks do not provide one.

**Does the certificate establish expertise?** It records course completion within the platform. It is not professional accreditation.

**Did you train the model?** No. The checkpoint is third-party and pinned in the model card. I integrated the optional service.

**Was AI used?** AI assistance supported implementation, editing and presentation preparation. I should explain what I reviewed and can reproduce, and distinguish that work from third-party dependencies and the upstream model.

**Can I access the demo remotely?** The demonstrated service runs locally. A professor needs a recorded demonstration or a separately prepared public deployment; localhost will not work on their computer.
