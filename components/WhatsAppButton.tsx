"use client";

import { usePathname } from "next/navigation";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

export default function WhatsAppButton() {
  const pathname = usePathname();
  if (!WHATSAPP_NUMBER || pathname?.startsWith("/admin")) return null;

  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="שלחו לנו הודעה בוואטסאפ"
      className="fixed bottom-5 left-5 z-50 h-14 w-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.18)] hover:brightness-105 transition-all"
    >
      <svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor" aria-hidden="true">
        <path d="M16.004 3C9.373 3 4 8.373 4 15.004a11.94 11.94 0 0 0 1.63 6.02L4 29l8.15-1.6a12 12 0 0 0 3.854.63h.004c6.63 0 12.004-5.373 12.004-12.004C28.012 8.373 22.638 3 16.004 3Zm0 21.8a9.75 9.75 0 0 1-4.973-1.364l-.357-.212-4.837.95.966-4.716-.233-.373A9.77 9.77 0 0 1 5.2 15.004C5.2 9.036 10.036 4.2 16.004 4.2c5.968 0 10.808 4.836 10.808 10.804 0 5.968-4.84 10.796-10.808 10.796Zm5.94-8.096c-.326-.163-1.928-.951-2.227-1.06-.298-.109-.516-.163-.733.163-.217.326-.842 1.06-1.033 1.278-.19.217-.38.244-.706.082-.326-.163-1.376-.507-2.62-1.616-.968-.863-1.622-1.93-1.812-2.256-.19-.326-.02-.502.143-.664.146-.146.326-.38.489-.57.163-.19.217-.326.326-.543.109-.217.054-.407-.027-.57-.082-.163-.733-1.766-1.004-2.418-.264-.635-.532-.549-.733-.56-.19-.009-.407-.011-.625-.011-.217 0-.57.082-.868.407-.298.326-1.137 1.111-1.137 2.71 0 1.6 1.164 3.144 1.326 3.36.163.217 2.29 3.497 5.55 4.905.776.335 1.38.535 1.852.685.778.248 1.486.213 2.046.129.624-.093 1.928-.788 2.2-1.549.271-.76.271-1.412.19-1.549-.081-.136-.298-.217-.624-.38Z" />
      </svg>
    </a>
  );
}
