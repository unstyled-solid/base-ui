import { git } from './process.mjs';
import { fail } from './state.mjs';

export function changeReport(checkout, source, state, fromSha, toSha) {
  const fields = git(checkout, ['diff', '--raw', '-z', '--no-abbrev', '--no-ext-diff', '--no-textconv',
    '--find-renames=50%', fromSha, toSha, '--']).stdout.split('\0');
  const changes = [];
  for (let i = 0; i < fields.length && fields[i];) {
    const header = fields[i++].match(/^:(\d+) (\d+) ([a-f0-9]{40}) ([a-f0-9]{40}) ([A-Z])(\d*)$/);
    if (!header) fail('DIFF_FORMAT', 'Unexpected raw Git diff format; refusing an incomplete change report.');
    const [, oldMode, newMode, oldBlob, newBlob, status, score] = header;
    const oldPath = fields[i++];
    const newPath = status === 'R' || status === 'C' ? fields[i++] : oldPath;
    changes.push({ status, ...(score ? { similarity: Number(score) } : {}),
      oldPath: status === 'A' ? null : oldPath, newPath: status === 'D' ? null : newPath,
      oldMode, newMode, oldBlob, newBlob, disposition: 'untriaged' });
  }
  const commits = git(checkout, ['rev-list', '--reverse', `${fromSha}..${toSha}`]).stdout.trim().split('\n').filter(Boolean);
  return { schemaVersion: 1, source, repositoryUrl: state.repositoryUrl, branch: state.branch,
    fromSha, toSha, commits, changes, kind: 'raw-source-diff',
    qualification: 'unverified', impactStatus: 'pending-bsolid-upstream-impact' };
}
