# دليل النشر والتشغيل النهائي لمنصة عمرة (OMRA)

هذا الدليل يوضح خطوات إطلاق المنصة للعموم ونشرها على خوادم **Vercel** وربطها بقاعدة بيانات **Supabase** للإنتاج، مع تفعيل منطق المعاملات الجزائري المعتمد يدوياً.

---

## 🗺️ الخطوة 1: تحديث قاعدة بيانات الإنتاج (Supabase)

إذا كانت قاعدة البيانات نشطة ومملوءة بالبيانات مسبقاً، لا تقم بمسحها؛ بل قم بتشغيل سيناريو الترقية المخصص لتفادي أي خطأ كاش في الحقول الجديدة:

1. ادخل إلى لوحة تحكم [Supabase Dashboard](https://supabase.com/).
2. اختر مشروعك ثم توجه إلى قسم **SQL Editor**.
3. افتح تبويباً جديداً وانسخ محتوى الملف المحدّث [migration-custom-commission.sql](file:///d:/OMRA/src/lib/supabase/migration-custom-commission.sql) أو الكود التالي بالكامل:

```sql
-- 1. إزالة عمود العمولة القديم من جدول الأسعار
ALTER TABLE public.program_room_prices DROP COLUMN IF EXISTS commission;

-- 2. إضافة حقول عمولة البالغ والطفل، نوع الرحلة، وسعر الطفل لجدول البرامج
ALTER TABLE public.programs 
ADD COLUMN IF NOT EXISTS adult_commission numeric(12, 2) NOT NULL DEFAULT 0.00 CHECK (adult_commission >= 0);

ALTER TABLE public.programs 
ADD COLUMN IF NOT EXISTS child_commission numeric(12, 2) NOT NULL DEFAULT 0.00 CHECK (child_commission >= 0);

ALTER TABLE public.programs 
ADD COLUMN IF NOT EXISTS flight_type text NOT NULL DEFAULT 'direct' CHECK (flight_type in ('direct', 'transit'));

ALTER TABLE public.programs 
ADD COLUMN IF NOT EXISTS child_price numeric(12, 2) NOT NULL DEFAULT 0.00 CHECK (child_price >= 0);

-- 3. إضافة عدد البالغين والأطفال وقيمة العمولة لجدول الحجوزات
ALTER TABLE public.booking_requests 
ADD COLUMN IF NOT EXISTS adults_count integer NOT NULL DEFAULT 1 CHECK (adults_count >= 1);

ALTER TABLE public.booking_requests 
ADD COLUMN IF NOT EXISTS children_count integer NOT NULL DEFAULT 0 CHECK (children_count >= 0);

ALTER TABLE public.booking_requests 
ADD COLUMN IF NOT EXISTS commission_value numeric(12, 2) CHECK (commission_value >= 0);

-- 4. إضافة الحساب البريدي الجاري وأماكن الفروع وعقد الوكالة لجدول الوكالات
ALTER TABLE public.agencies 
ADD COLUMN IF NOT EXISTS contract_signed boolean NOT NULL DEFAULT false;

ALTER TABLE public.agencies 
ADD COLUMN IF NOT EXISTS ccp_number text;

ALTER TABLE public.agencies 
ADD COLUMN IF NOT EXISTS ccp_holder text;

ALTER TABLE public.agencies 
ADD COLUMN IF NOT EXISTS branches text;
```

4. اضغط على زر **Run** للتنفيذ والتحديث.

---

## 🚀 الخطوة 2: النشر على خوادم Vercel (Production Deployment)

لرفع التطبيق على Vercel ليعمل بالرابط النهائي للمستخدمين:

1. ارفع المشروع إلى مستودع **GitHub** خاص بك (أو قم بعمل Commit ودفع التعديلات الحالية).
2. ادخل إلى حسابك في [Vercel Dashboard](https://vercel.com/) واضغط على **Add New > Project**.
3. قم باستيراد (Import) مستودع المشروع من GitHub.
4. في إعدادات المشروع بـ Vercel، افتح قسم **Environment Variables** وأضف الحقول الثلاثة التالية (ستجد قيمها في إعدادات Supabase > API):
   - `NEXT_PUBLIC_SUPABASE_URL`: رابط قاعدة البيانات.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: المفتاح العام (anon).
   - `SUPABASE_SERVICE_ROLE_KEY`: مفتاح الصلاحيات الإدارية المطلق (Service Role) - *ملاحظة: هذا المفتاح يبقى سرياً بالكامل على الخادم لضمان أمان العمليات والعمولات*.
5. اضغط على **Deploy**. سيقوم Vercel ببناء المشروع تلقائياً وبثه على الويب.

---

## 🤝 الخطوة 3: سير العمل القانوني وتفعيل الوكالات (Admin-Agency Workflow)

بناءً على خصوصية التشغيل لضمان المصداقية وحماية حقوق كل الأطراف:

1. **تسجيل الوكالة:** تسجل الوكالة حسابها عبر رابط المنصة وتدخل رقم رخصتها السياحية وبيانات الاتصال.
2. **حالة معلقة:** يظهر الحساب معلقاً في لوحة الإدارة ولا يمكن للوكالة نشر أي عروض للمواطنين.
3. **توقيع العقد (الكونترا):** يتواصل المشرف مع الوكالة لتوقيع اتفاقية التعاون قانونياً (عبر البريد أو يدوياً) والتي تلتزم فيها الوكالة بنزاهة الأسعار وصحة الفنادق المصرح بها ودفع مستحقات العمولات.
4. **التنشيط والاعتماد الإداري:**
   - يفتح المشرف لوحة تحكم المسؤول ويضغط على **تفعيل الحساب** للوكالة المعنية.
   - يقوم المشرف بتفعيل خيار **"توقيع الاتفاقية والعقد الرسمي"** واعتماد الحساب لتأكيد تنشيط الوكالة.
5. **شارة التوثيق والاعتماد:** فور التفعيل، تظهر شارة شرفية خضراء للمواطنين بصفحة تفاصيل الرحلة ومودال الحجز: **"✓ وكالة معتمدة بعقد رسمي"**؛ مما يعطي دفعة ثقة قوية للمعتمر الجزائري لتقديم بياناته.

---

## 💸 الخطوة 4: منطق الحجوزات والدفع اليدوي (CCP & Cash)

- **الحجز الإلكتروني مجاني ومحمي:** المواطن يملأ بياناته فقط لتأكيد إحالته وحفظ العمولة، المنصة لا تطلب أي دفع بالبطاقة.
- **التواصل والدفع:** تتواصل الوكالة مع الزبون، ويمكنها إظهار فروعها الجغرافية لتقديم الملف يدوياً، أو تزويده برقم الـ CCP الخاص بها (الذي تدخله الوكالة في إعدادات ملفها الشخصي) لإجراء تحويل بريدي آمن.
