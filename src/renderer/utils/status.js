export function getStatus(dataValidade) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const validade = new Date(dataValidade + 'T00:00:00');
  const diffDays = Math.ceil((validade - today) / 86_400_000);

  if (diffDays < 0)   return { type: 'expired',        label: `Vencido há ${Math.abs(diffDays)} dia(s)` };
  if (diffDays === 0) return { type: 'expiring-today', label: 'Vence hoje!'                              };
  if (diffDays <= 30) return { type: 'expiring',       label: `Vence em ${diffDays} dia(s)`              };
  return                     { type: 'valid',          label: 'Válido'                                   };
}
