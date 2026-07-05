import SEO, { SITE_URL } from "@/components/SEO";

const Privacy = () => (
  <div className="container py-8 max-w-3xl">
    <SEO title="গোপনীয়তা নীতি" description="বিসমিল্লাহ হোমিও চেম্বারের গোপনীয়তা নীতি। আপনার ব্যক্তিগত তথ্যের সুরক্ষা আমাদের অঙ্গীকার।" canonical={`${SITE_URL}/privacy`} />
    <h1 className="text-2xl font-bold text-foreground">গোপনীয়তা নীতি</h1>
    <div className="mt-6 space-y-4 text-sm text-foreground">
      <p>হোমিওকেয়ার আপনার ব্যক্তিগত তথ্যের গোপনীয়তা রক্ষায় প্রতিশ্রুতিবদ্ধ।</p>
      <h2 className="text-lg font-semibold">তথ্য সংগ্রহ</h2>
      <p>আমরা অর্ডার প্রসেসিং ও ডেলিভারির জন্য আপনার নাম, ফোন নম্বর ও ঠিকানা সংগ্রহ করি।</p>
      <h2 className="text-lg font-semibold">তথ্যের ব্যবহার</h2>
      <p>আপনার তথ্য শুধুমাত্র অর্ডার ডেলিভারি ও কাস্টমার সার্ভিসের জন্য ব্যবহৃত হবে। আমরা কোনো তৃতীয় পক্ষের কাছে আপনার তথ্য বিক্রি করি না।</p>
      <h2 className="text-lg font-semibold">কুকিজ</h2>
      <p>আমাদের ওয়েবসাইট ব্রাউজিং অভিজ্ঞতা উন্নত করতে কুকিজ ব্যবহার করে।</p>
      <h2 className="text-lg font-semibold">যোগাযোগ</h2>
      <p>গোপনীয়তা সংক্রান্ত যেকোনো প্রশ্নের জন্য আমাদের সাথে যোগাযোগ করুন।</p>
    </div>
  </div>
);

export default Privacy;
