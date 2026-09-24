import React from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { CLINIC_INFO } from '../data/clinicData';
import { useClinicData } from '../context/ClinicDataContext';

export const MapSection: React.FC = () => {
  const { contact: rawContact } = useClinicData();
  const contact = rawContact as any;
  
  // Show or hide the map completely based on settings
  if (contact?.showMap === false) {
    return null;
  }

  const mapDirectionsUrl = contact?.googleMapsUrl || CLINIC_INFO.googleMapsUrl || 'https://maps.app.goo.gl/MCyvMKGM5Bn2ZGFy6';
  const clinicAddress = contact?.address || CLINIC_INFO.address;
  const clinicBuilding = contact?.building || CLINIC_INFO.building || 'مركز المأمون الطبي التشخيصي';
  const zoomLevel = contact?.zoomLevel || 18;
  
  // Determine Google Maps Embed URL dynamically
  let embedUrl = contact?.googleMapsEmbed;
  if (!embedUrl) {
    if (contact?.latitude && contact?.longitude) {
      embedUrl = `https://maps.google.com/maps?q=${contact.latitude},${contact.longitude}&z=${zoomLevel}&output=embed`;
    } else {
      embedUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3848.47!2d44.2213114!3d15.3361629!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1603db5a79506aed%3A0xe8fd3a13d23c9994!2zMTXCsDIwJzEwLjIiTiA0NMKwMTMnMTYuNyJF!5e0!3m2!1sar!2sye!4v1710000000000!5m2!1sar!2sye';
    }
  }

  const directionsBtnText = contact?.directionsBtnText || 'فتح الموقع على خرائط جوجل (Google Maps)';
  const locationDescription = contact?.description || 'صنعاء – شارع تعز (تقاطع شارع تعز) – جولة تعز - مركز المأمون الطبي التشخيصي';

  return (
    <section id="location-map" className="py-16 md:py-20 bg-[#F6FAFC] border-b border-[#E2EAF0]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F0F7FC] border border-[#BED8EA] text-[#064B82] text-xs font-bold mb-3">
            <span>الموقع الجغرافي والاتجاهات</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#064B82] mb-2">
            موقع العيادة
          </h2>
          <div className="geometric-divider">
            <span className="geometric-divider-center" />
          </div>
          <p className="text-sm sm:text-base text-[#4B6375]">
            {clinicAddress}
          </p>
        </div>

        {/* Map Preview Container */}
        <div className="geometric-card overflow-hidden">
          
          <div className="relative w-full h-[360px] sm:h-[420px] bg-slate-100 flex items-center justify-center overflow-hidden">
            <iframe
              title="موقع عيادة د. عبدالباسط عبده الحاج مقبل الاستشارية"
              src={embedUrl}
              className="w-full h-full border-0 pointer-events-auto"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />

            {/* Overlaid Clinic Location Card */}
            <div className="absolute bottom-4 right-4 max-w-sm bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-xl border border-[#BED8EA] shadow-lg text-right z-10 hidden sm:block">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#064B82] text-white flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-[#A5D56D]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#064B82]">
                    {clinicBuilding}
                  </h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    {locationDescription}
                  </p>
                  <div className="mt-2 text-xs font-semibold text-[#55A630]">
                    عيادة د. عبدالباسط عبده الحاج مقبل الاستشارية
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Bar: Action Directions Button */}
          <div className="p-4 sm:p-5 bg-white border-t border-[#E2EAF0] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-[#17354F] font-semibold text-right">
              <MapPin className="w-4 h-4 text-[#0872B9] shrink-0" />
              <span>{clinicBuilding} – {clinicAddress}</span>
            </div>

            <a
              href={mapDirectionsUrl}
              target="_blank"
              rel="noreferrer"
              id="get-directions-btn"
              className="inline-flex items-center justify-center gap-2 bg-[#064B82] hover:bg-[#0872B9] text-white font-bold px-6 py-2.5 rounded-xl shadow-2xs hover:shadow-xs transition-all text-xs sm:text-sm w-full sm:w-auto cursor-pointer active:scale-[0.99]"
            >
              <Navigation className="w-4 h-4 text-[#A5D56D]" />
              <span>{directionsBtnText}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>

      </div>
    </section>
  );
};
