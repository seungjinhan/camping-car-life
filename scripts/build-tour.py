"""fetch-tour.py가 받은 scripts/tour-raw/를 src/data/tour/의 도별 JSON · festivals.json · index.json으로 만들어요.
usage: python3 -I scripts/build-tour.py
도 · 시군 키는 src/lib/baseDictionary.ts의 것을 써요 (고캠핑과 같은 규칙).
레포츠는 넣지 않아요 (운영자 결정, 2026-11-14). 사진은 쓰지 않아요.
"""
import html, json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "scripts", "tour-raw")
OUT = os.path.join(ROOT, "src", "data", "tour")

src = open(os.path.join(ROOT, "src", "lib", "baseDictionary.ts"), encoding="utf-8").read()
CITIES = {}
for key, ko, cities in re.findall(r'province\("([\w-]+)", "([^"]+)", "[^"]*", "([^"]*)"\)', src):
    CITIES[key] = {c.split(":")[1]: c.split(":")[0] for c in cities.split("|")} if cities else {}

PROVINCE = [("서울", "seoul"), ("부산", "busan"), ("대구", "daegu"), ("인천", "incheon"), ("광주", "gwangju"), ("대전", "daejeon"),
            ("울산", "ulsan"), ("세종", "sejong"), ("경기", "gyeonggi"), ("강원", "gangwon"), ("충청북", "chungbuk"), ("충북", "chungbuk"),
            ("충청남", "chungnam"), ("충남", "chungnam"), ("전라북", "jeonbuk"), ("전북", "jeonbuk"), ("전라남", "jeonnam"), ("전남", "jeonnam"),
            ("경상북", "gyeongbuk"), ("경북", "gyeongbuk"), ("경상남", "gyeongnam"), ("경남", "gyeongnam"), ("제주", "jeju")]
TYPES = {12: "attraction", 14: "culture"}
SKIP_KINDS = {"캠핑", "펜션/민박"}  # 차박지 탭(고캠핑)과 겹치거나 숙박이에요.

def province_key(word):
    for prefix, key in PROVINCE:
        if word.startswith(prefix):
            return key
    return None

def city_key(province, word):
    table = CITIES.get(province, {})
    if not table or not word:
        return ""
    return table.get(word) or table.get(re.sub(r"(시|군|구)$", "", word), "")

def region(address):
    words = (address or "").split()
    province = province_key(words[0]) if words else None
    # 2026년 전남광주통합특별시: 예전 광주광역시의 구는 사전의 광주로 둬요.
    if province == "jeonnam" and len(words) > 1 and words[1].endswith("구"):
        province = "gwangju"
    if not province:
        return None, ""
    return province, city_key(province, words[1] if len(words) > 1 else "")

def text(value, limit):
    value = html.unescape(re.sub(r"<br\s*/?>", "\n", value or "", flags=re.I))
    value = re.sub(r"<[^>]+>", "", value)
    value = re.sub(r"[ \t]+", " ", re.sub(r"\n\s*\n+", "\n", value)).strip()
    return value if len(value) <= limit else value[: limit - 1].rstrip() + "…"

def link(value):
    found = re.search(r"https?://[^\s\"'<>]+", value or "")
    return found.group(0) if found else ""

def point(row):
    try:
        lat, lng = round(float(row.get("mapy") or 0), 6), round(float(row.get("mapx") or 0), 6)
    except ValueError:
        return 0, 0
    return (lat, lng) if 33 < lat < 39 and 124 < lng < 132 else (0, 0)

def day(value):
    return f"{value[:4]}-{value[4:6]}-{value[6:8]}" if value and len(value) >= 8 else ""

codes = {c["lclsSystm2Cd"]: c["lclsSystm2Nm"] for c in json.load(open(os.path.join(RAW, "codes.json"), encoding="utf-8"))}

places, skipped = {}, 0
for content_type, kind_key in TYPES.items():
    for row in json.load(open(os.path.join(RAW, f"list-{content_type}.json"), encoding="utf-8")):
        kind = codes.get(row.get("lclsSystm2", ""), "")
        if kind in SKIP_KINDS or row.get("lclsSystm1") == "AC":
            continue
        address = " ".join(filter(None, [row.get("addr1", "").strip(), row.get("addr2", "").strip()]))
        province, city = region(address)
        if not province:
            skipped += 1
            continue
        lat, lng = point(row)
        places.setdefault(province, []).append({
            "id": int(row["contentid"]), "type": kind_key, "name": text(row["title"], 80), "city": city, "address": address,
            "phone": text(row.get("tel", ""), 40), "lat": lat, "lng": lng, "kind": kind, "updated": day(row.get("modifiedtime", "")),
        })

festivals = []
for row in json.load(open(os.path.join(RAW, "festivals.json"), encoding="utf-8")):
    province, city = region(row.get("addr1", ""))
    if not province:
        skipped += 1
        continue
    path = os.path.join(RAW, "details", f"{row['contentid']}.json")
    detail = json.load(open(path, encoding="utf-8")) if os.path.exists(path) else {"common": {}, "intro": {}}
    common, intro = detail["common"], detail["intro"]
    lat, lng = point(row)
    festivals.append({
        "id": int(row["contentid"]), "name": text(row["title"], 80), "province": province, "city": city,
        "address": " ".join(filter(None, [row.get("addr1", "").strip(), row.get("addr2", "").strip()])),
        "phone": text(row.get("tel", "") or intro.get("sponsor1tel", ""), 40), "lat": lat, "lng": lng,
        "start": day(row.get("eventstartdate", "")), "end": day(row.get("eventenddate", "")),
        "place": text(intro.get("eventplace", ""), 80), "time": text(intro.get("playtime", ""), 120),
        "fee": text(intro.get("usetimefestival", ""), 120), "age": text(intro.get("agelimit", ""), 80),
        "sponsor": text(intro.get("sponsor1", ""), 60), "program": text(intro.get("program", ""), 600),
        "overview": text(common.get("overview", ""), 1200),
        "homepage": link(intro.get("eventhomepage", "")) or link(common.get("homepage", "")),
        "updated": day(row.get("modifiedtime", "")),
    })
festivals.sort(key=lambda f: (f["start"], f["name"]))

os.makedirs(OUT, exist_ok=True)
for name in os.listdir(OUT):
    if name.endswith(".json"):
        os.remove(os.path.join(OUT, name))
index = {}
for province, rows in places.items():
    rows.sort(key=lambda p: (p["type"], p["name"]))
    with open(os.path.join(OUT, f"{province}.json"), "w", encoding="utf-8") as file:
        json.dump(rows, file, ensure_ascii=False, separators=(",", ":"))
    # 도 → 분류 → 시군 → 곳 수예요. 지역 칩을 받기 전에 그릴 때 써요 (광역시는 시군 "").
    index[province] = {kind: {} for kind in TYPES.values()}
    for p in rows:
        index[province][p["type"]][p["city"]] = index[province][p["type"]].get(p["city"], 0) + 1
with open(os.path.join(OUT, "festivals.json"), "w", encoding="utf-8") as file:
    json.dump(festivals, file, ensure_ascii=False, separators=(",", ":"))
with open(os.path.join(OUT, "index.json"), "w", encoding="utf-8") as file:
    json.dump(index, file, ensure_ascii=False, separators=(",", ":"))
print({"places": sum(len(r) for r in places.values()), "festivals": len(festivals), "skipped": skipped,
       "no_city": sum(1 for r in places.values() for p in r if not p["city"]), "no_point": sum(1 for r in places.values() for p in r if not p["lat"])})
