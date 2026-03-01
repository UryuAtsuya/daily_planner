import { exec as execCb } from 'node:child_process';
import { promisify } from 'node:util';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const exec = promisify(execCb);
const ROOT = process.cwd();
const REPORT_PATH = path.join(ROOT, 'docs', 'multi-agents-report.md');

async function runCommand(command) {
  try {
    const { stdout, stderr } = await exec(command, { cwd: ROOT, maxBuffer: 1024 * 1024 * 10 });
    return {
      ok: true,
      command,
      stdout: stdout.trim(),
      stderr: stderr.trim(),
    };
  } catch (error) {
    return {
      ok: false,
      command,
      stdout: error.stdout?.trim() || '',
      stderr: error.stderr?.trim() || error.message,
      code: error.code,
    };
  }
}

function formatCommandResult(result) {
  const status = result.ok ? 'PASS' : 'FAIL';
  const body = result.stdout || result.stderr || '(no output)';
  return `- ${status} \`${result.command}\`\n\n\`\`\`txt\n${body}\n\`\`\``;
}

async function environmentAgent() {
  const checks = await Promise.all([
    runCommand('node -v'),
    runCommand('npm -v'),
    runCommand('npm run lint'),
    runCommand('git status --short'),
  ]);

  const lint = checks.find((c) => c.command === 'npm run lint');
  const lintSummary = lint?.ok ? 'lint is passing.' : 'lint has issues and needs cleanup.';

  return {
    agent: 'Environment Agent',
    summary: `Runtime and project health checks completed; ${lintSummary}`,
    details: checks.map(formatCommandResult).join('\n\n'),
  };
}

async function implementationAgent() {
  const packageJsonRaw = await fs.readFile(path.join(ROOT, 'package.json'), 'utf8');
  const packageJson = JSON.parse(packageJsonRaw);
  const scripts = Object.keys(packageJson.scripts || {});

  const featuresDir = path.join(ROOT, 'src', 'features');
  const featureEntries = await fs.readdir(featuresDir, { withFileTypes: true });
  const features = featureEntries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();

  const missingScripts = ['test', 'typecheck'].filter((name) => !scripts.includes(name));
  const implementationTasks = [
    missingScripts.length
      ? `Add npm scripts: ${missingScripts.join(', ')} for safer CI checks.`
      : 'Core validation scripts are available.',
    'Add a lightweight CI workflow (lint + typecheck + build) to prevent regressions.',
    'Split API integrations (calendar/rss/llm) behind adapters to simplify mocking and testing.',
  ];

  return {
    agent: 'Implementation Agent',
    summary: `Found ${features.length} feature modules and identified practical implementation tasks.`,
    details: [
      `- Detected feature modules: ${features.join(', ')}`,
      `- Existing npm scripts: ${scripts.join(', ')}`,
      ...implementationTasks.map((task) => `- ${task}`),
    ].join('\n'),
  };
}

async function ideaAgent() {
  const docsDir = path.join(ROOT, 'docs');
  const docs = (await fs.readdir(docsDir)).filter((file) => file.endsWith('.md')).sort();

  const ideas = [
    'Smart day planning: suggest task priorities based on calendar load and Pomodoro history.',
    'Zen Feed to action: convert digest items into actionable tasks with one click.',
    'Monetization dashboard: show ad + affiliate metrics beside daily active users.',
    'Focus scoring: daily score from completed tasks, focus sessions, and interruption count.',
    'Weekly review generator: auto-create a reflection summary from completed tasks and logs.',
  ];

  return {
    agent: 'Idea Agent',
    summary: `Generated product ideas aligned with existing docs and feature set (${docs.length} docs reviewed).`,
    details: [
      `- Reviewed docs: ${docs.join(', ')}`,
      ...ideas.map((idea, index) => `${index + 1}. ${idea}`),
    ].join('\n'),
  };
}

function buildReport(results) {
  const now = new Date().toISOString();
  const sections = results
    .map(
      (result) => `## ${result.agent}\n\n${result.summary}\n\n${result.details}`,
    )
    .join('\n\n');

  return `# Multi-Agents Report\n\nGenerated at: ${now}\n\n${sections}\n`;
}

async function main() {
  const results = await Promise.all([
    environmentAgent(),
    implementationAgent(),
    ideaAgent(),
  ]);

  const report = buildReport(results);
  await fs.mkdir(path.dirname(REPORT_PATH), { recursive: true });
  await fs.writeFile(REPORT_PATH, report, 'utf8');

  console.log(report);
  console.log(`Saved report: ${REPORT_PATH}`);
}

main().catch((error) => {
  console.error('Multi-agents execution failed.');
  console.error(error);
  process.exitCode = 1;
});
