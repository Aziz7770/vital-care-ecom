import SEO, { SITE_URL } from "@/components/SEO";

const ReturnPolicy = () => (
  <div className="container py-8 max-w-3xl">
    <SEO title="রিটার্ন পলিসি" description="পণ্য হাতে পাওয়ার ৭ দিনের মধ্যে রিটার্ন করতে পারবেন। রিটার্নের শর্ত ও রিফান্ড নীতি জানুন।" canonical={`${SITE_URL}/return-policy`} />
    <h1 className="text-2xl font-bold text-foreground">রিটার্ন পলিসি</h1>
    <div className="mt-6 space-y-4 text-sm text-foreground">
      <h2 className="text-lg font-semibold">রিটার্ন নীতি</h2>
      <p>পণ্য হাতে পাওয়ার ৭ দিনের মধ্যে রিটার্নের জন্য আবেদন করতে পারবেন।</p>
      <h2 className="text-lg font-semibold">রিটার্নের শর্ত</h2>
      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
        <li>পণ্য অক্ষত ও সিলড অবস্থায় থাকতে হবে</li>
        <li>ভুল পণ্য ডেলিভারি হলে সম্পূর্ণ রিফান্ড পাবেন</li>
        <li>পণ্যের মেয়াদ শেষ হলে বিনামূল্যে পরিবর্তন করা হবে</li>
        <li>খোলা বা ব্যবহৃত পণ্য রিটার্নযোগ্য নয়</li>
      </ul>
      <h2 className="text-lg font-semibold">রিফান্ড</h2>
      <p>রিটার্ন অনুমোদিত হলে ৫-৭ কর্মদিবসের মধ্যে রিফান্ড প্রদান করা হবে।</p>
    </div>
  </div>
);

export default ReturnPolicy;
