/**
 * اختبار التحقق من استجابة واجهة برمجة التطبيقات (API) للحجوزات
 * يتحقق من:
 * 1. نجاح إرسال طلب حجز جديد وتوليد رقم حجز فريد (201 Created).
 * 2. التعامل الصحيح مع حالات تعارض المواعيد عند حجز نفس الوقت (409 Conflict).
 * 3. التحقق من الحقول الإلزامية ورفض الطلب عند نقص البيانات (400 Bad Request).
 * 4. التحقق من أيام الإجازات الأسبوعية للعيادة (400 Bad Request).
 */

async function runBookingApiTests() {
  const BASE_URL = process.env.TEST_URL || 'http://localhost:3000/api';
  console.log('--- بدء اختبارات واجهة برمجة التطبيقات لحجوزات العيادة ---');
  console.log(`الهدف: ${BASE_URL}\n`);

  let testsPassed = 0;
  let testsFailed = 0;

  // توليد تاريخ مستقبلي ووقت فريد لكل دورة اختبار لضمان قابلية التكرار
  const randomMins = Math.floor(Math.random() * 50) + 10;
  const randomHour = Math.floor(Math.random() * 3) + 9;
  const testDate = '2026-10-10'; // السبت (يوم عمل)
  const testSlotTime = `${randomHour}:${randomMins} صباحًا (${Date.now() % 10000})`;
  const testPatientPhone = `77${Math.floor(1000000 + Math.random() * 9000000)}`;

  // 1. اختبار إرسال حجز جديد ناجح
  console.log('1. اختبار إرسال طلب حجز جديد صالح:');
  try {
    const res = await fetch(`${BASE_URL}/public/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientName: 'مريض تجريبي - اختبار النجاح',
        phone: testPatientPhone,
        whatsapp: testPatientPhone,
        serviceId: 'srv_digestive',
        visitType: 'كشف جديد',
        preferredDate: testDate,
        preferredShift: 'morning',
        preferredTime: testSlotTime,
        notes: 'طلب كشف واستشارة للمعدة',
      }),
    });

    const data = await res.json();
    if (res.status === 201 && data.success && data.bookingId) {
      console.log('✅ نجح الاختبار: تم إنشاء الحجز بنجاح برقم:', data.bookingId);
      testsPassed++;
    } else {
      console.error('❌ فشل الاختبار: الاستجابة غير متوقعة:', res.status, data);
      testsFailed++;
    }
  } catch (err) {
    console.error('❌ خطأ في الاتصال بالخادم:', err);
    testsFailed++;
  }

  // 2. اختبار تعارض الموعد (نفس التاريخ ونفس التوقيت المحدد)
  console.log('\n2. اختبار محاولة حجز موعد متعارض في نفس الوقت:');
  try {
    const res = await fetch(`${BASE_URL}/public/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientName: 'مريض آخر - محاولة حجز نفس الوقت',
        phone: '779998877',
        serviceId: 'srv_liver',
        visitType: 'استشارة',
        preferredDate: testDate,
        preferredShift: 'morning',
        preferredTime: testSlotTime, // نفس التوقيت السابق المحجوز
      }),
    });

    const data = await res.json();
    if (res.status === 409 && data.conflict === true) {
      console.log('✅ نجح الاختبار: تم اكتشاف التعارض بنجاح وإرجاع رمز الحالة 409 Conflict:');
      console.log('   رسالة الخطأ المعادة:', data.error);
      testsPassed++;
    } else {
      console.error('❌ فشل الاختبار: كان المتوقع كود 409 للتعارض ولكن تم استلام:', res.status, data);
      testsFailed++;
    }
  } catch (err) {
    console.error('❌ خطأ أثناء اختبار التعارض:', err);
    testsFailed++;
  }

  // 3. اختبار التحقق من البيانات المطلوبة (إرسال بدون رقم هاتف)
  console.log('\n3. اختبار التحقق من الحقول الإلزامية (نقص رقم الهاتف):');
  try {
    const res = await fetch(`${BASE_URL}/public/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientName: 'مريض بدون هاتف',
      }),
    });

    const data = await res.json();
    if (res.status === 400 && data.error) {
      console.log('✅ نجح الاختبار: تم رفض الطلب الناقص بنجاح بكود 400 وتوضيح السبب:');
      console.log('   رسالة الخطأ:', data.error);
      testsPassed++;
    } else {
      console.error('❌ فشل الاختبار:', res.status, data);
      testsFailed++;
    }
  } catch (err) {
    console.error('❌ خطأ أثناء اختبار الحقول الإلزامية:', err);
    testsFailed++;
  }

  // 4. اختبار حجز في يوم عطلة العيادة (يوم الجمعة)
  console.log('\n4. اختبار حجز في يوم إجازة أسبوعية (الجمعة 2026-10-09):');
  try {
    const res = await fetch(`${BASE_URL}/public/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientName: 'مريض يوم الجمعة',
        phone: '772223344',
        preferredDate: '2026-10-09', // يوم جمعة
      }),
    });

    const data = await res.json();
    if (res.status === 400 && data.error && data.error.includes('إجازة')) {
      console.log('✅ نجح الاختبار: تم منع الحجز في يوم العطلة الأسبوعية بنجاح بكود 400:');
      console.log('   رسالة الخطأ:', data.error);
      testsPassed++;
    } else {
      console.error('❌ فشل الاختبار:', res.status, data);
      testsFailed++;
    }
  } catch (err) {
    console.error('❌ خطأ أثناء اختبار يوم الإجازة:', err);
    testsFailed++;
  }

  console.log('\n======================================');
  console.log(`إجمالي الاختبارات المكتملة: ${testsPassed + testsFailed}`);
  console.log(`الاختبارات الناجحة: ${testsPassed} ✅`);
  console.log(`الاختبارات الفاشلة: ${testsFailed} ❌`);
  console.log('======================================');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runBookingApiTests();
