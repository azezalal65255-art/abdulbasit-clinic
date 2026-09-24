import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  CLINIC_INFO,
  QUALIFICATIONS,
  SPECIALTIES,
  MEDICAL_CONDITIONS,
  ENDOSCOPY_PROCEDURES,
  MEDICAL_ARTICLES,
  FAQS,
} from '../data/clinicData';
import { api } from '../services/api';
import {
  Specialty,
  MedicalCondition,
  EndoscopyProcedure,
  MedicalArticle,
  Qualification,
  FaqItem,
  ClinicVideo,
  Career,
  Conference,
  Research,
  Slider,
} from '../types';

interface ClinicDataState {
  doctor: {
    name: string;
    title: string;
    jobTitle: string;
    bio: string;
    photo: string;
    experiences: string[];
    qualifications: Qualification[];
  };
  services: Specialty[];
  conditions: MedicalCondition[];
  endoscopy: EndoscopyProcedure[];
  articles: MedicalArticle[];
  pages: any[];
  faqs: FaqItem[];
  videos: ClinicVideo[];
  careers: Career[];
  conferences: Conference[];
  research: Research[];
  sliders: Slider[];
  schedule: {
    morningHours: string;
    eveningHours: string;
    workingDays: string;
    morningActive: boolean;
    eveningActive: boolean;
    emergencyNotice: string;
    isNoticeActive: boolean;
  };
  contact: {
    phones: string[];
    whatsapp: string;
    email: string;
    address: string;
    addressShort: string;
    building: string;
    city: string;
    country: string;
    googleMapsUrl: string;
    googleMapsEmbed: string;
    social: {
      whatsapp: string;
      facebook: string;
      instagram: string;
      youtube?: string;
      tiktok?: string;
      twitter?: string;
      telegram?: string;
      linkedin?: string;
      snapchat?: string;
    };
  };
  settings: {
    siteName: string;
    clinicName: string;
    doctorName: string;
    doctorSpecialty: string;
    logoUrl: string;
    heroHeadline: string;
    heroSubheadline: string;
    bookButtonText: string;
    defaultWhatsAppText: string;
  };
  isLoading: boolean;
  refreshContent: () => Promise<void>;
}

const defaultState: ClinicDataState = {
  doctor: {
    name: CLINIC_INFO.doctorName,
    title: CLINIC_INFO.doctorTitle,
    jobTitle: 'استشاري أول ورئيس وحدة الجهاز الهضمي والكبد والمناظير',
    bio: 'استشاري متخصص في تشخيص وعلاج أمراض الجهاز الهضمي وأمراض الكبد المزمنة وإجراء مناظير المعدة والقولون التشخيصية والعلاجية، حاصل على الماجستير والدكتوراه من كلية الطب بجامعة القاهرة (قصر العيني).',
    photo: '/images/dr-abdulbasit.jpg',
    experiences: [
      'خبرة سريرية وأكاديمية متقدمة في أمراض الجهاز الهضمي والكبد',
      'إجراء آلاف المناظير التشخيصية والعلاجية للمعدة والقولون بنسب أمان ونجاح عالية',
      'تدريب تخصصي وبحثي مكثف في مستشفيات جامعة القاهرة وقصر العيني',
      'متابعة الحالات المعقدة لأمراض الكبد الفيروسية والدهنية والمناعية',
    ],
    qualifications: QUALIFICATIONS,
  },
  services: SPECIALTIES,
  conditions: MEDICAL_CONDITIONS,
  endoscopy: ENDOSCOPY_PROCEDURES,
  articles: MEDICAL_ARTICLES,
  pages: [],
  faqs: FAQS,
  videos: [],
  careers: [],
  conferences: [],
  research: [],
  sliders: [],
  schedule: {
    morningHours: CLINIC_INFO.morningHours,
    eveningHours: CLINIC_INFO.eveningHours,
    workingDays: CLINIC_INFO.workingDays,
    morningActive: true,
    eveningActive: true,
    emergencyNotice: '',
    isNoticeActive: false,
  },
  contact: {
    phones: CLINIC_INFO.phones,
    whatsapp: CLINIC_INFO.whatsapp,
    email: CLINIC_INFO.email,
    address: CLINIC_INFO.address,
    addressShort: CLINIC_INFO.addressShort,
    building: CLINIC_INFO.building,
    city: CLINIC_INFO.city,
    country: CLINIC_INFO.country,
    googleMapsUrl: CLINIC_INFO.googleMapsUrl || 'https://maps.app.goo.gl/MCyvMKGM5Bn2ZGFy6',
    googleMapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3848.47!2d44.2213114!3d15.3361629!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1603db5a79506aed%3A0xe8fd3a13d23c9994!2zMTXCsDIwJzEwLjIiTiA0NMKwMTMnMTYuNyJF!5e0!3m2!1sar!2sye!4v1710000000000!5m2!1sar!2sye',
    social: {
      whatsapp: CLINIC_INFO.social.whatsapp,
      facebook: CLINIC_INFO.social.facebook,
      instagram: CLINIC_INFO.social.instagram,
    },
  },
  settings: {
    siteName: 'عيادة د. عبدالباسط عبده الحاج مقبل',
    clinicName: CLINIC_INFO.clinicName,
    doctorName: CLINIC_INFO.doctorName,
    doctorSpecialty: CLINIC_INFO.doctorTitle,
    logoUrl: '/images/clinic-logo.jpg',
    heroHeadline: 'رعاية متقدمة لأمراض الجهاز الهضمي والكبد والمناظير',
    heroSubheadline: 'تشخيص دقيق وعلاج متخصص بإشراف د. عبدالباسط عبده الحاج مقبل، استشاري الباطنة والجهاز الهضمي والكبد والمناظير، وفق أحدث المعايير الطبية العالمية.',
    bookButtonText: 'حجز موعد استشارة',
    defaultWhatsAppText: 'مرحبًا، أود حجز موعد في عيادة د. عبدالباسط عبده الحاج مقبل.',
  },
  isLoading: false,
  refreshContent: async () => {},
};

const ClinicDataContext = createContext<ClinicDataState>(defaultState);

export function ClinicDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ClinicDataState>(defaultState);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchContent = async () => {
    try {
      const res = await api.getPublicContent();
      if (res) {
        setData((prev) => ({
          ...prev,
          doctor: {
            name: res.doctor?.name || prev.doctor.name,
            title: res.doctor?.title || prev.doctor.title,
            jobTitle: res.doctor?.jobTitle || prev.doctor.jobTitle,
            bio: res.doctor?.bio || prev.doctor.bio,
            photo: res.doctor?.photo || prev.doctor.photo,
            experiences: res.doctor?.experiences || prev.doctor.experiences,
            qualifications: res.doctor?.qualifications?.length ? res.doctor.qualifications : prev.doctor.qualifications,
          },
          services: res.services?.length
            ? res.services.map((s: any) => ({
                id: s.id,
                title: s.title,
                description: s.description,
                iconName: s.iconName || 'Activity',
                features: s.features || [],
              }))
            : prev.services,
          conditions: res.conditions?.length
            ? res.conditions.map((c: any) => ({
                id: c.id,
                name: c.name,
                category: c.category || 'digestive',
                icon: c.icon || 'Flame',
                description: c.description,
                symptoms: c.symptoms || [],
                treatmentApproach: c.treatmentApproach || '',
              }))
            : prev.conditions,
          endoscopy: res.endoscopy?.length
            ? res.endoscopy.map((e: any) => ({
                id: e.id,
                title: e.title,
                description: e.description,
                image: e.image,
                indications: e.indications || [],
                duration: e.duration,
                prepSummary: e.prepSummary,
              }))
            : prev.endoscopy,
          articles: res.articles?.length
            ? res.articles.map((a: any) => ({
                id: a.id,
                title: a.title,
                slug: a.slug,
                excerpt: a.excerpt,
                category: a.category,
                readTime: a.readTime,
                date: a.date,
                image: a.image,
                content: Array.isArray(a.content) ? a.content : [a.content],
              }))
            : prev.articles,
          pages: Array.isArray(res.pages) ? res.pages : prev.pages,
          faqs: res.faqs?.length
            ? res.faqs.map((f: any) => ({
                question: f.question,
                answer: f.answer,
                category: f.category,
              }))
            : prev.faqs,
          videos: Array.isArray(res.videos) ? res.videos : prev.videos,
          careers: Array.isArray(res.careers) ? res.careers : prev.careers,
          conferences: Array.isArray(res.conferences) ? res.conferences : prev.conferences,
          research: Array.isArray(res.research) ? res.research : prev.research,
          sliders: Array.isArray(res.sliders) ? res.sliders : prev.sliders,
          schedule: res.schedule || prev.schedule,
          contact: {
            phones: [res.contact?.phone1, res.contact?.phone2].filter(Boolean),
            whatsapp: res.contact?.whatsapp || prev.contact.whatsapp,
            email: res.contact?.email || prev.contact.email,
            address: res.contact?.address || prev.contact.address,
            addressShort: res.contact?.addressShort || prev.contact.addressShort,
            building: res.contact?.building || prev.contact.building,
            city: res.contact?.city || prev.contact.city,
            country: res.contact?.country || prev.contact.country,
            googleMapsUrl: res.contact?.googleMapsUrl || prev.contact.googleMapsUrl,
            googleMapsEmbed: res.contact?.googleMapsEmbed || '',
            social: {
              whatsapp: res.contact?.whatsapp ? (res.contact.whatsapp.startsWith('http') ? res.contact.whatsapp : `https://wa.me/967${res.contact.whatsapp}`) : prev.contact.social.whatsapp,
              facebook: res.contact?.facebook || prev.contact.social.facebook,
              instagram: res.contact?.instagram || prev.contact.social.instagram,
              youtube: res.contact?.youtube || prev.contact.social.youtube,
              tiktok: res.contact?.tiktok || prev.contact.social.tiktok,
              twitter: res.contact?.twitter || prev.contact.social.twitter,
              telegram: res.contact?.telegram || prev.contact.social.telegram,
              linkedin: res.contact?.linkedin || prev.contact.social.linkedin,
              snapchat: res.contact?.snapchat || prev.contact.social.snapchat,
            },
          },
          settings: res.settings || prev.settings,
        }));
      }
    } catch (err) {
      console.warn('Could not fetch public content from API, falling back to cached/preset data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();

    // Track initial visit
    api.trackAnalyticsEvent({
      type: 'visit',
      page: window.location.pathname,
      device: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
    }).catch(() => {});
  }, []);

  return (
    <ClinicDataContext.Provider
      value={{
        ...data,
        isLoading,
        refreshContent: fetchContent,
      }}
    >
      {children}
    </ClinicDataContext.Provider>
  );
}

export function useClinicData(): ClinicDataState {
  return useContext(ClinicDataContext);
}
