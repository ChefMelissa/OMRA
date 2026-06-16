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
    ...

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
          - generic [ref=e13]: منصة عمرة
        - navigation [ref=e14]:
          - link "تصفح البرامج" [ref=e15] [cursor=pointer]:
            - /url: /
          - link "مقارنة العروض" [ref=e16] [cursor=pointer]:
            - /url: /compare
        - link "دخول الوكالات" [ref=e18] [cursor=pointer]:
          - /url: /login
          - button "دخول الوكالات" [ref=e19]:
            - img [ref=e20]
            - generic [ref=e24]: دخول الوكالات
    - main [ref=e25]:
      - generic [ref=e26]:
        - generic [ref=e27]:
          - generic [ref=e28]:
            - img [ref=e29]
            - generic [ref=e34]: المنصة الأولى لمقارنة وحجز عروض العمرة بالجزائر
          - heading "تيسير بحثك عن برنامج العمرة المناسب" [level=1] [ref=e35]
          - paragraph [ref=e36]: قارن بين عشرات العروض المقدمة من الوكالات السياحية المعتمدة بالجزائر. تصفح الفنادق، قارن الأسعار والمسافات عن الحرم، واحجز برنامجك بكل سهولة وشفافية وبدون دفع مسبق.
          - generic [ref=e37]:
            - generic [ref=e38]:
              - text: "17"
              - paragraph [ref=e39]: وكالة معتمدة
            - generic [ref=e40]:
              - text: "34"
              - paragraph [ref=e41]: برنامج نشط
            - generic [ref=e42]:
              - text: 100%
              - paragraph [ref=e43]: بدون دفع مسبق
        - generic [ref=e44]:
          - generic [ref=e45]:
            - img [ref=e46]
            - heading "تصفح البرامج والأسعار المتوفرة" [level=2] [ref=e53]
          - generic [ref=e54]:
            - generic [ref=e55]:
              - generic [ref=e56]:
                - generic [ref=e57]:
                  - generic [ref=e58]: ولاية الانطلاق
                  - generic [ref=e59]:
                    - img [ref=e60]
                    - combobox [ref=e63]:
                      - option "كل الولايات" [selected]
                      - option "الجزائر"
                      - option "باتنة"
                      - option "وهران"
                      - option "قسنطينة"
                    - img
                - generic [ref=e64]:
                  - generic [ref=e65]:
                    - generic [ref=e66]: 🌙
                    - generic [ref=e67]: موعد انطلاق رحلة العمرة المباركة
                  - button "كل المواعيد المتوفرة (عرض كل الرحلات)" [ref=e68]:
                    - generic [ref=e69]:
                      - img [ref=e70]
                      - generic [ref=e75]: كل المواعيد المتوفرة (عرض كل الرحلات)
                    - img
                - button "بحث عن عروض العمرة" [ref=e77]:
                  - img [ref=e78]
                  - generic [ref=e81]: بحث عن عروض العمرة
              - button "تصفية إضافية (المسافة، الطيران، السعر...)" [ref=e83]:
                - img [ref=e84]
                - generic [ref=e94]: تصفية إضافية (المسافة، الطيران، السعر...)
            - generic [ref=e95]:
              - paragraph [ref=e96]: تم العثور على 10 برنامج متوفر
              - generic [ref=e97]:
                - img [ref=e98]
                - combobox [ref=e103]:
                  - option "الأفضل ترتيباً" [selected]
                  - option "السعر (من الأقل للأعلى)"
                  - option "السعر (من الأعلى للأقل)"
                  - option "قرب فندق مكة من الحرم"
                  - option "الأقصر مدة"
                  - option "البرامج الأحدث إدراجاً"
            - generic [ref=e104]:
              - 'link "أفضل سعر وكالة الأنوار للأسفار والخدمات وكالة الأنوار للأسفار والخدمات برنامج العمرة الرمضانية المتميز - خيار اقتصادي مكة: فندق برج الكسوة 900م عن الحرم المدينة: فندق منازل المهاجرين 250م عن الحرم 15 يوم (من الجزائر) Air Algérie سعر المعتمر يبدأ من 175,000 دج التفاصيل والحجز ←" [ref=e105] [cursor=pointer]':
                - /url: /programs/3cb4bf48-fbc3-470a-82c5-ac4b6067155d
                - generic [ref=e107]: أفضل سعر
                - generic [ref=e108]:
                  - button "قارن مع برامج أخرى" [active] [ref=e109]:
                    - img [ref=e110]
                  - button [ref=e116]:
                    - img [ref=e117]
                - generic [ref=e119]:
                  - generic [ref=e120]:
                    - img "وكالة الأنوار للأسفار والخدمات" [ref=e121]
                    - generic [ref=e122]: وكالة الأنوار للأسفار والخدمات
                  - heading "برنامج العمرة الرمضانية المتميز - خيار اقتصادي" [level=3] [ref=e123]
                  - generic [ref=e124]:
                    - generic [ref=e125]:
                      - generic [ref=e126]:
                        - img [ref=e127]
                        - generic [ref=e138]: "مكة: فندق برج الكسوة"
                      - generic [ref=e139]:
                        - generic [ref=e140]: 900م
                        - generic [ref=e141]: عن الحرم
                    - generic [ref=e142]:
                      - generic [ref=e143]:
                        - img [ref=e144]
                        - generic [ref=e155]: "المدينة: فندق منازل المهاجرين"
                      - generic [ref=e156]:
                        - generic [ref=e157]: 250م
                        - generic [ref=e158]: عن الحرم
                  - generic [ref=e159]:
                    - generic [ref=e160]:
                      - img [ref=e161]
                      - generic [ref=e166]: 15 يوم (من الجزائر)
                    - generic [ref=e167]:
                      - img [ref=e168]
                      - generic [ref=e170]: Air Algérie
                - generic [ref=e171]:
                  - generic [ref=e172]:
                    - generic [ref=e173]: سعر المعتمر يبدأ من
                    - generic [ref=e174]: 175,000 دج
                  - generic [ref=e175]:
                    - generic [ref=e176]: التفاصيل والحجز
                    - generic [ref=e177]: ←
              - 'link "أفضل سعر وكالة سبيل الرشاد للأسفار وكالة سبيل الرشاد للأسفار عمرة البهجة والاقتصاد - مباشر باتنة مكة: فندق ديار المشاعر 950م عن الحرم المدينة: فندق ريحانة السكينة 300م عن الحرم 15 يوم (من باتنة) Air Algérie سعر المعتمر يبدأ من 149,000 دج التفاصيل والحجز ←" [ref=e178] [cursor=pointer]':
                - /url: /programs/3949afce-959b-4b93-ac27-f61b45629f29
                - generic [ref=e180]: أفضل سعر
                - generic [ref=e181]:
                  - button "قارن مع برامج أخرى" [ref=e182]:
                    - img [ref=e183]
                  - button [ref=e189]:
                    - img [ref=e190]
                - generic [ref=e192]:
                  - generic [ref=e193]:
                    - img "وكالة سبيل الرشاد للأسفار" [ref=e194]
                    - generic [ref=e195]: وكالة سبيل الرشاد للأسفار
                  - heading "عمرة البهجة والاقتصاد - مباشر باتنة" [level=3] [ref=e196]
                  - generic [ref=e197]:
                    - generic [ref=e198]:
                      - generic [ref=e199]:
                        - img [ref=e200]
                        - generic [ref=e211]: "مكة: فندق ديار المشاعر"
                      - generic [ref=e212]:
                        - generic [ref=e213]: 950م
                        - generic [ref=e214]: عن الحرم
                    - generic [ref=e215]:
                      - generic [ref=e216]:
                        - img [ref=e217]
                        - generic [ref=e228]: "المدينة: فندق ريحانة السكينة"
                      - generic [ref=e229]:
                        - generic [ref=e230]: 300م
                        - generic [ref=e231]: عن الحرم
                  - generic [ref=e232]:
                    - generic [ref=e233]:
                      - img [ref=e234]
                      - generic [ref=e239]: 15 يوم (من باتنة)
                    - generic [ref=e240]:
                      - img [ref=e241]
                      - generic [ref=e243]: Air Algérie
                - generic [ref=e244]:
                  - generic [ref=e245]:
                    - generic [ref=e246]: سعر المعتمر يبدأ من
                    - generic [ref=e247]: 149,000 دج
                  - generic [ref=e248]:
                    - generic [ref=e249]: التفاصيل والحجز
                    - generic [ref=e250]: ←
              - 'link "أفضل سعر وكالة الإخلاص للسياحة والأسفار وكالة الإخلاص للسياحة والأسفار عمرة السكينة والاقتصاد - فنادق قريبة وممتازة مكة: فندق إعمار الأندلسية 650م عن الحرم المدينة: فندق ديار المدينة 200م عن الحرم 15 يوم (من وهران) Air Algérie سعر المعتمر يبدأ من 190,000 دج التفاصيل والحجز ←" [ref=e251] [cursor=pointer]':
                - /url: /programs/24262984-2454-4bbd-92ea-047b922a2af4
                - generic [ref=e253]: أفضل سعر
                - generic [ref=e254]:
                  - button "قارن مع برامج أخرى" [ref=e255]:
                    - img [ref=e256]
                  - button [ref=e262]:
                    - img [ref=e263]
                - generic [ref=e265]:
                  - generic [ref=e266]:
                    - img "وكالة الإخلاص للسياحة والأسفار" [ref=e267]
                    - generic [ref=e268]: وكالة الإخلاص للسياحة والأسفار
                  - heading "عمرة السكينة والاقتصاد - فنادق قريبة وممتازة" [level=3] [ref=e269]
                  - generic [ref=e270]:
                    - generic [ref=e271]:
                      - generic [ref=e272]:
                        - img [ref=e273]
                        - generic [ref=e284]: "مكة: فندق إعمار الأندلسية"
                      - generic [ref=e285]:
                        - generic [ref=e286]: 650م
                        - generic [ref=e287]: عن الحرم
                    - generic [ref=e288]:
                      - generic [ref=e289]:
                        - img [ref=e290]
                        - generic [ref=e301]: "المدينة: فندق ديار المدينة"
                      - generic [ref=e302]:
                        - generic [ref=e303]: 200م
                        - generic [ref=e304]: عن الحرم
                  - generic [ref=e305]:
                    - generic [ref=e306]:
                      - img [ref=e307]
                      - generic [ref=e312]: 15 يوم (من وهران)
                    - generic [ref=e313]:
                      - img [ref=e314]
                      - generic [ref=e316]: Air Algérie
                - generic [ref=e317]:
                  - generic [ref=e318]:
                    - generic [ref=e319]: سعر المعتمر يبدأ من
                    - generic [ref=e320]: 190,000 دج
                  - generic [ref=e321]:
                    - generic [ref=e322]: التفاصيل والحجز
                    - generic [ref=e323]: ←
              - 'link "أفضل سعر وكالة نسائم مكة لخدمات العمرة وكالة نسائم مكة لخدمات العمرة برنامج عمرة البركة لربيع 2026 - مباشر قسنطينة مكة: فندق ميريديان أبراج مكة 1200م عن الحرم المدينة: فندق الشرفات الذهبية 300م عن الحرم 15 يوم (من قسنطينة) Saudia سعر المعتمر يبدأ من 205,000 دج التفاصيل والحجز ←" [ref=e324] [cursor=pointer]':
                - /url: /programs/e4674523-8044-4255-9e8f-d58b54f466a6
                - generic [ref=e326]: أفضل سعر
                - generic [ref=e327]:
                  - button "قارن مع برامج أخرى" [ref=e328]:
                    - img [ref=e329]
                  - button [ref=e335]:
                    - img [ref=e336]
                - generic [ref=e338]:
                  - generic [ref=e339]:
                    - img "وكالة نسائم مكة لخدمات العمرة" [ref=e340]
                    - generic [ref=e341]: وكالة نسائم مكة لخدمات العمرة
                  - heading "برنامج عمرة البركة لربيع 2026 - مباشر قسنطينة" [level=3] [ref=e342]
                  - generic [ref=e343]:
                    - generic [ref=e344]:
                      - generic [ref=e345]:
                        - img [ref=e346]
                        - generic [ref=e357]: "مكة: فندق ميريديان أبراج مكة"
                      - generic [ref=e358]:
                        - generic [ref=e359]: 1200م
                        - generic [ref=e360]: عن الحرم
                    - generic [ref=e361]:
                      - generic [ref=e362]:
                        - img [ref=e363]
                        - generic [ref=e374]: "المدينة: فندق الشرفات الذهبية"
                      - generic [ref=e375]:
                        - generic [ref=e376]: 300م
                        - generic [ref=e377]: عن الحرم
                  - generic [ref=e378]:
                    - generic [ref=e379]:
                      - img [ref=e380]
                      - generic [ref=e385]: 15 يوم (من قسنطينة)
                    - generic [ref=e386]:
                      - img [ref=e387]
                      - generic [ref=e389]: Saudia
                - generic [ref=e390]:
                  - generic [ref=e391]:
                    - generic [ref=e392]: سعر المعتمر يبدأ من
                    - generic [ref=e393]: 205,000 دج
                  - generic [ref=e394]:
                    - generic [ref=e395]: التفاصيل والحجز
                    - generic [ref=e396]: ←
              - 'link "أفضل سعر وكالة الهدى والنور للسياحة وكالة الهدى والنور للسياحة برنامج عمرة الاقتصاد والراحة - سطيف مكة: فندق نوازي الوثير 800م عن الحرم المدينة: فندق دار السلام الجديد 280م عن الحرم 15 يوم (من الجزائر) Turkish Airlines سعر المعتمر يبدأ من 168,000 دج التفاصيل والحجز ←" [ref=e397] [cursor=pointer]':
                - /url: /programs/ed300041-16d1-4815-ad60-cf2c93398f4c
                - generic [ref=e399]: أفضل سعر
                - generic [ref=e400]:
                  - button "قارن مع برامج أخرى" [ref=e401]:
                    - img [ref=e402]
                  - button [ref=e408]:
                    - img [ref=e409]
                - generic [ref=e411]:
                  - generic [ref=e412]:
                    - img "وكالة الهدى والنور للسياحة" [ref=e413]
                    - generic [ref=e414]: وكالة الهدى والنور للسياحة
                  - heading "برنامج عمرة الاقتصاد والراحة - سطيف" [level=3] [ref=e415]
                  - generic [ref=e416]:
                    - generic [ref=e417]:
                      - generic [ref=e418]:
                        - img [ref=e419]
                        - generic [ref=e430]: "مكة: فندق نوازي الوثير"
                      - generic [ref=e431]:
                        - generic [ref=e432]: 800م
                        - generic [ref=e433]: عن الحرم
                    - generic [ref=e434]:
                      - generic [ref=e435]:
                        - img [ref=e436]
                        - generic [ref=e447]: "المدينة: فندق دار السلام الجديد"
                      - generic [ref=e448]:
                        - generic [ref=e449]: 280م
                        - generic [ref=e450]: عن الحرم
                  - generic [ref=e451]:
                    - generic [ref=e452]:
                      - img [ref=e453]
                      - generic [ref=e458]: 15 يوم (من الجزائر)
                    - generic [ref=e459]:
                      - img [ref=e460]
                      - generic [ref=e462]: Turkish Airlines
                - generic [ref=e463]:
                  - generic [ref=e464]:
                    - generic [ref=e465]: سعر المعتمر يبدأ من
                    - generic [ref=e466]: 168,000 دج
                  - generic [ref=e467]:
                    - generic [ref=e468]: التفاصيل والحجز
                    - generic [ref=e469]: ←
              - 'link "وكالة الأنوار للأسفار والخدمات وكالة الأنوار للأسفار والخدمات برنامج عمرة النخبة - VIP مباشرة مكة: فندق سويس أوتيل المقام 100م عن الحرم المدينة: فندق دار الإيمان إنتركونتيننتال 50م عن الحرم 12 يوم (من الجزائر) Saudia سعر المعتمر يبدأ من 340,000 دج التفاصيل والحجز ←" [ref=e470] [cursor=pointer]':
                - /url: /programs/e97b9f87-1f22-4899-bd4f-387b9dc26791
                - generic [ref=e471]:
                  - button "قارن مع برامج أخرى" [ref=e472]:
                    - img [ref=e473]
                  - button [ref=e479]:
                    - img [ref=e480]
                - generic [ref=e482]:
                  - generic [ref=e483]:
                    - img "وكالة الأنوار للأسفار والخدمات" [ref=e484]
                    - generic [ref=e485]: وكالة الأنوار للأسفار والخدمات
                  - heading "برنامج عمرة النخبة - VIP مباشرة" [level=3] [ref=e486]
                  - generic [ref=e487]:
                    - generic [ref=e488]:
                      - generic [ref=e489]:
                        - img [ref=e490]
                        - generic [ref=e501]: "مكة: فندق سويس أوتيل المقام"
                      - generic [ref=e502]:
                        - generic [ref=e503]: 100م
                        - generic [ref=e504]: عن الحرم
                    - generic [ref=e505]:
                      - generic [ref=e506]:
                        - img [ref=e507]
                        - generic [ref=e518]: "المدينة: فندق دار الإيمان إنتركونتيننتال"
                      - generic [ref=e519]:
                        - generic [ref=e520]: 50م
                        - generic [ref=e521]: عن الحرم
                  - generic [ref=e522]:
                    - generic [ref=e523]:
                      - img [ref=e524]
                      - generic [ref=e529]: 12 يوم (من الجزائر)
                    - generic [ref=e530]:
                      - img [ref=e531]
                      - generic [ref=e533]: Saudia
                - generic [ref=e534]:
                  - generic [ref=e535]:
                    - generic [ref=e536]: سعر المعتمر يبدأ من
                    - generic [ref=e537]: 340,000 دج
                  - generic [ref=e538]:
                    - generic [ref=e539]: التفاصيل والحجز
                    - generic [ref=e540]: ←
              - 'link "أفضل سعر وكالة سبيل الرشاد للأسفار وكالة سبيل الرشاد للأسفار برنامج عمرة الأمل المريح - فنادق 4 نجوم مكة: فندق روتانا المسك 550م عن الحرم المدينة: فندق طابة السلام 220م عن الحرم 15 يوم (من باتنة) Air Algérie سعر المعتمر يبدأ من 205,000 دج التفاصيل والحجز ←" [ref=e541] [cursor=pointer]':
                - /url: /programs/8e3bc815-4e9c-4bbb-b69f-5ca875ffc0ad
                - generic [ref=e543]: أفضل سعر
                - generic [ref=e544]:
                  - button "قارن مع برامج أخرى" [ref=e545]:
                    - img [ref=e546]
                  - button [ref=e552]:
                    - img [ref=e553]
                - generic [ref=e555]:
                  - generic [ref=e556]:
                    - img "وكالة سبيل الرشاد للأسفار" [ref=e557]
                    - generic [ref=e558]: وكالة سبيل الرشاد للأسفار
                  - heading "برنامج عمرة الأمل المريح - فنادق 4 نجوم" [level=3] [ref=e559]
                  - generic [ref=e560]:
                    - generic [ref=e561]:
                      - generic [ref=e562]:
                        - img [ref=e563]
                        - generic [ref=e574]: "مكة: فندق روتانا المسك"
                      - generic [ref=e575]:
                        - generic [ref=e576]: 550م
                        - generic [ref=e577]: عن الحرم
                    - generic [ref=e578]:
                      - generic [ref=e579]:
                        - img [ref=e580]
                        - generic [ref=e591]: "المدينة: فندق طابة السلام"
                      - generic [ref=e592]:
                        - generic [ref=e593]: 220م
                        - generic [ref=e594]: عن الحرم
                  - generic [ref=e595]:
                    - generic [ref=e596]:
                      - img [ref=e597]
                      - generic [ref=e602]: 15 يوم (من باتنة)
                    - generic [ref=e603]:
                      - img [ref=e604]
                      - generic [ref=e606]: Air Algérie
                - generic [ref=e607]:
                  - generic [ref=e608]:
                    - generic [ref=e609]: سعر المعتمر يبدأ من
                    - generic [ref=e610]: 205,000 دج
                  - generic [ref=e611]:
                    - generic [ref=e612]: التفاصيل والحجز
                    - generic [ref=e613]: ←
              - 'link "وكالة نسائم مكة لخدمات العمرة وكالة نسائم مكة لخدمات العمرة عمرة التيسير الفاخرة - مباشر قسنطينة مكة: فندق أبراج مريديان زمزم 100م عن الحرم المدينة: فندق دلة طيبة 100م عن الحرم 15 يوم (من قسنطينة) Air Algérie سعر المعتمر يبدأ من 315,000 دج التفاصيل والحجز ←" [ref=e614] [cursor=pointer]':
                - /url: /programs/14fd3a03-e40b-4801-869d-3fa46ef7821d
                - generic [ref=e615]:
                  - button "قارن مع برامج أخرى" [ref=e616]:
                    - img [ref=e617]
                  - button [ref=e623]:
                    - img [ref=e624]
                - generic [ref=e626]:
                  - generic [ref=e627]:
                    - img "وكالة نسائم مكة لخدمات العمرة" [ref=e628]
                    - generic [ref=e629]: وكالة نسائم مكة لخدمات العمرة
                  - heading "عمرة التيسير الفاخرة - مباشر قسنطينة" [level=3] [ref=e630]
                  - generic [ref=e631]:
                    - generic [ref=e632]:
                      - generic [ref=e633]:
                        - img [ref=e634]
                        - generic [ref=e645]: "مكة: فندق أبراج مريديان زمزم"
                      - generic [ref=e646]:
                        - generic [ref=e647]: 100م
                        - generic [ref=e648]: عن الحرم
                    - generic [ref=e649]:
                      - generic [ref=e650]:
                        - img [ref=e651]
                        - generic [ref=e662]: "المدينة: فندق دلة طيبة"
                      - generic [ref=e663]:
                        - generic [ref=e664]: 100م
                        - generic [ref=e665]: عن الحرم
                  - generic [ref=e666]:
                    - generic [ref=e667]:
                      - img [ref=e668]
                      - generic [ref=e673]: 15 يوم (من قسنطينة)
                    - generic [ref=e674]:
                      - img [ref=e675]
                      - generic [ref=e677]: Air Algérie
                - generic [ref=e678]:
                  - generic [ref=e679]:
                    - generic [ref=e680]: سعر المعتمر يبدأ من
                    - generic [ref=e681]: 315,000 دج
                  - generic [ref=e682]:
                    - generic [ref=e683]: التفاصيل والحجز
                    - generic [ref=e684]: ←
              - 'link "وكالة الإخلاص للسياحة والأسفار وكالة الإخلاص للسياحة والأسفار برنامج عمرة الصيف العائلي - خيار الـ 4 نجوم مكة: فندق أنوار الضيافة 450م عن الحرم المدينة: فندق المركزية الذهبي 150م عن الحرم 21 يوم (من وهران) Turkish Airlines سعر المعتمر يبدأ من 250,000 دج التفاصيل والحجز ←" [ref=e685] [cursor=pointer]':
                - /url: /programs/25b24955-29c3-4445-ad89-90573a982abf
                - generic [ref=e686]:
                  - button "قارن مع برامج أخرى" [ref=e687]:
                    - img [ref=e688]
                  - button [ref=e694]:
                    - img [ref=e695]
                - generic [ref=e697]:
                  - generic [ref=e698]:
                    - img "وكالة الإخلاص للسياحة والأسفار" [ref=e699]
                    - generic [ref=e700]: وكالة الإخلاص للسياحة والأسفار
                  - heading "برنامج عمرة الصيف العائلي - خيار الـ 4 نجوم" [level=3] [ref=e701]
                  - generic [ref=e702]:
                    - generic [ref=e703]:
                      - generic [ref=e704]:
                        - img [ref=e705]
                        - generic [ref=e716]: "مكة: فندق أنوار الضيافة"
                      - generic [ref=e717]:
                        - generic [ref=e718]: 450م
                        - generic [ref=e719]: عن الحرم
                    - generic [ref=e720]:
                      - generic [ref=e721]:
                        - img [ref=e722]
                        - generic [ref=e733]: "المدينة: فندق المركزية الذهبي"
                      - generic [ref=e734]:
                        - generic [ref=e735]: 150م
                        - generic [ref=e736]: عن الحرم
                  - generic [ref=e737]:
                    - generic [ref=e738]:
                      - img [ref=e739]
                      - generic [ref=e744]: 21 يوم (من وهران)
                    - generic [ref=e745]:
                      - img [ref=e746]
                      - generic [ref=e748]: Turkish Airlines
                - generic [ref=e749]:
                  - generic [ref=e750]:
                    - generic [ref=e751]: سعر المعتمر يبدأ من
                    - generic [ref=e752]: 250,000 دج
                  - generic [ref=e753]:
                    - generic [ref=e754]: التفاصيل والحجز
                    - generic [ref=e755]: ←
              - 'link "الأكثر طلباً وكالة الهدى والنور للسياحة وكالة الهدى والنور للسياحة عمرة التوحيد الصيفية الفاخرة - طيران مباشر مكة: فندق دار الغفران الصفوة 80م عن الحرم المدينة: فندق الأوبروي المدينة 50م عن الحرم 12 يوم (من الجزائر) Saudia سعر المعتمر يبدأ من 390,000 دج التفاصيل والحجز ←" [ref=e756] [cursor=pointer]':
                - /url: /programs/8ca1c2d8-e085-42d4-8fcc-a77f71e0802a
                - generic [ref=e758]: الأكثر طلباً
                - generic [ref=e759]:
                  - button "قارن مع برامج أخرى" [ref=e760]:
                    - img [ref=e761]
                  - button [ref=e767]:
                    - img [ref=e768]
                - generic [ref=e770]:
                  - generic [ref=e771]:
                    - img "وكالة الهدى والنور للسياحة" [ref=e772]
                    - generic [ref=e773]: وكالة الهدى والنور للسياحة
                  - heading "عمرة التوحيد الصيفية الفاخرة - طيران مباشر" [level=3] [ref=e774]
                  - generic [ref=e775]:
                    - generic [ref=e776]:
                      - generic [ref=e777]:
                        - img [ref=e778]
                        - generic [ref=e789]: "مكة: فندق دار الغفران الصفوة"
                      - generic [ref=e790]:
                        - generic [ref=e791]: 80م
                        - generic [ref=e792]: عن الحرم
                    - generic [ref=e793]:
                      - generic [ref=e794]:
                        - img [ref=e795]
                        - generic [ref=e806]: "المدينة: فندق الأوبروي المدينة"
                      - generic [ref=e807]:
                        - generic [ref=e808]: 50م
                        - generic [ref=e809]: عن الحرم
                  - generic [ref=e810]:
                    - generic [ref=e811]:
                      - img [ref=e812]
                      - generic [ref=e817]: 12 يوم (من الجزائر)
                    - generic [ref=e818]:
                      - img [ref=e819]
                      - generic [ref=e821]: Saudia
                - generic [ref=e822]:
                  - generic [ref=e823]:
                    - generic [ref=e824]: سعر المعتمر يبدأ من
                    - generic [ref=e825]: 390,000 دج
                  - generic [ref=e826]:
                    - generic [ref=e827]: التفاصيل والحجز
                    - generic [ref=e828]: ←
            - generic [ref=e829]:
              - generic [ref=e830]:
                - heading "مقارنة برامج العمرة (1)" [level=4] [ref=e831]
                - paragraph [ref=e832]: لقد اخترت برامج للمقارنة. قارن الفنادق والمسافات والأسعار جنباً إلى جنب.
              - generic [ref=e834]:
                - generic [ref=e835]: برنامج العمرة الرمضانية المتميز - خيار اقتصادي
                - button [ref=e836]:
                  - img [ref=e837]
              - generic [ref=e840]:
                - link "قارن الآن" [ref=e841] [cursor=pointer]:
                  - /url: /compare?ids=3cb4bf48-fbc3-470a-82c5-ac4b6067155d
                  - button "قارن الآن" [ref=e842]
                - button "إلغاء" [ref=e843]
    - contentinfo [ref=e844]:
      - generic [ref=e845]:
        - generic [ref=e846]:
          - link "منصة عمرة" [ref=e847] [cursor=pointer]:
            - /url: /
            - img [ref=e848]
            - generic [ref=e855]: منصة عمرة
          - paragraph [ref=e856]: المنصة الأولى المخصصة للجزائريين لتصفح، مقارنة، وفلترة برامج عروض العمرة بكل شفافية. هدفنا ربط المعتمرين بأفضل الوكالات المعتمدة.
        - generic [ref=e857]:
          - heading "روابط سريعة" [level=4] [ref=e858]
          - list [ref=e859]:
            - listitem [ref=e860]:
              - link "الرئيسية وتصفح العروض" [ref=e861] [cursor=pointer]:
                - /url: /
            - listitem [ref=e862]:
              - link "مقارنة برامج العمرة" [ref=e863] [cursor=pointer]:
                - /url: /compare
            - listitem [ref=e864]:
              - link "تسجيل دخول وكالة" [ref=e865] [cursor=pointer]:
                - /url: /login
            - listitem [ref=e866]:
              - link "تسجيل وكالة جديدة" [ref=e867] [cursor=pointer]:
                - /url: /register
        - generic [ref=e868]:
          - heading "شروط وقوانين المنصة" [level=4] [ref=e869]
          - paragraph [ref=e870]: المنصة لا تقبل أي مدفوعات إلكترونية أو عربون مالي. الحجز يتم ببيانات الاتصال ومطابقتها من الإدارة لضمان أمان معاملينا.
          - paragraph [ref=e871]: © 2026 عمرة الجزائر. جميع الحقوق محفوظة.
  - button "Open Next.js Dev Tools" [ref=e877] [cursor=pointer]:
    - img [ref=e878]
  - alert [ref=e882]
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