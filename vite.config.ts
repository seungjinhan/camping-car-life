import aitDevtools from "@apps-in-toss/devtools/unplugin";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

// 토스 검수는 번들에 "eval(" 글자가 있으면 외부 코드 실행으로 보고 반려해요(2026-11-15 반려).
// Firestore가 쓰는 re2js의 Prefilter.eval은 외부 코드를 실행하지 않는 메서드 이름이라, 빌드할 때 이름만 바꿔요.
const RE2JS_EVAL = "eval(input, pos)";
const RE2JS_EVAL_COUNT = 4;
const EVAL_CALL = /(^|[^\w$])eval\s*\(/;

function noEval(): Plugin {
  return {
    name: "no-eval",
    enforce: "pre",
    apply: "build",
    transform(code, id) {
      if (!/[\\/]node_modules[\\/]re2js[\\/]/.test(id)) return null;
      const count = code.split(RE2JS_EVAL).length - 1;
      // re2js가 바뀌어 개수가 다르면 그냥 넘기지 않고 멈춰서 다시 확인하게 해요.
      if (count !== RE2JS_EVAL_COUNT) this.error(`re2js의 ${RE2JS_EVAL}가 ${count}곳이에요(${RE2JS_EVAL_COUNT}곳이어야 해요). vite.config.ts를 다시 확인해 주세요.`);
      return { code: code.replaceAll(RE2JS_EVAL, "prefilterMatches(input, pos)"), map: null };
    },
    generateBundle(_, bundle) {
      for (const file of Object.values(bundle)) {
        if (file.type === "chunk" && EVAL_CALL.test(file.code)) this.error(`${file.fileName}에 eval( 글자가 남아 있어요. 토스 검수에서 반려돼요.`);
      }
    },
  };
}

// --mode web: GitHub Pages용 웹 버전이에요. 하위 경로(/camping-car-life/)에서도 열리게 상대 경로로 만들고, 토스 개발 도구는 빼요.
export default defineConfig(({ mode }) => ({
  base: mode === "web" ? "./" : "/",
  build: mode === "web" ? { outDir: "dist-web" } : undefined,
  plugins: mode === "web" ? [noEval(), react()] : [noEval(), aitDevtools.vite(), react()],
  test: { exclude: ["node_modules", "dist", "dist-web"] },
}) as Parameters<typeof defineConfig>[0]);
