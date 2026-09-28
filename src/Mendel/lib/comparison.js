export function compareError(value, baseline) {
  if (!Number.isFinite(value) || !Number.isFinite(baseline) || value < 0 || baseline < 0) return 'confronto non disponibile';
  if (Math.abs(value - baseline) < 1e-12) return 'lo stesso scarto';
  if (baseline === 0) return 'uno scarto maggiore (il riferimento ha scarto zero)';
  const percent = (100 * Math.abs(value - baseline) / baseline).toLocaleString('it-IT', { maximumFractionDigits: 1 });
  return 'uno scarto ' + (value < baseline ? 'minore' : 'maggiore') + ' del ' + percent + '%';
}
export function bestModels(contest) {
  const min = Math.min(...contest.map(c => c.m.scarto));
  return contest.filter(c => Math.abs(c.m.scarto - min) < 1e-12).map(c => c.label).join(', ');
}
