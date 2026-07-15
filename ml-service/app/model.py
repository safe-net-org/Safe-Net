"""
Phishing detection via pretrained HuggingFace model.
Primary:  pirocheto/phishing-url-detection  (DistilBERT fine-tuned on phishing URLs)
Fallback: rule-based scorer when model is unavailable or download fails.
"""

import logging
from typing import Optional

from .features import UrlFeatures, extract_features, features_to_dict
from .schemas import PredictResponse, ShapSignal

logger = logging.getLogger(__name__)

HF_MODEL_ID = "ealvaradob/bert-finetuned-phishing"

FEATURE_LABELS: dict[str, str] = {
    "idn_homograph": "IDN-гомограф (кириллица+латиница)",
    "mixed_script": "Смешение алфавитов в домене",
    "brand_impersonation": "Подмена бренда (кириллица читается как латиница)",
    "has_cyrillic": "Кириллица в домене",
    "has_punycode": "Punycode (xn--) в домене",
    "is_typosquat": "Тайпсквоттинг",
    "typosquat_distance": "Дистанция до известного бренда",
    "is_leet_squat": "Leet-подмена букв на цифры (paypa1, g00gle)",
    "has_brand_token": "Бренд вшит в составной домен",
    "has_excessive_encoding": "Чрезмерное / двойное %-кодирование",
    "has_ip": "IP-адрес вместо домена",
    "is_https": "Нет HTTPS",
    "url_length": "Длина URL",
    "domain_length": "Длина домена",
    "path_length": "Длина пути",
    "subdomain_depth": "Глубина поддоменов",
    "dot_count": "Количество точек",
    "hyphen_count": "Дефисы в домене",
    "domain_entropy": "Энтропия домена",
    "has_at_sign": "Символ @ в URL",
    "has_double_slash_redirect": "Двойной слеш в пути",
    "suspicious_word_count": "Подозрительные слова в URL",
    "path_suspicious_words": "Подозрительные слова в пути",
    "multiple_domains_in_url": "Несколько доменов в URL",
    "tld_suspicious": "Подозрительный TLD",
    "free_hosting": "Бесплатный хостинг",
    "has_port": "Нестандартный порт",
    "query_param_count": "Количество параметров запроса",
    "fragment_present": "Fragment-идентификатор",
}


def _score_to_level(score: int) -> str:
    if score >= 70:
        return "danger"
    if score >= 40:
        return "suspicious"
    return "safe"


def _signal_severity(contribution: int) -> str:
    if contribution >= 30:
        return "high"
    if contribution >= 15:
        return "medium"
    return "low"


def _rule_signals(features: UrlFeatures, feat_dict: dict[str, float]) -> list[ShapSignal]:
    """Extract rule-based signals regardless of which model is used."""
    signals: list[ShapSignal] = []

    def sig(fname: str, contribution: int) -> None:
        signals.append(ShapSignal(
            feature=fname,
            label=FEATURE_LABELS.get(fname, fname),
            value=feat_dict.get(fname, 0.0),
            shap_value=round(contribution / 100, 3),
            severity=_signal_severity(contribution),
        ))

    if features.idn_homograph:
        sig("idn_homograph", 90)
    if features.brand_impersonation:
        sig("brand_impersonation", 88)
    if features.is_typosquat and features.typosquat_distance <= 2:
        sig("is_typosquat", 75)
    if features.is_leet_squat:
        sig("is_leet_squat", 80)
    if features.has_brand_token:
        sig("has_brand_token", 35)
    if features.has_excessive_encoding:
        sig("has_excessive_encoding", 15)
    if features.has_ip:
        sig("has_ip", 35)
    if features.has_punycode:
        sig("has_punycode", 30)
    if not features.is_https:
        sig("is_https", 20)
    if features.suspicious_word_count >= 2:
        sig("suspicious_word_count", min(80, features.suspicious_word_count * 8))
    if features.free_hosting:
        sig("free_hosting", 20)
    if features.has_at_sign:
        sig("has_at_sign", 20)
    if features.subdomain_depth >= 3:
        sig("subdomain_depth", 15)
    if features.tld_suspicious:
        sig("tld_suspicious", 15)
    if features.multiple_domains_in_url:
        sig("multiple_domains_in_url", 15)
    if features.domain_entropy > 3.5:
        sig("domain_entropy", 12)
    if features.url_length > 100:
        sig("url_length", 10)

    return sorted(signals, key=lambda s: -s.shap_value)


class PhishingModel:
    def __init__(self) -> None:
        self._pipeline: Optional[object] = None
        self._loaded = False
        self._try_load_hf()

    def _try_load_hf(self) -> None:
        try:
            from transformers import pipeline as hf_pipeline  # type: ignore[import]
            logger.info("Downloading / loading HuggingFace model: %s", HF_MODEL_ID)
            self._pipeline = hf_pipeline(
                "text-classification",
                model=HF_MODEL_ID,
                truncation=True,
                max_length=128,
            )
            self._loaded = True
            logger.info("HuggingFace model ready: %s", HF_MODEL_ID)
        except Exception as exc:
            logger.warning(
                "HuggingFace model unavailable (%s) — rule-based fallback active", exc
            )
            self._pipeline = None

    @property
    def is_loaded(self) -> bool:
        return self._loaded

    def predict(self, raw_url: str) -> PredictResponse:
        features = extract_features(raw_url)
        feat_dict = features_to_dict(features)
        if self._loaded and self._pipeline is not None:
            return self._predict_hf(raw_url, features, feat_dict)
        return self._predict_rules(raw_url, features, feat_dict)

    def _predict_hf(
        self,
        raw_url: str,
        features: UrlFeatures,
        feat_dict: dict[str, float],
    ) -> PredictResponse:
        try:
            result = self._pipeline(raw_url)[0]  # type: ignore[index]
            label: str = str(result["label"]).lower()
            confidence: float = float(result["score"])

            # Different model checkpoints use different label conventions
            is_phishing = label in ("phishing", "label_1", "1", "malicious", "spam", "bad")
            phishing_prob = confidence if is_phishing else 1.0 - confidence

            score = min(100, round(phishing_prob * 100))
            level = _score_to_level(score)
            signals = _rule_signals(features, feat_dict)

            return PredictResponse(
                url=raw_url,
                score=score,
                level=level,
                probability=phishing_prob,
                signals=signals[:10],
                features=feat_dict,
            )
        except Exception as exc:
            logger.error("HF prediction error (%s) — falling back to rules", exc)
            return self._predict_rules(raw_url, features, feat_dict)

    def _predict_rules(
        self,
        raw_url: str,
        features: UrlFeatures,
        feat_dict: dict[str, float],
    ) -> PredictResponse:
        """Rule-based scorer — mirrors risk-scorer.ts hard rules."""
        signals = _rule_signals(features, feat_dict)

        score = 0
        if features.idn_homograph:
            score += 90
        if features.brand_impersonation:
            score = max(score, 88)
        if features.is_typosquat and features.typosquat_distance <= 2:
            score += 75
        if features.is_leet_squat:
            score = max(score, 80)
        if features.has_brand_token:
            score += 35
        if features.has_excessive_encoding:
            score += 15
        if features.has_ip:
            score += 35
        if features.has_punycode:
            score += 30
        if not features.is_https:
            score += 20
        if features.suspicious_word_count >= 2:
            score += min(80, features.suspicious_word_count * 8)
        if features.free_hosting:
            score += 20
        if features.has_at_sign:
            score += 20
        if features.subdomain_depth >= 3:
            score += 15
        if features.tld_suspicious:
            score += 15
        if features.multiple_domains_in_url:
            score += 15
        if features.domain_entropy > 3.5:
            score += 12
        if features.url_length > 100:
            score += 10

        score = min(100, score)
        proba = score / 100.0
        level = _score_to_level(score)

        return PredictResponse(
            url=raw_url,
            score=score,
            level=level,
            probability=proba,
            signals=signals[:10],
            features=feat_dict,
        )


# Singleton — loaded once at startup
_model: Optional[PhishingModel] = None


def get_model() -> PhishingModel:
    global _model
    if _model is None:
        _model = PhishingModel()
    return _model
