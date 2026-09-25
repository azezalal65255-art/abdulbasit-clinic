import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  DatabaseSchema,
  User,
  DoctorProfile,
  MedicalServiceItem,
  ConditionCategoryItem,
  MedicalConditionItem,
  EndoscopyItem,
  ArticleItem,
  FaqItemRecord,
  BookingRecord,
  MessageRecord,
  ScheduleSettings,
  ContactSettings,
  MediaItem,
  CustomPageItem,
  SeoSettings,
  SiteSettings,
  NotificationItem,
  ActivityLogItem,
  AnalyticsData,
  UserRole,
  ClinicVideoItem,
  CareerItem,
  JobApplicationRecord,
  ConferenceItem,
  ResearchItem,
  SliderItem,
} from './types';
import {
  DATA_DIR,
  BACKUP_DIR,
  ensureDirectories,
  sanitizeAndPersistMediaUrls,
  UPLOADS_DIR,
} from './storageUtils';
import { MEDICAL_CONDITIONS, ENDOSCOPY_PROCEDURES } from '../src/data/clinicData';

const DB_FILE = path.join(DATA_DIR, 'clinic-database.json');
const DB_BACKUP_FILE = path.join(DATA_DIR, 'clinic-database.backup.json');

// Helper to hash password
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_dr_baset_salt_2026').digest('hex');
}

export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

function getDefaultDatabase(): DatabaseSchema {
  const defaultUsers: User[] = [
    {
      id: 'usr_super_admin',
      email: 'admin@clinic.com',
      name: 'د. عبدالباسط مقبل (المدير العام)',
      role: 'super_admin',
      passwordHash: hashPassword('admin123456'),
      phone: '777554626',
      isActive: true,
      createdAt: '2026-01-01T08:00:00.000Z',
    },
    {
      id: 'usr_admin',
      email: 'manager@clinic.com',
      name: 'إدارة العيادة',
      role: 'admin',
      passwordHash: hashPassword('manager123456'),
      phone: '777560603',
      isActive: true,
      createdAt: '2026-01-02T08:00:00.000Z',
    },
    {
      id: 'usr_receptionist',
      email: 'receptionist@clinic.com',
      name: 'الاستقبال وحجز المواعيد',
      role: 'receptionist',
      passwordHash: hashPassword('recep123456'),
      phone: '777554626',
      isActive: true,
      createdAt: '2026-01-03T08:00:00.000Z',
    },
    {
      id: 'usr_content',
      email: 'content@clinic.com',
      name: 'مسؤول التحرير والمحتوى الطبي',
      role: 'content_manager',
      passwordHash: hashPassword('content123456'),
      phone: '777554626',
      isActive: true,
      createdAt: '2026-01-04T08:00:00.000Z',
    },
  ];

  const defaultDoctor: DoctorProfile = {
    name: 'د. عبدالباسط عبده الحاج مقبل',
    title: 'استشاري الباطنة والجهاز الهضمي والكبد والمناظير',
    jobTitle: 'استشاري أول ورئيس وحدة الجهاز الهضمي والكبد والمناظير',
    bio: 'استشاري متخصص في تشخيص وعلاج أمراض الجهاز الهضمي وأمراض الكبد المزمنة وإجراء مناظير المعدة والقولون التشخيصية والعلاجية، حاصل على الماجستير والدكتوراه من كلية الطب بجامعة القاهرة (قصر العيني). يكرس خبرته السريرية الطويلة لتقديم رعاية طبية دقيقة ومبنية على أحدث البراهين والبروتوكولات العالمية.',
    photo: 'https://rmvhgoewsegyohdbsjsd.supabase.co/storage/v1/object/public/media/images/dr-abdulbasit.jpg',
    experiences: [
      'خبرة سريرية وأكاديمية متقدمة في أمراض الجهاز الهضمي والكبد',
      'إجراء آلاف المناظير التشخيصية والعلاجية للمعدة والقولون بنسب أمان ونجاح عالية',
      'تدريب تخصصي وبحثي مكثف في مستشفيات جامعة القاهرة وقصر العيني',
      'متابعة الحالات المعقدة لأمراض الكبد الفيروسية والدهنية والمناعية',
    ],
    qualifications: [
      {
        id: 'q1',
        degree: 'بكالوريوس طب عام وجراحة',
        institution: 'جامعة ذمار',
        description: 'الأساس الأكاديمي والسريري المتين في الطب العام والجراحة السريرية.',
        iconType: 'academic',
        order: 1,
      },
      {
        id: 'q2',
        degree: 'ماجستير جهاز هضمي وكبد ومناظير',
        institution: 'كلية الطب – جامعة القاهرة (قصر العيني)',
        description: 'تدريب سريري ومخبري وتطبيقي متقدم في أمراض الجهاز الهضمي وأمراض الكبد والمناظير التشخيصية.',
        iconType: 'specialist',
        order: 2,
      },
      {
        id: 'q3',
        degree: 'دكتوراه في الباطنة وأمراض الجهاز الهضمي والكبد والأمراض المعدية',
        institution: 'جامعة القاهرة',
        description: 'أعلى درجة علمية تخصصية تشمل أحدث البروتوكولات العلاجية العالمية وأبحاث أمراض الجهاز الهضمي والكبد المتقدمة.',
        iconType: 'doctorate',
        order: 3,
      },
      {
        id: 'q4',
        degree: 'دراسة مناظير الجهاز الهضمي المتقدمة',
        institution: 'المراكز التخصصية المعتمدة للتدريب المنظاري',
        description: 'خبرة تقنية متخصصة في مناظير المعدة والقولون التشخيصية والعلاجية وأخذ الخزعات الدقيقة.',
        iconType: 'advanced',
        order: 4,
      },
    ],
  };

  const defaultServices: MedicalServiceItem[] = [
    {
      id: 'srv_liver',
      title: 'أمراض الكبد',
      slug: 'liver-diseases',
      description: 'تشخيص ومتابعة أمراض الكبد والتهابات الكبد وارتفاع إنزيمات الكبد والكبد الدهني وغيرها من الحالات المتعلقة بالكبد.',
      fullDescription: 'نقدم تقييماً شاملاً لجميع اعتلالات الكبد الحادة والمزمنة، بما في ذلك الكبد الدهني، والتليف الكبدي، والتهابات الكبد الفيروسية (B و C)، مع بروتوكولات دوائية ومتابعة دورية منتظمة لوظائف الكبد ومستويات الإنزيمات.',
      iconName: 'Activity',
      image: '/images/med_photo_ultrasound_liver_1790359449355.jpg',
      features: [
        'تشخيص وعلاج الكبد الدهني واضطرابات الدهون',
        'متابعة ارتفاع إنزيمات الكبد المزمن والحاد',
        'علاج ومتابعة التهابات الكبد الفيروسية والمناعية',
        'الفحص الدوري لوظائف وخلايا الكبد',
      ],
      metaTitle: 'تشخيص وعلاج أمراض الكبد | عيادة د. عبدالباسط مقبل',
      metaDescription: 'رعاية تخصصية لمرضى الكبد الدهني وارتفاع إنزيمات الكبد والتهابات الكبد الفيروسية في صنعاء.',
      isActive: true,
      order: 1,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'srv_digestive',
      title: 'أمراض الجهاز الهضمي',
      slug: 'digestive-diseases',
      description: 'تشخيص ومتابعة اضطرابات الجهاز الهضمي والمعدة والمريء والقولون والأمعاء.',
      fullDescription: 'علاج متكامل لمشاكل الجهاز الهضمي العلوي والسفلي، بدءاً من جرثومة المعدة المقاومة وقرحة الاثني عشر، ووصولاً إلى متلازمة القولون العصبي وحساسية القمح وعسر الهضم الوظيفي.',
      iconName: 'Stethoscope',
      image: '/images/med_photo_stomach_ache_1790359401032.jpg',
      features: [
        'علاج ارتجاع المريء وحموضة المعدة المزمنة',
        'تشخيص وعلاج جرثومة المعدة (H. Pylori)',
        'علاج القولون العصبي واضطرابات الهضم والغازات',
        'متابعة قرحة المعدة والاثني عشر واضطرابات الامتصاص',
      ],
      metaTitle: 'أمراض الجهاز الهضمي والمعدة والقولون | د. عبدالباسط مقبل',
      metaDescription: 'تشخيص دقيق وعلاج حاسم لجرثومة المعدة، القولون العصبي، وارتجاع المريء بصنعاء.',
      isActive: true,
      order: 2,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'srv_internal',
      title: 'أمراض الباطنة العامة',
      slug: 'internal-medicine',
      description: 'تقييم وتشخيص ومتابعة الحالات المرتبطة بالأمراض الباطنية المعقدة والمزمنة.',
      fullDescription: 'فحص سريري واستقصائي شامل للأمراض الباطنية وتفاعلاتها مع الجهاز الهضمي، مثل فقر الدم غير المفسر، ونقص الفيتامينات، وأمراض المناعة الذاتية، ومضاعفات الأدوية المزمنة.',
      iconName: 'HeartHandshake',
      image: '/images/med_photo_clinic_desk_steth_1790359496141.jpg',
      features: [
        'الفحص الشامل للحالات الباطنية العامة',
        'تقييم أسباب فقر الدم غير المبرر ونقص الفيتامينات',
        'متابعة الأمراض الباطنية المزمنة المرتبطة بالجهاز الهضمي',
        'تشخيص الحمى غير المحددة والأمراض المعدية المرتبطة بالبطن',
      ],
      metaTitle: 'استشارات الأمراض الباطنية العامة | د. عبدالباسط مقبل',
      metaDescription: 'استشارات باطنية تخصصية وفحص دقيق للحالات المزمنة في صنعاء.',
      isActive: true,
      order: 3,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'srv_gastroscopy',
      title: 'منظار المعدة التشخيصي والعلاجي',
      slug: 'gastroscopy-procedure',
      description: 'فحص بصري دقيق للمريء والمعدة والاثني عشر بأحدث مناظير الفيديو عالية الدقة.',
      fullDescription: 'إجراء منظار المعدة بكاميرا فائقة الوضوح للكشف عن القرح، الالتهابات، جرثومة المعدة، والنزيف، تحت مهدئ خفيف ومخدر موضعي لراحة تامة للمريض خلال 10 دقائق.',
      iconName: 'Eye',
      image: '/images/med_photo_endoscopy_tower_1790359425401.jpg',
      features: [
        'فحص دقيق لجدار المريء والمعدة والاثني عشر',
        'الكشف المباشر عن القرح والالتهابات والنزيف',
        'أخذ خزعات خالية من الألم لتحليل الجرثومة والأنسجة',
        'إجراء مريح وسريع تحت مهدئ لطيف',
      ],
      metaTitle: 'منظار المعدة التشخيصي | عيادة د. عبدالباسط مقبل',
      metaDescription: 'إجراء منظار المعدة في صنعاء بدقة متناهية وبدون ألم مع د. عبدالباسط مقبل.',
      isActive: true,
      order: 4,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'srv_colonoscopy',
      title: 'منظار القولون التشخيصي',
      slug: 'colonoscopy-procedure',
      description: 'فحص القولون والمستقيم للكشف المبكر عن الزوائد اللحمية والتهابات الأمعاء المزمنة.',
      fullDescription: 'تنظير تخصصي كامل للقولون لتقييم حالات الإسهال أو الإمساك المزمن والنزيف الهضمي، واستئصال الزوائد اللحمية وقائياً لمنع تحولها إلى أورام.',
      iconName: 'ShieldAlert',
      image: '/images/med_photo_colonoscope_room_1790359436716.jpg',
      features: [
        'الكشف المبكر عن زوائد القولون واستئصالها',
        'تشخيص التهاب القولون التقرحي ومرض كرون',
        'استقصاء أسباب النزيف السفلي وفقر الدم الحاد',
        'تقنيات متقدمة تضمن أقصى معايير التعقيم والسلامة',
      ],
      metaTitle: 'منظار القولون التشخيصي | د. عبدالباسط مقبل صنعاء',
      metaDescription: 'فحص متقدم للقولون والمستقيم بأحدث المناظير في مركز المأمون الطبي.',
      isActive: true,
      order: 5,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'srv_biopsy',
      title: 'أخذ الخزعات وفحص الأنسجة',
      slug: 'endoscopic-biopsy',
      description: 'أخذ عينات مجهرية دقيقة دون أي ألم أثناء إجراء المنظار للتحليل الباثولوجي.',
      fullDescription: 'أخذ عينات نسيجية مجهرية من بطانة المعدة أو القولون بواسطة ملقط منظاري دقيق، لإرسالها للفحص الباثولوجي وتأكيد تشخيص حساسية القمح أو جرثومة المعدة بدقة مخبرية متناهية.',
      iconName: 'Layers',
      image: '/images/med_photo_biopsy_microscope_1790359460826.jpg',
      features: [
        'عينات دقيقة بأمان وعناية فائقة',
        'تأكيد تشخيص حساسية القمح (السيلياك)',
        'فحص نشاط جرثومة المعدة والتغيرات الخلوية',
        'تقرير مخبري باثولوجي معتمد ومفصل',
      ],
      metaTitle: 'أخذ الخزعات المنظارية وتحليل الأنسجة | د. عبدالباسط مقبل',
      metaDescription: 'فحص مجهري دقيق لعينات الأنسجة وخزعات الجهاز الهضمي في صنعاء.',
      isActive: true,
      order: 6,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  const defaultCategories: ConditionCategoryItem[] = [
    {
      id: 'cat_gastro',
      slug: 'gastroenterology',
      name: 'أمراض الجهاز الهضمي',
      description: 'تشخيص وعلاج أمراض المريء، المعدة، القولون، والاثني عشر',
      order: 1,
      isActive: true,
    },
    {
      id: 'cat_liver',
      slug: 'liver',
      name: 'أمراض الكبد والصفراء',
      description: 'متابعة وعلاج الكبد الدهني، ارتفاع الإنزيمات، والتهابات الكبد',
      order: 2,
      isActive: true,
    },
    {
      id: 'cat_internal',
      slug: 'internal-medicine',
      name: 'أمراض الباطنية والمزمنة',
      description: 'رعاية باطنية شاملة، متابعة السكري والضغط والأمراض المزمنة',
      order: 3,
      isActive: true,
    },
    {
      id: 'cat_endoscopy',
      slug: 'endoscopy',
      name: 'مناظير الجهاز الهضمي',
      description: 'مناظير المعدة والقولون التشخيصية والعلاجية واستئصال اللحميات',
      order: 4,
      isActive: true,
    },
  ];

  const defaultConditions: MedicalConditionItem[] = MEDICAL_CONDITIONS.map((c, index) => ({
    id: c.id,
    name: c.name,
    slug: c.id,
    category: c.category as any,
    icon: c.icon,
    description: c.description,
    shortDescription: c.shortSummary || c.description,
    definition: c.description,
    symptoms: c.symptoms,
    treatmentApproach: c.treatmentApproach,
    image: c.image,
    imageUrl: c.image,
    isActive: true,
    order: index + 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  }));

  const defaultEndoscopy: EndoscopyItem[] = ENDOSCOPY_PROCEDURES.map((e, index) => ({
    id: e.id,
    title: e.title,
    slug: e.id,
    description: e.description,
    image: e.image,
    imageUrl: e.image,
    indications: e.indications,
    duration: e.duration,
    prepSummary: e.prepSummary,
    preInstructions: [],
    postInstructions: [],
    isActive: true,
    order: index + 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  }));

  const defaultArticles: ArticleItem[] = [
    {
      id: 'art_1',
      title: 'ألم المعدة بعد الأكل... ما الأسباب؟',
      slug: 'stomach-pain-after-eating',
      excerpt: 'تعرف على أبرز الأسباب الشائعة للشعور بالألم أو الثقل بعد تناول الوجبات ومتى يجب استشارة الطبيب المختص.',
      content: `يعتبر ألم المعدة بعد تناول الطعام من الشكاوى المتكررة التي يراجع بها المرضى عيادة الجهاز الهضمي. قد يظهر هذا الألم على شكل حرقة، تقلصات، أو شعور بالامتلاء الشديد والثقل.

أهم الأسباب الشائعة تشمل:
1. التهاب بطانة المعدة أو وجود قرحة معدية، حيث يثير احتكاك الطعام أو إفراز الحمض النسيج الملتهب.
2. جرثومة المعدة (H. Pylori) كسبب رئيسي وراء استمرار هذه الآلام والالتهابات المتكررة.
3. اضطرابات المرارة وحصوات القنوات الصفراوية التي تزداد حدتها عقب تناول وجبات غنية بالدهون.
4. متلازمة القولون العصبي وعسر الهضم الوظيفي.

نصيحة الطبيب:
إذا كان الألم مصحوبًا بصعوبة في البلع، فقدان غير مبرر للوزن، أو تكرار القيء، يجب عدم التردد في إجراء فحص سريري وتقييم منظاري دقيق لتحديد السبب وبدء العلاج المناسب.`,
      category: 'أمراض الجهاز الهضمي',
      author: 'د. عبدالباسط عبده الحاج مقبل',
      readTime: '3 دقائق',
      date: '2026-02-15',
      image: '/images/real_stomach_exam_1790357472966.jpg',
      tags: ['المعدة', 'عسر الهضم', 'جرثومة المعدة', 'حموضة'],
      keywords: ['ألم المعدة بعد الأكل', 'علاج جرثومة المعدة صنعاء', 'أعراض قرحة المعدة', 'حموضة المعدة', 'استشاري جهاز هضمي صنعاء'],
      metaTitle: 'ألم المعدة بعد الأكل: الأسباب والتشخيص والعلاج | د. عبدالباسط مقبل',
      metaDescription: 'دليل طبي شامل يوضح أسباب ألم وحرقة المعدة بعد الأكل ومتى يستلزم الأمر منظاراً أو فحصاً تخصصياً.',
      status: 'published',
      views: 1420,
      createdAt: '2026-02-15T10:00:00.000Z',
      updatedAt: '2026-02-15T10:00:00.000Z',
    },
    {
      id: 'art_2',
      title: 'أسباب ارتفاع إنزيمات الكبد ومتى تحتاج إلى فحص؟',
      slug: 'elevated-liver-enzymes-causes',
      excerpt: 'دليل مبسط يوضح دلالات فحص وظائف الكبد وإنزيمات ALT و AST، والعوامل الأكثر شيوعًا وراء ارتفاعها.',
      content: `إنزيمات الكبد (مثل ALT و AST) هي بروتينات حيوية توجد داخل خلايا الكبد وتؤدي وظائف أيضية مهمة. عندما تتعرض خلايا الكبد للإجهاد أو الالتهاب، تتسرب هذه الإنزيمات إلى مجرى الدم لترتفع نسبتها في التحاليل المخبرية.

أبرز العوامل المسببة للارتفاع:
- تراكم الدهون في الكبد (الكبد الدهني) المصاحب للسمنة أو اضطراب دهون الدم.
- تناول بعض الأدوية أو المسكنات أو المكملات العشبية دون إشراف طبي.
- التهابات الكبد الفيروسية (فيروس B وفيروس C).
- التهابات الكبد المناعية والاضطرابات الاستقلابية.

متى تستشير الطبيب؟
إذا أظهر الفحص المخبري ارتفاعاً حتى بدون وجود أعراض، لأن أمراض الكبد غالباً ما تتطور بصمت. التشخيص المبكر يضمن حماية الكبد وعودته لكامل عافيته بإذن الله.`,
      category: 'أمراض الكبد',
      author: 'د. عبدالباسط عبده الحاج مقبل',
      readTime: '4 دقائق',
      date: '2026-02-20',
      image: '/images/real_liver_therapy_1790357555411.jpg',
      tags: ['الكبد', 'إنزيمات الكبد', 'الكبد الدهني', 'تحاليل مخبرية'],
      keywords: ['ارتفاع إنزيمات الكبد', 'وظائف الكبد ALT AST', 'علاج الكبد الدهني', 'دكتور كبد صنعاء', 'التهاب الكبد الفيروسي'],
      metaTitle: 'ارتفاع إنزيمات الكبد: الأسباب ودلالات التحليل | د. عبدالباسط مقبل',
      metaDescription: 'كل ما تود معرفته عن فحص إنزيمات الكبد ALT و AST وكيفية علاج أسباب الارتفاع.',
      status: 'published',
      views: 980,
      createdAt: '2026-02-20T10:00:00.000Z',
      updatedAt: '2026-02-20T10:00:00.000Z',
    },
    {
      id: 'art_3',
      title: 'منظار المعدة... متى تحتاج إليه؟',
      slug: 'when-do-you-need-gastroscopy',
      excerpt: 'تعرف على الحالات والأعراض التي تستدعي إجراء منظار المعدة وكيف يمثل وسيلة تشخيصية آمنة ودقيقة.',
      content: `منظار المعدة (Gastroscopy) هو إجراء طبي آمن ودقيق للغاية يستخدم فيه الطبيب أنبوبًا رفيعًا ومرنًا مزودًا بكاميرا عالية الدقة لفحص بطانة المريء والمعدة والاثني عشر مباشرة على شاشة العرض.

الحالات التي تستدعي المنظار:
1. استمرار حموضة وارتجاع المريء رغم العلاج الدوائي الممتد.
2. صعوبة أو ألم عند بلع الطعام والسوائل.
3. فقر الدم ونقص الحديد غير المفسر.
4. الشك في وجود قرحة أو نزيف أو زوائد غشائية.
5. أخذ عينة لفحص جرثومة المعدة أو حساسية القمح.

مميزات الإجراء الحديث:
يستغرق الإجراء عادة دقائق معدودة فقط (10 إلى 15 دقيقة) تحت مهدئ خفيف ومخدر موضعي للحلق، ويمكن للمريض مغادرة العيادة بعد وقت قصير وممارسة يومه براحة تامة.`,
      category: 'مناظير الجهاز الهضمي',
      author: 'د. عبدالباسط عبده الحاج مقبل',
      readTime: '4 دقائق',
      date: '2026-02-28',
      image: '/images/real_endoscopy_suite_1790357440526.jpg',
      tags: ['منظار المعدة', 'مناظير الجهاز الهضمي', 'تشخيص', 'خزعة'],
      keywords: ['منظار المعدة صنعاء', 'مناظير الجهاز الهضمي اليمن', 'فحص جرثومة المعدة بالمنظار', 'منظار القولون بدون ألم', 'مركز المأمون الطبي'],
      metaTitle: 'متى تحتاج لمنظار المعدة؟ الحالات وخطوات الإجراء | د. عبدالباسط مقبل',
      metaDescription: 'شرح مبسط ومطمئن لخطوات إجراء منظار المعدة والأعراض التي تستوجب الفحص في صنعاء.',
      status: 'published',
      views: 1850,
      createdAt: '2026-02-28T10:00:00.000Z',
      updatedAt: '2026-02-28T10:00:00.000Z',
    },
  ];

  const defaultFaqs: FaqItemRecord[] = [
    {
      id: 'faq_1',
      question: 'هل يحتاج منظار المعدة أو القولون إلى تخدير كامل؟',
      answer: 'لا يحتاج في العادة إلى تخدير كامل، بل يتم إجراؤه بسلاسة تامة تحت تأثير مهدئ خفيف ومريح (Sedation) مع مخدر موضعي للحلق في منظار المعدة، مما يجعل الإجراء مريحًا وخاليًا من الشعور بالألم أو الانزعاج.',
      category: 'مناظير',
      order: 1,
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'faq_2',
      question: 'ما هي مدة الصيام المطلوبة قبل عمل منظار المعدة؟',
      answer: 'يُنصح بالصيام التام عن الطعام والشراب لمدة تتراوح بين 6 إلى 8 ساعات قبل الموعد، لضمان خلو المعدة تمامًا ووضوح الرؤية التام للطبيب وسلامة المريض.',
      category: 'مناظير',
      order: 2,
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'faq_3',
      question: 'ما هو الفارق بين القولون العصبي والتهاب القولون؟',
      answer: 'القولون العصبي هو اضطراب وظيفي في حركة واستجابة الأمعاء دون وجود تلف أو تقرح عضوي في الأنسجة، بينما التهابات القولون (كالتقرحي أو المناعي) تصاحبها تغيرات والتهابات ملموسة في بطانة القولون يتم تشخيصها بدقة بواسطة المنظار والتحاليل.',
      category: 'أمراض',
      order: 3,
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'faq_4',
      question: 'هل يمكن الشفاء التام من جرثومة المعدة؟',
      answer: 'نعم بالتأكيد، عند الالتزام بالبروتوكول العلاجي الدوائي الكامل الذي يحدده الطبيب بدقة دون انقطاع، وإجراء الفحص التأكيدي بعد انتهاء العلاج بشهر للتأكد من القضاء التام عليها.',
      category: 'علاج',
      order: 4,
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'faq_5',
      question: 'كيف يمكنني حجز موعد في العيادة؟',
      answer: 'يمكنك حجز موعدك بسهولة عبر تعبئة نموذج الحجز في الموقع، أو بالتواصل المباشر عبر الاتصال أو الواتساب على الرقم 777554626 أو 777560603، وسيتم التنسيق معكم لتأكيد الفترة المناسبة.',
      category: 'مواعيد',
      order: 5,
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  const defaultBookings: BookingRecord[] = [
    {
      id: 'bkg_101',
      patientName: 'أحمد صالح العريقي',
      phone: '771234567',
      visitType: 'كشف جديد',
      serviceId: 'srv_digestive',
      preferredDate: '2026-09-08',
      preferredShift: 'morning',
      notes: 'أعاني من حرقة شديدة في المعدة مستمرة منذ أسبوعين مع حموضة عند النوم.',
      status: 'new',
      createdAt: '2026-09-05T08:30:00.000Z',
      updatedAt: '2026-09-05T08:30:00.000Z',
    },
    {
      id: 'bkg_102',
      patientName: 'فاطمة محمد الأهدل',
      phone: '773456789',
      visitType: 'منظار تشخيصي',
      serviceId: 'srv_gastroscopy',
      preferredDate: '2026-09-09',
      preferredShift: 'morning',
      notes: 'تحويل من طبيب باطنة لإجراء منظار معدة لفحص عسر البلع المستمر.',
      status: 'confirmed',
      adminNotes: 'تم تأكيد الموعد وإرسال تعليمات الصيام التام قبل المنظار بـ 8 ساعات.',
      createdAt: '2026-09-04T11:20:00.000Z',
      updatedAt: '2026-09-04T14:15:00.000Z',
    },
    {
      id: 'bkg_103',
      patientName: 'خالد عبدالله الذماري',
      phone: '775678901',
      visitType: 'متابعة نتائج وفحوصات',
      serviceId: 'srv_liver',
      preferredDate: '2026-09-07',
      preferredShift: 'evening',
      notes: 'متابعة تحليل وظائف الكبد وإنزيمات ALT بعد شهر من العلاج.',
      status: 'contacted',
      adminNotes: 'تم الاتصال بالمريض وتذكيره بإحضار كشف التحاليل السابق والجديد.',
      createdAt: '2026-09-03T16:45:00.000Z',
      updatedAt: '2026-09-04T09:10:00.000Z',
    },
    {
      id: 'bkg_104',
      patientName: 'ياسر حميد الشميري',
      phone: '779012345',
      visitType: 'كشف جديد',
      serviceId: 'srv_digestive',
      preferredDate: '2026-09-06',
      preferredShift: 'evening',
      notes: 'انتفاخ مستمر وغازات وآلام بالقولون.',
      status: 'completed',
      adminNotes: 'تم الكشف وصرف العلاج، وموعد مراجعة بعد 3 أسابيع.',
      createdAt: '2026-09-01T10:00:00.000Z',
      updatedAt: '2026-09-02T18:00:00.000Z',
    },
  ];

  const defaultMessages: MessageRecord[] = [
    {
      id: 'msg_201',
      name: 'محمد رضوان',
      phone: '777112233',
      email: 'm.radwan@example.com',
      subject: 'استفسار عن تكلفة منظار القولون والتحضير',
      message: 'السلام عليكم يا دكتور، أود الاستفسار عن كلفة منظار القولون وهل المحلول الملحي متوفر في صيدلية المركز؟ شكرًا لكم.',
      status: 'new',
      createdAt: '2026-09-05T09:15:00.000Z',
      updatedAt: '2026-09-05T09:15:00.000Z',
    },
    {
      id: 'msg_202',
      name: 'سامية علي',
      phone: '774455667',
      email: 'samia.ali@example.com',
      subject: 'مواعيد الدوام يوم السبت القادم',
      message: 'مرحبًا بكم، هل العيادة تفتح صباحًا يوم السبت القادم؟ لدي مريض قادم من خارج صنعاء.',
      status: 'read',
      createdAt: '2026-09-04T15:30:00.000Z',
      updatedAt: '2026-09-04T16:00:00.000Z',
    },
  ];

  const defaultSchedule: ScheduleSettings = {
    morningHours: '9:00 صباحًا – 2:00 ظهرًا',
    eveningHours: '5:00 عصرًا – 9:00 ليلًا',
    workingDays: 'السبت إلى الخميس',
    morningActive: true,
    eveningActive: true,
    emergencyNotice: '',
    isNoticeActive: false,
    holidays: ['الجمعة'],
  };

  const defaultContact: ContactSettings = {
    phone1: '777554626',
    phone2: '777560603',
    whatsapp: '777554626',
    email: 'baset.clinic@gmail.com',
    address: 'مركز المأمون الطبي التشخيصي – صنعاء – شارع تعز (تقاطع شارع تعز)',
    addressShort: 'صنعاء – شارع تعز – مركز المأمون الطبي',
    building: 'مركز المأمون الطبي التشخيصي',
    city: 'صنعاء',
    country: 'اليمن',
    googleMapsUrl: 'https://maps.app.goo.gl/MCyvMKGM5Bn2ZGFy6',
    googleMapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3848.47!2d44.2213114!3d15.3361629!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1603db5a79506aed%3A0xe8fd3a13d23c9994!2zMTXCsDIwJzEwLjIiTiA0NMKwMTMnMTYuNyJF!5e0!3m2!1sar!2sye!4v1710000000000!5m2!1sar!2sye',
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    youtube: 'https://youtube.com',
  };

  const defaultMedia: MediaItem[] = [
    {
      id: 'med_1',
      name: 'صورة د. عبدالباسط مقبل الرسمية',
      url: 'https://rmvhgoewsegyohdbsjsd.supabase.co/storage/v1/object/public/media/images/dr-abdulbasit.jpg',
      altText: 'د. عبدالباسط عبده الحاج مقبل استشاري الباطنة والجهاز الهضمي والكبد والمناظير',
      fileSize: '420 KB',
      fileType: 'image/jpeg',
      uploadedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'med_2',
      name: 'شعار العيادة الرسمي',
      url: 'https://rmvhgoewsegyohdbsjsd.supabase.co/storage/v1/object/public/media/images/clinic-logo.jpg',
      altText: 'شعار عيادة د. عبدالباسط مقبل للجهاز الهضمي والمناظير',
      fileSize: '180 KB',
      fileType: 'image/jpeg',
      uploadedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'med_3',
      name: 'صورة منظار المعدة',
      url: 'https://rmvhgoewsegyohdbsjsd.supabase.co/storage/v1/object/public/media/images/endoscopy-gastro.jpg',
      altText: 'وحدة منظار المعدة التشخيصي والعلاجي',
      fileSize: '310 KB',
      fileType: 'image/jpeg',
      uploadedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'med_4',
      name: 'صورة منظار القولون',
      url: 'https://rmvhgoewsegyohdbsjsd.supabase.co/storage/v1/object/public/media/images/endoscopy-colon.jpg',
      altText: 'وحدة منظار القولون التشخيصي',
      fileSize: '290 KB',
      fileType: 'image/jpeg',
      uploadedAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  const defaultPages: CustomPageItem[] = [
    {
      id: 'page_endoscopy_prep',
      title: 'دليل تحضير المريض لمناظير الجهاز الهضمي',
      slug: 'endoscopy-preparation-guide',
      excerpt: 'دليل تفصيلي وإرشادات هامة للتحضير الآمن لمناظير المعدة والقولون في عيادة الدكتور عبدالباسط مقبل.',
      content: `## إرشادات هامة قبل إجراء منظار الجهاز الهضمي

لضمان إجراء المنظار بدقة وأمان تام، يرجى قراءة واتباع التعليمات التالية بعناية فائقة:

### 1. منظار المعدة والمريء التشخيصي (Gastroscopy):
* **الصيام التام:** يجب الامتناع عن تناول أي طعام صلب أو حليب لمدة **6 إلى 8 ساعات** على الأقل قبل موعد الفحص.
* **شرب الماء والسوائل:** يمكن شرب رشفات بسيطة من الماء حتى **3 ساعات** قبل الإجراء فقط.
* **الأدوية اليومية:** يُسمح بتناول أدوية الضغط أو القلب في موعدها مع رشفة ماء، ما لم يوصِ الطبيب بخلاف ذلك.

### 2. منظار القولون (Colonoscopy):
* **الحمية الغذائية قبل يومين:** تجنب الأطعمة الغنية بالألياف والبذور والخضروات الورقية والمكسرات.
* **تحضير الأمعاء بالمحلول:** تناول المحلول الملحي الملين الموصوف من قِبل العيادة وفق التوقيت والجرعات المحددة بدقة.
* **السوائل الشفافة:** الاعتماد على السوائل الشفافة فقط (شوربة مصفاة، شاي خفيف، ماء) في اليوم السابق للمنظار.

### 3. أدوية السيولة والسكري:
* **مرضى السكري:** تأجيل جرعة الإنسولين أو أقراص السكر الصباحية إلى ما بعد انتهاء الفحص وتناول الطعام بالتنسيق مع الطبيب.
* **أدوية سيولة الدم (مثل الأسبرين أو الوارفارين أو البلافيكس):** يجب إبلاغ الطبيب مسبقًا لتحديد إمكانية إيقافها أو تعديل جرعاتها قبل الإجراء بعدة أيام.

### 4. ما بعد الإجراء:
* في حال استخدام المهدئ اللطيف (التهدئة الوريدية الواعية)، يُشترط وجود مرافق بالغ لقيادة السيارة ومرافقة المريض إلى المنزل.
* يمكن العودة لتناول وجبة خفيفة بعد زوال أثر التخدير الموضعي في الحلق بنحو ساعة.

📞 لأي استفسار أو تفاصيل إضافية، يرجى التواصل مع فريق العيادة مباشرة.`,
      coverImage: 'https://rmvhgoewsegyohdbsjsd.supabase.co/storage/v1/object/public/media/images/endoscopy-prep.jpg',
      metaTitle: 'دليل تحضير المريض لمناظير الجهاز الهضمي | عيادة د. عبدالباسط مقبل',
      metaDescription: 'إرشادات مفصلة لمرضى مناظير المعدة والقولون: تعليمات الصيام، الأدوية، وحمية تحضير الأمعاء.',
      keywords: ['تحضير منظار المعدة', 'تعليمات منظار القولون', 'صيام المنظار', 'عيادة مناظير صنعاء'],
      showInHeader: true,
      showInFooter: true,
      order: 1,
      isActive: true,
      createdAt: '2026-02-01T00:00:00.000Z',
      updatedAt: '2026-02-01T00:00:00.000Z',
    },
    {
      id: 'page_patient_rights',
      title: 'حقوق وواجبات المريض والزائر',
      slug: 'patient-rights-responsibilities',
      excerpt: 'ميثاق رعاية المريض وخصوصيته وحقوقه في الحصول على الرعاية الطبية وفق أعلى المعايير الأخلاقية والمهنية.',
      content: `## ميثاق حقوق وواجبات المريض

تلتزم عيادة الدكتور عبدالباسط عبده الحاج مقبل بتقديم أفضل المعايير الإكلينيكية والأخلاقية، وتضمن للمريض حقوقه الكاملة:

### أولاً: حقوق المريض:
1. **الاحترام والكرامة:** الحصول على رعاية طبية محترمة ومنصفة دون أي تمييز، مع مراعاة القيم الإنسانية.
2. **الخصوصية والسرية:** الحفاظ التام على سرية السجلات والتقارير الطبية ونتائج الفحوصات والتحاليل.
3. **المعلومات الواضحة:** من حق المريض الحصول على شرح وافٍ ومبسط حول تشخيص حالته، الخيارات العلاجية المتاحة، والنتائج المتوقعة.
4. **الموافقة المستنيرة:** الحصول على الموافقة الواعية والمسبقة قبل أي إجراء تشخيصي أو تداخلي (كالمناظير وأخذ العينات).
5. **معرفة التكاليف:** الاطلاع المسبق على رسوم الكشف والفحوصات والمناظير بشفافية ووضوح.

### ثانياً: مسؤوليات وواجبات المريض:
1. **المعلومات الدقيقة:** تقديم معلومات تاريخية وصحية كاملة وصحيحة عن الأعراض، الأمراض السابقة، والأدوية الحالية.
2. **اتباع التعليمات الطبية:** الالتزام بتوجيهات الطبيب والجرعات الدوائية المقررة وتعليمات التحضير للفحوصات.
3. **احترام المواعيد:** الحضور في الموعد المحدد أو إشعار العيادة مبكراً في حال الرغبة بإلغاء الموعد أو تأجيله.
4. **احترام الفريق الطبي والزوار:** مراعاة الهدوء والآداب العامة داخل العيادة ومرافق مركز المأمون الطبي.`,
      coverImage: 'https://rmvhgoewsegyohdbsjsd.supabase.co/storage/v1/object/public/media/images/clinic-logo.jpg',
      metaTitle: 'حقوق وواجبات المريض | عيادة د. عبدالباسط مقبل',
      metaDescription: 'ميثاق حقوق وواجبات المريض والزائر في عيادة الدكتور عبدالباسط مقبل لأمراض الباطنة والكبد والمناظير.',
      keywords: ['حقوق المريض', 'ميثاق المريض', 'عيادة دكتور عبدالباسط مقبل'],
      showInHeader: false,
      showInFooter: true,
      order: 2,
      isActive: true,
      createdAt: '2026-02-01T00:00:00.000Z',
      updatedAt: '2026-02-01T00:00:00.000Z',
    },
  ];

  const defaultSeo: SeoSettings = {
    defaultMetaTitle: 'عيادة د. عبدالباسط عبده الحاج مقبل | استشاري الباطنة والجهاز الهضمي والكبد والمناظير صنعاء',
    defaultMetaDescription: 'الموقع الرسمي لعيادة د. عبدالباسط عبده الحاج مقبل في صنعاء - مركز المأمون الطبي. استشاري الباطنة والجهاز الهضمي والكبد ومناظير المعدة والقولون. احجز موعدك الآن.',
    siteKeywords: [
      'دكتور عبدالباسط مقبل',
      'استشاري جهاز هضمي صنعاء',
      'دكتور كبد صنعاء',
      'مناظير المعدة صنعاء',
      'منظار القولون اليمن',
      'علاج جرثومة المعدة',
      'الكبد الدهني',
      'مركز المأمون الطبي',
    ],
    canonicalUrl: 'https://dr-abdulbasit-clinic.com',
    ogTitle: 'عيادة د. عبدالباسط عبده الحاج مقبل - استشاري الجهاز الهضمي والكبد والمناظير',
    ogDescription: 'رعاية تخصصية وخبرة سريرية وأكاديمية متقدمة في أمراض الجهاز الهضمي والكبد ومناظير المعدة والقولون.',
    ogImage: 'https://rmvhgoewsegyohdbsjsd.supabase.co/storage/v1/object/public/media/images/clinic-logo.jpg',
    robotsTxt: 'User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: https://dr-abdulbasit-clinic.com/sitemap.xml',
    sitemapEnabled: true,
    schemas: {
      medicalClinic: true,
      physician: true,
      faq: true,
      breadcrumb: true,
    },
  };

  const defaultSettings: SiteSettings = {
    siteName: 'عيادة د. عبدالباسط عبده الحاج مقبل',
    clinicName: 'عيادة د. عبدالباسط عبده الحاج مقبل',
    doctorName: 'د. عبدالباسط عبده الحاج مقبل',
    doctorSpecialty: 'استشاري الباطنة والجهاز الهضمي والكبد والمناظير',
    logoUrl: 'https://rmvhgoewsegyohdbsjsd.supabase.co/storage/v1/object/public/media/images/clinic-logo.jpg',
    faviconUrl: '/favicon.ico',
    heroBadge: 'رعاية طبية تخصصية متقدمة في صنعاء',
    heroHeadline: 'رعاية متقدمة لأمراض الجهاز الهضمي والكبد والمناظير',
    heroSubheadline: 'تشخيص دقيق وعلاج متخصص بإشراف د. عبدالباسط عبده الحاج مقبل، استشاري الباطنة والجهاز الهضمي والكبد والمناظير، وفق أحدث المعايير الطبية العالمية.',
    bookButtonText: 'حجز موعد استشارة',
    contactButtonText: 'تواصل مع العيادة',
    defaultWhatsAppText: 'مرحبًا، أود الاستفسار وحجز موعد في عيادة د. عبدالباسط مقبل.',
    maintenanceMode: false,
    footerCopyright: 'جميع الحقوق محفوظة © 2026 عيادة د. عبدالباسط عبده الحاج مقبل.',
  };

  const defaultNotifications: NotificationItem[] = [
    {
      id: 'notif_1',
      title: 'حجز جديد وارد',
      message: 'ورد طلب حجز موعد جديد من المريض: أحمد صالح العريقي.',
      type: 'booking',
      isRead: false,
      createdAt: '2026-09-05T08:30:00.000Z',
      link: '/admin/bookings',
    },
    {
      id: 'notif_2',
      title: 'رسالة تواصل جديدة',
      message: 'رسالة استفسار جديدة من: محمد رضوان بخصوص منظار القولون.',
      type: 'message',
      isRead: false,
      createdAt: '2026-09-05T09:15:00.000Z',
      link: '/admin/messages',
    },
  ];

  const defaultActivityLogs: ActivityLogItem[] = [
    {
      id: 'act_1',
      userId: 'usr_super_admin',
      userName: 'د. عبدالباسط مقبل',
      userRole: 'super_admin',
      action: 'تهيئة النظام',
      module: 'النظام',
      details: 'تم تدشين وتفعيل قاعدة البيانات ولوحة التحكم الإدارية بنجاح.',
      timestamp: '2026-09-05T08:00:00.000Z',
    },
    {
      id: 'act_2',
      userId: 'usr_admin',
      userName: 'إدارة العيادة',
      userRole: 'admin',
      action: 'تحديث حجز',
      module: 'الحجوزات',
      details: 'تم تأكيد موعد المنظار للمريضة فاطمة محمد الأهدل.',
      timestamp: '2026-09-04T14:15:00.000Z',
    },
  ];

  const defaultAnalytics: AnalyticsData = {
    totalVisits: 3840,
    whatsappClicks: 642,
    phoneClicks: 518,
    bookingFormSubmissions: 284,
    pageViews: {
      '/': 2450,
      '#specialties': 980,
      '#conditions': 1350,
      '#endoscopy': 1620,
      '#library': 740,
      '#booking': 890,
      '#contact': 610,
    },
    devices: {
      mobile: 2680,
      desktop: 980,
      tablet: 180,
    },
    dailyVisits: [
      { date: '2026-08-30', visits: 110, bookings: 8 },
      { date: '2026-08-31', visits: 135, bookings: 11 },
      { date: '2026-09-01', visits: 142, bookings: 9 },
      { date: '2026-09-02', visits: 168, bookings: 14 },
      { date: '2026-09-03', visits: 155, bookings: 12 },
      { date: '2026-09-04', visits: 180, bookings: 16 },
      { date: '2026-09-05', visits: 195, bookings: 18 },
    ],
  };

  const defaultVideos: ClinicVideoItem[] = [
    {
      id: 'vid_1',
      title: 'منظار المعدة التشخيصي والعلاجي - د. عبدالباسط مقبل',
      description: 'شرح مفصل حول إجراء منظار المعدة والأمان والتحضير السليم للمريض لتشخيص القرحة وجرثومة المعدة والارتجاع بدقة عالية.',
      youtubeUrl: 'https://youtube.com/@dr.abdulbaset_clinic?si=zrrCllJ74-rbHNPr',
      youtubeId: 'dQw4w9WgXcQ',
      thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      duration: '04:15',
      order: 1,
      isActive: true,
      createdAt: '2026-01-10T10:00:00.000Z',
      updatedAt: '2026-01-10T10:00:00.000Z',
    },
    {
      id: 'vid_2',
      title: 'أعراض وعلاج دهون الكبد والتهابات الكبد المزمنة',
      description: 'نصائح طبية وإرشادات علمية للوقاية وعلاج تراكم الدهون على الكبد والمتابعة السريرية اللازمة.',
      youtubeUrl: 'https://youtube.com/@dr.abdulbaset_clinic?si=zrrCllJ74-rbHNPr',
      youtubeId: 'L_LUpnjgPso',
      thumbnailUrl: 'https://img.youtube.com/vi/L_LUpnjgPso/hqdefault.jpg',
      duration: '06:30',
      order: 2,
      isActive: true,
      createdAt: '2026-01-12T10:00:00.000Z',
      updatedAt: '2026-01-12T10:00:00.000Z',
    },
    {
      id: 'vid_3',
      title: 'منظار القولون واستئصال اللحميات والزوائد المعوية',
      description: 'أهمية الفحص المبكر بالمنظار واستئصال الزوائد اللحمية للوقاية من أورام القولون والمستقيم.',
      youtubeUrl: 'https://youtube.com/@dr.abdulbaset_clinic?si=zrrCllJ74-rbHNPr',
      youtubeId: 'kJQP7kiw5Fk',
      thumbnailUrl: 'https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
      duration: '05:20',
      order: 3,
      isActive: true,
      createdAt: '2026-01-15T10:00:00.000Z',
      updatedAt: '2026-01-15T10:00:00.000Z',
    },
    {
      id: 'vid_4',
      title: 'جرثومة المعدة (H. Pylori): التشخيص الدقيق والعلاج الفعال',
      description: 'كل ما تحتاج معرفته عن جرثومة المعدة وطرق انتقالها وأسباب مقاومة العلاج وكيفية التعافي منها.',
      youtubeUrl: 'https://youtube.com/@dr.abdulbaset_clinic?si=zrrCllJ74-rbHNPr',
      youtubeId: '3JZ_D3ELwOQ',
      thumbnailUrl: 'https://img.youtube.com/vi/3JZ_D3ELwOQ/hqdefault.jpg',
      duration: '07:45',
      order: 4,
      isActive: true,
      createdAt: '2026-01-18T10:00:00.000Z',
      updatedAt: '2026-01-18T10:00:00.000Z',
    },
  ];

  const defaultCareers: CareerItem[] = [
    {
      id: 'job_1',
      title: 'ممرض / ممرضة عيادة مناظير الجهاز الهضمي',
      department: 'قسم التمريض والمناظير',
      description: 'مطلوب ممرض/ـة ذو كفاءة للعمل في وحدة مناظير الجهاز الهضمي، تحضير المرضى ومرافقة الإجراءات الطبية ومتابعة التعقيم.',
      requirements: [
        'بكالوريوس أو دبلوم عالي في التمريض العام',
        'خبرة لا تقل عن سنتين في وحدات المناظير أو غرف العمليات',
        'ترخيص مزاولة مهنة ساري المفعول',
        'مهارات تواصل ممتازة والقدرة على التعامل مع الحالات الطبية باحترافية',
      ],
      experience: 'خبرة من 2 إلى 4 سنوات',
      location: 'صنعاء - شارع تعز',
      employmentType: 'full-time',
      deadline: '2026-05-30',
      postedDate: '2026-02-01',
      status: 'open',
      order: 1,
      isActive: true,
      createdAt: '2026-02-01T08:00:00.000Z',
      updatedAt: '2026-02-01T08:00:00.000Z',
    },
    {
      id: 'job_2',
      title: 'موظف / موظفة استقبال وتنسيق مواعيد طبية',
      department: 'قسم خدمة المرضى والاستقبال',
      description: 'استقبال المراجعين وتنظيم الحجوزات وإدخال البيانات على النظام الإداري للعيادة والرد على الاستفسارات الهاتفية.',
      requirements: [
        'مؤهل جامعي مناسب (إدارة أو علاقات عامة أو مجال ذي صلة)',
        'إجادة استخدام برامج الحاسوب وأنظمة إدارة المواعيد',
        'لباقة عالية في التحدث وحسن التعامل مع المراجعين',
        'الالتزام بالدقة والمواعيد',
      ],
      experience: 'خبرة سنة واحدة على الأقل في استقبال طبي',
      location: 'صنعاء - شارع تعز',
      employmentType: 'full-time',
      deadline: '2026-05-15',
      postedDate: '2026-02-05',
      status: 'open',
      order: 2,
      isActive: true,
      createdAt: '2026-02-05T08:00:00.000Z',
      updatedAt: '2026-02-05T08:00:00.000Z',
    },
  ];

  const defaultConferences: ConferenceItem[] = [
    {
      id: 'conf_1',
      title: 'المؤتمر السنوي للجمعية الطبية لأمراض الجهاز الهضمي والكبد',
      image: 'https://rmvhgoewsegyohdbsjsd.supabase.co/storage/v1/object/public/media/images/hero-doctor.png',
      date: '15-17 نوفمبر 2025',
      location: 'صنعاء، اليمن',
      shortDescription: 'مشاركة علمية ببحث متخصص حول تقنيات استئصال الزوائد اللحمية بالمنظار والبروتوكولات الآمنة.',
      details: 'قدم الدكتور عبدالباسط عبده الحاج مقبل ورقة عمل متميزة حول تقنيات المناظير المتقدمة في فحص الجهاز الهضمي العلوي والسفلي، وحضر الجلسات النقاشية مع نخبة من كبار أطباء الجهاز الهضمي والكبد.',
      order: 1,
      isActive: true,
      createdAt: '2025-11-20T08:00:00.000Z',
      updatedAt: '2025-11-20T08:00:00.000Z',
    },
    {
      id: 'conf_2',
      title: 'ورشة العمل المتقدمة في مناظير القولون واستئصال الأورام المبكرة',
      image: 'https://rmvhgoewsegyohdbsjsd.supabase.co/storage/v1/object/public/media/images/dr-abdulbasit.jpg',
      date: '22-24 مايو 2025',
      location: 'القاهرة، جمهورية مصر العربية',
      shortDescription: 'مشاركة تدريبية وبحثية مكثفة بجامعة القاهرة قصر العيني حول أحدث معايير السلامة واستئصال الآفات المعوية.',
      details: 'شملت الورشة استعراض أحدث الأجهزة والتقنيات الرقمية المساعدة للمناظير التشخيصية والعلاجية، مع التركيز على تقليل احتمالات النزيف وتسريع استشفاء المريض.',
      order: 2,
      isActive: true,
      createdAt: '2025-05-26T08:00:00.000Z',
      updatedAt: '2025-05-26T08:00:00.000Z',
    },
    {
      id: 'conf_3',
      title: 'الندوة العلمية لمستجدات علاج الكبد الدهني والتهاب الكبد المناعي',
      image: 'https://rmvhgoewsegyohdbsjsd.supabase.co/storage/v1/object/public/media/images/hero-doctor.png',
      date: '10 سبتمبر 2024',
      location: 'صنعاء، اليمن',
      shortDescription: 'محاضرة توعوية وسريرية حول استراتيجيات التشخيص المبكر لدهون الكبد وتجنب تليف الكبد.',
      details: 'تناولت الندوة التوصيات الدولية المحدثة للجمعية الأوروبية والأمريكية لدراسة الكبد، وبروتوكولات الفحص بالموجات فوق الصوتية وتحاليل الأنزيمات.',
      order: 3,
      isActive: true,
      createdAt: '2024-09-12T08:00:00.000Z',
      updatedAt: '2024-09-12T08:00:00.000Z',
    },
  ];

  const defaultResearch: ResearchItem[] = [
    {
      id: 'res_1',
      title: 'فعالية استئصال الزوائد اللحمية للقولون بالمنظار البارد مقابل المنظار الساخن: دراسة سريرية مقارنة',
      authors: 'د. عبدالباسط عبده الحاج مقبل وفريق بحثي',
      year: '2024',
      institution: 'كلية الطب - جامعة القاهرة & عيادة الجهاز الهضمي والكبد',
      journal: 'المجلة الإقليمية لأمراض الجهاز الهضمي والكبد',
      abstract: 'هدفت الدراسة إلى مقارنة نسب الأمان ومعدلات النزيف ومعدل الإزالة الكاملة للزوائد اللحمية صغيرة ومتوسطة الحجم في القولون. أظهرت النتائج تفوق التقنيات الحديثة في تقليل مدة الإجراء وتفادي المضاعفات بنسبة نجاح بلغت 98.4%.',
      pdfUrl: '',
      order: 1,
      isActive: true,
      createdAt: '2024-08-01T08:00:00.000Z',
      updatedAt: '2024-08-01T08:00:00.000Z',
    },
    {
      id: 'res_2',
      title: 'العلاقة بين جرثومة المعدة الحلزونية (H. Pylori) ومتلازمة القولون العصبي في المرضى المراجعين',
      authors: 'د. عبدالباسط عبده الحاج مقبل',
      year: '2023',
      institution: 'جامعة القاهرة / قصر العيني',
      journal: 'أبحاث الطب الباطني والجهاز الهضمي',
      abstract: 'بحثت هذه الدراسة في العلاقة المتبادلة بين إيجابية فحص جرثومة المعدة وشدة أعراض عسر الهضم الوظيفي ومتلازمة القولون العصبي، مع تقييم استجابة المرضى بعد استكمال البروتوكول الرباعي الحديث.',
      pdfUrl: '',
      order: 2,
      isActive: true,
      createdAt: '2023-11-15T08:00:00.000Z',
      updatedAt: '2023-11-15T08:00:00.000Z',
    },
    {
      id: 'res_3',
      title: 'المؤشرات الحيوية المبكرة لتليف الكبد في مرضى الكبد الدهني غير الكحولي (NAFLD)',
      authors: 'د. عبدالباسط عبده الحاج مقبل',
      year: '2023',
      institution: 'وحدة أمراض الكبد والمناظير',
      journal: 'أبحاث الكبد السريرية',
      abstract: 'دراسة استقصائية لتقييم دقة القياسات غير التداخلية في التنبؤ بتقدم دهون الكبد نحو التليف المبكر مقارنة بالفحوصات النسيجية.',
      pdfUrl: '',
      order: 3,
      isActive: true,
      createdAt: '2023-05-10T08:00:00.000Z',
      updatedAt: '2023-05-10T08:00:00.000Z',
    },
  ];

  const defaultSliders: SliderItem[] = [
    {
      id: 'slide_1',
      title: 'رعاية متقدمة لأمراض الجهاز الهضمي والكبد والمناظير',
      subtitle: 'تشخيص دقيق وخبرة سريرية وأكاديمية متقدمة وفق أحدث المعايير الدولية',
      description: 'إشراف استشاري حاصل على الماجستير والدكتوراه من كلية الطب بجامعة القاهرة قصر العيني.',
      image: '/images/real_endoscopy_suite_1790357440526.jpg',
      imageUrl: '/images/real_endoscopy_suite_1790357440526.jpg',
      buttonText: 'احجز موعد استشارة',
      buttonLink: '#booking',
      order: 1,
      isActive: true,
      createdAt: '2026-01-01T08:00:00.000Z',
      updatedAt: '2026-01-01T08:00:00.000Z',
    },
    {
      id: 'slide_2',
      title: 'مناظير تشخيصية وعلاجية بأعلى معايير الأمان والراحة',
      subtitle: 'مناظير المعدة والقولون واستئصال الزوائد اللحمية بأجهزة فائقة الدقة',
      description: 'إجراءات آمنة مع رعاية تمريضية متخصصة وتعقيم آلي دقيق لضمان سلامتك الكاملة.',
      image: '/images/real_liver_care_1790357413712.jpg',
      imageUrl: '/images/real_liver_care_1790357413712.jpg',
      buttonText: 'تعرف على المناظير',
      buttonLink: '#endoscopy',
      order: 2,
      isActive: true,
      createdAt: '2026-01-02T08:00:00.000Z',
      updatedAt: '2026-01-02T08:00:00.000Z',
    },
    {
      id: 'slide_3',
      title: 'تشخيص ومتابعة أمراض الكبد الفيروسية والدهنية والمزمنة',
      subtitle: 'بروتوكولات علاجية حديثة وإرشادات غذائية وطبية متكاملة',
      description: 'فحوصات دورية ومتابعة مستمرة لدهون الكبد والتهابات الكبد المناعية والفيروسية.',
      image: '/images/real_patient_comfort_1790357507323.jpg',
      imageUrl: '/images/real_patient_comfort_1790357507323.jpg',
      buttonText: 'استكشف الحالات المعالجة',
      buttonLink: '#conditions',
      order: 3,
      isActive: true,
      createdAt: '2026-01-03T08:00:00.000Z',
      updatedAt: '2026-01-03T08:00:00.000Z',
    },
  ];

  return {
    users: defaultUsers,
    doctor: defaultDoctor,
    services: defaultServices,
    categories: defaultCategories,
    conditions: defaultConditions,
    endoscopy: defaultEndoscopy,
    articles: defaultArticles,
    pages: defaultPages,
    faqs: defaultFaqs,
    bookings: defaultBookings,
    messages: defaultMessages,
    schedule: defaultSchedule,
    contact: defaultContact,
    media: defaultMedia,
    seo: defaultSeo,
    settings: defaultSettings,
    videos: defaultVideos,
    careers: defaultCareers,
    jobApplications: [],
    conferences: defaultConferences,
    research: defaultResearch,
    sliders: defaultSliders,
    notifications: defaultNotifications,
    activityLogs: defaultActivityLogs,
    analytics: defaultAnalytics,
    recycleBin: [],
  };
}

class Database {
  private data: DatabaseSchema;
  private lastSnapshotHour = -1;

  constructor() {
    this.data = this.load();
    // Sanitize any existing in-memory data on boot to ensure disk consistency
    this.data = sanitizeAndPersistMediaUrls(this.data);
    this.saveToFile(this.data);
  }

  private load(): DatabaseSchema {
    ensureDirectories();
    const defaults = getDefaultDatabase();

    // 1. Try reading the primary database file
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        if (raw && raw.trim().length > 10) {
          const parsed = JSON.parse(raw);
          return {
            ...defaults,
            ...parsed,
            pages: Array.isArray(parsed.pages) ? parsed.pages : defaults.pages,
            videos: Array.isArray(parsed.videos) ? parsed.videos : defaults.videos,
            careers: Array.isArray(parsed.careers) ? parsed.careers : defaults.careers,
            jobApplications: Array.isArray(parsed.jobApplications) ? parsed.jobApplications : defaults.jobApplications,
            conferences: Array.isArray(parsed.conferences) ? parsed.conferences : defaults.conferences,
            research: Array.isArray(parsed.research) ? parsed.research : defaults.research,
            sliders: Array.isArray(parsed.sliders) ? parsed.sliders : defaults.sliders,
          };
        }
      } catch (err) {
        console.error('Failed to parse primary database file, attempting backup recovery:', err);
      }
    }

    // 2. Fallback: Try reading secondary rolling backup file
    if (fs.existsSync(DB_BACKUP_FILE)) {
      try {
        const rawBackup = fs.readFileSync(DB_BACKUP_FILE, 'utf-8');
        if (rawBackup && rawBackup.trim().length > 10) {
          console.warn('[Database Recovery] Successfully restored database from clinic-database.backup.json');
          const parsed = JSON.parse(rawBackup);
          return { ...defaults, ...parsed };
        }
      } catch (backupErr) {
        console.error('Failed to restore from secondary backup:', backupErr);
      }
    }

    // 3. Fallback: Try reading the latest snapshot from backups/ directory
    try {
      if (fs.existsSync(BACKUP_DIR)) {
        const files = fs.readdirSync(BACKUP_DIR).filter((f) => f.endsWith('.json')).sort().reverse();
        if (files.length > 0) {
          const latestFile = path.join(BACKUP_DIR, files[0]);
          const raw = fs.readFileSync(latestFile, 'utf-8');
          console.warn(`[Database Recovery] Successfully restored database from snapshot: ${files[0]}`);
          const parsed = JSON.parse(raw);
          return { ...defaults, ...parsed };
        }
      }
    } catch (snapshotErr) {
      console.error('Failed to restore from snapshot directory:', snapshotErr);
    }

    // 4. If no database or backups exist at all, initialize clean default database
    console.warn('[Database Init] Initializing fresh default database with pre-configured clinic data.');
    this.saveToFile(defaults);
    return defaults;
  }

  private saveToFile(data: DatabaseSchema): void {
    try {
      ensureDirectories();

      // Deeply sanitize and auto-persist any base64 media to disk files
      const cleanData = sanitizeAndPersistMediaUrls(data);
      const jsonString = JSON.stringify(cleanData, null, 2);

      // 1. Maintain rolling backup of previous valid file before overwriting
      if (fs.existsSync(DB_FILE)) {
        try {
          fs.copyFileSync(DB_FILE, DB_BACKUP_FILE);
        } catch {}
      }

      // 2. Rotating hourly snapshot in data/backups/
      const currentHour = new Date().getHours();
      if (this.lastSnapshotHour !== currentHour) {
        this.lastSnapshotHour = currentHour;
        try {
          const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
          const snapshotPath = path.join(BACKUP_DIR, `snapshot-${dateStr}.json`);
          fs.writeFileSync(snapshotPath, jsonString, 'utf-8');

          // Keep max 24 snapshots to avoid disk bloating
          const allSnapshots = fs.readdirSync(BACKUP_DIR).filter((f) => f.endsWith('.json')).sort();
          if (allSnapshots.length > 24) {
            const toDelete = allSnapshots.slice(0, allSnapshots.length - 24);
            toDelete.forEach((f) => {
              try { fs.unlinkSync(path.join(BACKUP_DIR, f)); } catch {}
            });
          }
        } catch (snapErr) {
          console.error('Error creating rotating snapshot:', snapErr);
        }
      }

      // 3. Atomic write via temp file
      const tempPath = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, jsonString, 'utf-8');
      fs.renameSync(tempPath, DB_FILE);

      this.data = cleanData;
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  public get(): DatabaseSchema {
    return this.data;
  }

  public reload(): DatabaseSchema {
    this.data = this.load();
    return this.data;
  }

  public save(): void {
    this.saveToFile(this.data);
  }

  public getStats() {
    ensureDirectories();
    let dbSize = 0;
    let dbMtime = new Date().toISOString();
    if (fs.existsSync(DB_FILE)) {
      const stat = fs.statSync(DB_FILE);
      dbSize = stat.size;
      dbMtime = stat.mtime.toISOString();
    }

    let uploadsCount = 0;
    let uploadsTotalBytes = 0;
    if (fs.existsSync(UPLOADS_DIR)) {
      const files = fs.readdirSync(UPLOADS_DIR);
      uploadsCount = files.length;
      files.forEach((f) => {
        try {
          const st = fs.statSync(path.join(UPLOADS_DIR, f));
          uploadsTotalBytes += st.size;
        } catch {}
      });
    }

    let snapshotsCount = 0;
    if (fs.existsSync(BACKUP_DIR)) {
      snapshotsCount = fs.readdirSync(BACKUP_DIR).filter((f) => f.endsWith('.json')).length;
    }

    return {
      dbSizeBytes: dbSize,
      dbSizeFormatted: `${(dbSize / 1024).toFixed(1)} KB`,
      dbLastModified: dbMtime,
      uploadsCount,
      uploadsTotalBytes,
      uploadsTotalFormatted: `${(uploadsTotalBytes / (1024 * 1024)).toFixed(2)} MB`,
      snapshotsCount,
      isPersistent: true,
      storagePath: DB_FILE,
      uploadsPath: UPLOADS_DIR,
      counts: {
        articles: this.data.articles?.filter((a) => !a.isDeleted).length || 0,
        services: this.data.services?.filter((s) => !s.isDeleted).length || 0,
        sliders: this.data.sliders?.filter((s) => !s.isDeleted).length || 0,
        bookings: this.data.bookings?.filter((b) => !b.isDeleted).length || 0,
        messages: this.data.messages?.filter((m) => !m.isDeleted).length || 0,
        media: this.data.media?.length || 0,
        recycleBin: this.data.recycleBin?.length || 0,
      },
    };
  }

  public listSnapshots() {
    ensureDirectories();
    if (!fs.existsSync(BACKUP_DIR)) return [];
    return fs
      .readdirSync(BACKUP_DIR)
      .filter((f) => f.endsWith('.json'))
      .sort()
      .reverse()
      .map((fileName) => {
        const fullPath = path.join(BACKUP_DIR, fileName);
        const stat = fs.statSync(fullPath);
        return {
          fileName,
          sizeBytes: stat.size,
          sizeFormatted: `${(stat.size / 1024).toFixed(1)} KB`,
          createdAt: stat.birthtime.toISOString() || stat.mtime.toISOString(),
        };
      });
  }

  public restoreSnapshot(fileName: string, user: { id: string; name: string; role: UserRole }): boolean {
    try {
      const fullPath = path.join(BACKUP_DIR, path.basename(fileName));
      if (!fs.existsSync(fullPath)) return false;

      const raw = fs.readFileSync(fullPath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (!parsed.doctor || !parsed.services) return false;

      this.data = { ...getDefaultDatabase(), ...parsed };
      this.logActivity(user, 'استعادة لقطة احتياطية', 'النسخ الاحتياطي', `تمت استعادة لقطة قاعدة البيانات: ${fileName}`);
      this.save();
      return true;
    } catch (err) {
      console.error('Failed to restore snapshot:', err);
      return false;
    }
  }

  public createManualSnapshot(user: { id: string; name: string; role: UserRole }, note?: string) {
    ensureDirectories();
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
    const safeNote = note ? `_${note.replace(/[^a-zA-Z0-9_\-\u0600-\u06FF]/g, '_').slice(0, 20)}` : '';
    const fileName = `manual-${dateStr}${safeNote}.json`;
    const fullPath = path.join(BACKUP_DIR, fileName);

    fs.writeFileSync(fullPath, JSON.stringify(this.data, null, 2), 'utf-8');
    this.logActivity(user, 'إنشاء لقطة احتياطية يدوية', 'النسخ الاحتياطي', `تم إنشاء لقطة: ${fileName}`);
    return { fileName, fullPath };
  }

  public logActivity(
    user: { id: string; name: string; role: UserRole },
    action: string,
    module: string,
    details: string
  ): void {
    const entry: ActivityLogItem = {
      id: generateId('act'),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action,
      module,
      details,
      timestamp: new Date().toISOString(),
    };
    this.data.activityLogs.unshift(entry);
    // Keep max 500 logs
    if (this.data.activityLogs.length > 500) {
      this.data.activityLogs.pop();
    }
    this.save();
  }

  public addNotification(
    title: string,
    message: string,
    type: 'booking' | 'message' | 'article' | 'system',
    link?: string
  ): void {
    const notif: NotificationItem = {
      id: generateId('notif'),
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date().toISOString(),
      link,
    };
    this.data.notifications.unshift(notif);
    if (this.data.notifications.length > 100) {
      this.data.notifications.pop();
    }
    this.save();
  }

  public softDelete(
    collectionName: keyof DatabaseSchema,
    id: string,
    user: { id: string; name: string; role: UserRole }
  ): boolean {
    const col = this.data[collectionName];
    if (!Array.isArray(col)) return false;

    const index = (col as any[]).findIndex((item: any) => item.id === id);
    if (index === -1) return false;

    const item = (col as any[])[index];
    item.isDeleted = true;
    item.deletedAt = new Date().toISOString();
    item.deletedBy = user.name;

    // Add to recycle bin
    this.data.recycleBin.unshift({
      id: generateId('rec'),
      collection: String(collectionName),
      data: { ...item },
      deletedAt: new Date().toISOString(),
      deletedBy: user.name,
    });

    // Remove from active array or keep marked as isDeleted
    (col as any[]).splice(index, 1);

    this.logActivity(user, 'حذف عنصر', String(collectionName), `تم حذف العنصر مع المعرّف: ${id}`);
    this.save();
    return true;
  }

  public restoreFromRecycleBin(
    recycleId: string,
    user: { id: string; name: string; role: UserRole }
  ): boolean {
    const recIndex = this.data.recycleBin.findIndex((r) => r.id === recycleId);
    if (recIndex === -1) return false;

    const rec = this.data.recycleBin[recIndex];
    const targetCollection = this.data[rec.collection as keyof DatabaseSchema];

    if (Array.isArray(targetCollection)) {
      const restoredItem = { ...rec.data };
      delete restoredItem.isDeleted;
      delete restoredItem.deletedAt;
      delete restoredItem.deletedBy;
      (targetCollection as any[]).unshift(restoredItem);
    }

    this.data.recycleBin.splice(recIndex, 1);
    this.logActivity(user, 'استرجاع من سلة المحذوفات', rec.collection, `تم استرجاع العنصر: ${rec.data.title || rec.data.name || rec.data.id}`);
    this.save();
    return true;
  }

  public purgeRecycleBinItem(recycleId: string, user: { id: string; name: string; role: UserRole }): boolean {
    const idx = this.data.recycleBin.findIndex((r) => r.id === recycleId);
    if (idx === -1) return false;
    this.data.recycleBin.splice(idx, 1);
    this.logActivity(user, 'حذف نهائي', 'سلة المحذوفات', `تم الحذف النهائي للعنصر: ${recycleId}`);
    this.save();
    return true;
  }

  public exportBackup(): string {
    return JSON.stringify(this.data, null, 2);
  }

  public importBackup(jsonString: string, user: { id: string; name: string; role: UserRole }): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.users || !parsed.doctor || !parsed.services) {
        throw new Error('Invalid backup structure');
      }
      this.data = { ...getDefaultDatabase(), ...parsed };
      this.logActivity(user, 'استعادة نسخة احتياطية', 'النسخ الاحتياطي', 'تم استعادة قاعدة البيانات بالكامل من ملف خارجي');
      this.save();
      return true;
    } catch (e) {
      console.error('Backup import error:', e);
      return false;
    }
  }
}

export const db = new Database();
