import React from "react";
import { Lock } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300 py-12 md:py-20 px-4 md:px-8 font-sans selection:bg-[#ff6b00] selection:text-black">
      <div className="max-w-4xl mx-auto bg-[#18181b] border border-[#333] p-6 md:p-12 rounded-2xl shadow-2xl">
        <div className="flex items-center gap-4 mb-8 border-b border-[#333] pb-6">
          <Lock size={36} className="text-[#ff6b00]" />
          <h1 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter text-white">
            Политика за <span className="text-[#ff6b00]">Поверителност</span>
          </h1>
        </div>

        <div className="space-y-8 text-sm md:text-base leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-widest border-l-4 border-[#ff6b00] pl-3">1. Събиране на данни</h2>
            <p>
              За да обработим вашата поръчка, ние събираме следните лични данни: Име, Фамилия, Телефон, Имейл и Адрес за доставка. 
              Тези данни се използват единствено за целите на изпълнение на поръчката и комуникация с вас.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-widest border-l-4 border-[#ff6b00] pl-3">2. Споделяне с трети страни</h2>
            <p>
              Вашите данни за доставка се споделят строго поверително с куриерските фирми (Еконт) за физическото доставяне на стоката. 
              При плащане с карта, финансовите ви данни се обработват директно от Stripe (който е в режим на тестване и няма да ви изтегли парите), ние нямаме достъп до номера на вашата карта.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-widest border-l-4 border-[#ff6b00] pl-3">3. Вашите права</h2>
            <p>
              Вие имате право по всяко време да изискате копие от данните, които съхраняваме за вас, както и да поискате тяхното пълно изтриване ("Правото да бъдеш забравен"). 
              За целта, моля свържете се с нас през страницата "Контакти".
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}