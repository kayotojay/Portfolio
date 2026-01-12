import os
import json
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ART_DIR = os.path.join(BASE_DIR, "..", "art")
JSON_PATH = os.path.join(BASE_DIR, "art.json")
PHOTOSHOP_DIR = r"H:\My Drive\Photoshop Files"

IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".gif"}

def parse_date_flexible(date_str):
    if not date_str:
        return None
    date_str = date_str.strip()
    if date_str.endswith("-?"):
        try:
            return datetime(int(date_str[:4]), 1, 1)
        except:
            return None
    try:
        return datetime.strptime(date_str, "%Y-%m-%d")
    except:
        return None

# ---------------- LOAD JSON ----------------
with open(JSON_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

# ---------------- ADD NEW ART FILES ----------------
existing_files = {item.get("file") for item in data}

for f in os.listdir(ART_DIR):
    ext = os.path.splitext(f)[1].lower()
    if ext in IMAGE_EXTS and f not in existing_files:
        data.append({
            "file": f,
            "date": "",
            "title": os.path.splitext(f)[0],
            "tags": []
        })

# ---------------- BUILD PSD DATE MAP ----------------
ps_dates = {}
for f in os.listdir(PHOTOSHOP_DIR):
    full_path = os.path.join(PHOTOSHOP_DIR, f)
    if os.path.isfile(full_path):
        base = os.path.splitext(f)[0]
        ps_dates[base] = datetime.fromtimestamp(os.path.getmtime(full_path))

# ---------------- APPLY PSD DATES (ONLY IF EMPTY) ----------------
for item in data:
    if not isinstance(item.get("tags"), list):
        item["tags"] = []

    if item.get("date"):
        continue

    art_base = os.path.splitext(item.get("file", ""))[0]

    if art_base in ps_dates:
        dt = ps_dates[art_base]
        item["date"] = dt.strftime("%Y-%m-%d")

        year = str(dt.year)
        if year not in item["tags"]:
            item["tags"].append(year)

# ---------------- SORT + TAG NORMALIZATION ----------------
for item in data:
    dt = parse_date_flexible(item.get("date", ""))
    if dt:
        item["_d"] = dt
        year = str(dt.year)
        if year not in item["tags"]:
            item["tags"].append(year)
    else:
        item["_d"] = datetime.max

proper = []
attention = []

for item in data:
    if len(item.get("tags", [])) <= 1:
        attention.append(item)
    else:
        proper.append(item)

proper.sort(key=lambda x: x["_d"])
attention.sort(key=lambda x: x["_d"])

final_data = proper + attention

for item in final_data:
    del item["_d"]

# ---------------- WRITE JSON ----------------
with open(JSON_PATH, "w", encoding="utf-8") as f:
    json.dump(final_data, f, indent=2)

print("Sync complete. New art added. PSD dates applied. Untagged items moved to bottom.")
