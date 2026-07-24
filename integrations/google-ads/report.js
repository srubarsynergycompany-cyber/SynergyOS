'use strict';

const { search } = require('./googleAdsClient');

const query = `
  SELECT
    campaign.id,
    campaign.name,
    campaign.status,
    campaign_budget.amount_micros,
    campaign.bidding_strategy_type,
    metrics.impressions,
    metrics.clicks,
    metrics.cost_micros,
    metrics.conversions,
    metrics.conversions_value,
    metrics.ctr,
    metrics.average_cpc
  FROM campaign
  WHERE segments.date DURING LAST_30_DAYS
    AND campaign.status != 'REMOVED'
  ORDER BY metrics.cost_micros DESC
`;

(async () => {
  try {
    const rows = await search(query);
    const report = rows.map((row) => ({
      campaignId: row.campaign?.id,
      campaign: row.campaign?.name,
      status: row.campaign?.status,
      biddingStrategy: row.campaign?.biddingStrategyType,
      dailyBudgetCzk: Number(row.campaignBudget?.amountMicros || 0) / 1_000_000,
      impressions: Number(row.metrics?.impressions || 0),
      clicks: Number(row.metrics?.clicks || 0),
      ctrPercent: Number(row.metrics?.ctr || 0) * 100,
      averageCpcCzk: Number(row.metrics?.averageCpc || 0) / 1_000_000,
      costCzk: Number(row.metrics?.costMicros || 0) / 1_000_000,
      conversions: Number(row.metrics?.conversions || 0),
      conversionValue: Number(row.metrics?.conversionsValue || 0),
    }));

    console.table(report);
    console.log(JSON.stringify({ generatedAt: new Date().toISOString(), report }, null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
})();
