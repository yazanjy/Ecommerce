// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      // 1. إيقاف تحذيرات التنسيق والمسافات المزعجة من Prettier تماماً واجعلها صامتة
      "prettier/prettier": "off",

      // 2. إيقاف تحذيرات الـ Async/Await التي تظهر عندما لا نكتب await
      '@typescript-eslint/require-await': 'off',

      // 3. إيقاف تحذيرات العمليات غير الآمنة (التي واجهتك في البداية)
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',

      // 4. إعدادات عامة لتسهيل العمل في المتجر
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unused-vars': 'warn', // يعطيك تنبيه أصفر خفيف فقط لو عرفت متغير ولم تستخدمه
    },
  },
);