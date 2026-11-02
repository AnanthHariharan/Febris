// An edited observation invalidates all questions selected after it.
export function editEvidence(evidence, index, choice) {
  if (!Number.isInteger(index) || index < 0 || index >= evidence.length || !['present','absent','unknown','remove'].includes(choice)) throw new Error('Invalid evidence edit');
  const edited = evidence[index];
  const retained = edited.source === 'initial' ? evidence.filter(item => item.source === 'initial') : evidence.slice(0, index + 1);
  const next = retained.filter(item => choice !== 'remove' || item !== edited).map(item => item === edited ? {...item, choice_id: choice} : item);
  return { evidence: next, count: next.filter(item => item.source !== 'initial').length };
}
