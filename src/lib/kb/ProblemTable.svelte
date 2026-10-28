<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { problemsIn, type Problem } from '#lib/kb/problems';

  // `issues` maps a problem to the ticket that tracks it, e.g. { parser: 'https://…/issues/1' }.
  let { ticket, issues = {} }: { ticket: number; issues?: Partial<Record<Problem, string>> } = $props();

  const result = $derived(problemsIn(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const moved = $derived(result.rows.find((r) => r.problem === 'one-day-move')?.reports.length ?? 0);
</script>

<p class="sum">
  <strong>{result.merged}</strong> reports in #{ticket} ·
  <strong>{result.rows.length}</strong> problems
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each result.rows as r (r.problem)}
      <tr>
        <td><code>{r.problem}</code></td>
        <td>{r.reports.length}</td>
        <td>{r.tenants}</td>
        <td>{r.firstSeen} → {r.lastSeen}</td>
        <td>{#if issues[r.problem]}<a href={issues[r.problem]}>{issues[r.problem]?.replace(/^.*\/issues\//, 'issue #')}</a>{:else}<span class="none">none yet</span>{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

{#if moved}
  <p class="note">The {moved} <code>one-day-move</code> reports are also counted under the cause they are filed under, as the desk counts them.</p>
{/if}

<style>
  .sum { font-size: 1.1rem; }
  .note { color: var(--muted); font-size: 0.85em; }
  .none { color: var(--warn); font-weight: 600; }
</style>
