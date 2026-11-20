import type { Dictionary, Named, Province } from "./types";

// 처음 넣는 기본 목록이에요 (실제 행정구역 · 시설 이름). 관리자 화면의 그룹 · 태그에서 더하고 고칠 수 있어요.
// 형식: "key:한국어:English|..."
function parse(list: string): Named[] {
  return list.split("|").map((entry) => {
    const [key, ko, en] = entry.split(":");
    return { key, name: { ko, en } };
  });
}

function province(key: string, ko: string, en: string, cities: string): Province {
  return { key, country: "kr", name: { ko, en }, cities: cities ? parse(cities) : [] };
}

export const BASE_DICTIONARY: Dictionary = {
  countries: [{ key: "kr", name: { ko: "한국", en: "Korea" } }],
  provinces: [
    province("seoul", "서울", "Seoul", ""),
    province("busan", "부산", "Busan", ""),
    province("daegu", "대구", "Daegu", ""),
    province("incheon", "인천", "Incheon", ""),
    province("gwangju", "광주", "Gwangju", ""),
    province("daejeon", "대전", "Daejeon", ""),
    province("ulsan", "울산", "Ulsan", ""),
    province("sejong", "세종", "Sejong", ""),
    province("gyeonggi", "경기", "Gyeonggi", "suwon:수원:Suwon|seongnam:성남:Seongnam|goyang:고양:Goyang|yongin:용인:Yongin|bucheon:부천:Bucheon|ansan:안산:Ansan|anyang:안양:Anyang|namyangju:남양주:Namyangju|hwaseong:화성:Hwaseong|pyeongtaek:평택:Pyeongtaek|uijeongbu:의정부:Uijeongbu|siheung:시흥:Siheung|paju:파주:Paju|gimpo:김포:Gimpo|gwangmyeong:광명:Gwangmyeong|gwangju-gg:광주:Gwangju|gunpo:군포:Gunpo|hanam:하남:Hanam|osan:오산:Osan|icheon:이천:Icheon|anseong:안성:Anseong|uiwang:의왕:Uiwang|yangju:양주:Yangju|guri:구리:Guri|pocheon:포천:Pocheon|dongducheon:동두천:Dongducheon|gwacheon:과천:Gwacheon|yeoju:여주:Yeoju|yangpyeong:양평:Yangpyeong|gapyeong:가평:Gapyeong|yeoncheon:연천:Yeoncheon"),
    province("gangwon", "강원", "Gangwon", "chuncheon:춘천:Chuncheon|wonju:원주:Wonju|gangneung:강릉:Gangneung|donghae:동해:Donghae|taebaek:태백:Taebaek|sokcho:속초:Sokcho|samcheok:삼척:Samcheok|hongcheon:홍천:Hongcheon|hoengseong:횡성:Hoengseong|yeongwol:영월:Yeongwol|pyeongchang:평창:Pyeongchang|jeongseon:정선:Jeongseon|cheorwon:철원:Cheorwon|hwacheon:화천:Hwacheon|yanggu:양구:Yanggu|inje:인제:Inje|goseong-gw:고성:Goseong|yangyang:양양:Yangyang"),
    province("chungbuk", "충북", "Chungbuk", "cheongju:청주:Cheongju|chungju:충주:Chungju|jecheon:제천:Jecheon|boeun:보은:Boeun|okcheon:옥천:Okcheon|yeongdong:영동:Yeongdong|jeungpyeong:증평:Jeungpyeong|jincheon:진천:Jincheon|goesan:괴산:Goesan|eumseong:음성:Eumseong|danyang:단양:Danyang"),
    province("chungnam", "충남", "Chungnam", "cheonan:천안:Cheonan|gongju:공주:Gongju|boryeong:보령:Boryeong|asan:아산:Asan|seosan:서산:Seosan|nonsan:논산:Nonsan|gyeryong:계룡:Gyeryong|dangjin:당진:Dangjin|geumsan:금산:Geumsan|buyeo:부여:Buyeo|seocheon:서천:Seocheon|cheongyang:청양:Cheongyang|hongseong:홍성:Hongseong|yesan:예산:Yesan|taean:태안:Taean"),
    province("jeonbuk", "전북", "Jeonbuk", "jeonju:전주:Jeonju|gunsan:군산:Gunsan|iksan:익산:Iksan|jeongeup:정읍:Jeongeup|namwon:남원:Namwon|gimje:김제:Gimje|wanju:완주:Wanju|jinan:진안:Jinan|muju:무주:Muju|jangsu:장수:Jangsu|imsil:임실:Imsil|sunchang:순창:Sunchang|gochang:고창:Gochang|buan:부안:Buan"),
    province("jeonnam", "전남", "Jeonnam", "mokpo:목포:Mokpo|yeosu:여수:Yeosu|suncheon:순천:Suncheon|naju:나주:Naju|gwangyang:광양:Gwangyang|damyang:담양:Damyang|gokseong:곡성:Gokseong|gurye:구례:Gurye|goheung:고흥:Goheung|boseong:보성:Boseong|hwasun:화순:Hwasun|jangheung:장흥:Jangheung|gangjin:강진:Gangjin|haenam:해남:Haenam|yeongam:영암:Yeongam|muan:무안:Muan|hampyeong:함평:Hampyeong|yeonggwang:영광:Yeonggwang|jangseong:장성:Jangseong|wando:완도:Wando|jindo:진도:Jindo|sinan:신안:Sinan"),
    province("gyeongbuk", "경북", "Gyeongbuk", "pohang:포항:Pohang|gyeongju:경주:Gyeongju|gimcheon:김천:Gimcheon|andong:안동:Andong|gumi:구미:Gumi|yeongju:영주:Yeongju|yeongcheon:영천:Yeongcheon|sangju:상주:Sangju|mungyeong:문경:Mungyeong|gyeongsan:경산:Gyeongsan|uiseong:의성:Uiseong|cheongsong:청송:Cheongsong|yeongyang:영양:Yeongyang|yeongdeok:영덕:Yeongdeok|cheongdo:청도:Cheongdo|goryeong:고령:Goryeong|seongju:성주:Seongju|chilgok:칠곡:Chilgok|yecheon:예천:Yecheon|bonghwa:봉화:Bonghwa|uljin:울진:Uljin|ulleung:울릉:Ulleung"),
    province("gyeongnam", "경남", "Gyeongnam", "changwon:창원:Changwon|jinju:진주:Jinju|tongyeong:통영:Tongyeong|sacheon:사천:Sacheon|gimhae:김해:Gimhae|miryang:밀양:Miryang|geoje:거제:Geoje|yangsan:양산:Yangsan|uiryeong:의령:Uiryeong|haman:함안:Haman|changnyeong:창녕:Changnyeong|goseong-gn:고성:Goseong|namhae:남해:Namhae|hadong:하동:Hadong|sancheong:산청:Sancheong|hamyang:함양:Hamyang|geochang:거창:Geochang|hapcheon:합천:Hapcheon"),
    province("jeju", "제주", "Jeju", "jeju-si:제주시:Jeju City|seogwipo:서귀포:Seogwipo"),
  ],
  spotTypes: parse("beach:해변:Beach|valley:계곡:Valley|mountain:산:Mountain|river:강변:Riverside|lake:호수:Lake|city:도심:City|campsite:캠핑장:Campsite"),
  features: parse("toilet:화장실:Toilet|sink:개수대:Sink|power:전기:Power|shower:샤워:Shower|water:식수:Drinking water|parking:넓은 주차:Wide parking"),
  tags: parse("pet:반려견:Pet-friendly|stars:별보기:Stargazing|seaview:바다뷰:Sea view|free:무료:Free|fishing:낚시:Fishing|quiet:조용함:Quiet"),
  vehicleCategories: parse("maint:정비:Maintenance|winter:겨울 대비:Winter prep|power:전기·배터리:Power & battery|water:수도·오수:Water & waste|mod:개조:Build & mods"),
};

export const EMPTY_DICTIONARY: Dictionary = { countries: [], provinces: [], spotTypes: [], features: [], tags: [], vehicleCategories: [] };
