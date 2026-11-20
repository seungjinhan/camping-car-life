import { defineConfig } from "@apps-in-toss/web-framework/config";

// appName은 토스 콘솔에 등록한 값과 같아야 업로드할 수 있어요 (콘솔 등록 후 바꿀 수 없어요).
export default defineConfig({
  appName: "camping-car-life",
  brand: {
    primaryColor: "#2F7D5B",
  },
  webView: {},
  permissions: [{ name: "clipboard", access: "write" }],
  webBundleDir: "dist",
});
