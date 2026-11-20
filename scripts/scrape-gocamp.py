"""고캠핑 캠핑장 목록·상세를 1초에 한 번씩 천천히 받아요. 끊겨도 이어서 받아요.
usage: python3 -I scrape_gocamp.py OUT_DIR
"""
import html, json, os, re, sys, time, urllib.request

BASE = "https://www.gocamping.or.kr/bsite/camp/info"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
FAC = {"001": "전기", "002": "장작판매", "003": "온수", "004": "놀이터", "005": "산책로", "006": "운동장",
       "007": "와이파이", "008": "운동시설", "009": "트렘폴린", "010": "마트,편의점", "011": "물놀이장"}
out = sys.argv[1]
LIST = os.path.join(out, "list.jsonl")
DETAIL = os.path.join(out, "detail.jsonl")
last = [0.0]

def get(url):
    for attempt in range(4):
        wait = 1.0 - (time.time() - last[0])
        if wait > 0: time.sleep(wait)
        last[0] = time.time()
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "ko"})
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.read().decode("utf-8", "ignore")
        except Exception as e:
            print("retry", url, e, flush=True)
            time.sleep(5 * (attempt + 1))
    raise RuntimeError(url)

def text(s):
    s = re.sub(r"<!--.*?-->", "", s, flags=re.S)
    s = re.sub(r"<br\s*/?>", " ", s)
    s = re.sub(r"<[^>]+>", "", s)
    return re.sub(r"\s+", " ", html.unescape(s).replace("\xa0", " ")).strip()

def read_jsonl(path):
    if not os.path.exists(path): return []
    return [json.loads(l) for l in open(path, encoding="utf-8") if l.strip()]

def parse_list(s):
    items = []
    for block in re.split(r'<div class="list-item', s)[1:]:
        cls = block[:block.find('"')]
        m = re.search(r"read\.do\?c_no=(\d+)", block)
        if not m: continue
        subject = text(re.search(r'<h2 class="subject[^>]*>(.*?)</h2>', block, re.S).group(1))
        rm = re.match(r"\[([^\]]*)\]\s*(.*)", subject)
        def grab(p):
            mm = re.search(p, block, re.S)
            return text(mm.group(1)) if mm else ""
        items.append({
            "c_no": int(m.group(1)),
            "region": rm.group(1) if rm else "",
            "name": rm.group(2) if rm else subject,
            "summary": grab(r'<h3 class="summary[^>]*>(.*?)</h3>'),
            "content": grab(r'<p class="content[^>]*>(.*?)</p>'),
            "address": grab(r'class="address[^>]*>(.*?)</a>'),
            "phone": grab(r'class="contact[^>]*>(.*?)</a>'),
            "facilities": [FAC.get(c, c) for c in re.findall(r'class="facility(\d{3})"', block)],
            "listClass": cls.strip(),
        })
    return items

def dl_pairs(chunk):
    pairs = {}
    for dt, dd in re.findall(r"<dt[^>]*>(.*?)</dt>\s*<dd[^>]*>(.*?)</dd>", chunk, re.S):
        pairs[text(dt)] = (text(dd), dd)
    return pairs

def parse_detail(s):
    d = {}
    for k in ("lat", "lng"):
        m = re.search(r'var %s = "([^"]*)"' % k, s)
        d[k] = m.group(1) if m else ""
    i = s.find('<div class="camp-info'); j = s.find("camp-buttons", i)
    info = dl_pairs(s[i:j]) if i >= 0 else {}
    k = s.find('<div class="camp-etc-facilities'); kk = s.find("</dl>", k)
    etc = dl_pairs(s[k:kk]) if k >= 0 else {}
    for key, (val, raw) in {**info, **etc}.items():
        if key == "홈페이지":
            m = re.search(r'href="([^"]+)"', raw); d[key] = m.group(1) if m else ""
        else:
            d[key] = val
    m = re.search(r"최종 정보 수정일\s*:\s*([\d-]+)", s); d["updated"] = m.group(1) if m else ""
    m = re.search(r'<div class="camp-intro.*?<p[^>]*>(.*?)</p>', s, re.S)
    d["intro"] = text(m.group(1))[:600] if m else ""
    return d

def main():
    os.makedirs(out, exist_ok=True)
    done_pages = {r["page"] for r in read_jsonl(LIST)}
    first = get(f"{BASE}/list.do?pageUnit=10&pageIndex=1")
    total = int(re.search(r'총 <span class="count">(\d+)', first).group(1))
    pages = (total + 9) // 10
    print("total", total, "pages", pages, flush=True)
    with open(LIST, "a", encoding="utf-8") as f:
        for p in range(1, pages + 1):
            if p in done_pages: continue
            s = first if p == 1 else get(f"{BASE}/list.do?pageUnit=10&pageIndex={p}")
            f.write(json.dumps({"page": p, "items": parse_list(s)}, ensure_ascii=False) + "\n"); f.flush()
            if p % 20 == 0: print("list", p, "/", pages, flush=True)
    ids = []
    for r in read_jsonl(LIST):
        ids += [it["c_no"] for it in r["items"]]
    ids = list(dict.fromkeys(ids))
    done = {r["c_no"] for r in read_jsonl(DETAIL)}
    print("ids", len(ids), "detail done", len(done), flush=True)
    with open(DETAIL, "a", encoding="utf-8") as f:
        n = 0
        for c in ids:
            if c in done: continue
            d = parse_detail(get(f"{BASE}/read.do?c_no={c}"))
            d["c_no"] = c
            f.write(json.dumps(d, ensure_ascii=False) + "\n"); f.flush()
            n += 1
            if n % 100 == 0: print("detail", len(done) + n, "/", len(ids), flush=True)
    print("DONE", flush=True)

if __name__ == "__main__":
    main()
