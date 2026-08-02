export interface ParsedRecord {
  customer_name: string;
  phone: string;
  address: string;
  items_text: string;
  total: number;
  note: string;
}

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

export const toAsciiDigits = (s: string) =>
  s.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));

const STOP = /^\s*(জেলা|থানা|ঠিকানা|গ্রাম|মূল্য|উপজেলা|ইউনিয়ন|বাসা|ঢাকা|মোবাইল|পোস্ট)/;
const PRICE_START = /^(মূল্য|টাকা|\d|দুইটা|তিনটা|একটা|এন্ট্রি|দুটি)/;
const PHONE_RE = /01\d{9}/g;

const stripName = (line: string) =>
  line
    .replace(PHONE_RE, " ")
    .replace(/^নাম\s*[-ঃ:,]*\s*/, "")
    .trim()
    .replace(/^[-:।,\s]+|[-:।,\s]+$/g, "");

/**
 * Parses free-form Bangla notebook text (one customer per block) into records.
 * A block ends at the line containing a phone number.
 */
export function parseNotebookText(raw: string): ParsedRecord[] {
  const text = toAsciiDigits(raw).replace(/\r/g, "");
  const paras = text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const blocks: string[][] = [];
  let cur: string[] = [];
  for (const p of paras) {
    cur.push(p);
    if (/01\d{9}/.test(p)) {
      blocks.push(cur);
      cur = [];
    }
  }
  if (cur.length && blocks.length) blocks[blocks.length - 1].push(...cur);

  const out: ParsedRecord[] = [];
  for (const block of blocks) {
    const joined = block.join(" ");
    const phones = joined.match(PHONE_RE) || [];
    if (!phones.length) continue;
    const clean = joined.replace(PHONE_RE, " ").replace(/\s+/g, " ").trim();

    let name = "";
    for (const line of block) {
      let c = stripName(line);
      if (!c || PRICE_START.test(c) || STOP.test(" " + c)) continue;
      c = c.split(STOP)[0].replace(/^[-:।,\s]+|[-:।,\s]+$/g, "");
      if (c) {
        name = c.split(/\s+/).slice(0, 4).join(" ");
        break;
      }
    }

    const nums = (clean.match(/(?<!\d)\d{3,5}(?!\d)/g) || [])
      .map(Number)
      .filter((n) => n >= 100 && n <= 20000);
    const total = nums.length ? Math.max(...nums) : 0;
    const address = clean.slice(0, 300);

    for (const phone of phones) {
      out.push({
        customer_name: name || "Unknown",
        phone,
        address,
        items_text: address,
        total,
        note: "notebook",
      });
    }
  }
  return out;
}
