import { PROTECTED_SUPABASE_DOCTOR_PHOTO, LOCAL_DOCTOR_PHOTO } from "../constants/clinicAssets";
import React from 'react';
import { GraduationCap, Award, BookOpen, Microscope, ShieldCheck } from 'lucide-react';
import { QUALIFICATIONS, CLINIC_INFO } from '../data/clinicData';
import { useClinicData } from '../context/ClinicDataContext';

export const QualificationsSection: React.FC = () => {
  const { doctor } = useClinicData();

  const doctorName = doctor?.name || CLINIC_INFO.doctorName;
  const doctorTitle = doctor?.title || CLINIC_INFO.doctorTitle;
  const doctorPhoto = doctor?.photo || PROTECTED_SUPABASE_DOCTOR_PHOTO;
  const doctorBio = doctor?.bio || 'د. عبدالباسط عبده الحاج مقبل، استشاري أمراض الباطنة والجهاز الهضمي والكبد والمناظير، وأستاذ الباطنة المساعد بكلية الطب والعلوم الصحية بجامعة ذمار، حاصل على دكتوراه (بورد) أمراض الباطنة ودبلوم عالي في الباطنة، وعضو الجمعية الأوروبية لمناظير الجهاز الهضمي (ESGE).';
  const qualifications = doctor?.qualifications?.length ? doctor.qualifications : QUALIFICATIONS;

  const getIcon = (type: string) => {
    switch (type) {
      case 'academic':
        return <GraduationCap className="w-6 h-6 text-[#0872B9]" />;
      case 'specialist':
        return <BookOpen className="w-6 h-6 text-[#55A630]" />;
      case 'doctorate':
        return <Award className="w-6 h-6 text-[#064B82]" />;
      case 'advanced':
        return <Microscope className="w-6 h-6 text-[#2F8B3C]" />;
      default:
        return <GraduationCap className="w-6 h-6 text-[#0872B9]" />;
    }
  };

  return (
    <section id="about" className="py-16 md:py-20 bg-white border-b border-[#E2EAF0]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F0F7FC] border border-[#BED8EA] text-[#064B82] text-xs font-bold mb-3">
            <span>المسيرة العلمية والتخصصية</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#064B82] mb-2">
            المؤهلات العلمية للدكتور
          </h2>
          <div className="geometric-divider">
            <span className="geometric-divider-center" />
          </div>
          <p className="text-sm sm:text-base text-[#4B6375]">
            مسيرة أكاديمية وسريرية رصينة من أعرق الجامعات في تخصص الباطنة والجهاز الهضمي والكبد والمناظير
          </p>
        </div>

        {/* Doctor Highlight Box */}
        <div className="geometric-card p-6 sm:p-8 mb-12 flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-white shrink-0 border border-[#BED8EA] shadow-2xs">
            <img
              src={doctorPhoto}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = LOCAL_DOCTOR_PHOTO; }}
              alt={doctorName}
              className="w-full h-full object-contain object-top"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="text-right flex-1">
            <h3 className="text-xl sm:text-2xl font-bold text-[#064B82] mb-1">
              {doctorName}
            </h3>
            <p className="text-sm font-semibold text-[#55A630] mb-2">
              {doctorTitle}
            </p>
            <p className="text-xs sm:text-sm text-[#4B6375] leading-relaxed">
              {doctorBio}
            </p>
          </div>
        </div>

        {/* Qualifications Timeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {qualifications.map((q, idx) => (
            <div
              key={idx}
              className="geometric-card p-6 flex gap-4 items-start group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#F0F7FC] border border-[#E2EAF0] flex items-center justify-center shrink-0 group-hover:bg-[#F0F8EC] group-hover:border-[#C5E6B5] transition-colors">
                {getIcon(q.iconType)}
              </div>
              <div className="flex-1 text-right">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0872B9] bg-[#F0F7FA] border border-[#BED8EA] px-2.5 py-0.5 rounded-full mb-1.5">
                  <ShieldCheck className="w-3 h-3 text-[#55A630]" />
                  <span>مؤهل أكاديمي معتمد</span>
                </div>
                <h4 className="text-base sm:text-lg font-bold text-[#064B82] group-hover:text-[#0872B9] transition-colors mb-1">
                  {q.degree}
                </h4>
                <div className="text-xs sm:text-sm font-bold text-[#55A630] mb-2">
                  {q.institution}
                </div>
                <p className="text-xs text-[#4B6375] leading-relaxed">
                  {q.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
