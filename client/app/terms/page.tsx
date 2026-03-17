import React from "react";
import { ShieldAlert } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300 py-12 md:py-20 px-4 md:px-8 font-sans selection:bg-[#ff6b00] selection:text-black">
      <div className="max-w-4xl mx-auto bg-[#18181b] border border-[#333] p-6 md:p-12 rounded-2xl shadow-2xl">
        <div className="flex items-center gap-4 mb-8 border-b border-[#333] pb-6">
          <ShieldAlert size={36} className="text-[#ff6b00]" />
          <h1 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter text-white">
            Общи <span className="text-[#ff6b00]">Условия</span>
          </h1>
        </div>

        <div className="space-y-8 text-sm md:text-base leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-widest border-l-4 border-[#ff6b00] pl-3">1. Общи положения</h2>
            <p>
              Настоящите общи условия регламентират отношенията между "Retro Audio Shop" и лицата, ползващи сайта и онлайн магазина. 
              С натискането на бутона "Поръчай", потребителят се съгласява изцяло с тези условия.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-widest border-l-4 border-[#ff6b00] pl-3">2. Цени и характеристики</h2>
            <p>
              Всички цени в сайта са в Евро (€) и са крайни. "Retro Audio Shop" запазва правото си да променя цените без предварително уведомление.
              Предлаганата техника е втора употреба (ретро/винтидж), преминала техническа профилактика, освен ако не е посочено друго.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-widest border-l-4 border-[#ff6b00] pl-3">3. Поръчка и Доставка</h2>
            <p>
              Доставката се извършва чрез куриерски фирми (Еконт/Спиди) в рамките на 1-3 работни дни. Всяка пратка се изпраща с опция "Преглед и тест". 
              Ако клиентът откаже пратката след преглед, куриерските услуги са за негова сметка.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-widest border-l-4 border-[#ff6b00] pl-3">4. Връщане на стока и Гаранция</h2>
            <p>
              Според ЗЗП, потребителят има право да върне закупената стока в 14-дневен срок, при условие че тя е в същия вид, в който е получена, без следи от интервенции.
              Предоставяме 6 месеца гаранция на сервизираната от нас електроника (валидна само при липса на външна намеса).
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}