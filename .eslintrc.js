module.exports = {
  env: {
    es6: true,
    node: true,
    "nova/nova": true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
  plugins: ["nova"],
  rules: {},
};
