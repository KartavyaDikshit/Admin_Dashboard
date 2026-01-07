
const text = "The Patient Registry Software Market was valued at USD 1.5 Billion in 2026 and is projected to reach USD 3.2 Billion by 2035, growing at a compound annual growth rate (CAGR) of approximately 8.5% during the 2026-2035 period. This robust growth";

function extract(text) {
  const cleanText = text.replace(/<[^>]*>?/gm, ' ');
  const cagrMatch = cleanText.match(/(?:CAGR of|CAGR:|CAGR|\(CAGR\) of)\s*(?:approximately|approx\.|around|about)?\s*([\d\.,]+)\s*%/i) || 
                    cleanText.match(/([\d\.,]+)\s*%\s*(?:CAGR|\(CAGR\))/i);
  return cagrMatch ? `${cagrMatch[1]}%` : null;
}

const cagr = extract(text);
console.log('CAGR:', cagr);
