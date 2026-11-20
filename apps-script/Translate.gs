/**
 * 캠핑카라이프 자동 번역 웹 앱이에요.
 * 배포: 확장 프로그램 > Apps Script에 붙여 넣고 [배포 > 새 배포 > 웹 앱], 액세스 권한은 "모든 사용자".
 * 받은 주소를 .env의 VITE_TRANSLATE_URL에 넣어요.
 * 한도: 개인 계정은 하루 5,000회 정도예요. 번역만 하므로 데이터를 읽거나 쓰지 않아요.
 *
 * 요청: GET ?text=한국어&targets=en,ja,zh-TW,zh-CN,vi,id,es,th
 * 응답: { "en": "...", "ja": "...", ... }
 */
function doGet(e) {
  var text = String((e && e.parameter && e.parameter.text) || "").slice(0, 4000);
  var targets = String((e && e.parameter && e.parameter.targets) || "").split(",").filter(String);
  var result = {};
  if (text) {
    targets.forEach(function (target) {
      try {
        result[target] = LanguageApp.translate(text, "ko", target);
      } catch (error) {
        // 한 언어가 실패해도 나머지는 돌려줘요. 빈 칸은 앱에서 영어 → 한국어로 보여줘요.
      }
    });
  }
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}
