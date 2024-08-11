/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', 'prettier'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'prettier/prettier': [
      'warn',
      {
        arrowParens: 'always', // 항상 괄호 사용
        bracketSpacing: true, // 중괄호 안의 공백 유지
        endOfLine: 'lf', // LF (줄 바꿈) 사용
        bracketSameLine: false, // JSX의 마지막 꺽쇠를 다음 줄로
        jsxSingleQuote: false, // JSX에서 더블 쿼트 사용
        printWidth: 80, // 80자 라인 길이 제한
        quoteProps: 'as-needed', // 필요한 경우만 속성에 따옴표 사용
        semi: false, // 세미콜론 사용하지 않음
        singleQuote: true, // 싱글 쿼트 사용
        tabWidth: 2, // 탭 너비 2칸
        trailingComma: 'es5', // ES5의 후행 쉼표 사용
        useTabs: false, // 스페이스 사용 (탭 대신)
      },
    ],
  },
}
