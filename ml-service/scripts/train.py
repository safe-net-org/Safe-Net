"""
Training script for SafeNet Guard phishing classifier.

Data sources:
  Option A — synthetic (no download needed):
    python scripts/generate_dataset.py --out data/synthetic.csv --n 10000
    python scripts/train.py --synthetic data/synthetic.csv

  Option B — real data:
    python scripts/train.py --phish data/phishtank.csv --benign data/tranco.csv

Output:
    data/model.json   — XGBoost model
    data/metrics.json — validation metrics
"""

import argparse
import json
import logging
import sys
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.metrics import (
    classification_report,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split

# Allow importing from parent package when run as script
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.features import extract_features, features_to_dict

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)


def load_phishtank(path: str) -> list[str]:
    df = pd.read_csv(path, usecols=["url"])
    return df["url"].dropna().tolist()


def load_tranco(path: str, n: int = 50_000) -> list[str]:
    df = pd.read_csv(path, header=None, names=["rank", "domain"])
    domains = df["domain"].dropna().head(n).tolist()
    return [f"https://{d}/" for d in domains]


def build_dataset(phish_urls: list[str], benign_urls: list[str]) -> pd.DataFrame:
    rows = []

    for url in phish_urls:
        try:
            f = extract_features(url)
            row = features_to_dict(f)
            row["label"] = 1
            rows.append(row)
        except Exception:
            pass

    for url in benign_urls:
        try:
            f = extract_features(url)
            row = features_to_dict(f)
            row["label"] = 0
            rows.append(row)
        except Exception:
            pass

    return pd.DataFrame(rows)


def train(df: pd.DataFrame, model_path: Path, metrics_path: Path) -> None:
    import xgboost as xgb

    feature_cols = [c for c in df.columns if c != "label"]
    X = df[feature_cols].values.astype(np.float32)
    y = df["label"].values

    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    scale_pos_weight = (y_train == 0).sum() / max((y_train == 1).sum(), 1)

    model = xgb.XGBClassifier(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        scale_pos_weight=scale_pos_weight,
        use_label_encoder=False,
        eval_metric="logloss",
        random_state=42,
        tree_method="hist",
    )

    model.fit(
        X_train, y_train,
        eval_set=[(X_val, y_val)],
        verbose=50,
    )

    y_pred = model.predict(X_val)
    y_proba = model.predict_proba(X_val)[:, 1]
    auc = roc_auc_score(y_val, y_proba)
    report = classification_report(y_val, y_pred, output_dict=True)

    logger.info("ROC-AUC: %.4f", auc)
    logger.info("\n%s", classification_report(y_val, y_pred))

    model.save_model(str(model_path))
    logger.info("Model saved to %s", model_path)

    metrics = {"roc_auc": auc, "classification_report": report, "feature_names": feature_cols}
    metrics_path.write_text(json.dumps(metrics, indent=2))
    logger.info("Metrics saved to %s", metrics_path)


def load_synthetic(path: str) -> tuple[list[str], list[str]]:
    """Load pre-labelled synthetic CSV (url, label columns)."""
    df = pd.read_csv(path)
    phish = df[df["label"] == 1]["url"].dropna().tolist()
    benign = df[df["label"] == 0]["url"].dropna().tolist()
    return phish, benign


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--synthetic", help="Synthetic CSV (url,label) — skips --phish/--benign")
    parser.add_argument("--phish", help="PhishTank CSV path")
    parser.add_argument("--benign", help="Tranco CSV path")
    parser.add_argument("--benign-limit", type=int, default=50_000)
    args = parser.parse_args()

    data_dir = Path(__file__).parent.parent / "data"
    data_dir.mkdir(exist_ok=True)

    if args.synthetic:
        logger.info("Loading synthetic dataset from %s", args.synthetic)
        phish, benign = load_synthetic(args.synthetic)
        logger.info("phishing=%d benign=%d", len(phish), len(benign))
    elif args.phish and args.benign:
        logger.info("Loading phishing URLs from %s", args.phish)
        phish = load_phishtank(args.phish)
        logger.info("Loaded %d phishing URLs", len(phish))
        logger.info("Loading benign URLs from %s", args.benign)
        benign = load_tranco(args.benign, n=args.benign_limit)
        logger.info("Loaded %d benign URLs", len(benign))
    else:
        parser.error("Provide either --synthetic or both --phish and --benign")

    logger.info("Extracting features...")
    df = build_dataset(phish, benign)
    logger.info("Dataset: %d rows, %d features", len(df), len(df.columns) - 1)

    train(df, data_dir / "model.json", data_dir / "metrics.json")


if __name__ == "__main__":
    main()
