"""
Phishing detection via ealvaradob/bert-finetuned-phishing.

The checkpoint is a BERT-large sequence classifier fine-tuned for benign vs
phishing URLs. Its probability is blended with deterministic rules; the rules
remain the fallback when the checkpoint is unavailable.
"""

import logging
import os
import re
from typing import Optional

from .features import UrlFeatures, extract_features, features_to_dict
from .schemas import PredictResponse, ShapSignal

logger = logging.getLogger(__name__)

HF_MODEL_ID = "ealvaradob/bert-finetuned-phishing"
# Full immutable commit SHA from the upstream model repository. Operators may
# roll forward deliberately, but mutable branch names such as `main` are
# rejected so two deployments cannot silently run different weights.
DEFAULT_HF_MODEL_REVISION = "fa8fb73a007174c410ab7160d4e4c6e6b8d998d4"
HF_MODEL_REVISION = os.getenv(
    "HF_MODEL_REVISION", DEFAULT_HF_MODEL_REVISION
).strip().lower()
if not re.fullmatch(r"[0-9a-f]{40}", HF_MODEL_REVISION):
    raise RuntimeError("HF_MODEL_REVISION must be a full 40-character commit SHA")
MODEL_ARCHITECTURE = "BERT-large sequence classifier"

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
FEATURE_LABELS.update({
    "typosquat": "Домен похож на известный бренд",
    "leet_squat": "Буквы бренда заменены цифрами",
    "brand_token": "Имя бренда в составном домене",
    "brand_token_leet": "Имя бренда с заменой букв в составном домене",
    "encoded_ip": "IP-адрес замаскирован числом",
    "ip_domain": "IP-адрес вместо имени сайта",
    "punycode": "Punycode в домене",
    "credential_in_query": "Учётные данные в параметрах URL",
    "dangerous_file": "Ссылка ведёт на исполняемый файл",
    "data_uri": "Содержимое встроено в data:-URL",
    "suspicious_scheme": "Необычная схема URL",
    "tld_swap": "Бренд в подозрительной доменной зоне",
    "no_https": "Нет HTTPS",
    "url_shortener": "Сокращатель скрывает адрес назначения",
    "deep_subdomain": "Глубокие поддомены",
    "suspicious_words": "Подозрительные слова в URL",
    "suspicious_word": "Подозрительное слово в URL",
    "suspicious_tld": "Подозрительная доменная зона",
    "cyrillic_domain": "Кириллица в домене",
    "nonstandard_port": "Нестандартный порт",
    "long_url": "Необычно длинный URL",
    "high_entropy": "Случайно выглядящий домен",
    "at_sign": "Символ @ в URL",
    "hex_encoding": "Hex-кодирование в URL",
    "excessive_encoding": "Чрезмерное %-кодирование",
    "base64_path": "Base64-подобная строка в пути",
    "multiple_domains": "Несколько доменов в URL",
    "many_hyphens": "Много дефисов в домене",
})


def _score_to_level(score: int) -> str:
    return _rule_score_to_level(score)


def _rule_score_to_level(score: int) -> str:
    if score <= 30:
        return "safe"
    if score < 70:
        return "suspicious"
    return "danger"


def _signal_severity(contribution: int) -> str:
    if contribution >= 30:
        return "high"
    if contribution >= 15:
        return "medium"
    return "low"


def _rule_signals(features: UrlFeatures, feat_dict: dict[str, float]) -> list[ShapSignal]:
    """Expose the same rule keys and conditions as guard-core's scorer."""
    signals: list[ShapSignal] = []

    def sig(fname: str, contribution: int, value: float = 1.0) -> None:
        signals.append(ShapSignal(
            feature=fname,
            label=FEATURE_LABELS.get(fname, fname),
            value=value,
            shap_value=round(contribution / 100, 3),
            severity=_signal_severity(contribution),
        ))

    if features.idn_homograph:
        sig("idn_homograph", 90)
    if features.brand_impersonation:
        sig("brand_impersonation", 88)
    if features.is_typosquat and 1 <= features.typosquat_distance <= 2:
        sig("typosquat", 75)
    if features.is_leet_squat:
        sig("leet_squat", 80)
    if features.has_brand_token and not features.brand_impersonation and not features.is_typosquat:
        sig("brand_token_leet" if features.brand_token_via_leet else "brand_token", 80 if features.brand_token_via_leet else 35)
    if features.is_encoded_ip:
        sig("encoded_ip", 40)
    if features.has_ip:
        sig("ip_domain", 35)
    if features.has_punycode:
        sig("punycode", 30)
    if features.credential_in_query:
        sig("credential_in_query", 30)
    if features.dangerous_extension:
        sig("dangerous_file", 30)
    if features.has_data_uri:
        sig("data_uri", 25)
    if features.has_suspicious_scheme and not features.has_data_uri:
        sig("suspicious_scheme", 20)
    if features.is_tld_swap:
        sig("tld_swap", 25)
    if not features.is_https and not features.has_suspicious_scheme:
        sig("no_https", 20)
    if features.is_url_shortener:
        sig("url_shortener", 15)
    if features.subdomain_depth >= 3:
        sig("deep_subdomain", 15, float(features.subdomain_depth))
    if features.suspicious_word_count >= 2:
        sig("suspicious_words", features.suspicious_word_count * 8, float(features.suspicious_word_count))
    elif features.suspicious_word_count == 1:
        sig("suspicious_word", 8)
    if features.tld_suspicious and not features.is_tld_swap:
        sig("suspicious_tld", 15)
    if features.free_hosting:
        sig("free_hosting", 20)
    if features.has_cyrillic and not features.idn_homograph and not features.brand_impersonation:
        sig("cyrillic_domain", 10)
    if features.non_standard_port:
        sig("nonstandard_port", 10)
    if features.url_length > 100:
        sig("long_url", 10, float(features.url_length))
    if features.domain_entropy > 4.0:
        sig("high_entropy", 12, features.domain_entropy)
    if features.has_at_sign:
        sig("at_sign", 20)
    if features.has_hex_encoding:
        sig("hex_encoding", 10)
    if features.has_excessive_encoding:
        sig("excessive_encoding", 15)
    if features.has_base64_in_path:
        sig("base64_path", 12)
    if features.multiple_domains_in_url:
        sig("multiple_domains", 15)
    if features.hyphen_count >= 4:
        sig("many_hyphens", 8, float(features.hyphen_count))

    return sorted(signals, key=lambda s: -s.shap_value)


# Deterministic, high-precision signals. When any of these fire the domain is
# near-certainly malicious, and no neural-net probability should be able to
# argue it down.
def _hard_danger(features: UrlFeatures) -> bool:
    return (
        features.idn_homograph
        or features.brand_impersonation
        or features.is_leet_squat
        or (features.is_typosquat and features.typosquat_distance <= 2)
        or (features.has_brand_token and _brand_token_is_leet(features))
    )


def _brand_token_is_leet(features: UrlFeatures) -> bool:
    # A brand token that only matched after de-leeting (micros0ft-alerts) is
    # deliberate evasion, not a coincidence — score it like leet-squatting.
    return features.brand_token_via_leet


def _rule_score(features: UrlFeatures) -> int:
    """The deterministic score, mirroring packages/guard-core/model/score.ts."""
    score = 0
    if features.idn_homograph:
        score = max(score, 90)
    if features.brand_impersonation:
        score = max(score, 88)
    if features.is_typosquat and 1 <= features.typosquat_distance <= 2:
        score = max(score, 75)
    if features.is_leet_squat:
        score = max(score, 80)
    if features.has_brand_token and not features.brand_impersonation and not features.is_typosquat:
        score = max(score, 80) if _brand_token_is_leet(features) else score + 35
    if features.is_encoded_ip:
        score += 40
    if features.has_ip:
        score += 35
    if features.has_punycode:
        score += 30
    if features.credential_in_query:
        score += 30
    if features.dangerous_extension:
        score += 30
    if features.has_data_uri:
        score += 25
    if features.has_suspicious_scheme and not features.has_data_uri:
        score += 20
    if features.is_tld_swap:
        score += 25
    if not features.is_https and not features.has_suspicious_scheme:
        score += 20
    if features.is_url_shortener:
        score += 15
    if features.subdomain_depth >= 3:
        score += 15
    if features.suspicious_word_count >= 2:
        score += features.suspicious_word_count * 8
    elif features.suspicious_word_count == 1:
        score += 8
    if features.tld_suspicious and not features.is_tld_swap:
        score += 15
    if features.free_hosting:
        score += 20
    if features.has_cyrillic and not features.idn_homograph and not features.brand_impersonation:
        score += 10
    if features.non_standard_port:
        score += 10
    if features.url_length > 100:
        score += 10
    if features.domain_entropy > 4.0:
        score += 12
    if features.has_at_sign:
        score += 20
    if features.has_hex_encoding:
        score += 10
    if features.has_excessive_encoding:
        score += 15
    if features.has_base64_in_path:
        score += 12
    if features.multiple_domains_in_url:
        score += 15
    if features.hyphen_count >= 4:
        score += 8
    return min(100, score)


# How much a blended verdict leans on the neural net when neither side is
# certain. Mirrors the extension's documented 0.6 ML / 0.4 rules split.
_ML_BLEND_WEIGHT = 0.6
# A recognised brand's own domain with no red flags is capped here, so a jumpy
# classifier can never block a site everyone uses.
_KNOWN_BRAND_SAFE_CAP = 20


def _blend(features: UrlFeatures, bert_score: int) -> tuple[int, str]:
    """
    Combine the neural net with the deterministic rules.

    The rules are high precision but narrow; the net is broad but noisy. So the
    rules win at the extremes — they floor the score when they are certain it is
    phishing, and cap it when it is plainly a known brand — and the net decides
    the uncertain middle where the rules stay silent.
    """
    rule = _rule_score(features)

    if _hard_danger(features):
        # Rules are certain: never let the net argue a homograph down.
        return max(rule, bert_score), "rule-override"

    no_red_flags = rule <= 30
    if features.registrable_is_brand and no_red_flags:
        # github.com, mail.google.com — the net's nervousness is overruled.
        return min(bert_score, _KNOWN_BRAND_SAFE_CAP), "rule-override"

    if rule >= 70:
        # Rules already say danger; the net can only raise it.
        return max(rule, bert_score), "rules"

    # Uncertain middle — this is where the model earns its keep, catching novel
    # phishing the rules have never seen. Weighted toward the net, floored by
    # whatever the rules did find.
    blended = round(_ML_BLEND_WEIGHT * bert_score + (1 - _ML_BLEND_WEIGHT) * rule)
    method = "ml" if bert_score > rule else "blend"
    return max(blended, rule), method


class PhishingModel:
    def __init__(self) -> None:
        self._pipeline: Optional[object] = None
        self._loaded = False
        self._try_load_hf()

    def _try_load_hf(self) -> None:
        try:
            from transformers import pipeline as hf_pipeline  # type: ignore[import]
            logger.info(
                "Downloading / loading HuggingFace model: %s revision=%s",
                HF_MODEL_ID,
                HF_MODEL_REVISION,
            )
            self._pipeline = hf_pipeline(
                "text-classification",
                model=HF_MODEL_ID,
                revision=HF_MODEL_REVISION,
                trust_remote_code=False,
                truncation=True,
                max_length=128,
            )
            self._loaded = True
            logger.info(
                "HuggingFace model ready: %s revision=%s",
                HF_MODEL_ID,
                HF_MODEL_REVISION,
            )
        except Exception as exc:
            logger.warning(
                "HuggingFace model unavailable error_type=%s — rule-based fallback active",
                type(exc).__name__,
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
            bert_score = min(100, round(phishing_prob * 100))

            # The net alone is noisy (it rated mail.google.com 0.98). Blend it
            # with the deterministic rules so precision wins at the extremes.
            score, method = _blend(features, bert_score)
            level = _score_to_level(score)
            signals = _rule_signals(features, feat_dict)

            return PredictResponse(
                url=raw_url,
                score=score,
                level=level,
                probability=score / 100.0,
                signals=signals[:10],
                features=feat_dict,
                ml_probability=round(phishing_prob, 4),
                rule_score=_rule_score(features),
                method=method,
            )
        except Exception as exc:
            # Some inference exceptions include the input. Never put exception
            # text (and therefore potentially a URL secret) in service logs.
            logger.error(
                "BERT inference failed error_type=%s — falling back to rules",
                type(exc).__name__,
            )
            return self._predict_rules(raw_url, features, feat_dict)

    def _predict_rules(
        self,
        raw_url: str,
        features: UrlFeatures,
        feat_dict: dict[str, float],
    ) -> PredictResponse:
        """Deterministic scorer, used when the neural net is unavailable."""
        signals = _rule_signals(features, feat_dict)
        score = _rule_score(features)
        level = _rule_score_to_level(score)

        return PredictResponse(
            url=raw_url,
            score=score,
            level=level,
            probability=score / 100.0,
            signals=signals[:10],
            features=feat_dict,
            ml_probability=0.0,
            rule_score=score,
            method="rules",
        )


# Singleton — loaded once at startup
_model: Optional[PhishingModel] = None


def get_model() -> PhishingModel:
    global _model
    if _model is None:
        _model = PhishingModel()
    return _model
