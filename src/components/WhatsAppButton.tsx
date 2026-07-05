import whatsappLogo from "@/assets/whatsapp-logo.png";
import { trackContact } from "@/lib/tracking";

const WhatsAppButton = () => {
  const phoneNumber = "8801767678562";
  const message = encodeURIComponent("আসসালামু আলাইকুম, আমি আপনাদের ওয়েবসাইট থেকে জানতে চাই...");

  return (
    <a
      onClick={() => trackContact()}
      href={`https://wa.me/${phoneNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 transition-transform hover:scale-110"
      aria-label="WhatsApp এ যোগাযোগ করুন"
    >
      <img src={whatsappLogo} alt="WhatsApp" className="h-16 w-16 drop-shadow-lg rounded-full" />
    </a>
  );
};

export default WhatsAppButton;
