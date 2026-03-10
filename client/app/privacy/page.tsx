import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300 py-16 px-4 md:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black text-white mb-8 uppercase tracking-tight border-b border-[#ff6b00] pb-4 inline-block">
          Политика за поверителност
        </h1>

        <div className="space-y-8 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-2 uppercase">1. Събиране на данни</h2>
            <p>
              Ние събираме само данните, необходими за обработка на вашата поръчка: Име, Телефон, Адрес за доставка и Имейл.
              Тези данни се използват единствено за целите на доставката и комуникацията с вас.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-2 uppercase">2. Споделяне на данни</h2>
            <p>
              Вашите лични данни НЕ се продават на трети страни. Единствената трета страна, която получава достъп до тях, 
              е куриерската фирма, за да може да извърши доставката.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-2 uppercase">3. Бисквитки (Cookies)</h2>
            <p>
              Нашият сайт използва "бисквитки" за да запомни вашия вход в системата (Authentication Token) и съдържанието 
              на вашата количка. Без тях сайтът не може да функционира коректно.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-2 uppercase">4. Защита</h2>
            <p>
              Паролите на потребителите се съхраняват в криптиран вид (hashed) и ние нямаме достъп до тях.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}