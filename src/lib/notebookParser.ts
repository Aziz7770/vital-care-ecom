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
const PHONE_CANDIDATE_RE = /(?:\+?88[\s.-]*)?0?1[3-9](?:[\s().-]*\d){8}/g;

const normalizePhone = (value: string) => {
  let digits = toAsciiDigits(value).replace(/\D/g, "");
  if (digits.startsWith("880")) digits = digits.slice(2);
  else if (digits.length === 13 && digits.startsWith("88")) digits = digits.slice(2);
  else if (digits.length === 10 && digits.startsWith("1")) digits = `0${digits}`;
  return /^01[3-9]\d{8}$/.test(digits) ? digits : "";
};

const extractPhones = (value: string) =>
  Array.from(value.matchAll(PHONE_CANDIDATE_RE), (match) => normalizePhone(match[0])).filter(Boolean);

const stripName = (line: string) =>
  line
    .replace(PHONE_CANDIDATE_RE, " ")
    .replace(/^নাম\s*[-ঃ:,]*\s*/, "")
    .trim()
    .replace(/^[-:।,\s]+|[-:।,\s]+$/g, "");

/**
 * Parses free-form Bangla notebook text (one customer per block) into records.
 * A block ends at the line containing a phone number.
 */
export function parseNotebookText(raw: string): ParsedRecord[] {
  const text = toAsciiDigits(raw)
    .replace(/\r/g, "")
    .replace(PHONE_CANDIDATE_RE, (phone) => {
      const normalized = normalizePhone(phone);
      return normalized || phone;
    });
  const paras = text
    .split(/\n+/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const blocks: string[][] = [];
  let cur: string[] = [];
  for (const p of paras) {
    cur.push(p);
    if (extractPhones(p).length) {
      blocks.push(cur);
      cur = [];
    }
  }
  if (cur.length) {
    if (blocks.length) blocks[blocks.length - 1].push(...cur);
    else if (extractPhones(cur.join(" ")).length) blocks.push(cur);
  }

  const out: ParsedRecord[] = [];
  for (const block of blocks) {
    const joined = block.join(" ");
    const phones = extractPhones(joined);
    if (!phones.length) continue;
    const clean = joined.replace(PHONE_CANDIDATE_RE, " ").replace(/\s+/g, " ").trim();

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
