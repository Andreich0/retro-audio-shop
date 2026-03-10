import React from 'react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300 py-16 px-4 md:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black text-white mb-8 uppercase tracking-tight border-b border-[#ff6b00] pb-4 inline-block">
          Общи условия
        </h1>

        <div className="space-y-8 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-2 uppercase">1. Обща информация</h2>
            <p>
              Добре дошли в Retro Audio Shop. Тези общи условия уреждат взаимоотношенията между Продавача и Потребителите, 
              които използват нашия онлайн магазин за покупка на ретро аудио техника.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-2 uppercase">2. Поръчки и Доставка</h2>
            <p>
              Всички поръчки се обработват в рамките на 24-48 часа. Доставката се извършва чрез куриерска фирма Еконт/Спиди 
              с опция "Преглед и тест". Всички продукти са внимателно опаковани, за да се гарантира тяхната цялост.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-2 uppercase">3. Гаранция и Връщане</h2>
            <p>
              Нашите реставрирани продукти (декове и уокмени) идват с <strong>6 месеца гаранция</strong>. 
              Тя покрива технически неизправности, възникнали при нормална употреба. 
              Гаранцията не покрива механични повреди, причинени от изпускане или неправилна експлоатация.
            </p>
            <p className="mt-2">
              Съгласно закона, имате право да върнете стоката в 14-дневен срок, ако тя е в същия търговски вид.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-2 uppercase">4. Състояние на продуктите</h2>
            <p>
              Тъй като предлагаме винтидж техника, продуктите са класифицирани по състояния. 
              Моля, четете внимателно описанието и разглеждайте снимките преди покупка.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}