var e=`{
  "extends": "../../../tsconfig.json",
  "compilerOptions": { "types": ["node", "vite/client", "@vitest/browser-playwright"] },
  "include": ["./**/*.ts", "./**/*.tsx", "../shared/types.ts"],
  "exclude": ["./.cache"]
}
`;export{e as default};