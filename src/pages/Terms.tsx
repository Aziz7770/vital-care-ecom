import SEO, { SITE_URL } from "@/components/SEO";

const Terms = () => (
  <div className="container py-8 max-w-3xl">
    <SEO title="শর্তাবলী" description="বিসমিল্লাহ হোমিও চেম্বারের শর্তাবলী। অর্ডার, পেমেন্ট, ডেলিভারি সংক্রান্ত সকল নিয়ম।" canonical={`${SITE_URL}/terms`} />
    <h1 className="text-2xl font-bold text-foreground">শর্তাবলী</h1>
    <div className="mt-6 space-y-4 text-sm text-foreground">
      <h2 className="text-lg font-semibold">সাধারণ শর্তাবলী</h2>
      <p>হোমিওকেয়ার ওয়েবসাইট ব্যবহার করে আপনি নিম্নলিখিত শর্তাবলী মেনে চলতে সম্মত হচ্ছেন।</p>
      <h2 className="text-lg font-semibold">অর্ডার ও পেমেন্ট</h2>
      <p>সকল অর্ডার ক্যাশ অন ডেলিভারি পদ্ধতিতে গৃহীত হয়। অর্ডার কনফার্ম হওয়ার পর আমরা আপনার সাথে ফোনে যোগাযোগ করব।</p>
      <h2 className="text-lg font-semibold">ডেলিভারি</h2>
      <p>ঢাকার ভিতরে ১-৩ দিন এবং ঢাকার বাইরে ৩-৫ দিনের মধ্যে ডেলিভারি সম্পন্ন হয়।</p>
      <h2 className="text-lg font-semibold">দায়বদ্ধতা</h2>
      <p>হোমিওপ্যাথিক ঔষধ ব্যবহারের আগে বিশেষজ্ঞ ডাক্তারের পরামর্শ নেওয়া বাঞ্ছনীয়।</p>
    </div>
  </div>
);

export default Terms;
