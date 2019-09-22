module.exports = {
  // Use only this configuration
  root: true,
  // File parser
  parser: 'vue-eslint-parser',
  // parser: 'babel-eslint',
  parserOptions: {
    // Use babel-eslint for JavaScript
    parser: 'babel-eslint',
    ecmaVersion: 2017,
    // With import/export syntax
    sourceType: 'module'
  },
  // Environment global objects
  env: {
    browser: true,
    node: true
  },
  extends: [
    // https://github.com/standard/standard/blob/master/RULES.md#javascript-standard-style
    'standard',
    // https://eslint.vuejs.org/rules/
    'plugin:vue/recommended'
  ],
  // globals: {
  //   __static: true
  // },
  // plugins: [
  //   'html'
  // ],
  // 'rules': {
  //   // allow paren-less arrow functions
  //   'arrow-parens': 0,
  //   // allow async-await
  //   'generator-star-spacing': 0,
  //   // allow debugger during development
  //   'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
  // }
}
