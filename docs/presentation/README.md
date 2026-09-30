# Safe-Net professor review package

Prepared 30 September 2026. Presenter: **Volkov Artem Aleksandrovich**. The latest English presentation has 15 slides and takes about 5–6 minutes to present.

## Latest files

- `output/Safe-Net_Professor_Review_Visual.pptx`: editable deck with a new cover, real product screenshots, the system mindmap, repository structure and source references in speaker notes.
- `output/Safe-Net_Professor_Review_Visual.pdf`: sharing copy. Text and diagrams are rasterized; use the PPTX for editing.
- `output/Safe-Net_Professor_Review_Visual_Cover.png`: cover preview.
- `output/Safe-Net_Mindmap.pptx`, `.png` and `.pdf`: standalone component overview.
- `DEFENSE_NOTES_EN.md`: spoken explanation and likely questions, matching the 15-slide deck.
- `DEMO_RECORDING_GUIDE_RU.md`: 60–90-second recording plan, English narration and 2560×1440 export settings. The presenter will record the demo; no video is included yet.
- `../outreach/PROFESSOR_CONTACTS_2026-09-30.md`: public contact shortlist and source links.
- `../outreach/ACTIVITY_PLAN.md`: proposed evaluations and deliverables.
- `../outreach/FIRST_EMAIL_DRAFT.md`: first email draft. Nothing has been sent.

The original `Safe-Net_Professor_Review` files remain as the first edition. Send the **Visual** edition.

## Scope

The package presents a local engineering prototype and a proposed study. The learner screenshots show a synthetic local account. Known answers were used to demonstrate the task and certificate flow; the result is not a study outcome. The Guard example is scored as URL text, not visited.

Content counts and recorded engineering results come from source commit `8d1b2dc` and `docs/audits/LOCAL_VERIFICATION_2026-09-30.md`. Interface copy and presentation materials were revised afterwards. The web build passed after the copy edits. Regression-test counts refer to the recorded earlier run; the suite was not rerun for this wording pass.

Chrome installation, external inbox delivery, hosted CI and broader browser checks remain before public release. They can be deferred for an initial professor review of the PDF. A localhost link will not work on the recipient's computer.

## Design and credits

Original layout: Helvetica Neue, warm paper backgrounds, navy and green accents. Product images are actual Safe-Net screenshots captured on 30 September 2026. Diagrams and slide text remain editable. The supplied Presenton repository was inspected as a possible route: https://github.com/presenton/presenton. No Presenton template or generated slide was copied.

AI assistance supported implementation, copy editing and deck preparation. The deck was authored with the bundled Artifact Tool. The presenter should explain the decisions and code they reviewed, and distinguish their contribution from external dependencies. The BERT checkpoint is third-party; its provenance is recorded in `ml-service/MODEL_CARD.md`.

PPTX package and layout validation passed. All 15 final slides were rendered and visually reviewed. The PDF contains 15 pages. Native PowerPoint compatibility was not independently checked. The reviewed implementation is published on GitHub in `upd/portfolio-localization`. The outreach draft links to source commit `6679bd4c1742827be796d098ee3c4f9c531c99df`.
