import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import config from '../../../packages/solid/build.config.mjs';
import { portableDeclaration } from '../types/shared.mjs';
import { compile, moduleImports, packageName, toPosix, verifyToolchain } from './compiler.mjs';

export const root = fileURLToPath(new URL('../../../', import.meta.url));
const json = async file => JSON.parse(await fs.readFile(file, 'utf8'));
const exists = async file => fs.stat(file).then(s => s.isFile(), e => { if (e.code === 'ENOENT') return false; throw e; });
export const isProduction = file => /\.(?:tsx?|jsx?)$/.test(file) && !/\.d\.ts$/.test(file) &&
  !/(?:^|\/)(?:__tests__|tests?|specs?|browsers?|testUtils|test-utils|fixtures?|__fixtures__|proof|negative|diagnostics?|scripts?|generation|\.?generated|\.cache|describeGregorianAdapter)(?:\/|$)/i.test(file) &&
  !/\.(?:test|test-utils|spec|browser|ssr\.test|proof|probe|typecheck|types|diagnostics?|generation|template|fixtures?|[\w-]*fixture|emit)\./i.test(file) &&
  !/(?:Fixture|Fixtures)\.[tj]sx?$/.test(file) &&
  !/(?:^|\/)(?:check-consumers|vitest\.config|setupTests|testImage|testUtils|test-utils)\./.test(file);

export async function filesIn(directory) {
  const result = [];
  async function walk(dir) {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) throw new Error(`Symlink is not a build source: ${entry.name}`);
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(file);
      else if (entry.isFile()) result.push(toPosix(path.relative(directory, file)));
    }
  }
  await walk(directory);
  return result.sort();
}

function stem(target) {
  if (!/^\.\/src\/[\w/-]+\.tsx?$/.test(target) || target.includes('..') || target.includes('node_modules')) {
    throw new Error(`Unsafe export target: ${target}`);
  }
  return target.slice(6).replace(/\.tsx?$/, '');
}

export function stagedManifest(source, contract, policy) {
  const exports = {};
  if (Object.keys(contract.exports).length !== 79) throw new Error('Expected exactly 79 contract exports');
  for (const [key, entry] of Object.entries(contract.exports)) {
    if (key !== '.' && !/^\.\/[\w/-]+$/.test(key)) throw new Error(`Unsafe export key: ${key}`);
    const template = entry.kind === 'types-only' ? policy.resolution.typeOnlyTemplate : policy.resolution.runtimeTemplate;
    exports[key] = Object.fromEntries(Object.entries(template).map(([condition, target]) => [condition, target.replace('{stem}', stem(entry.target))]));
  }
  return {
    name: policy.identity.publicationName ?? policy.identity.workspaceName,
    version: policy.identity.version, private: !policy.identity.publicationName,
    ...(policy.identity.publicationName ? { publishConfig: { access: 'public' }, homepage: policy.identity.homepage } : {}),
    type: 'module', description: source.description, license: source.license,
    sideEffects: policy.format.sideEffects.qualified ? policy.format.sideEffects.workspaceValue : true,
    main: exports['.'].default, types: exports['.'].types,
    exports,
    imports: {
      '#formatErrorMessage': {
        worker: './server/utils/formatErrorMessage.js', browser: './dom/utils/formatErrorMessage.js',
        deno: './server/utils/formatErrorMessage.js', node: './server/utils/formatErrorMessage.js', default: './server/utils/formatErrorMessage.js',
      },
      ...Object.fromEntries(Object.entries(policy.imports).filter(([key]) => key.startsWith('#prehydration/')).map(([key, entry]) => [key,
        Object.fromEntries(['worker', 'browser', 'deno', 'node', 'default'].map(condition => [condition, entry[condition]])),
      ])),
    },
    dependencies: source.dependencies,
    peerDependencies: source.peerDependencies,
    peerDependenciesMeta: source.peerDependenciesMeta,
    engines: { node: '>=22.12.0' },
    files: ['dom', 'server', 'types', 'README.md', 'LICENSE', 'NOTICE', 'THIRD-PARTY-NOTICES.md', 'notices', 'CHANGELOG.md', 'docs'],
  };
}

export async function validateArtifacts(output, manifest) {
  const missing = [];
  for (const [key, branches] of Object.entries(manifest.exports)) {
    for (const target of new Set(Object.values(branches))) {
      if (!await exists(path.join(output, target))) missing.push(`${key}: ${target}`);
    }
  }
  for (const [key, branches] of Object.entries(manifest.imports)) {
    for (const target of new Set(Object.values(branches))) {
      if (!await exists(path.join(output, target))) missing.push(`${key}: ${target}`);
    }
  }
  return missing;
}

export async function buildPackage({ repository = root, packageDirectory = path.join(repository, 'packages/solid'),
  output = path.join(packageDirectory, 'build'), stageDocs = Boolean(process.env.BASE_UI_PUBLISH_DOCS),
  validate = true } = {}) {
  verifyToolchain();
  // Never clean build/ itself: declarations can be emitted concurrently.
  if (path.resolve(output) === path.resolve(packageDirectory)) throw new Error('Output cannot be the source package');
  const sourceDirectory = path.join(packageDirectory, 'src');
  const sourceManifest = await json(path.join(packageDirectory, 'package.json'));
  const contract = await json(path.join(repository, 'distribution/exports.json'));
  const policy = await json(path.join(repository, 'distribution/package-contract.json'));
  const manifest = stagedManifest(sourceManifest, contract, policy);
  const sourceFiles = (await filesIn(sourceDirectory)).filter(isProduction);
  const files = new Set(sourceFiles);
  const sourceContents = new Map(await Promise.all(sourceFiles.map(async file => [file, await fs.readFile(path.join(sourceDirectory, file), 'utf8')])));
  const typeOnly = new Set(Object.values(contract.exports).filter(e => e.kind === 'types-only')
    .flatMap(e => [`${stem(e.target)}.ts`, `${stem(e.target)}.tsx`]));
  const external = new Set([...Object.keys(sourceManifest.dependencies ?? {}), ...Object.keys(sourceManifest.peerDependencies ?? {})]);
  const outputs = new Map();
  const problems = [];
  const runtimeFiles = sourceFiles.filter(file => !typeOnly.has(file));
  const modulePaths = new Set();
  for (const file of runtimeFiles) {
    const target = file.replace(/\.[jt]sx?$/, '.js');
    if (modulePaths.has(target)) throw new Error(`Multiple source modules emit ${target}; resolve the source collision before building`);
    modulePaths.add(target);
  }
  const prehydration = Object.fromEntries(Object.entries(manifest.imports).filter(([key]) => key.startsWith('#prehydration/')).map(([key]) => [key,
    `${key.slice('#prehydration/'.length)}/prehydrationScript.ts`,
  ]));
  for (const generate of ['dom', 'ssr']) {
    const directory = generate === 'dom' ? 'dom' : 'server';
    const generated = new Map();
    for (const file of runtimeFiles) {
      const source = sourceContents.get(file);
      const outputFile = file.replace(/\.[jt]sx?$/, '.js');
      const resolveImport = specifier => {
        if (specifier === '#formatErrorMessage' || prehydration[specifier]) {
          const target = specifier === '#formatErrorMessage' ? 'utils/formatErrorMessage.ts' : generate === 'dom'
            ? 'internals/prehydrationScript.stub.ts' : prehydration[specifier];
          if (!files.has(target)) throw new Error(`Missing alias implementation ${specifier}: src/${target}`);
          const relative = toPosix(path.relative(path.dirname(file), target)).replace(/\.tsx?$/, prehydration[specifier] && generate === 'ssr' ? '.min.js' : '.js');
          return relative.startsWith('.') ? relative : `./${relative}`;
        }
        if (!specifier.startsWith('.')) return specifier;
        const base = toPosix(path.normalize(path.join(path.dirname(file), specifier)));
        if (base.startsWith('../') || path.isAbsolute(base)) throw new Error(`Import escapes src/: ${specifier}`);
        const bare = base.replace(/\.(?:[jt]sx?)$/, '');
        const candidates = [base, ...['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx'].map(ext => bare + ext)];
        const target = candidates.find(candidate => files.has(candidate));
        if (!target || typeOnly.has(target)) throw new Error(`Missing runtime source ${specifier} (from ${file})`);
        const relative = toPosix(path.relative(path.dirname(file), target)).replace(/\.[jt]sx?$/, '.js');
        return relative.startsWith('.') ? relative : `./${relative}`;
      };
      try {
        // Resolve only emitted imports: TS removes type-only dependencies first.
        const erased = compile(source, `src/${file}`, generate);
        const replacements = new Map(moduleImports(erased.code, file).map(specifier => [specifier, resolveImport(specifier)]));
        const result = compile(source, `src/${file}`, generate, specifier => replacements.get(specifier) ?? specifier);
        const imports = moduleImports(result.code, file);
        for (const specifier of imports) {
          if (!specifier.startsWith('.') && (specifier.startsWith('#') || !external.has(packageName(specifier)))) {
            throw new Error(`Undeclared/workspace-only runtime import ${specifier}`);
          }
          if (/^(?:react(?:-dom)?(?:\/|$)|@base-ui\/|@floating-ui\/react|solid-js\/web|solid-floating-ui(?:\/|$)|@solidjs\/(?:compiler|babel-plugin))/.test(specifier)) {
            throw new Error(`Forbidden runtime import ${specifier}`);
          }
        }
        result.map.file = path.basename(outputFile);
        result.map.sourceRoot = '';
        result.map.sources = [toPosix(path.relative(path.dirname(outputFile), path.join('__source__', file)))];
        result.map.sourcesContent = [source];
        generated.set(outputFile, `${result.code}\n//# sourceMappingURL=${path.basename(outputFile)}.map\n`);
        generated.set(`${outputFile}.map`, `${JSON.stringify(result.map)}\n`);
      } catch (error) { problems.push(`${directory}/${file}: ${error.message}`); }
    }
    // Conditional imports keep the payload server-only; never ship the bodies in DOM.
    for (const source of Object.values(prehydration)) {
      if (generate === 'dom') {
        generated.delete(source.replace(/\.ts$/, '.js'));
        generated.delete(source.replace(/\.ts$/, '.js.map'));
      } else {
        const file = source.replace(/\.ts$/, '.js');
        if (generated.has(file)) {
          const alias = file.replace(/\.js$/, '.min.js');
          // Payloads are already authored strings. Preserve their module/map;
          // '.min' is contract spelling, not a claim of extra minification.
          generated.set(alias, generated.get(file).replace(`sourceMappingURL=prehydrationScript.js.map`, 'sourceMappingURL=prehydrationScript.min.js.map'));
          const map = JSON.parse(generated.get(`${file}.map`));
          map.file = 'prehydrationScript.min.js';
          generated.set(`${alias}.map`, `${JSON.stringify(map)}\n`);
        }
      }
    }
    for (const [file, content] of generated) {
      if (!file.endsWith('.js')) continue;
      for (const specifier of moduleImports(content, file)) {
        if (specifier.startsWith('.') && !generated.has(toPosix(path.normalize(path.join(path.dirname(file), specifier))))) {
          problems.push(`${directory}/${file}: missing emitted dependency ${specifier}`);
        }
      }
    }
    // All ordinary consumer graphs must be usable without either date adapter.
    const visited = new Set();
    const traverse = file => {
      if (visited.has(file) || !generated.has(file)) return;
      visited.add(file);
      for (const specifier of moduleImports(generated.get(file), file)) {
        if (!specifier.startsWith('.')) {
          if (['date-fns', '@date-fns/tz', 'luxon', '@types/luxon'].includes(packageName(specifier))) {
            problems.push(`${directory}/${file}: optional peer leaked into an ordinary export graph: ${specifier}`);
          }
        } else {
          const dependency = toPosix(path.normalize(path.join(path.dirname(file), specifier)));
          if (/internals\/temporal-adapter-/.test(dependency)) problems.push(`${directory}/${file}: optional adapter leaked into an ordinary export graph`);
          traverse(dependency);
        }
      }
    };
    for (const [key, entry] of Object.entries(contract.exports)) {
      if (entry.kind === 'runtime' && !key.includes('temporal-adapter-')) traverse(`${stem(entry.target)}.js`);
    }
    outputs.set(directory, generated);
  }
  // Emit the current complete production tree even when an integration seam is
  // absent; return failure with exact owner paths, never substitute scaffolds.
  await fs.mkdir(output, { recursive: true });
  for (const [directory, generated] of outputs) {
    await fs.rm(path.join(output, directory), { recursive: true, force: true });
    for (const [file, content] of generated) {
      const target = path.join(output, directory, file);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, content);
    }
  }
  await fs.writeFile(path.join(output, 'package.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  if (policy.identity.publicationName) {
    const directory = path.join(output, 'types');
    const declarations = new Map((await filesIn(directory)).filter(file => file.endsWith('.d.ts')).map(file => [path.join(directory, file), null]));
    for (const file of declarations.keys()) {
      const text = await fs.readFile(file, 'utf8');
      const result = portableDeclaration(file, text, declarations, {
        from: policy.identity.workspaceName, to: policy.identity.publicationName,
      });
      await fs.writeFile(file, result.text);
    }
  }
  for (const name of ['README.md', 'LICENSE', 'NOTICE', 'CHANGELOG.md']) {
    const local = path.join(packageDirectory, name), fallback = path.join(repository, name);
    const source = await exists(local) ? local : await exists(fallback) ? fallback : null;
    if (source) await fs.copyFile(source, path.join(output, name));
    else {
      await fs.rm(path.join(output, name), { force: true });
      if (name !== 'CHANGELOG.md') problems.push(`Missing required ${name}`);
    }
  }
  await fs.rm(path.join(output, 'docs'), { recursive: true, force: true });
  let docs = 0;
  if (stageDocs) {
    const directory = path.join(repository, config.docsDirectory);
    const markdown = (await filesIn(directory)).filter(file => file.endsWith('.md'));
    if (!markdown.length) problems.push(`No Markdown in ${config.docsDirectory}; run the docs generation lane first`);
    for (const file of markdown) {
      const target = path.join(output, 'docs', file);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.copyFile(path.join(directory, file), target);
      docs++;
    }
    const markdownManifest = path.join(directory, 'markdown-manifest.json');
    if (await exists(markdownManifest)) await fs.copyFile(markdownManifest, path.join(output, 'docs/markdown-manifest.json'));
    else problems.push('Missing versioned Markdown manifest; run docs:generate-markdown before packaging docs');
  }
  // The contract defines emitted stems. A TS/TSX source spelling change with
  // the identical stem needs an integration note, not a fabricated stub or a
  // change to any of the exact .js/.d.ts conditional targets.
  const sourceSpellingNotes = [];
  const missingSources = Object.entries(contract.exports).filter(([key, entry]) => {
    const expected = entry.target.slice(6);
    if (files.has(expected)) return false;
    const equivalent = `${stem(entry.target)}${expected.endsWith('.tsx') ? '.ts' : '.tsx'}`;
    if (files.has(equivalent)) {
      sourceSpellingNotes.push(`${key}: contract ${entry.target}, current ./src/${equivalent} (same emitted stem; owner ${entry.owner})`);
      return false;
    }
    return true;
  });
  for (const [key, entry] of missingSources) problems.push(`Missing export source ${key}: ${entry.target} (owner ${entry.owner})`);
  const missing = await validateArtifacts(output, manifest);
  const requiredMissing = validate ? missing : missing.filter(problem => !problem.includes(': ./types/'));
  console.log(`Build: ${runtimeFiles.length} production sources; ${[...outputs.get('dom').keys()].filter(f => f.endsWith('.js')).length} DOM / ${[...outputs.get('server').keys()].filter(f => f.endsWith('.js')).length} server modules; 79 exports (76 runtime, 3 types-only); ${docs} Markdown files; compiler=${config.compiler}@${config.compilerVersion}`);
  for (const note of sourceSpellingNotes) console.log(`Integration source spelling: ${note}`);
  if (problems.length || requiredMissing.length) {
    throw new Error(`Package build incomplete:\n${[...problems, ...requiredMissing.map(p => `Missing artifact ${p}`)].join('\n')}`);
  }
  return { output, manifest, sources: runtimeFiles.length, missing, docs };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.some(arg => !['--runtime-only', '--docs'].includes(arg))) {
    console.error('Usage: node scripts/distribution/build/index.mjs [--runtime-only] [--docs]');
    process.exitCode = 1;
  } else {
    try {
      const result = await buildPackage({ validate: !args.includes('--runtime-only'), stageDocs: args.includes('--docs') || Boolean(process.env.BASE_UI_PUBLISH_DOCS) });
      if (result.missing.length) console.log(`Runtime build only: ${result.missing.length} declaration artifacts remain under bsolid-dist-types; this is not complete staging.`);
      else console.log(`PASS: all contract artifacts exist; ${result.manifest.name}@${result.manifest.version} ready for packing`);
    } catch (error) { console.error(error.message); process.exitCode = 1; }
  }
}
