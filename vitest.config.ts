import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: [
        "lib/api/response.ts",
        "lib/services/quiz-generator.ts",
        "lib/services/results.ts",
        "app/api/ai/quiz/route.ts",
        "app/api/results/list/route.ts",
        "app/api/results/get/[id]/route.ts",
        "app/api/results/update/[id]/route.ts",
        "app/api/results/delete/[id]/route.ts",
      ],
      thresholds: {
        lines: 75,
        functions: 80,
        branches: 70,
        statements: 75,
      },
    },
  },
});
