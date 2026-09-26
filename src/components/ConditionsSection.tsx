import { useClinicData } from "../context/ClinicDataContext";
import React, { useState } from 'react';
import {
  Flame,
  Bug,
  ShieldAlert,
  Layers,
  TrendingUp,
  Activity,
  Search,
  MoreHorizontal,
  X,
  ChevronLeft,
  Calendar,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { ALL_CONDITIONS, DetailedCondition } from '../data/conditionsData';
import { soundManager } from '../utils/soundEffects';

interface ConditionsSectionProps {
  onSelectCondition?: (condition: DetailedCondition) => void;
}

export const ConditionsSection: React.FC<ConditionsSectionProps> = ({ onSelectCondition }) => {
  const { conditions: dynamicConditions = [] } = useClinicData();
  const [showAllModal, setShowAllModal] = useState(false);
  const [selectedConditionDetail, setSelectedConditionDetail] = useState<DetailedCondition | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Merge dynamic database conditions with ALL_CONDITIONS
  const allEnrichedConditions = React.useMemo(() => {
    return ALL_CONDITIONS.map((cond) => {
      const match = dynamicConditions.find(
        (dc: any) => dc.id === cond.id || dc.slug === cond.slug || (dc.name && cond.name.includes(dc.name.slice(0, 6)))
      );
      if (match) {
        return {
          ...cond,
          name: match.name || cond.name,
          shortDescription: match.description || cond.shortDescription,
          image: match.image || (match as any).imageUrl || cond.image,
        };
      }
      return cond;
    });
  }, [dynamicConditions]);

  // The EXACT 7 cards displayed in reference-model-1.png (Right-to-Left order):
  const primaryDisplayConditions = [
    {
      id: 'gerd',
      title: 'ارتجاع المريء',
      icon: Flame,
      conditionData: allEnrichedConditions.find((c) => c.id === 'gerd'),
    },
    {
      id: 'h-pylori',
      title: 'جرثومة المعدة',
      icon: Bug,
      conditionData: allEnrichedConditions.find((c) => c.id === 'h-pylori'),
    },
    {
      id: 'peptic-ulcer',
      title: 'قرحة المعدة',
      icon: ShieldAlert,
      conditionData: allEnrichedConditions.find((c) => c.id === 'peptic-ulcer'),
    },
    {
      id: 'ibs',
      title: 'القولون العصبي',
      icon: Layers,
      conditionData: allEnrichedConditions.find((c) => c.id === 'ibs'),
    },
    {
      id: 'fatty-liver',
      title: 'الكبد الدهني',
      icon: Activity,
      conditionData: allEnrichedConditions.find((c) => c.id === 'fatty-liver'),
    },
    {
      id: 'liver-enzymes',
      title: 'ارتفاع إنزيمات الكبد',
      icon: TrendingUp,
      conditionData: allEnrichedConditions.find((c) => c.id === 'elevated-liver-enzymes' || c.id === 'liver-enzymes'),
    },
    {
      id: 'other',
      title: 'جميع الأمراض والحالات',
      icon: MoreHorizontal,
      conditionData: null,
    },
  ];

  const handleCardClick = (item: typeof primaryDisplayConditions[0]) => {
    soundManager.playClickChime();
    if (item.id === 'other') {
      setShowAllModal(true);
    } else if (item.conditionData) {
      if (onSelectCondition) {
        onSelectCondition(item.conditionData);
      } else {
        setSelectedConditionDetail(item.conditionData);
      }
    } else {
      setShowAllModal(true);
    }
  };

  const filteredConditions = allEnrichedConditions.filter((item) => {
    const matchesCategory =
      activeCategory === 'all' ||
      item.category === activeCategory ||
      (activeCategory === 'digestive' && item.category === 'gastroenterology');
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      q === '' ||
      item.name.toLowerCase().includes(q) ||
      item.shortDescription.toLowerCase().includes(q) ||
      item.definition.toLowerCase().includes(q) ||
      item.commonSymptoms.some((s) => s.toLowerCase().includes(q)) ||
      item.keywords.some((k) => k.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="conditions" className="py-12 md:py-16 bg-white border-b border-[#e2eaf0]" dir="rtl">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0c3653] mb-2">
            الحالات المرضية التي نعالجها
          </h2>
          <div className="w-10 h-1 bg-[#2fa84f] rounded-full mx-auto" />
        </div>

        {/* 7 Cards Grid matching reference-model-1.png with interactive press & sound effects */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 mb-8">
          {primaryDisplayConditions.map((item) => {
            const IconComponent = item.icon;
            const isOther = item.id === 'other';
            return (
              <div
                key={item.id}
                onClick={() => handleCardClick(item)}
                className="bg-white border border-slate-200/90 hover:border-[#2fa84f] rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center shadow-2xs hover:shadow-lg hover:-translate-y-1 active:scale-90 active:ring-4 active:ring-[#2fa84f]/25 active:bg-emerald-50/50 transition-all duration-150 cursor-pointer group aspect-square select-none"
              >
                {/* Icon Container with interactive bounce */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-115 group-hover:rotate-6 group-active:scale-90 ${
                    isOther
                      ? 'bg-[#2fa84f] text-white shadow-2xs'
                      : 'bg-[#f0f9f3] border border-emerald-100 text-[#2fa84f]'
                  }`}
                >
                  <IconComponent className="w-6 h-6" />
                </div>

                {/* Title */}
                <h3 className="text-xs sm:text-sm font-bold text-[#0c3653] group-hover:text-[#2fa84f] transition-colors leading-snug">
                  {item.title}
                </h3>
              </div>
            );
          })}
        </div>

        {/* Green "عرض جميع الحالات" button */}
        <div className="text-center">
          <button
            onClick={() => {
              soundManager.playClickChime();
              setShowAllModal(true);
            }}
            className="px-7 py-2.5 rounded-lg bg-[#2fa84f] hover:bg-[#279144] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2 mx-auto"
          >
            <span>عرض جميع الحالات الطبية</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* ================= ALL CONDITIONS MODAL ================= */}
      {showAllModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-right">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-[#0c3653]">
                  دليل الحالات المرضية الشامل
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  اختر أي حالة للاطلاع على صفحتها الفرعية الشاملة والصور الواقعية
                </p>
              </div>
              <button
                onClick={() => {
                  soundManager.playClickChime();
                  setShowAllModal(false);
                }}
                className="w-9 h-9 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold cursor-pointer active:scale-90 transition-transform"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter and Search */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث باسم المرض، الأعراض (مثال: جرثومة، ارتجاع، دهون)..."
                    className="w-full pr-10 pl-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#2fa84f] transition-colors"
                  />
                </div>

                {/* Categories Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {[
                    { id: 'all', label: 'الكل' },
                    { id: 'digestive', label: 'جهاز هضمي' },
                    { id: 'liver', label: 'كبد وصفراء' },
                    { id: 'internal-medicine', label: 'باطنة عامة' },
                    { id: 'endoscopy', label: 'مناظير' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        soundManager.playClickChime();
                        setActiveCategory(cat.id);
                      }}
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer active:scale-95 ${
                        activeCategory === cat.id
                          ? 'bg-[#2fa84f] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conditions List Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredConditions.map((cond) => (
                  <div
                    key={cond.id}
                    onClick={() => {
                      soundManager.playClickChime();
                      setShowAllModal(false);
                      if (onSelectCondition) {
                        onSelectCondition(cond);
                      } else {
                        setSelectedConditionDetail(cond);
                      }
                    }}
                    className="bg-white border border-slate-200 hover:border-[#2fa84f] rounded-2xl p-4 shadow-2xs hover:shadow-lg transition-all duration-150 cursor-pointer flex flex-col justify-between group active:scale-95 active:ring-2 active:ring-[#2fa84f]/30"
                  >
                    <div>
                      {/* 100% Realistic Image Thumbnail */}
                      <div className="w-full h-32 rounded-xl overflow-hidden mb-3 bg-slate-100 relative">
                        <img
                          src={cond.image}
                          alt={cond.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/gerd_2026_1790363403788.jpg';
                          }}
                        />
                        <span className="absolute top-2 right-2 text-[10px] font-bold text-[#0872B9] bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md shadow-2xs">
                          {cond.category === 'liver' ? 'كبد' : cond.category === 'internal-medicine' ? 'باطنة' : 'هضمي'}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-[#0c3653] group-hover:text-[#2fa84f] transition-colors mb-1">
                        {cond.name}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                        {cond.shortDescription}
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#2fa84f] font-bold">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>فتح الصفحة الفرعية الكاملة</span>
                      </span>
                      <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ================= INDIVIDUAL CONDITION DETAIL MODAL (Fallback) ================= */}
      {selectedConditionDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-right">
            
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-xs font-bold text-[#2fa84f] mb-1 block">
                  دليل الحالات السريرية
                </span>
                <h3 className="text-lg sm:text-xl font-black text-[#0c3653]">
                  {selectedConditionDetail.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedConditionDetail(null)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold cursor-pointer active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
              {/* Realistic Image in Modal */}
              <div className="w-full h-48 rounded-2xl overflow-hidden bg-slate-900 relative">
                <img
                  src={selectedConditionDetail.image}
                  alt={selectedConditionDetail.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/gerd_2026_1790363403788.jpg';
                  }}
                />
              </div>

              <div>
                <h4 className="font-bold text-[#0c3653] mb-1">التعريف الطبي:</h4>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedConditionDetail.definition}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#0c3653] mb-2">الأعراض الشائعة:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedConditionDetail.commonSymptoms.map((sym, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50/50 border border-emerald-100 text-emerald-900">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2fa84f]" />
                      <span>{sym}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[#0c3653] mb-2">النهج التشخيصي والعلاجي:</h4>
                <div className="p-3 rounded-xl bg-slate-50 text-slate-700 leading-relaxed border border-slate-100">
                  {typeof selectedConditionDetail.treatmentApproach === 'string' ? (
                    <p>{selectedConditionDetail.treatmentApproach}</p>
                  ) : (
                    <div className="space-y-1.5">
                      {(selectedConditionDetail.treatmentApproach as any[]).map((app, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-[#0872B9] font-bold">✓</span>
                          <span>{app}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 flex flex-col sm:flex-row gap-2">
                {onSelectCondition && (
                  <button
                    onClick={() => {
                      soundManager.playClickChime();
                      const cond = selectedConditionDetail;
                      setSelectedConditionDetail(null);
                      onSelectCondition(cond);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#0872B9] hover:bg-[#075f9a] text-white font-bold flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>فتح الصفحة الفرعية الكاملة للحالة</span>
                  </button>
                )}
                <a
                  href="#booking"
                  onClick={() => {
                    setSelectedConditionDetail(null);
                    setShowAllModal(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#2fa84f] hover:bg-[#279144] text-white font-bold flex items-center justify-center gap-2 text-center"
                >
                  <Calendar className="w-4 h-4" />
                  <span>حجز استشارة طبية</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
