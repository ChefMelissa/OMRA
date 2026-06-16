# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: citizen.spec.ts >> Citizen Flow E2E Tests >> should search, compare, and book a program successfully
- Location: tests\e2e\citizen.spec.ts:4:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('div:has-text("مقارنة برامج العمرة")')
Expected: visible
Error: strict mode violation: locator('div:has-text("مقارنة برامج العمرة")') resolved to 7 elements:
    1) <div class="flex flex-col min-h-screen">…</div> aka getByText('منصة عمرةتصفح البرامجمقارنة العروضدخول الوكالاتالمنصة الأولى لمقارنة وحجز عروض ا')
    2) <div class="space-y-12 animate-fade-in">…</div> aka getByRole('main').locator('div').filter({ hasText: 'المنصة الأولى لمقارنة وحجز عروض العمرة بالجزائرتيسير بحثك عن برنامج العمرة المنا' })
    3) <div class="space-y-8">…</div> aka locator('div').filter({ hasText: 'ولاية الانطلاقكل الولاياتالجزائرباتنةوهرانقسنطينة🌙موعد انطلاق رحلة العمرة المبا' }).nth(2)
    4) <div class="fixed bottom-6 inset-x-6 z-40 bg-card border border-primary/20 shadow-2xl p-5 rounded-2xl max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">…</div> aka locator('div').filter({ hasText: 'مقارنة برامج العمرة (1' }).nth(3)
    5) <div class="space-y-1 text-center sm:text-right">…</div> aka locator('div').filter({ hasText: 'مقارنة برامج العمرة (1' }).nth(4)
    6) <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-right">…</div> aka locator('div').filter({ hasText: 'منصة عمرةالمنصة الأولى المخصصة للجزائريين لتصفح، مقارنة، وفلترة برامج عروض العمر' }).nth(1)
    7) <div class="space-y-3">…</div> aka getByText('روابط سريعةالرئيسية وتصفح العروضمقارنة برامج العمرةتسجيل دخول وكالةتسجيل وكالة ج')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('div:has-text("مقارنة برامج العمرة")')

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e4]:
        - link "منصة عمرة" [ref=e5] [cursor=pointer]:
          - /url: /
          - img [ref=e6]
          - generic [ref=e8]: منصة عمرة
        - navigation [ref=e9]:
          - link "تصفح البرامج" [ref=e10] [cursor=pointer]:
            - /url: /
          - link "مقارنة العروض" [ref=e11] [cursor=pointer]:
            - /url: /compare
        - link "دخول الوكالات" [ref=e13] [cursor=pointer]:
          - /url: /login
          - button "دخول الوكالات" [ref=e14]:
            - img [ref=e15]
            - generic [ref=e18]: دخول الوكالات
    - main [ref=e19]:
      - generic [ref=e20]:
        - generic [ref=e21]:
          - generic [ref=e22]:
            - img [ref=e23]
            - generic [ref=e26]: المنصة الأولى لمقارنة وحجز عروض العمرة بالجزائر
          - heading "تيسير بحثك عن برنامج العمرة المناسب" [level=1] [ref=e27]
          - paragraph [ref=e28]: قارن بين عشرات العروض المقدمة من الوكالات السياحية المعتمدة بالجزائر. تصفح الفنادق، قارن الأسعار والمسافات عن الحرم، واحجز برنامجك بكل سهولة وشفافية وبدون دفع مسبق.
          - generic [ref=e29]:
            - generic [ref=e30]:
              - text: "17"
              - paragraph [ref=e31]: وكالة معتمدة
            - generic [ref=e32]:
              - text: "34"
              - paragraph [ref=e33]: برنامج نشط
            - generic [ref=e34]:
              - text: 100%
              - paragraph [ref=e35]: بدون دفع مسبق
        - generic [ref=e36]:
          - generic [ref=e37]:
            - img [ref=e38]
            - heading "تصفح البرامج والأسعار المتوفرة" [level=2] [ref=e40]
          - generic [ref=e41]:
            - generic [ref=e42]:
              - generic [ref=e43]:
                - generic [ref=e44]:
                  - generic [ref=e45]: ولاية الانطلاق
                  - generic [ref=e46]:
                    - img [ref=e47]
                    - combobox [ref=e50]:
                      - option "كل الولايات" [selected]
                      - option "الجزائر"
                      - option "باتنة"
                      - option "وهران"
                      - option "قسنطينة"
                    - img
                - generic [ref=e51]:
                  - generic [ref=e52]:
                    - generic [ref=e53]: 🌙
                    - generic [ref=e54]: موعد انطلاق رحلة العمرة المباركة
                  - button "كل المواعيد المتوفرة (عرض كل الرحلات)" [ref=e55]:
                    - generic [ref=e56]:
                      - img [ref=e57]
                      - generic [ref=e59]: كل المواعيد المتوفرة (عرض كل الرحلات)
                    - img
                - button "بحث عن عروض العمرة" [ref=e61]:
                  - img [ref=e62]
                  - generic [ref=e65]: بحث عن عروض العمرة
              - button "تصفية إضافية (المسافة، الطيران، السعر...)" [ref=e67]:
                - img [ref=e68]
                - generic [ref=e69]: تصفية إضافية (المسافة، الطيران، السعر...)
            - generic [ref=e70]:
              - paragraph [ref=e71]: تم العثور على 10 برنامج متوفر
              - generic [ref=e72]:
                - img [ref=e73]
                - combobox [ref=e76]:
                  - option "الأفضل ترتيباً" [selected]
                  - option "السعر (من الأقل للأعلى)"
                  - option "السعر (من الأعلى للأقل)"
                  - option "قرب فندق مكة من الحرم"
                  - option "الأقصر مدة"
                  - option "البرامج الأحدث إدراجاً"
            - generic [ref=e77]:
              - 'link "أفضل سعر وكالة الأنوار للأسفار والخدمات وكالة الأنوار للأسفار والخدمات برنامج العمرة الرمضانية المتميز - خيار اقتصادي مكة: فندق برج الكسوة 900م عن الحرم المدينة: فندق منازل المهاجرين 250م عن الحرم 15 يوم (من الجزائر) Air Algérie سعر المعتمر يبدأ من 175,000 دج التفاصيل والحجز ←" [ref=e78] [cursor=pointer]':
                - /url: /programs/3cb4bf48-fbc3-470a-82c5-ac4b6067155d
                - generic [ref=e80]: أفضل سعر
                - generic [ref=e81]:
                  - button "قارن مع برامج أخرى" [active] [ref=e82]:
                    - img [ref=e83]
                  - button [ref=e87]:
                    - img [ref=e88]
                - generic [ref=e90]:
                  - generic [ref=e91]:
                    - img "وكالة الأنوار للأسفار والخدمات" [ref=e92]
                    - generic [ref=e93]: وكالة الأنوار للأسفار والخدمات
                  - heading "برنامج العمرة الرمضانية المتميز - خيار اقتصادي" [level=3] [ref=e94]
                  - generic [ref=e95]:
                    - generic [ref=e96]:
                      - generic [ref=e97]:
                        - img [ref=e98]
                        - generic [ref=e101]: "مكة: فندق برج الكسوة"
                      - generic [ref=e102]:
                        - generic [ref=e103]: 900م
                        - generic [ref=e104]: عن الحرم
                    - generic [ref=e105]:
                      - generic [ref=e106]:
                        - img [ref=e107]
                        - generic [ref=e110]: "المدينة: فندق منازل المهاجرين"
                      - generic [ref=e111]:
                        - generic [ref=e112]: 250م
                        - generic [ref=e113]: عن الحرم
                  - generic [ref=e114]:
                    - generic [ref=e115]:
                      - img [ref=e116]
                      - generic [ref=e118]: 15 يوم (من الجزائر)
                    - generic [ref=e119]:
                      - img [ref=e120]
                      - generic [ref=e122]: Air Algérie
                - generic [ref=e123]:
                  - generic [ref=e124]:
                    - generic [ref=e125]: سعر المعتمر يبدأ من
                    - generic [ref=e126]: 175,000 دج
                  - generic [ref=e127]:
                    - generic [ref=e128]: التفاصيل والحجز
                    - generic [ref=e129]: ←
              - 'link "أفضل سعر وكالة سبيل الرشاد للأسفار وكالة سبيل الرشاد للأسفار عمرة البهجة والاقتصاد - مباشر باتنة مكة: فندق ديار المشاعر 950م عن الحرم المدينة: فندق ريحانة السكينة 300م عن الحرم 15 يوم (من باتنة) Air Algérie سعر المعتمر يبدأ من 149,000 دج التفاصيل والحجز ←" [ref=e130] [cursor=pointer]':
                - /url: /programs/3949afce-959b-4b93-ac27-f61b45629f29
                - generic [ref=e132]: أفضل سعر
                - generic [ref=e133]:
                  - button "قارن مع برامج أخرى" [ref=e134]:
                    - img [ref=e135]
                  - button [ref=e139]:
                    - img [ref=e140]
                - generic [ref=e142]:
                  - generic [ref=e143]:
                    - img "وكالة سبيل الرشاد للأسفار" [ref=e144]
                    - generic [ref=e145]: وكالة سبيل الرشاد للأسفار
                  - heading "عمرة البهجة والاقتصاد - مباشر باتنة" [level=3] [ref=e146]
                  - generic [ref=e147]:
                    - generic [ref=e148]:
                      - generic [ref=e149]:
                        - img [ref=e150]
                        - generic [ref=e153]: "مكة: فندق ديار المشاعر"
                      - generic [ref=e154]:
                        - generic [ref=e155]: 950م
                        - generic [ref=e156]: عن الحرم
                    - generic [ref=e157]:
                      - generic [ref=e158]:
                        - img [ref=e159]
                        - generic [ref=e162]: "المدينة: فندق ريحانة السكينة"
                      - generic [ref=e163]:
                        - generic [ref=e164]: 300م
                        - generic [ref=e165]: عن الحرم
                  - generic [ref=e166]:
                    - generic [ref=e167]:
                      - img [ref=e168]
                      - generic [ref=e170]: 15 يوم (من باتنة)
                    - generic [ref=e171]:
                      - img [ref=e172]
                      - generic [ref=e174]: Air Algérie
                - generic [ref=e175]:
                  - generic [ref=e176]:
                    - generic [ref=e177]: سعر المعتمر يبدأ من
                    - generic [ref=e178]: 149,000 دج
                  - generic [ref=e179]:
                    - generic [ref=e180]: التفاصيل والحجز
                    - generic [ref=e181]: ←
              - 'link "أفضل سعر وكالة الإخلاص للسياحة والأسفار وكالة الإخلاص للسياحة والأسفار عمرة السكينة والاقتصاد - فنادق قريبة وممتازة مكة: فندق إعمار الأندلسية 650م عن الحرم المدينة: فندق ديار المدينة 200م عن الحرم 15 يوم (من وهران) Air Algérie سعر المعتمر يبدأ من 190,000 دج التفاصيل والحجز ←" [ref=e182] [cursor=pointer]':
                - /url: /programs/24262984-2454-4bbd-92ea-047b922a2af4
                - generic [ref=e184]: أفضل سعر
                - generic [ref=e185]:
                  - button "قارن مع برامج أخرى" [ref=e186]:
                    - img [ref=e187]
                  - button [ref=e191]:
                    - img [ref=e192]
                - generic [ref=e194]:
                  - generic [ref=e195]:
                    - img "وكالة الإخلاص للسياحة والأسفار" [ref=e196]
                    - generic [ref=e197]: وكالة الإخلاص للسياحة والأسفار
                  - heading "عمرة السكينة والاقتصاد - فنادق قريبة وممتازة" [level=3] [ref=e198]
                  - generic [ref=e199]:
                    - generic [ref=e200]:
                      - generic [ref=e201]:
                        - img [ref=e202]
                        - generic [ref=e205]: "مكة: فندق إعمار الأندلسية"
                      - generic [ref=e206]:
                        - generic [ref=e207]: 650م
                        - generic [ref=e208]: عن الحرم
                    - generic [ref=e209]:
                      - generic [ref=e210]:
                        - img [ref=e211]
                        - generic [ref=e214]: "المدينة: فندق ديار المدينة"
                      - generic [ref=e215]:
                        - generic [ref=e216]: 200م
                        - generic [ref=e217]: عن الحرم
                  - generic [ref=e218]:
                    - generic [ref=e219]:
                      - img [ref=e220]
                      - generic [ref=e222]: 15 يوم (من وهران)
                    - generic [ref=e223]:
                      - img [ref=e224]
                      - generic [ref=e226]: Air Algérie
                - generic [ref=e227]:
                  - generic [ref=e228]:
                    - generic [ref=e229]: سعر المعتمر يبدأ من
                    - generic [ref=e230]: 190,000 دج
                  - generic [ref=e231]:
                    - generic [ref=e232]: التفاصيل والحجز
                    - generic [ref=e233]: ←
              - 'link "أفضل سعر وكالة نسائم مكة لخدمات العمرة وكالة نسائم مكة لخدمات العمرة برنامج عمرة البركة لربيع 2026 - مباشر قسنطينة مكة: فندق ميريديان أبراج مكة 1200م عن الحرم المدينة: فندق الشرفات الذهبية 300م عن الحرم 15 يوم (من قسنطينة) Saudia سعر المعتمر يبدأ من 205,000 دج التفاصيل والحجز ←" [ref=e234] [cursor=pointer]':
                - /url: /programs/e4674523-8044-4255-9e8f-d58b54f466a6
                - generic [ref=e236]: أفضل سعر
                - generic [ref=e237]:
                  - button "قارن مع برامج أخرى" [ref=e238]:
                    - img [ref=e239]
                  - button [ref=e243]:
                    - img [ref=e244]
                - generic [ref=e246]:
                  - generic [ref=e247]:
                    - img "وكالة نسائم مكة لخدمات العمرة" [ref=e248]
                    - generic [ref=e249]: وكالة نسائم مكة لخدمات العمرة
                  - heading "برنامج عمرة البركة لربيع 2026 - مباشر قسنطينة" [level=3] [ref=e250]
                  - generic [ref=e251]:
                    - generic [ref=e252]:
                      - generic [ref=e253]:
                        - img [ref=e254]
                        - generic [ref=e257]: "مكة: فندق ميريديان أبراج مكة"
                      - generic [ref=e258]:
                        - generic [ref=e259]: 1200م
                        - generic [ref=e260]: عن الحرم
                    - generic [ref=e261]:
                      - generic [ref=e262]:
                        - img [ref=e263]
                        - generic [ref=e266]: "المدينة: فندق الشرفات الذهبية"
                      - generic [ref=e267]:
                        - generic [ref=e268]: 300م
                        - generic [ref=e269]: عن الحرم
                  - generic [ref=e270]:
                    - generic [ref=e271]:
                      - img [ref=e272]
                      - generic [ref=e274]: 15 يوم (من قسنطينة)
                    - generic [ref=e275]:
                      - img [ref=e276]
                      - generic [ref=e278]: Saudia
                - generic [ref=e279]:
                  - generic [ref=e280]:
                    - generic [ref=e281]: سعر المعتمر يبدأ من
                    - generic [ref=e282]: 205,000 دج
                  - generic [ref=e283]:
                    - generic [ref=e284]: التفاصيل والحجز
                    - generic [ref=e285]: ←
              - 'link "أفضل سعر وكالة الهدى والنور للسياحة وكالة الهدى والنور للسياحة برنامج عمرة الاقتصاد والراحة - سطيف مكة: فندق نوازي الوثير 800م عن الحرم المدينة: فندق دار السلام الجديد 280م عن الحرم 15 يوم (من الجزائر) Turkish Airlines سعر المعتمر يبدأ من 168,000 دج التفاصيل والحجز ←" [ref=e286] [cursor=pointer]':
                - /url: /programs/ed300041-16d1-4815-ad60-cf2c93398f4c
                - generic [ref=e288]: أفضل سعر
                - generic [ref=e289]:
                  - button "قارن مع برامج أخرى" [ref=e290]:
                    - img [ref=e291]
                  - button [ref=e295]:
                    - img [ref=e296]
                - generic [ref=e298]:
                  - generic [ref=e299]:
                    - img "وكالة الهدى والنور للسياحة" [ref=e300]
                    - generic [ref=e301]: وكالة الهدى والنور للسياحة
                  - heading "برنامج عمرة الاقتصاد والراحة - سطيف" [level=3] [ref=e302]
                  - generic [ref=e303]:
                    - generic [ref=e304]:
                      - generic [ref=e305]:
                        - img [ref=e306]
                        - generic [ref=e309]: "مكة: فندق نوازي الوثير"
                      - generic [ref=e310]:
                        - generic [ref=e311]: 800م
                        - generic [ref=e312]: عن الحرم
                    - generic [ref=e313]:
                      - generic [ref=e314]:
                        - img [ref=e315]
                        - generic [ref=e318]: "المدينة: فندق دار السلام الجديد"
                      - generic [ref=e319]:
                        - generic [ref=e320]: 280م
                        - generic [ref=e321]: عن الحرم
                  - generic [ref=e322]:
                    - generic [ref=e323]:
                      - img [ref=e324]
                      - generic [ref=e326]: 15 يوم (من الجزائر)
                    - generic [ref=e327]:
                      - img [ref=e328]
                      - generic [ref=e330]: Turkish Airlines
                - generic [ref=e331]:
                  - generic [ref=e332]:
                    - generic [ref=e333]: سعر المعتمر يبدأ من
                    - generic [ref=e334]: 168,000 دج
                  - generic [ref=e335]:
                    - generic [ref=e336]: التفاصيل والحجز
                    - generic [ref=e337]: ←
              - 'link "وكالة الأنوار للأسفار والخدمات وكالة الأنوار للأسفار والخدمات برنامج عمرة النخبة - VIP مباشرة مكة: فندق سويس أوتيل المقام 100م عن الحرم المدينة: فندق دار الإيمان إنتركونتيننتال 50م عن الحرم 12 يوم (من الجزائر) Saudia سعر المعتمر يبدأ من 340,000 دج التفاصيل والحجز ←" [ref=e338] [cursor=pointer]':
                - /url: /programs/e97b9f87-1f22-4899-bd4f-387b9dc26791
                - generic [ref=e339]:
                  - button "قارن مع برامج أخرى" [ref=e340]:
                    - img [ref=e341]
                  - button [ref=e345]:
                    - img [ref=e346]
                - generic [ref=e348]:
                  - generic [ref=e349]:
                    - img "وكالة الأنوار للأسفار والخدمات" [ref=e350]
                    - generic [ref=e351]: وكالة الأنوار للأسفار والخدمات
                  - heading "برنامج عمرة النخبة - VIP مباشرة" [level=3] [ref=e352]
                  - generic [ref=e353]:
                    - generic [ref=e354]:
                      - generic [ref=e355]:
                        - img [ref=e356]
                        - generic [ref=e359]: "مكة: فندق سويس أوتيل المقام"
                      - generic [ref=e360]:
                        - generic [ref=e361]: 100م
                        - generic [ref=e362]: عن الحرم
                    - generic [ref=e363]:
                      - generic [ref=e364]:
                        - img [ref=e365]
                        - generic [ref=e368]: "المدينة: فندق دار الإيمان إنتركونتيننتال"
                      - generic [ref=e369]:
                        - generic [ref=e370]: 50م
                        - generic [ref=e371]: عن الحرم
                  - generic [ref=e372]:
                    - generic [ref=e373]:
                      - img [ref=e374]
                      - generic [ref=e376]: 12 يوم (من الجزائر)
                    - generic [ref=e377]:
                      - img [ref=e378]
                      - generic [ref=e380]: Saudia
                - generic [ref=e381]:
                  - generic [ref=e382]:
                    - generic [ref=e383]: سعر المعتمر يبدأ من
                    - generic [ref=e384]: 340,000 دج
                  - generic [ref=e385]:
                    - generic [ref=e386]: التفاصيل والحجز
                    - generic [ref=e387]: ←
              - 'link "أفضل سعر وكالة سبيل الرشاد للأسفار وكالة سبيل الرشاد للأسفار برنامج عمرة الأمل المريح - فنادق 4 نجوم مكة: فندق روتانا المسك 550م عن الحرم المدينة: فندق طابة السلام 220م عن الحرم 15 يوم (من باتنة) Air Algérie سعر المعتمر يبدأ من 205,000 دج التفاصيل والحجز ←" [ref=e388] [cursor=pointer]':
                - /url: /programs/8e3bc815-4e9c-4bbb-b69f-5ca875ffc0ad
                - generic [ref=e390]: أفضل سعر
                - generic [ref=e391]:
                  - button "قارن مع برامج أخرى" [ref=e392]:
                    - img [ref=e393]
                  - button [ref=e397]:
                    - img [ref=e398]
                - generic [ref=e400]:
                  - generic [ref=e401]:
                    - img "وكالة سبيل الرشاد للأسفار" [ref=e402]
                    - generic [ref=e403]: وكالة سبيل الرشاد للأسفار
                  - heading "برنامج عمرة الأمل المريح - فنادق 4 نجوم" [level=3] [ref=e404]
                  - generic [ref=e405]:
                    - generic [ref=e406]:
                      - generic [ref=e407]:
                        - img [ref=e408]
                        - generic [ref=e411]: "مكة: فندق روتانا المسك"
                      - generic [ref=e412]:
                        - generic [ref=e413]: 550م
                        - generic [ref=e414]: عن الحرم
                    - generic [ref=e415]:
                      - generic [ref=e416]:
                        - img [ref=e417]
                        - generic [ref=e420]: "المدينة: فندق طابة السلام"
                      - generic [ref=e421]:
                        - generic [ref=e422]: 220م
                        - generic [ref=e423]: عن الحرم
                  - generic [ref=e424]:
                    - generic [ref=e425]:
                      - img [ref=e426]
                      - generic [ref=e428]: 15 يوم (من باتنة)
                    - generic [ref=e429]:
                      - img [ref=e430]
                      - generic [ref=e432]: Air Algérie
                - generic [ref=e433]:
                  - generic [ref=e434]:
                    - generic [ref=e435]: سعر المعتمر يبدأ من
                    - generic [ref=e436]: 205,000 دج
                  - generic [ref=e437]:
                    - generic [ref=e438]: التفاصيل والحجز
                    - generic [ref=e439]: ←
              - 'link "وكالة نسائم مكة لخدمات العمرة وكالة نسائم مكة لخدمات العمرة عمرة التيسير الفاخرة - مباشر قسنطينة مكة: فندق أبراج مريديان زمزم 100م عن الحرم المدينة: فندق دلة طيبة 100م عن الحرم 15 يوم (من قسنطينة) Air Algérie سعر المعتمر يبدأ من 315,000 دج التفاصيل والحجز ←" [ref=e440] [cursor=pointer]':
                - /url: /programs/14fd3a03-e40b-4801-869d-3fa46ef7821d
                - generic [ref=e441]:
                  - button "قارن مع برامج أخرى" [ref=e442]:
                    - img [ref=e443]
                  - button [ref=e447]:
                    - img [ref=e448]
                - generic [ref=e450]:
                  - generic [ref=e451]:
                    - img "وكالة نسائم مكة لخدمات العمرة" [ref=e452]
                    - generic [ref=e453]: وكالة نسائم مكة لخدمات العمرة
                  - heading "عمرة التيسير الفاخرة - مباشر قسنطينة" [level=3] [ref=e454]
                  - generic [ref=e455]:
                    - generic [ref=e456]:
                      - generic [ref=e457]:
                        - img [ref=e458]
                        - generic [ref=e461]: "مكة: فندق أبراج مريديان زمزم"
                      - generic [ref=e462]:
                        - generic [ref=e463]: 100م
                        - generic [ref=e464]: عن الحرم
                    - generic [ref=e465]:
                      - generic [ref=e466]:
                        - img [ref=e467]
                        - generic [ref=e470]: "المدينة: فندق دلة طيبة"
                      - generic [ref=e471]:
                        - generic [ref=e472]: 100م
                        - generic [ref=e473]: عن الحرم
                  - generic [ref=e474]:
                    - generic [ref=e475]:
                      - img [ref=e476]
                      - generic [ref=e478]: 15 يوم (من قسنطينة)
                    - generic [ref=e479]:
                      - img [ref=e480]
                      - generic [ref=e482]: Air Algérie
                - generic [ref=e483]:
                  - generic [ref=e484]:
                    - generic [ref=e485]: سعر المعتمر يبدأ من
                    - generic [ref=e486]: 315,000 دج
                  - generic [ref=e487]:
                    - generic [ref=e488]: التفاصيل والحجز
                    - generic [ref=e489]: ←
              - 'link "وكالة الإخلاص للسياحة والأسفار وكالة الإخلاص للسياحة والأسفار برنامج عمرة الصيف العائلي - خيار الـ 4 نجوم مكة: فندق أنوار الضيافة 450م عن الحرم المدينة: فندق المركزية الذهبي 150م عن الحرم 21 يوم (من وهران) Turkish Airlines سعر المعتمر يبدأ من 250,000 دج التفاصيل والحجز ←" [ref=e490] [cursor=pointer]':
                - /url: /programs/25b24955-29c3-4445-ad89-90573a982abf
                - generic [ref=e491]:
                  - button "قارن مع برامج أخرى" [ref=e492]:
                    - img [ref=e493]
                  - button [ref=e497]:
                    - img [ref=e498]
                - generic [ref=e500]:
                  - generic [ref=e501]:
                    - img "وكالة الإخلاص للسياحة والأسفار" [ref=e502]
                    - generic [ref=e503]: وكالة الإخلاص للسياحة والأسفار
                  - heading "برنامج عمرة الصيف العائلي - خيار الـ 4 نجوم" [level=3] [ref=e504]
                  - generic [ref=e505]:
                    - generic [ref=e506]:
                      - generic [ref=e507]:
                        - img [ref=e508]
                        - generic [ref=e511]: "مكة: فندق أنوار الضيافة"
                      - generic [ref=e512]:
                        - generic [ref=e513]: 450م
                        - generic [ref=e514]: عن الحرم
                    - generic [ref=e515]:
                      - generic [ref=e516]:
                        - img [ref=e517]
                        - generic [ref=e520]: "المدينة: فندق المركزية الذهبي"
                      - generic [ref=e521]:
                        - generic [ref=e522]: 150م
                        - generic [ref=e523]: عن الحرم
                  - generic [ref=e524]:
                    - generic [ref=e525]:
                      - img [ref=e526]
                      - generic [ref=e528]: 21 يوم (من وهران)
                    - generic [ref=e529]:
                      - img [ref=e530]
                      - generic [ref=e532]: Turkish Airlines
                - generic [ref=e533]:
                  - generic [ref=e534]:
                    - generic [ref=e535]: سعر المعتمر يبدأ من
                    - generic [ref=e536]: 250,000 دج
                  - generic [ref=e537]:
                    - generic [ref=e538]: التفاصيل والحجز
                    - generic [ref=e539]: ←
              - 'link "الأكثر طلباً وكالة الهدى والنور للسياحة وكالة الهدى والنور للسياحة عمرة التوحيد الصيفية الفاخرة - طيران مباشر مكة: فندق دار الغفران الصفوة 80م عن الحرم المدينة: فندق الأوبروي المدينة 50م عن الحرم 12 يوم (من الجزائر) Saudia سعر المعتمر يبدأ من 390,000 دج التفاصيل والحجز ←" [ref=e540] [cursor=pointer]':
                - /url: /programs/8ca1c2d8-e085-42d4-8fcc-a77f71e0802a
                - generic [ref=e542]: الأكثر طلباً
                - generic [ref=e543]:
                  - button "قارن مع برامج أخرى" [ref=e544]:
                    - img [ref=e545]
                  - button [ref=e549]:
                    - img [ref=e550]
                - generic [ref=e552]:
                  - generic [ref=e553]:
                    - img "وكالة الهدى والنور للسياحة" [ref=e554]
                    - generic [ref=e555]: وكالة الهدى والنور للسياحة
                  - heading "عمرة التوحيد الصيفية الفاخرة - طيران مباشر" [level=3] [ref=e556]
                  - generic [ref=e557]:
                    - generic [ref=e558]:
                      - generic [ref=e559]:
                        - img [ref=e560]
                        - generic [ref=e563]: "مكة: فندق دار الغفران الصفوة"
                      - generic [ref=e564]:
                        - generic [ref=e565]: 80م
                        - generic [ref=e566]: عن الحرم
                    - generic [ref=e567]:
                      - generic [ref=e568]:
                        - img [ref=e569]
                        - generic [ref=e572]: "المدينة: فندق الأوبروي المدينة"
                      - generic [ref=e573]:
                        - generic [ref=e574]: 50م
                        - generic [ref=e575]: عن الحرم
                  - generic [ref=e576]:
                    - generic [ref=e577]:
                      - img [ref=e578]
                      - generic [ref=e580]: 12 يوم (من الجزائر)
                    - generic [ref=e581]:
                      - img [ref=e582]
                      - generic [ref=e584]: Saudia
                - generic [ref=e585]:
                  - generic [ref=e586]:
                    - generic [ref=e587]: سعر المعتمر يبدأ من
                    - generic [ref=e588]: 390,000 دج
                  - generic [ref=e589]:
                    - generic [ref=e590]: التفاصيل والحجز
                    - generic [ref=e591]: ←
            - generic [ref=e592]:
              - generic [ref=e593]:
                - heading "مقارنة برامج العمرة (1)" [level=4] [ref=e594]
                - paragraph [ref=e595]: لقد اخترت برامج للمقارنة. قارن الفنادق والمسافات والأسعار جنباً إلى جنب.
              - generic [ref=e597]:
                - generic [ref=e598]: برنامج العمرة الرمضانية المتميز - خيار اقتصادي
                - button [ref=e599]:
                  - img [ref=e600]
              - generic [ref=e603]:
                - link "قارن الآن" [ref=e604] [cursor=pointer]:
                  - /url: /compare?ids=3cb4bf48-fbc3-470a-82c5-ac4b6067155d
                  - button "قارن الآن" [ref=e605]
                - button "إلغاء" [ref=e606]
    - contentinfo [ref=e607]:
      - generic [ref=e608]:
        - generic [ref=e609]:
          - link "منصة عمرة" [ref=e610] [cursor=pointer]:
            - /url: /
            - img [ref=e611]
            - generic [ref=e613]: منصة عمرة
          - paragraph [ref=e614]: المنصة الأولى المخصصة للجزائريين لتصفح، مقارنة، وفلترة برامج عروض العمرة بكل شفافية. هدفنا ربط المعتمرين بأفضل الوكالات المعتمدة.
        - generic [ref=e615]:
          - heading "روابط سريعة" [level=4] [ref=e616]
          - list [ref=e617]:
            - listitem [ref=e618]:
              - link "الرئيسية وتصفح العروض" [ref=e619] [cursor=pointer]:
                - /url: /
            - listitem [ref=e620]:
              - link "مقارنة برامج العمرة" [ref=e621] [cursor=pointer]:
                - /url: /compare
            - listitem [ref=e622]:
              - link "تسجيل دخول وكالة" [ref=e623] [cursor=pointer]:
                - /url: /login
            - listitem [ref=e624]:
              - link "تسجيل وكالة جديدة" [ref=e625] [cursor=pointer]:
                - /url: /register
        - generic [ref=e626]:
          - heading "شروط وقوانين المنصة" [level=4] [ref=e627]
          - paragraph [ref=e628]: المنصة لا تقبل أي مدفوعات إلكترونية أو عربون مالي. الحجز يتم ببيانات الاتصال ومطابقتها من الإدارة لضمان أمان معاملينا.
          - paragraph [ref=e629]: © 2026 عمرة الجزائر. جميع الحقوق محفوظة.
  - button "Open Next.js Dev Tools" [ref=e635] [cursor=pointer]:
    - img [ref=e636]
  - alert [ref=e639]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('Citizen Flow E2E Tests', () => {
  4  |   test('should search, compare, and book a program successfully', async ({ page }) => {
  5  |     // 1. Visit homepage
  6  |     await page.goto('/')
  7  | 
  8  |     // Expect the page title and key text to be visible
  9  |     await expect(page).toHaveTitle(/منصة عمرة/)
  10 |     await expect(page.locator('h1')).toContainText('تيسير بحثك عن')
  11 | 
  12 |     // 2. Verify that program cards are loaded
  13 |     const cards = page.locator('a[href^="/programs/"]')
  14 |     await expect(cards.first()).toBeVisible()
  15 |     const initialCardCount = await cards.count()
  16 |     expect(initialCardCount).toBeGreaterThan(0)
  17 | 
  18 |     // 3. Test program comparison
  19 |     // Locate comparison button on the first card
  20 |     const firstCard = cards.first()
  21 |     const firstTitle = await firstCard.locator('h3').textContent()
  22 | 
  23 |     const compareBtn = firstCard.locator('button[title="قارن مع برامج أخرى"]')
  24 |     await compareBtn.click()
  25 | 
  26 |     // Floating comparison drawer should be visible at the bottom
  27 |     const compareDrawer = page.locator('div:has-text("مقارنة برامج العمرة")')
> 28 |     await expect(compareDrawer).toBeVisible()
     |                                 ^ Error: expect(locator).toBeVisible() failed
  29 | 
  30 |     // Add a second program card to compare
  31 |     if (initialCardCount > 1) {
  32 |       const secondCard = cards.nth(1)
  33 |       const secondCompareBtn = secondCard.locator('button[title="قارن مع برامج أخرى"]')
  34 |       await secondCompareBtn.click()
  35 | 
  36 |       // Should show (2) in the comparison title
  37 |       await expect(page.locator('h4:has-text("مقارنة برامج العمرة")')).toContainText('(2)')
  38 | 
  39 |       // Click "قارن الآن" button in the drawer to navigate
  40 |       const compareNowBtn = page.locator('button:has-text("قارن الآن")')
  41 |       await compareNowBtn.click()
  42 | 
  43 |       // Should navigate to /compare page
  44 |       await expect(page).toHaveURL(/\/compare\?ids=/)
  45 |       await expect(page.locator('h1')).toContainText('مقارنة برامج العمرة')
  46 | 
  47 |       // Return to homepage using the "العودة للبحث" button
  48 |       await page.locator('button:has-text("العودة للبحث")').click()
  49 |       await expect(page).toHaveURL('/')
  50 |     }
  51 | 
  52 |     // 4. Test detail page and booking modal flow
  53 |     // Click on the first card to go to detail page
  54 |     await cards.first().click()
  55 |     await expect(page).toHaveURL(/\/programs\/[a-fA-F0-9-]+/)
  56 | 
  57 |     // Click "اطلب حجز مكانك الآن (مجاناً)" button
  58 |     const bookNowBtn = page.locator('button:has-text("اطلب حجز مكانك الآن")')
  59 |     await expect(bookNowBtn).toBeVisible()
  60 |     await bookNowBtn.click()
  61 | 
  62 |     // Modal should appear
  63 |     const modalHeader = page.locator('h3:has-text("طلب الحجز المجاني")')
  64 |     await expect(modalHeader).toBeVisible()
  65 | 
  66 |     // Fill in the form
  67 |     await page.locator('input[placeholder="مثال: محمد بن علي"]').fill('محمد بن علي التجريبي')
  68 |     await page.locator('input[placeholder="مثال: 0550123456"]').fill('0550112233')
  69 | 
  70 |     // Submit the form
  71 |     const submitBtn = page.locator('button[type="submit"]')
  72 |     await submitBtn.click()
  73 | 
  74 |     // Success view should appear
  75 |     const successHeader = page.locator('h3:has-text("تم تسجيل طلب حجزك بنجاح!")')
  76 |     await expect(successHeader).toBeVisible()
  77 | 
  78 |     // Reference number should be displayed
  79 |     const refContainer = page.locator('div:has-text("الرقم المرجعي للحجز")')
  80 |     await expect(refContainer).toBeVisible()
  81 |     const refText = await refContainer.locator('span.text-2xl').textContent()
  82 |     expect(refText).toMatch(/UMR-[A-Z0-9]{6}/)
  83 | 
  84 |     // Close modal
  85 |     await page.locator('button:has-text("انتظر اتصال الوكالة بك هاتفياً")').click()
  86 |     await expect(successHeader).not.toBeVisible()
  87 |   })
  88 | })
  89 | 
```