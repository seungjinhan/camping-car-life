"""한국관광공사 TourAPI(국문 관광정보 서비스 KorService2)에서 돌아보기 데이터를 받아 scripts/tour-raw/에 쌓아요.
usage: TOUR_API_KEY=... python3 -I scripts/fetch-tour.py [--details N]
- 관광지(12) · 문화시설(14) 목록과 진행 중 · 다가오는 축제(15) 목록을 받아요 (약 20번 요청).
- 축제는 소개(detailCommon2)와 장소 · 시간 · 요금(detailIntro2)도 받아요. 받아 둔 건 다시 받지 않아요.
- 개발 계정은 하루 1,000번까지라, --details로 상세 요청 수를 제한해요 (기본 300).
키는 .env의 TOUR_API_KEY예요. 화면에 찍지 않아요.
"""
import json, os, sys, time, urllib.parse, urllib.request
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "scripts", "tour-raw")
KEY = os.environ.get("TOUR_API_KEY", "")
BUDGET = int(sys.argv[sys.argv.index("--details") + 1]) if "--details" in sys.argv else 300
if not KEY:
    sys.exit("TOUR_API_KEY가 없어요 (.env)")

calls = 0

def call(op, **params):
    global calls
    query = urllib.parse.urlencode({"serviceKey": KEY, "MobileOS": "ETC", "MobileApp": "CamperLife", "_type": "json", **params})
    for attempt in range(3):
        try:
            calls += 1
            body = json.loads(urllib.request.urlopen(f"https://apis.data.go.kr/B551011/KorService2/{op}?{query}", timeout=60).read().decode())
            header = body["response"]["header"]
            if header["resultCode"] != "0000":
                raise RuntimeError(f"{op}: {header['resultMsg']}")
            return body["response"]["body"]
        except Exception as error:  # 키가 메시지에 섞이지 않게 해요.
            message = str(error).replace(KEY, "<KEY>")
            if attempt == 2:
                raise RuntimeError(message) from None
            time.sleep(2)

def items_of(body):
    items = body.get("items") or {}
    item = items.get("item", []) if isinstance(items, dict) else []
    return item if isinstance(item, list) else [item]

def fetch_all(op, **params):
    out, page = [], 1
    while True:
        body = call(op, numOfRows=1000, pageNo=page, **params)
        out += items_of(body)
        if page * 1000 >= int(body["totalCount"]):
            return out
        page += 1
        time.sleep(0.3)

def save(name, value):
    with open(os.path.join(RAW, name), "w", encoding="utf-8") as file:
        json.dump(value, file, ensure_ascii=False)

os.makedirs(os.path.join(RAW, "details"), exist_ok=True)
for content_type in (12, 14):
    rows = fetch_all("areaBasedList2", contentTypeId=content_type, arrange="C")
    save(f"list-{content_type}.json", rows)
    print(content_type, len(rows))
festivals = fetch_all("searchFestival2", eventStartDate=date.today().strftime("%Y%m%d"), arrange="A")
save("festivals.json", festivals)
print("festivals", len(festivals))
save("codes.json", fetch_all("lclsSystmCode2", lclsSystmListYn="Y"))

used = 0
for row in festivals:
    path = os.path.join(RAW, "details", f"{row['contentid']}.json")
    if os.path.exists(path):
        continue
    if used + 2 > BUDGET:
        print("상세 요청 한도에 닿았어요. 내일 다시 돌리면 이어서 받아요.")
        break
    common = items_of(call("detailCommon2", contentId=row["contentid"]))
    intro = items_of(call("detailIntro2", contentId=row["contentid"], contentTypeId=15))
    used += 2
    with open(path, "w", encoding="utf-8") as file:
        json.dump({"common": common[0] if common else {}, "intro": intro[0] if intro else {}}, file, ensure_ascii=False)
    time.sleep(0.2)
print({"requests": calls})
