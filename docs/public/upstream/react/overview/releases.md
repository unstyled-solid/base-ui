# Releases

Changelogs for each Base UI release.





## Canary releases

A canary release is published for every master commit and pull request. Install one by using the corresponding pkg.pr.new URL:

```bash
# Install by master commit hash
npm i https://pkg.pr.new/@base-ui/react@ad745f1

# Install by PR number
npm i https://pkg.pr.new/@base-ui/react@3713
```

Your `package.json` will then reference the pkg.pr.new URL:

```json
{
  "dependencies": {
    "@base-ui/react": "https://pkg.pr.new/@base-ui/react@..."
  }
}
```

Canary releases may contain breaking changes. Check the associated pull requests on GitHub for details.

## Full release notes

You can see the [full changelog on GitHub](https://github.com/mui/base-ui/blob/master/CHANGELOG.md).

