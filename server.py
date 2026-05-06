import csv
import json
import os
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

HOST = "127.0.0.1"
PORT = 8765
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "words.csv")
META_PATH = os.path.join(BASE_DIR, "progress_meta.json")
STATUS_SCORE_MAP = {0: 0, 1: 10, 2: 20, 3: 40, 4: 80}


def is_total_row(chinese_value):
    if chinese_value is None:
        return False
    normalized = chinese_value.strip().lower().replace(" ", "")
    return normalized in {"totalscore", "totlascore"}


def _clean_str_list(items, ensure_default=None):
    cleaned = []
    for item in items:
        val = str(item).strip()
        if not val:
            continue
        if val not in cleaned:
            cleaned.append(val)
    if ensure_default is not None and ensure_default not in cleaned:
        cleaned.append(ensure_default)
    return cleaned


def _clean_int_dict(raw):
    cleaned = {}
    for k, v in raw.items():
        key = str(k).strip()
        if not key:
            continue
        try:
            cleaned[key] = max(0, int(v))
        except Exception:
            cleaned[key] = 0
    return cleaned


def _write_csv(words):
    total = sum(w["score"] for w in words)
    with open(CSV_PATH, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["中文", "英文", "unit", "status", "score"])
        for w in words:
            writer.writerow([w["chinese"], w["english"], w["unit"], w["status"], w["score"]])
        writer.writerow(["total score", "", "", "", total])
    return total


def load_words():
    if not os.path.exists(CSV_PATH):
        return []

    with open(CSV_PATH, "r", encoding="utf-8-sig", newline="") as f:
        rows = list(csv.reader(f))

    if not rows:
        return []

    header = [h.strip().replace("\ufeff", "") for h in rows[0]]
    lower = [h.lower() for h in header]

    def idx(name, fallback):
        return lower.index(name) if name in lower else fallback

    i_ch = idx("中文", 0)
    i_en = idx("英文", 1)
    i_unit = idx("unit", 2)
    i_status = idx("status", 3)

    words = []
    for row in rows[1:]:
        while len(row) <= max(i_ch, i_en, i_unit, i_status):
            row.append("")

        chinese = row[i_ch].strip()
        if not chinese or is_total_row(chinese):
            continue

        try:
            status = int((row[i_status] or "0").strip())
        except Exception:
            status = 0
        status = max(0, min(4, status))

        words.append(
            {
                "chinese": chinese,
                "english": row[i_en].strip(),
                "unit": row[i_unit].strip() or "默认单元",
                "status": status,
                "score": STATUS_SCORE_MAP.get(status, 0),
            }
        )
    return words


def default_meta(words=None):
    if words is None:
        words = load_words()
    completed_words = [w["chinese"] for w in words if int(w.get("status", 0)) >= 4]
    silver = sum(STATUS_SCORE_MAP.get(w["status"], 0) for w in words)
    gold = len(completed_words) * STATUS_SCORE_MAP[4]
    return {
        "cumulativeScore": silver,
        "silverCoins": silver,
        "goldCoins": gold,
        "goldEarnedWords": completed_words,
        "ownedVehicleIds": ["default_bugatti"],
        "equippedVehicleId": "default_bugatti",
        "ownedEffectIds": ["effect_default"],
        "equippedEffectId": "effect_default",
        "reviewCounts": {},
        "units": sorted({(w.get("unit") or "默认单元") for w in words}),
    }


def normalize_meta(meta, words=None):
    base = default_meta(words)
    if not isinstance(meta, dict):
        return base

    try:
        base["cumulativeScore"] = max(0, int(meta.get("cumulativeScore", base["cumulativeScore"])))
    except Exception:
        pass

    try:
        base["silverCoins"] = max(0, int(meta.get("silverCoins", base["cumulativeScore"])))
    except Exception:
        base["silverCoins"] = base["cumulativeScore"]

    if "silverCoins" not in meta:
        base["silverCoins"] = base["cumulativeScore"]

    try:
        base["goldCoins"] = max(0, int(meta.get("goldCoins", base.get("goldCoins", 0))))
    except Exception:
        pass

    earned_words = meta.get("goldEarnedWords", [])
    if isinstance(earned_words, list):
        base["goldEarnedWords"] = _clean_str_list(earned_words)

    owned_vehicle_ids = meta.get("ownedVehicleIds", ["default_bugatti"])
    if isinstance(owned_vehicle_ids, list):
        base["ownedVehicleIds"] = _clean_str_list(owned_vehicle_ids, "default_bugatti")

    equipped_vehicle_id = str(meta.get("equippedVehicleId", base.get("equippedVehicleId", "default_bugatti"))).strip()
    if equipped_vehicle_id and equipped_vehicle_id in base.get("ownedVehicleIds", ["default_bugatti"]):
        base["equippedVehicleId"] = equipped_vehicle_id
    else:
        base["equippedVehicleId"] = "default_bugatti"

    owned_effect_ids = meta.get("ownedEffectIds", ["effect_default"])
    if isinstance(owned_effect_ids, list):
        base["ownedEffectIds"] = _clean_str_list(owned_effect_ids, "effect_default")

    equipped_effect_id = str(meta.get("equippedEffectId", base.get("equippedEffectId", "effect_default"))).strip()
    if equipped_effect_id and equipped_effect_id in base.get("ownedEffectIds", ["effect_default"]):
        base["equippedEffectId"] = equipped_effect_id
    else:
        base["equippedEffectId"] = "effect_default"

    review_counts = meta.get("reviewCounts", {})
    if isinstance(review_counts, dict):
        base["reviewCounts"] = _clean_int_dict(review_counts)

    units = meta.get("units", [])
    if isinstance(units, list):
        cleaned_units = _clean_str_list(units)
        if cleaned_units:
            base["units"] = cleaned_units
    return base


def load_meta(words=None):
    if words is None:
        words = load_words()
    if not os.path.exists(META_PATH):
        meta = default_meta(words)
        save_meta(meta)
        return meta

    try:
        with open(META_PATH, "r", encoding="utf-8") as f:
            raw = json.load(f)
    except Exception:
        raw = {}
    meta = normalize_meta(raw, words)
    save_meta(meta)
    return meta


def save_meta(meta):
    normalized = normalize_meta(meta)
    with open(META_PATH, "w", encoding="utf-8") as f:
        json.dump(normalized, f, ensure_ascii=False, indent=2)
    return normalized


def save_words(updated_items):
    existing = load_words()
    existing_map = {w["chinese"]: w for w in existing}

    update_map = {}
    for item in updated_items:
        chinese = str(item.get("chinese", "")).strip()
        if not chinese:
            continue
        try:
            status = int(item.get("status", 0))
        except Exception:
            status = 0
        status = max(0, min(4, status))
        update_map[chinese] = status

    merged = []
    for w in existing:
        status = update_map.get(w["chinese"], w["status"])
        merged.append(
            {
                "chinese": w["chinese"],
                "english": w["english"],
                "unit": w["unit"],
                "status": status,
                "score": STATUS_SCORE_MAP.get(status, 0),
            }
        )

    total = _write_csv(merged)
    return merged, total


def save_all_words(words_payload):
    normalized = []
    for raw in words_payload:
        if not isinstance(raw, dict):
            continue

        chinese = str(raw.get("chinese", "")).strip()
        if not chinese or is_total_row(chinese):
            continue

        english = str(raw.get("english", "")).strip()
        unit = str(raw.get("unit", "默认单元")).strip() or "默认单元"

        try:
            status = int(raw.get("status", 0))
        except Exception:
            status = 0
        status = max(0, min(4, status))

        normalized.append(
            {
                "chinese": chinese,
                "english": english,
                "unit": unit,
                "status": status,
                "score": STATUS_SCORE_MAP.get(status, 0),
            }
        )

    total = _write_csv(normalized)
    return normalized, total


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def _json(self, data, status=HTTPStatus.OK):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _build_response(self, words, meta, total, extra=None):
        data = {
            "words": words,
            "totalScore": total,
            "cumulativeScore": int(meta.get("cumulativeScore", total)),
            "silverCoins": int(meta.get("silverCoins", meta.get("cumulativeScore", total))),
            "goldCoins": int(meta.get("goldCoins", 0)),
            "goldEarnedWords": meta.get("goldEarnedWords", []),
            "ownedVehicleIds": meta.get("ownedVehicleIds", ["default_bugatti"]),
            "equippedVehicleId": meta.get("equippedVehicleId", "default_bugatti"),
            "ownedEffectIds": meta.get("ownedEffectIds", ["effect_default"]),
            "equippedEffectId": meta.get("equippedEffectId", "effect_default"),
            "reviewCounts": meta.get("reviewCounts", {}),
            "units": meta.get("units", sorted({w["unit"] for w in words})),
        }
        if extra:
            data.update(extra)
        return self._json(data)

    def do_GET(self):
        if self.path == "/api/words":
            words = load_words()
            total = sum(w["score"] for w in words)
            meta = load_meta(words)
            return self._build_response(words, meta, total)
        return super().do_GET()

    def do_POST(self):
        if self.path not in {"/api/sync", "/api/admin/save"}:
            return self._json({"error": "not found"}, status=HTTPStatus.NOT_FOUND)

        length = int(self.headers.get("Content-Length", "0"))
        payload = self.rfile.read(length).decode("utf-8") if length > 0 else "{}"
        try:
            data = json.loads(payload)
        except Exception:
            return self._json({"error": "invalid json"}, status=HTTPStatus.BAD_REQUEST)

        updated_items = data.get("words", [])
        if not isinstance(updated_items, list):
            return self._json({"error": "words must be list"}, status=HTTPStatus.BAD_REQUEST)

        if self.path == "/api/admin/save":
            merged, total = save_all_words(updated_items)
        else:
            merged, total = save_words(updated_items)

        incoming_meta = data.get("meta", {}) if isinstance(data, dict) else {}
        current_meta = load_meta(merged)
        saved_meta = save_meta({**current_meta, **incoming_meta})
        return self._build_response(merged, saved_meta, total, extra={"ok": True})


if __name__ == "__main__":
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"Server running at http://{HOST}:{PORT}")
    print(f"CSV path: {CSV_PATH}")
    server.serve_forever()
