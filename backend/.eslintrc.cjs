/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: { node: true, es2022: true },
  parserOptions: { ecmaVersion: "latest", sourceType: "script" },
  plugins: ["import"],
  extends: ["eslint:recommended", "plugin:import/recommended", "prettier"],
  ignorePatterns: ["dist", "node_modules"],
  rules: {
    "import/order": [
      "error",
      {
        alphabetize: { order: "asc", caseInsensitive: true },
        "newlines-between": "always"
      }
    ]
  },
  settings: {
    "import/resolver": {
      node: { extensions: [".js", ".cjs", ".ts"] }
    }
  }
};

