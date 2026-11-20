"""scrape-gocamp.py가 받은 list.jsonl · detail.jsonl을 src/data/campsites/{도}.json과 index.json으로 만들어요.
usage: python3 -I scripts/build-campsites.py RAW_DIR
도 · 시군 키는 src/lib/baseDictionary.ts의 것을 써요.
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "src", "data", "campsites")
raw = sys.argv[1]

src = open(os.path.join(ROOT, "src", "lib", "baseDictionary.ts"), encoding="utf-8").read()
CITIES = {}
for key, ko, cities in re.findall(r'province\("([\w-]+)", "([^"]+)", "[^"]*", "([^"]*)"\)', src):
    CITIES[key] = {c.split(":")[1]: c.split(":")[0] for c in cities.split("|")} if cities else {}

PROVINCE = [("서울", "seoul"), ("부산", "busan"), ("대구", "daegu"), ("인천", "incheon"), ("광주", "gwangju"), ("대전", "daejeon"),
            ("울산", "ulsan"), ("세종", "sejong"), ("경기", "gyeonggi"), ("강원", "gangwon"), ("충청북", "chungbuk"), ("충북", "chungbuk"),
            ("충청남", "chungnam"), ("충남", "chungnam"), ("전라북", "jeonbuk"), ("전북", "jeonbuk"), ("전라남", "jeonnam"), ("전남", "jeonnam"),
            ("경상북", "gyeongbuk"), ("경북", "gyeongbuk"), ("경상남", "gyeongnam"), ("경남", "gyeongnam"), ("제주", "jeju")]

def province_key(word):
    for prefix, key in PROVINCE:
        if word.startswith(prefix): return key
    return None

def city_key(province, word):
    table = CITIES.get(province, {})
    if not table or not word: return ""
    if word in table: return table[word]
    stripped = re.sub(r"(시|군|구)$", "", word)
    return table.get(stripped, "")

def read(path):
    return [json.loads(l) for l in open(path, encoding="utf-8") if l.strip()]

def clean(value, limit):
    value = (value or "").strip()
    if value in ("-", "없음"): return ""
    return value if len(value) <= limit else value[: limit - 1].rstrip() + "…"

items = []
for page in sorted(read(os.path.join(raw, "list.jsonl")), key=lambda r: r["page"]):
    items += page["items"]
details = {d["c_no"]: d for d in read(os.path.join(raw, "detail.jsonl"))} if os.path.exists(os.path.join(raw, "detail.jsonl")) else {}

seen, out, skipped, closed = set(), {}, [], 0
for it in items:
    if it["c_no"] in seen: continue
    seen.add(it["c_no"])
    if "hotel_close" in it["listClass"]:  # 휴업 중인 곳은 빼요.
        closed += 1; continue
    d = details.get(it["c_no"], {})
    address = d.get("주소") or it["address"]
    words = (it["region"] or address).split()
    province = province_key(words[0]) if words else None
    if not province and address: province = province_key(address.split()[0])
    # 2026년 전남광주통합특별시: 예전 광주광역시의 구는 사전의 광주로 둬요.
    if province == "jeonnam" and len(words) > 1 and words[1].endswith("구"): province = "gwangju"
    if not province:
        skipped.append((it["c_no"], it["region"], address)); continue
    city = city_key(province, words[1] if len(words) > 1 else "") or city_key(province, (address.split() + ["", ""])[1])
    try:
        lat, lng = round(float(d.get("lat") or 0), 6), round(float(d.get("lng") or 0), 6)
    except ValueError:
        lat = lng = 0
    if not (33 < lat < 39 and 124 < lng < 132): lat = lng = 0
    phone = (d.get("문의처") or it["phone"]).split(",")[0].strip()
    out.setdefault(province, []).append({
        "id": it["c_no"], "name": it["name"], "city": city, "address": address.strip(), "phone": clean(phone, 40),
        "lat": lat, "lng": lng, "summary": clean(it["summary"] or it["content"], 120), "kind": clean(d.get("캠핑장 유형", ""), 40),
        "facilities": list(dict.fromkeys(it["facilities"])), "nearby": clean(d.get("주변이용가능시설", ""), 120),
        "pets": clean(d.get("반려동물 출입", ""), 60), "season": clean(d.get("운영기간", ""), 40), "days": clean(d.get("운영일", ""), 40),
        "homepage": d.get("홈페이지", "") if d.get("홈페이지", "").startswith("http") else "", "note": clean(d.get("기타 정보", ""), 200),
        "updated": d.get("updated", ""),
    })

os.makedirs(OUT, exist_ok=True)
for name in os.listdir(OUT):
    if name.endswith(".json"): os.remove(os.path.join(OUT, name))
index = {}
for province, camps in out.items():
    with open(os.path.join(OUT, f"{province}.json"), "w", encoding="utf-8") as f:
        json.dump(camps, f, ensure_ascii=False, separators=(",", ":"))
    counts = {}
    for c in camps: counts[c["city"]] = counts.get(c["city"], 0) + 1
    index[province] = counts
with open(os.path.join(OUT, "index.json"), "w", encoding="utf-8") as f:
    json.dump(index, f, ensure_ascii=False, indent=1)
total = sum(len(v) for v in out.values())
print("campsites", total, "closed", closed, "details", sum(1 for i in seen if i in details), "skipped", len(skipped), skipped[:5])
print("no city:", sum(1 for v in out.values() for c in v if not c["city"] and CITIES.get(next(k for k, x in out.items() if x is v))))
print("no coords:", sum(1 for v in out.values() for c in v if not c["lat"]))
