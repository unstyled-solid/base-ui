var e=`{
  "extends": "../../../tsconfig.json",
  "compilerOptions": { "types": ["node", "vite/client", "@vitest/browser-playwright"] },
  "include": ["./entry.ts", "./hero/css-modules/index.tsx", "./hero/tailwind/index.tsx", "../shared/types.ts"],
  "exclude": ["./.cache", "./**/*.test.tsx"]
}
`;export{e as default};