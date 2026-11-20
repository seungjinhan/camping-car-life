import { BASE_DICTIONARY } from "./baseDictionary";
import type { CalendarEvent, Snapshot } from "./types";

// Firebase를 붙이기 전까지 쓰는 샘플 데이터예요. 실제 장소와 다를 수 있어요.
const n = (ko: string, en: string) => ({ ko, en });

export const SAMPLE: Snapshot = {
  dictionary: BASE_DICTIONARY,
  spots: [
    { id: "s1", name: n("인제 내린천 오토캠핑", "Inje Naerincheon Auto Camping"), category: "campsite", visitedAt: "2026-11-12", type: "valley", country: "kr", province: "gangwon", city: "inje", features: ["toilet", "sink"], tags: ["pet", "stars"], lat: 37.98, lng: 128.17, address: "강원 인제군 인제읍 내린천로", description: n("계곡 바로 옆이라 물소리를 들으며 잘 수 있어요. 화장실과 개수대가 있고 전기는 없어요.", "Right next to the stream. Toilet and sink, no power.") },
    { id: "s2", name: n("평창 육백마지기", "Pyeongchang Yukbaekmajigi"), category: "wild", visitedAt: "2026-11-05", type: "mountain", country: "kr", province: "gangwon", city: "pyeongchang", features: ["toilet"], tags: ["stars"], lat: 37.62, lng: 128.47, address: "강원 평창군 미탄면 청옥산길", description: n("해발 1,200m 고원이라 별이 잘 보여요. 바람이 세니 차를 잘 고정하세요.", "A 1,200 m plateau with great stars. Strong wind.") },
    { id: "s3", name: n("양양 낙산 해변 주차장", "Yangyang Naksan Beach Parking"), category: "parking", visitedAt: "2026-10-29", type: "beach", country: "kr", province: "gangwon", city: "yangyang", features: ["toilet", "shower"], tags: ["seaview"], lat: 38.12, lng: 128.63, address: "강원 양양군 강현면 해맞이길", description: n("일출을 차 안에서 볼 수 있어요. 여름엔 붐벼요.", "Sunrise from your van. Crowded in summer.") },
    { id: "s4", name: n("속초 영랑호 공영주차장", "Sokcho Yeongnangho Public Parking"), category: "parking", visitedAt: "2026-10-26", type: "city", country: "kr", province: "gangwon", city: "sokcho", features: ["toilet", "water"], tags: ["free"], lat: 38.22, lng: 128.58, address: "강원 속초시 영랑호반길", description: n("도심 가까운 호수 주차장이에요. 장보기 편해요.", "Lakeside lot close to town.") },
    { id: "s5", name: n("화천 붕어섬 주차장", "Hwacheon Bungeoseom Parking"), category: "parking", visitedAt: "2026-10-20", type: "river", country: "kr", province: "gangwon", city: "hwacheon", features: ["toilet"], tags: ["fishing"], lat: 38.1, lng: 127.71, address: "강원 화천군 화천읍 강변로", description: n("산천어축제장과 가까워요.", "Close to the trout festival.") },
    { id: "s6", name: n("태백 오투리조트 아래 공터", "Taebaek O2 Resort Lot"), category: "wild", visitedAt: "2026-10-15", type: "mountain", country: "kr", province: "gangwon", city: "taebaek", features: [], tags: ["stars", "free"], lat: 37.15, lng: 128.95, address: "강원 태백시 서학로", description: n("시설은 없지만 조용해요.", "No facilities, but quiet.") },
    { id: "s7", name: n("강릉 사천진 해변", "Gangneung Sacheonjin Beach"), category: "wild", visitedAt: "2026-10-11", type: "beach", country: "kr", province: "gangwon", city: "gangneung", features: ["toilet", "shower", "water"], tags: ["seaview", "pet"], lat: 37.84, lng: 128.88, address: "강원 강릉시 사천면 해안로", description: n("물이 맑고 카페가 가까워요.", "Clear water, cafes nearby.") },
    { id: "s8", name: n("홍천 노일리 강변", "Hongcheon Noil-ri Riverside"), category: "wild", visitedAt: "2026-10-06", type: "river", country: "kr", province: "gangwon", city: "hongcheon", features: ["toilet"], tags: ["fishing", "pet"], lat: 37.72, lng: 127.62, address: "강원 홍천군 서면 노일리", description: n("넓은 자갈밭이라 차 대기 좋아요.", "Wide gravel area for vans.") },
    { id: "s9", name: n("제주 금능 해변", "Jeju Geumneung Beach"), category: "wild", visitedAt: "2026-10-01", type: "beach", country: "kr", province: "jeju", city: "jeju-si", features: ["toilet", "shower"], tags: ["seaview"], lat: 33.39, lng: 126.23, address: "제주 제주시 한림읍 금능리", description: n("비양도가 보이는 에메랄드빛 바다예요.", "Emerald sea facing Biyangdo.") },
    { id: "s10", name: n("울진 망양정 쉼터", "Uljin Mangyangjeong Rest Area"), category: "parking", visitedAt: "2026-09-30", type: "beach", country: "kr", province: "gyeongbuk", city: "uljin", features: ["toilet", "water"], tags: ["seaview", "free"], lat: 36.88, lng: 129.41, address: "경북 울진군 근남면 산포리", description: n("동해를 내려다보는 정자 옆 쉼터예요.", "Rest area overlooking the East Sea.") },
    { id: "s11", name: n("여수 무슬목 해변", "Yeosu Museulmok Beach"), category: "wild", visitedAt: "2026-09-30", type: "beach", country: "kr", province: "jeonnam", city: "yeosu", features: ["toilet"], tags: ["seaview"], lat: 34.73, lng: 127.77, address: "전남 여수시 돌산읍 평사리", description: n("몽돌 해변과 일출이 좋아요.", "Pebble beach and sunrise.") },
    { id: "s12", name: n("남해 두모마을 공터", "Namhae Dumo Village Lot"), category: "wild", visitedAt: "2026-09-30", type: "mountain", country: "kr", province: "gyeongnam", city: "namhae", features: ["toilet", "sink"], tags: ["stars"], lat: 34.74, lng: 127.95, address: "경남 남해군 상주면 두모리", description: n("다랭이논이 내려다보여요.", "Overlooks terraced rice fields.") },
  ],
  festivals: [
    { id: "f1", name: n("평창 송어축제", "Pyeongchang Trout Festival"), country: "kr", province: "gangwon", city: "pyeongchang", start: "2026-12-26", end: "2027-02-08", place: n("오대천 일대", "Odaecheon Stream"), lat: 37.56, lng: 128.53, url: "https://www.festival700.or.kr", intro: n("얼음낚시와 눈썰매를 즐길 수 있어요.", "Ice fishing and snow sledding.") },
    { id: "f2", name: n("화천 산천어축제", "Hwacheon Sancheoneo Ice Festival"), country: "kr", province: "gangwon", city: "hwacheon", start: "2027-01-10", end: "2027-02-01", place: n("화천천 일대", "Hwacheoncheon Stream"), lat: 38.1, lng: 127.7, url: "https://www.narafestival.com", intro: n("얼음 위에서 산천어를 낚아요.", "Catch cherry salmon on the ice.") },
    { id: "f3", name: n("태백산 눈축제", "Taebaeksan Snow Festival"), country: "kr", province: "gangwon", city: "taebaek", start: "2027-01-23", end: "2027-02-01", place: n("태백산 국립공원", "Taebaeksan National Park"), lat: 37.1, lng: 128.96, url: "https://www.taebaek.go.kr", intro: n("눈 조각과 눈꽃 등반이 있어요.", "Snow sculptures and snowflake hikes.") },
    { id: "f4", name: n("양양 송이축제", "Yangyang Pine Mushroom Festival"), country: "kr", province: "gangwon", city: "yangyang", start: "2026-09-25", end: "2026-09-28", place: n("남대천 둔치", "Namdaecheon Riverside"), lat: 38.07, lng: 128.62, url: "https://www.yangyang.go.kr", intro: n("송이 채취 체험이 있어요.", "Pine mushroom picking.") },
  ],
  videos: [
    { id: "v1", youtubeId: "", title: n("영하 15도 대관령 차박, 무시동 히터 후기", "−15°C van night at Daegwallyeong with a diesel heater"), channel: "캠핑카라이프", kind: "camper", country: "kr", province: "gangwon", city: "pyeongchang", tags: ["stars"], spotId: "s2", createdAt: "2026-11-10" },
    { id: "v2", youtubeId: "", title: n("인제 계곡 첫날 밤", "First night by the Inje stream"), channel: "캠핑카라이프", kind: "travel", country: "kr", province: "gangwon", city: "inje", tags: ["pet"], spotId: "s1", createdAt: "2026-11-08" },
    { id: "v3", youtubeId: "", title: n("오수 탱크 처음 비우기", "Emptying the waste tank for the first time"), channel: "캠핑카라이프", kind: "repair", country: "kr", province: "gangwon", city: "sokcho", tags: [], spotId: "s4", createdAt: "2026-11-02" },
    { id: "v4", youtubeId: "", title: n("양양 일출 차박", "Sunrise van night in Yangyang"), channel: "캠핑카라이프", kind: "travel", country: "kr", province: "gangwon", city: "yangyang", tags: ["seaview"], spotId: "s3", createdAt: "2026-10-30" },
    { id: "v5", youtubeId: "", title: n("인산철 배터리 달기", "Installing a LiFePO4 battery"), channel: "캠핑카라이프", kind: "repair", country: "kr", province: "gangwon", city: "hongcheon", tags: [], createdAt: "2026-10-22" },
    { id: "v6", youtubeId: "", title: n("화천 강변 낚시", "Riverside fishing in Hwacheon"), channel: "캠핑카라이프", kind: "travel", country: "kr", province: "gangwon", city: "hwacheon", tags: ["fishing"], spotId: "s5", createdAt: "2026-10-21" },
    { id: "v7", youtubeId: "", title: n("작은 캠핑카 내부 소개", "Small camper van tour"), channel: "캠핑카라이프", kind: "camper", country: "kr", province: "gangwon", city: "inje", tags: [], createdAt: "2026-10-12" },
    { id: "v8", youtubeId: "", title: n("강릉 바다 앞 아침", "Morning by the Gangneung sea"), channel: "캠핑카라이프", kind: "travel", country: "kr", province: "gangwon", city: "gangneung", tags: ["seaview", "pet"], spotId: "s7", createdAt: "2026-10-11" },
    { id: "v9", youtubeId: "", title: n("제주로 차를 싣고", "Shipping the van to Jeju"), channel: "캠핑카라이프", kind: "travel", country: "kr", province: "jeju", city: "jeju-si", tags: ["seaview"], spotId: "s9", createdAt: "2026-10-02" },
    { id: "v10", youtubeId: "", title: n("캠핑카 생활 시작", "Starting camper life"), channel: "캠핑카라이프", kind: "camper", country: "kr", province: "gyeongbuk", city: "uljin", tags: [], createdAt: "2026-09-30" },
    { id: "v11", youtubeId: "", title: n("장보기와 차 안 요리", "Groceries and cooking in the van"), channel: "캠핑카라이프", kind: "etc", country: "kr", province: "jeonnam", city: "yeosu", tags: [], createdAt: "2026-09-29" },
  ],
  posts: [
    { id: "p1", board: "community", category: "notice", title: "캠핑카라이프를 시작했어요", body: "1년 동안 작은 캠핑카로 한국 구석구석을 다니며 차박지와 축제를 소개할게요.", pinned: true, createdAt: "2026-11-13" },
    { id: "p2", board: "community", category: "question", title: "다음 여정은 남해안이에요", body: "12월에는 통영에서 여수까지 남해안을 따라 다닐 예정이에요.", createdAt: "2026-11-12" },
    { id: "p3", board: "community", category: "update", title: "지도 보기가 생겼어요", body: "차박지 탭에서 목록과 지도를 오갈 수 있어요.", createdAt: "2026-11-10" },
    { id: "p4", board: "community", category: "question", title: "겨울 차박 필수템은?", body: "여러분의 겨울 필수템을 알려주세요.", createdAt: "2026-11-08" },
    { id: "p5", board: "vehicle", category: "power", title: "인산철 배터리 겨울 보관법", body: "영하에서는 충전하지 말고, 50~60%로 맞춰 보관해요.", createdAt: "2026-11-02" },
    { id: "p6", board: "vehicle", category: "winter", title: "청수 탱크 물 빼는 순서", body: "밸브를 열고 펌프를 돌려 배관에 남은 물까지 빼요.", createdAt: "2026-10-30" },
    { id: "p7", board: "vehicle", category: "water", title: "오수 탱크 냄새 잡기", body: "전용 약품과 함께 자주 비우는 게 가장 좋아요.", createdAt: "2026-10-28" },
    { id: "p8", board: "vehicle", category: "maint", title: "엔진오일 교환 (12,400km)", body: "5W-30으로 교환했어요. 다음은 22,000km 예정이에요.", createdAt: "2026-10-21" },
    { id: "p9", board: "vehicle", category: "mod", title: "무시동 히터 설치 후기", body: "설치 위치와 배기구 방향이 가장 중요해요.", createdAt: "2026-10-15" },
    { id: "p10", board: "story", category: "camper", title: "왜 작은 캠핑카를 골랐을까", body: "골목과 산길을 다니려고 길이 5m 안쪽 차를 골랐어요. 대신 짐은 반으로 줄였어요.", createdAt: "2026-11-11" },
    { id: "p11", board: "story", category: "video", title: "첫 영상 편집하며 배운 것", body: "휴대폰 하나로 찍고, 소리는 따로 녹음하는 게 훨씬 나았어요.", createdAt: "2026-11-06" },
    { id: "p12", board: "story", category: "life", title: "차에서 맞은 첫 서리", body: "아침에 창문이 하얗게 얼어 있었어요. 히터 덕분에 차 안은 따뜻했어요.", createdAt: "2026-11-03" },
  ],
  journey: { startDate: "2026-09-30", phase: "korea", koreaDays: 365, here: { spotId: "s1", province: "gangwon", city: "inje", since: "2026-11-12" } },
};

export const SAMPLE_EVENTS: CalendarEvent[] = [
  { id: "e1", title: "울진 해안도로 이동", start: "2026-11-08", end: "2026-11-09", allDay: true, location: "경북 울진", description: "" },
  { id: "e2", title: "속초 장보기 라이브", start: "2026-11-15T19:00:00+09:00", end: "2026-11-15T20:00:00+09:00", allDay: false, location: "온라인", description: "유튜브 라이브" },
  { id: "e3", title: "홍천 캠핑카 정모", start: "2026-11-22T10:00:00+09:00", end: "2026-11-22T18:00:00+09:00", allDay: false, location: "강원 홍천 노일리 강변", description: "장작은 각자 준비해 주세요. 화장실은 입구 쪽에 있어요." },
  { id: "e4", title: "겨울 대비 차량 점검 라이브", start: "2026-11-22T20:00:00+09:00", end: "2026-11-22T21:00:00+09:00", allDay: false, location: "온라인", description: "유튜브 라이브" },
  { id: "e5", title: "평창 이동", start: "2026-11-28", end: "2026-11-29", allDay: true, location: "강원 평창", description: "" },
  { id: "e6", title: "평창 송어축제 사전 답사", start: "2026-11-29T13:00:00+09:00", end: "2026-11-29T15:00:00+09:00", allDay: false, location: "강원 평창 오대천", description: "" },
  { id: "e7", title: "강릉 커피거리", start: "2026-12-05", end: "2026-12-06", allDay: true, location: "강원 강릉", description: "" },
];

