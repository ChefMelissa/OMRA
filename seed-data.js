const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local file to extract Supabase URL and service role key
function getEnv() {
  const envPath = path.join(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) {
    throw new Error('.env.local file not found in project root!');
  }
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      env[match[1]] = value.trim();
    }
  });
  return env;
}

async function runSeed() {
  console.log('--- Starting Database Seeding ---');
  
  let env;
  try {
    env = getEnv();
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing from .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  const mockEmails = [
    'mock.agency1@omra.dz',
    'mock.agency2@omra.dz',
    'mock.agency3@omra.dz',
    'mock.agency4@omra.dz',
    'mock.agency5@omra.dz'
  ];

  // 1. Clean up existing mock users from Supabase Auth
  console.log('Cleaning up existing mock users if any...');
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Failed to list users:', listError.message);
    process.exit(1);
  }

  for (const user of users) {
    if (mockEmails.includes(user.email)) {
      console.log(`Deleting existing mock user: ${user.email}`);
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      if (deleteError) {
        console.error(`Failed to delete user ${user.email}:`, deleteError.message);
      }
    }
  }

  // 2. Mock Agencies Data definition
  const agenciesData = [
    {
      email: 'mock.agency1@omra.dz',
      name: 'وكالة الأنوار للأسفار والخدمات',
      license_number: 'L-789/2025',
      description: 'وكالة متخصصة في تنظيم رحلات العمرة الفاخرة والاقتصادية بخدمات راقية وخبرة تفوق 10 سنوات.',
      city: 'الجزائر',
      phone: '021458796',
      whatsapp: '0550123456',
      logo_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=100&q=80',
      commission_rate: 5.0
    },
    {
      email: 'mock.agency2@omra.dz',
      name: 'وكالة الإخلاص للسياحة والأسفار',
      license_number: 'L-123/2024',
      description: 'نسعى لتيسير رحلتكم الإيمانية إلى البقاع المقدسة بأسعار مناسبة وبرامج مدروسة تناسب الجميع.',
      city: 'وهران',
      phone: '041258963',
      whatsapp: '0661234567',
      logo_url: 'https://images.unsplash.com/photo-1579621909532-b3edd7f567b9?auto=format&fit=crop&w=100&q=80',
      commission_rate: 4.5
    },
    {
      email: 'mock.agency3@omra.dz',
      name: 'وكالة نسائم مكة لخدمات العمرة',
      license_number: 'L-456/2024',
      description: 'خدمتكم شرف لنا. نرافقكم خطوة بخطوة لأداء مناسك العمرة بكل طمأنينة وراحة بال.',
      city: 'قسنطينة',
      phone: '031478521',
      whatsapp: '0770321456',
      logo_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=100&q=80',
      commission_rate: 5.0
    },
    {
      email: 'mock.agency4@omra.dz',
      name: 'وكالة الهدى والنور للسياحة',
      license_number: 'L-321/2025',
      description: 'برامج عمرة متميزة مع رحلات مباشرة وفنادق قريبة جداً من الحرمين الشريفين وبأسعار تنافسية.',
      city: 'سطيف',
      phone: '036859471',
      whatsapp: '0561987654',
      logo_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=100&q=80',
      commission_rate: 4.0
    },
    {
      email: 'mock.agency5@omra.dz',
      name: 'وكالة سبيل الرشاد للأسفار',
      license_number: 'L-987/2025',
      description: 'شعارنا الصدق والأمانة. عروض عمرة متنوعة تناسب العائلات والأفراد طيلة فترات السنة.',
      city: 'باتنة',
      phone: '033857412',
      whatsapp: '0655887766',
      logo_url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=100&q=80',
      commission_rate: 5.0
    }
  ];

  const createdAgencies = [];

  // Create agencies in the database
  for (const agencyInfo of agenciesData) {
    console.log(`Creating auth user for agency: ${agencyInfo.email}...`);
    
    // Create auth user
    const { data: userData, error: authError } = await supabase.auth.admin.createUser({
      email: agencyInfo.email,
      password: 'password123',
      email_confirm: true
    });

    if (authError) {
      console.error(`Failed to create auth user for ${agencyInfo.email}:`, authError.message);
      continue;
    }

    const userId = userData.user.id;
    console.log(`Created user ID: ${userId}. Creating profile & agency entries...`);

    // Ensure profiles table has it (the trigger should do this, but we run an upsert for safety)
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ id: userId, role: 'agency' });

    if (profileError) {
      console.error(`Failed to upsert profile for ${agencyInfo.email}:`, profileError.message);
      continue;
    }

    // Insert into agencies table
    const { error: agencyInsertError } = await supabase
      .from('agencies')
      .insert({
        id: userId,
        name: agencyInfo.name,
        license_number: agencyInfo.license_number,
        description: agencyInfo.description,
        city: agencyInfo.city,
        phone: agencyInfo.phone,
        whatsapp: agencyInfo.whatsapp,
        email: agencyInfo.email,
        logo_url: agencyInfo.logo_url,
        status: 'approved', // Automatically approve mock agencies for testing
        commission_rate: agencyInfo.commission_rate
      });

    if (agencyInsertError) {
      console.error(`Failed to insert agency details for ${agencyInfo.name}:`, agencyInsertError.message);
      continue;
    }

    createdAgencies.push({ id: userId, ...agencyInfo });
  }

  if (createdAgencies.length < 5) {
    console.warn('Warning: Some agencies could not be created. Mock programs might be fewer.');
  }

  console.log(`Successfully created ${createdAgencies.length} approved agencies.`);

  // 3. Mock Programs Data definition (10 programs total, 2 per agency)
  const programsData = [
    // Agency 1
    {
      agencyIndex: 0,
      title: 'برنامج العمرة الرمضانية المتميز - خيار اقتصادي',
      description: 'رحلة عمرة مباركة في العشر الأواخر. رحلة مباشرة، فنادق مريحة وبخدمات مميزة.',
      duration_days: 15,
      departure_date: '2026-06-20',
      return_date: '2026-07-05',
      departure_city: 'الجزائر',
      airline: 'Air Algérie',
      seats_available: 28,
      status: 'active',
      hotels: [
        { city: 'مكة', hotel_name: 'فندق برج الكسوة', stars: 3, distance_meters: 900, nights: 10, board_basis: 'بدون وجبات' },
        { city: 'المدينة', hotel_name: 'فندق منازل المهاجرين', stars: 3, distance_meters: 250, nights: 4, board_basis: 'فطور الصباح' }
      ],
      prices: [
        { room_type: 'ثنائية', price: 215000 },
        { room_type: 'ثلاثية', price: 195000 },
        { room_type: 'رباعية', price: 175000 }
      ],
      inclusions: ['تأشيرة العمرة', 'تذاكر الطيران ذهاب وإياب', 'النقل بحافلات حديثة ومكيفة', 'المزارات بالمدينة المنورة']
    },
    {
      agencyIndex: 0,
      title: 'برنامج عمرة النخبة - VIP مباشرة',
      description: 'عمرة ممتازة بفنادق 5 نجوم على ساحة الحرم المكي الشريف، مع وجبة فطور الصباح بوفيه مفتوح طيلة الإقامة.',
      duration_days: 12,
      departure_date: '2026-07-05',
      return_date: '2026-07-17',
      departure_city: 'الجزائر',
      airline: 'Saudia',
      seats_available: 15,
      status: 'active',
      hotels: [
        { city: 'مكة', hotel_name: 'فندق سويس أوتيل المقام', stars: 5, distance_meters: 100, nights: 8, board_basis: 'فطور الصباح' },
        { city: 'المدينة', hotel_name: 'فندق دار الإيمان إنتركونتيننتال', stars: 5, distance_meters: 50, nights: 3, board_basis: 'فطور الصباح' }
      ],
      prices: [
        { room_type: 'ثنائية', price: 420000 },
        { room_type: 'ثلاثية', price: 380000 },
        { room_type: 'رباعية', price: 340000 }
      ],
      inclusions: ['تأشيرة العمرة VIP', 'تذاكر الطيران (الجزائر - جدة - المدينة - الجزائر)', 'النقل بسيارات خاصة VIP', 'المزارات والإرشاد الديني', 'بوفيه مفتوح فطور الصباح']
    },

    // Agency 2
    {
      agencyIndex: 1,
      title: 'عمرة السكينة والاقتصاد - فنادق قريبة وممتازة',
      description: 'رحلة عمرة تجمع بين السعر الاقتصادي والقرب من الحرم المكي. مثالية للعائلات والمجموعات.',
      duration_days: 15,
      departure_date: '2026-06-25',
      return_date: '2026-07-10',
      departure_city: 'وهران',
      airline: 'Air Algérie',
      seats_available: 35,
      status: 'active',
      hotels: [
        { city: 'مكة', hotel_name: 'فندق إعمار الأندلسية', stars: 3, distance_meters: 650, nights: 10, board_basis: 'بدون وجبات' },
        { city: 'المدينة', hotel_name: 'فندق ديار المدينة', stars: 3, distance_meters: 200, nights: 4, board_basis: 'فطور الصباح' }
      ],
      prices: [
        { room_type: 'ثنائية', price: 230000 },
        { room_type: 'ثلاثية', price: 210000 },
        { room_type: 'رباعية', price: 190000 }
      ],
      inclusions: ['التأشيرة السياحية للتنقل', 'تذكرة الطيران المباشر من وهران', 'التأطير الطبي والإرشاد الفقهي لمناسك العمرة', 'النقل بحافلات مرسيدس مريحة']
    },
    {
      agencyIndex: 1,
      title: 'برنامج عمرة الصيف العائلي - خيار الـ 4 نجوم',
      description: 'برنامج عمرة عائلي بفنادق ممتازة من فئة 4 نجوم في مكة المكرمة والمدينة المنورة. مواعيد مناسبة جداً خلال العطلة الصيفية.',
      duration_days: 21,
      departure_date: '2026-07-15',
      return_date: '2026-08-05',
      departure_city: 'وهران',
      airline: 'Turkish Airlines',
      seats_available: 20,
      status: 'active',
      hotels: [
        { city: 'مكة', hotel_name: 'فندق أنوار الضيافة', stars: 4, distance_meters: 450, nights: 15, board_basis: 'نصف إقامة' },
        { city: 'المدينة', hotel_name: 'فندق المركزية الذهبي', stars: 4, distance_meters: 150, nights: 5, board_basis: 'نصف إقامة' }
      ],
      prices: [
        { room_type: 'ثنائية', price: 310000 },
        { room_type: 'ثلاثية', price: 280000 },
        { room_type: 'رباعية', price: 250000 }
      ],
      inclusions: ['تأشيرة الدخول الإلكترونية سريعة الإجراء', 'تذكرة الطيران غير المباشر عبر إسطنبول', 'النقل الكامل المريح', 'وجبتي فطور الصباح وعشاء بوفيه مفتوح', 'زيارة الأماكن التاريخية والمقدسة في مكة والمدينة']
    },

    // Agency 3
    {
      agencyIndex: 2,
      title: 'برنامج عمرة البركة لربيع 2026 - مباشر قسنطينة',
      description: 'رحلة إيمانية مباشرة من قسنطينة إلى المدينة المنورة، للتقليل من مشقة السفر على كبار السن.',
      duration_days: 15,
      departure_date: '2026-06-28',
      return_date: '2026-07-13',
      departure_city: 'قسنطينة',
      airline: 'Saudia',
      seats_available: 40,
      status: 'active',
      hotels: [
        { city: 'مكة', hotel_name: 'فندق ميريديان أبراج مكة', stars: 5, distance_meters: 1200, nights: 10, board_basis: 'بدون وجبات' }, // 5 star but far
        { city: 'المدينة', hotel_name: 'فندق الشرفات الذهبية', stars: 3, distance_meters: 300, nights: 4, board_basis: 'بدون وجبات' }
      ],
      prices: [
        { room_type: 'ثنائية', price: 250000 },
        { room_type: 'ثلاثية', price: 225000 },
        { room_type: 'رباعية', price: 205000 }
      ],
      inclusions: ['التأشيرة والتأمين الطبي الشامل للكورونا والحوادث', 'تذكرة طيران الخطوط السعودية المباشرة', 'توصيل مجاني للحرم 24 ساعة حافلات التردد المفتوح', 'المزارات والمحاضرات الدينية التثقيفية للرجال والنساء']
    },
    {
      agencyIndex: 2,
      title: 'عمرة التيسير الفاخرة - مباشر قسنطينة',
      description: 'برنامج مميز لأداء العمرة بأسعار معقولة وفندق 5 نجوم مطل على الكعبة الشريفة في برج زمزم.',
      duration_days: 15,
      departure_date: '2026-07-10',
      return_date: '2026-07-25',
      departure_city: 'قسنطينة',
      airline: 'Air Algérie',
      seats_available: 18,
      status: 'active',
      hotels: [
        { city: 'مكة', hotel_name: 'فندق أبراج مريديان زمزم', stars: 5, distance_meters: 100, nights: 9, board_basis: 'فطور الصباح' },
        { city: 'المدينة', hotel_name: 'فندق دلة طيبة', stars: 4, distance_meters: 100, nights: 5, board_basis: 'فطور الصباح' }
      ],
      prices: [
        { room_type: 'ثنائية', price: 380000 },
        { room_type: 'ثلاثية', price: 345000 },
        { room_type: 'رباعية', price: 315000 }
      ],
      inclusions: ['التأشيرة وبطاقة الحجز الإلكتروني', 'طيران مباشر مع طيران الجزائر', 'فطور بوفيه فاخر بالفنادق المذكورة', 'النقل بحافلات لكزس 2025 مكيفة وكاملة الخدمات']
    },

    // Agency 4
    {
      agencyIndex: 3,
      title: 'برنامج عمرة الاقتصاد والراحة - سطيف',
      description: 'تنظيم محكم لرحلات العمرة بتأطير ديني ممتاز من مرشدي الوكالة، مع مرافقة طبية طيلة أيام الرحلة.',
      duration_days: 15,
      departure_date: '2026-06-30',
      return_date: '2026-07-15',
      departure_city: 'الجزائر',
      airline: 'Turkish Airlines',
      seats_available: 30,
      status: 'active',
      hotels: [
        { city: 'مكة', hotel_name: 'فندق نوازي الوثير', stars: 3, distance_meters: 800, nights: 10, board_basis: 'بدون وجبات' },
        { city: 'المدينة', hotel_name: 'فندق دار السلام الجديد', stars: 3, distance_meters: 280, nights: 4, board_basis: 'بدون وجبات' }
      ],
      prices: [
        { room_type: 'ثنائية', price: 198000 },
        { room_type: 'ثلاثية', price: 182000 },
        { room_type: 'رباعية', price: 168000 }
      ],
      inclusions: ['استخراج تأشيرة العمرة وتغطية تأمينية كاملة', 'تذاكر طيران رحلة الخطوط التركية', 'توزيع مياه زمزم وهدايا تذكارية للمعتمرين']
    },
    {
      agencyIndex: 3,
      title: 'عمرة التوحيد الصيفية الفاخرة - طيران مباشر',
      description: 'باقة مميزة جداً تشمل السكن في فنادق قريبة بساحة الحرم ومثالية لكبار السن والعائلات الحريصة على القرب الشديد.',
      duration_days: 12,
      departure_date: '2026-07-20',
      return_date: '2026-08-01',
      departure_city: 'الجزائر',
      airline: 'Saudia',
      seats_available: 14,
      status: 'active',
      hotels: [
        { city: 'مكة', hotel_name: 'فندق دار الغفران الصفوة', stars: 5, distance_meters: 80, nights: 8, board_basis: 'إقامة كاملة' },
        { city: 'المدينة', hotel_name: 'فندق الأوبروي المدينة', stars: 5, distance_meters: 50, nights: 3, board_basis: 'إقامة كاملة' }
      ],
      prices: [
        { room_type: 'ثنائية', price: 460000 },
        { room_type: 'ثلاثية', price: 420000 },
        { room_type: 'رباعية', price: 390000 }
      ],
      inclusions: ['التأشيرات السريعة والخدمات المميزة في المطارات', 'تذكرة الطيران المباشرة درجة سياحية أولى', 'فطور غداء وعشاء بوفيه مفتوح بالفندقين', 'النقل الحصري بسيارات الكامري والجمس الحديثة للوكالة']
    },

    // Agency 5
    {
      agencyIndex: 4,
      title: 'عمرة البهجة والاقتصاد - مباشر باتنة',
      description: 'رحلة اقتصادية تنطلق من مطار مصطفى بن بولعيد بباتنة، مناسبة جداً لسكان ولايات الشرق الجزائري.',
      duration_days: 15,
      departure_date: '2026-06-22',
      return_date: '2026-07-07',
      departure_city: 'باتنة',
      airline: 'Air Algérie',
      seats_available: 45,
      status: 'active',
      hotels: [
        { city: 'مكة', hotel_name: 'فندق ديار المشاعر', stars: 3, distance_meters: 950, nights: 11, board_basis: 'بدون وجبات' },
        { city: 'المدينة', hotel_name: 'فندق ريحانة السكينة', stars: 3, distance_meters: 300, nights: 3, board_basis: 'بدون وجبات' }
      ],
      prices: [
        { room_type: 'ثنائية', price: 189000 },
        { room_type: 'ثلاثية', price: 174000 },
        { room_type: 'رباعية', price: 159000 },
        { room_type: 'خماسية', price: 149000 }
      ],
      inclusions: ['التأشيرة وبطاقة المعتمر الرسمية', 'تذاكر طيران الخطوط الجوية الجزائرية مباشر', 'مرافقة دينية وطبية طيلة الرحلة', 'زيارة غار حراء وغار ثور والمشاعر المقدسة بالباص']
    },
    {
      agencyIndex: 4,
      title: 'برنامج عمرة الأمل المريح - فنادق 4 نجوم',
      description: 'برنامج مميز يضمن السكن في فنادق 4 نجوم مع توفير خدمة التوصيل المستمرة مجاناً للحرمين الشريفين.',
      duration_days: 15,
      departure_date: '2026-07-08',
      return_date: '2026-07-23',
      departure_city: 'باتنة',
      airline: 'Air Algérie',
      seats_available: 22,
      status: 'active',
      hotels: [
        { city: 'مكة', hotel_name: 'فندق روتانا المسك', stars: 4, distance_meters: 550, nights: 10, board_basis: 'بدون وجبات' },
        { city: 'المدينة', hotel_name: 'فندق طابة السلام', stars: 4, distance_meters: 220, nights: 4, board_basis: 'فطور الصباح' }
      ],
      prices: [
        { room_type: 'ثنائية', price: 245000 },
        { room_type: 'ثلاثية', price: 225000 },
        { room_type: 'رباعية', price: 205000 }
      ],
      inclusions: ['تأشيرة الدخول الإلكترونية والتأمين الشامل', 'تذاكر السفر طائرة مباشرة ذهاب وإياب', 'النقل الخاص بالوكالة', 'المزارات المعتادة وجولة سياحية لأبرز معالم المدينة المنورة']
    }
  ];

  console.log('Inserting mock programs...');

  for (const prog of programsData) {
    const agency = createdAgencies[prog.agencyIndex];
    if (!agency) {
      console.warn(`Skipping program "${prog.title}" because the corresponding agency was not created.`);
      continue;
    }

    console.log(`Inserting program: "${prog.title}" under agency: "${agency.name}"...`);

    // 1. Insert program
    const { data: progData, error: progError } = await supabase
      .from('programs')
      .insert({
        agency_id: agency.id,
        title: prog.title,
        description: prog.description,
        duration_days: prog.duration_days,
        departure_date: prog.departure_date,
        return_date: prog.return_date,
        departure_city: prog.departure_city,
        airline: prog.airline,
        seats_available: prog.seats_available,
        status: prog.status
      })
      .select()
      .single();

    if (progError) {
      console.error(`Failed to insert program "${prog.title}":`, progError.message);
      continue;
    }

    const programId = progData.id;

    // 2. Insert hotels
    for (const hotel of prog.hotels) {
      const { error: hotelError } = await supabase
        .from('program_hotels')
        .insert({
          program_id: programId,
          city: hotel.city,
          hotel_name: hotel.hotel_name,
          stars: hotel.stars,
          distance_meters: hotel.distance_meters,
          nights: hotel.nights,
          board_basis: hotel.board_basis
        });
      if (hotelError) {
        console.error(`Failed to insert hotel for program ${programId}:`, hotelError.message);
      }
    }

    // 3. Insert room prices
    for (const pr of prog.prices) {
      const { error: priceError } = await supabase
        .from('program_room_prices')
        .insert({
          program_id: programId,
          room_type: pr.room_type,
          price: pr.price
        });
      if (priceError) {
        console.error(`Failed to insert price for program ${programId}:`, priceError.message);
      }
    }

    // 4. Insert inclusions
    for (const inc of prog.inclusions) {
      const { error: incError } = await supabase
        .from('program_inclusions')
        .insert({
          program_id: programId,
          inclusion: inc
        });
      if (incError) {
        console.error(`Failed to insert inclusion for program ${programId}:`, incError.message);
      }
    }
  }

  console.log('--- Database Seeding Completed Successfully! ---');
  process.exit(0);
}

runSeed();
