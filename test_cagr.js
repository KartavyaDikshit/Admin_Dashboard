
const { extractMarketStats } = require('./src/lib/utils');

const text = "The Patient Registry Software Market was valued at USD 1.5 Billion in 2026 and is projected to reach USD 3.2 Billion by 2035, growing at a compound annual growth rate (CAGR) of approximately 8.5% during the 2026-2035 period. This robust growth";

const stats = extractMarketStats(text);
console.log('Extracted Stats:', stats);

if (stats.cagr === '8.5%') {
    console.log('SUCCESS: CAGR extracted correctly.');
} else {
    console.log('FAILURE: CAGR not extracted correctly. Got:', stats.cagr);
}
