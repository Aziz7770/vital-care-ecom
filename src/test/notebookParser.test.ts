import { describe, expect, it } from "vitest";
import { parseNotebookText } from "@/lib/notebookParser";

describe("parseNotebookText", () => {
  it("accepts Bengali digits and common Bangladesh phone formats", () => {
    const records = parseNotebookText(`রহিম উদ্দিন\nঢাকা\n+৮৮ ০১৭১২-৩৪৫৬৭৮\n\nকরিম\nকুমিল্লা\n১৮ ১২৩ ৪৫৬ ৭৮`);

    expect(records.map((record) => record.phone)).toEqual(["01712345678", "01812345678"]);
  });

  it("parses consecutive customer lines without blank paragraphs", () => {
    const records = parseNotebookText(`আবুল কালাম\nচট্টগ্রাম\n01912345678\nসালমা আক্তার\nবরিশাল\n01612345678`);

    expect(records).toHaveLength(2);
    expect(records[0].customer_name).toContain("আবুল");
    expect(records[1].customer_name).toContain("সালমা");
  });
});