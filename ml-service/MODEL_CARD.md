# Safe Net Guard URL classifier

## What it is

Safe Net Guard uses two layers:

1. deterministic URL rules shared conceptually with `packages/guard-core`;
2. an optional BERT-large classifier as a second opinion.

The neural model is not the sole security decision-maker. High-confidence
homograph, typosquat, and leet-brand rules cannot be lowered by the model, while
known legitimate brand domains are capped to limit obvious false positives.
When the model cannot load, the API remains available in rules-only mode and
reports that state through `/health`.

## Versioned artifact

- Repository: `ealvaradob/bert-finetuned-phishing`
- Architecture: BERT large, uncased, sequence classification
- Default revision: `fa8fb73a007174c410ab7160d4e4c6e6b8d998d4`
- Runtime variable: `HF_MODEL_REVISION`

`HF_MODEL_REVISION` must be a full 40-character commit SHA. Mutable refs such as
`main` are rejected at startup. The health endpoint reports the exact revision.
The runtime disables remote custom code.

The upstream repository currently distributes PyTorch pickle weights rather
than safetensors. Pinning the commit reduces supply-chain drift but does not
make serialized third-party weights intrinsically trusted. Production images
should download and scan the pinned artifact during a controlled build.

## Intended use

- Optional second-opinion scoring for sanitized HTTP(S) URLs.
- Learner-facing explanations and warnings, not autonomous enforcement.
- English-heavy URL/text patterns with deterministic coverage for selected
  Cyrillic/Greek homographs and Russian-market brand impersonation.

It is not designed for malware analysis, page-content inspection, email
classification, legal attribution, or guaranteeing that a URL is safe.

## Privacy boundary

Before inference, credentials, URL query values, and fragments are removed.
The service does not log submitted URLs or exception messages that may contain
them. Hostnames and paths still reach the locally configured ML service and
must be treated as potentially sensitive operational data.

## Decision policy

- `0–39`: safe
- `40–69`: suspicious
- `70–100`: danger
- BERT/rules blend: 60% model and 40% rules in the uncertain middle
- Deterministic high-confidence attacks override a lower model score
- Known brand domains without rule red flags are capped at 20

These thresholds are product policy, not calibrated probabilities.

## Evidence and limitations

The upstream model card reports 97.17% accuracy and a 2.49% false-positive rate
on its own evaluation set. Safe Net has not independently reproduced those
figures on a representative production distribution, so they must not be used
as Safe Net performance claims.

The repository includes a small, versioned regression set covering known
homographs, typosquats, leet substitutions, brand lures, and common legitimate
domains. Passing it proves only that those curated cases did not regress. It
does not measure real-world base rates, newly registered domains, multilingual
coverage, calibration, demographic fairness, or adaptive attacker behavior.

## Reproducing checks

From `ml-service`:

```bash
.venv/bin/python scripts/test_scoring.py
.venv/bin/python scripts/test_parity.py
.venv/bin/python scripts/test_privacy.py
.venv/bin/python scripts/evaluate.py --mode rules
```

To evaluate the exact pinned runtime (requires downloading the checkpoint):

```bash
.venv/bin/python scripts/evaluate.py --mode runtime
```

## Release requirements

Before treating ML quality as production-validated:

- build a dated, deduplicated, independently labelled URL dataset;
- keep train/calibration/test splits source-separated to prevent leakage;
- report precision, recall, false-positive rate, calibration, and latency by
  language, TLD, attack family, and traffic segment;
- define rollback thresholds and monitor opt-in inference failures;
- scan and mirror the pinned model artifact in a controlled registry.
