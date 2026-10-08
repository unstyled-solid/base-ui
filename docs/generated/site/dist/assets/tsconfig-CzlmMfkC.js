var e=`{
  "extends": "../../../tsconfig.json",
  "compilerOptions": { "types": ["node", "vite/client", "@vitest/browser-playwright"] },
  "include": ["./**/*.ts", "./**/*.tsx", "../shared/types.ts"],
  "exclude": ["./demos.test.tsx", "./vitest*.ts"]
}
`;export{e as default};