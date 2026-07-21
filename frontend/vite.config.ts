import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const API_ORIGIN = "https://9sa9pqvlsc.execute-api.ap-northeast-1.amazonaws.com";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // 開発時は /api を本番 API に中継する。
  // 本番 API Gateway には CORS がまだ無く、ブラウザから直接叩くと
  // プリフライトで弾かれる。dev サーバー（サーバー間通信）が代理で叩けば
  // CORS はブラウザの制約なので回避でき、apply 前でもローカルで動作確認できる。
  server: {
    proxy: {
      "/api": {
        target: API_ORIGIN,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
