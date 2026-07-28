"""Reproducible Safe Net URL-regression evaluation.

The default `rules` mode is offline and CI-safe. `runtime` evaluates the exact
pinned BERT-plus-rules runtime and may download the 1.34 GB upstream checkpoint.
This curated set prevents known regressions; it is deliberately not presented
as a representative real-world quality benchmark.
"""

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.features import extract_features  # noqa: E402
from app.model import HF_MODEL_ID, HF_MODEL_REVISION, _rule_score, get_model  # noqa: E402

DEFAULT_DATASET = Path(__file__).parent.parent / "data" / "evaluation_urls.json"


def evaluate(dataset_path: Path, mode: str) -> dict:
    dataset = json.loads(dataset_path.read_text(encoding="utf-8"))
    threshold = int(dataset["decision_threshold"])
    samples = dataset["samples"]
    model = get_model() if mode == "runtime" else None

    tp = tn = fp = fn = 0
    results = []
    for sample in samples:
        if model is None:
            score = _rule_score(extract_features(sample["url"]))
            method = "rules"
        else:
            prediction = model.predict(sample["url"])
            score = prediction.score
            method = prediction.method

        predicted = "phishing" if score >= threshold else "benign"
        actual = sample["label"]
        if actual == "phishing" and predicted == "phishing":
            tp += 1
        elif actual == "benign" and predicted == "benign":
            tn += 1
        elif actual == "benign":
            fp += 1
        else:
            fn += 1
        results.append({
            "case": sample["case"],
            "actual": actual,
            "predicted": predicted,
            "score": score,
            "method": method,
        })

    positives = tp + fn
    negatives = tn + fp
    total = len(samples)
    return {
        "dataset": dataset["name"],
        "dataset_note": dataset["description"],
        "mode": mode,
        "model_id": HF_MODEL_ID if mode == "runtime" else None,
        "model_revision": HF_MODEL_REVISION if mode == "runtime" else None,
        "decision_threshold": threshold,
        "samples": total,
        "metrics": {
            "accuracy": (tp + tn) / total,
            "recall": tp / positives if positives else 0.0,
            "false_positive_rate": fp / negatives if negatives else 0.0,
            "tp": tp,
            "tn": tn,
            "fp": fp,
            "fn": fn,
        },
        "results": results,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=("rules", "runtime"), default="rules")
    parser.add_argument("--dataset", type=Path, default=DEFAULT_DATASET)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()

    report = evaluate(args.dataset, args.mode)
    rendered = json.dumps(report, ensure_ascii=False, indent=2)
    print(rendered)
    if args.output:
        args.output.write_text(rendered + "\n", encoding="utf-8")

    metrics = report["metrics"]
    if metrics["fn"] or metrics["fp"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
