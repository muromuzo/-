export type InputPair = { name: string; value?: number; revenue?: number };

export function normalizeReportPayload(payload: any) {
  const grossRevenue = Number(payload.grossRevenue) || 0;
  const revenueDeduction = Number(payload.revenueDeduction) || 0;
  const baselineRevenue = Number(payload.baselineRevenue) || 0;
  const feeRate = Number(payload.feeRate) || 0;
  const adjustedRevenue = grossRevenue - revenueDeduction;
  const increaseAmount = adjustedRevenue - baselineRevenue;
  const growthRate = baselineRevenue > 0 ? (increaseAmount / baselineRevenue) * 100 : 0;
  const supplyIncrease = increaseAmount > 0 ? increaseAmount / 1.1 : 0;
  const feeAmount = Math.round(supplyIncrease * (feeRate / 100));

  const marketingItems = Array.isArray(payload.marketingItems)
    ? payload.marketingItems
        .map((item: InputPair) => ({ name: String(item.name || '').trim(), value: Number(item.value) || 0 }))
        .filter((item: { name: string; value: number }) => item.name)
    : [];

  const savingsItems = Array.isArray(payload.savingsItems)
    ? payload.savingsItems
        .map((item: InputPair) => ({ name: String(item.name || '').trim(), value: Number(item.value) || 0 }))
        .filter((item: { name: string; value: number }) => item.name)
    : [];

  const channels = Array.isArray(payload.channels)
    ? payload.channels
        .map((item: InputPair) => ({ name: String(item.name || '').trim(), revenue: Number(item.value ?? item.revenue) || 0 }))
        .filter((item: { name: string; revenue: number }) => item.name)
    : [];

  return {
    brandName: String(payload.brandName || '').trim(),
    monthLabel: String(payload.monthLabel || '').trim(),
    grossRevenue,
    revenueDeduction,
    adjustedRevenue,
    baselineRevenue,
    increaseAmount,
    growthRate,
    feeRate,
    supplyIncrease: Math.round(supplyIncrease),
    feeAmount,
    managerNote: String(payload.managerNote || ''),
    otherNote: String(payload.otherNote || ''),
    statusMemo: String(payload.statusMemo || ''),
    marketingItems,
    savingsItems,
    channels
  };
}
