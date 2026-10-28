// The problems inside one merged ticket. causes.ts places a report by its tenant, and the desk counts
// it there. A report the desk read as a one-day move (desk-notes.json) is not a day/month flip at all,
// so it also gets its own row, while it stays counted where it is filed.
import { groupByCause, uniqueById, type Cause, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = Cause | 'one-day-move' | 'unplaced';

export type ProblemRow = {
  problem: Problem;
  reports: Report[];
  tenants: number;
  firstSeen: string;
  lastSeen: string;
};

export function problemsIn(
  all: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { merged: number; rows: ProblemRow[] } {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const moved = merged.filter((r) => oneDayMove.includes(r.id));

  const row = (problem: Problem, rs: Report[]): ProblemRow => {
    const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
    return { problem, reports: rs, tenants: new Set(rs.map((r) => r.tenant)).size, firstSeen: days[0], lastSeen: days[days.length - 1] };
  };

  const rows = [
    ...groupByCause(merged, tenantOf).map((g) => row(g.cause, g.reports)),
    ...(moved.length ? [row('one-day-move', moved)] : []),
  ].sort((a, b) => b.reports.length - a.reports.length);

  return { merged: merged.length, rows };
}
