"use client";

import React from 'react';
import DeleteConfirmationModal from "@/app/modules/shared/components/DeleteConfirmationModal";

export interface Hotel {
  city: string;
  nights: number;
  cityBadge?: string;
  hotelName: string;
  hasDetailsLink?: boolean;
  detailsLink?: string;
  roomDescription: {
    includesAll: string;
    bedType: string;
    roomType?: string;
  };
  checkInDate: string;
  checkOutDate: string;
  dayInfo: {
    checkInDay: string;
    checkOutDay: string;
  };
}

export interface HotelsSectionProps {
  hotels?: Hotel[];
  title?: string;
  showTitle?: boolean;
  direction?: "rtl" | "ltr";
  language?: "ar" | "en";
  labels?: {
    nights: string;
    includes: string;
    checkIn: string;
    checkOut: string;
    details: string;
    count: string;
  };
  id?: string;
  editable?: boolean;
  sectionId?: string;
  onEditHotel?: (hotelIndex: number) => void;
  onRemoveHotel?: (hotelIndex: number) => void;
  onAddHotel?: () => void;
  onEditSection?: () => void;
  onDeleteSection?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const HotelsSection: React.FC<HotelsSectionProps> = ({
  hotels = [
    {
      city: "جزيرة بوكيت",
      nights: 5,
      cityBadge: "المدينة الاولى",
      hotelName: "منتجع بولمان بوكيت كارون بيتش",
      hasDetailsLink: false,
      roomDescription: {
        includesAll: "شامل الافطار",
        bedType: "سرير اضافي/ عدد: 2",
        roomType: "سوبريور علي الحديقه"
      },
      checkInDate: "2025-07-01",
      checkOutDate: "2025-07-06",
      dayInfo: {
        checkInDay: "اليوم الاول",
        checkOutDay: "اليوم السادس"
      }
    },
    {
      city: "شنغماي",
      nights: 4,
      cityBadge: "المدينة الثانيه",
      hotelName: "فندق فييلا شنغماي",
      hasDetailsLink: true,
      roomDescription: {
        includesAll: "شامل الافطار",
        bedType: "سرير اضافي/ عدد: 2",
        roomType: "غرفة ميليا"
      },
      checkInDate: "2025-07-06",
      checkOutDate: "2025-07-10",
      dayInfo: {
        checkInDay: "اليوم السادس",
        checkOutDay: "اليوم العاشر"
      }
    },
    {
      city: "بانكوك",
      nights: 2,
      cityBadge: "المدينة الثالثه",
      hotelName: "فندق جراند سنتر بوينت بلومبينيتشنيت",
      hasDetailsLink: true,
      roomDescription: {
        includesAll: "شامل الافطار",
        bedType: "سرير اضافي/ عدد: 2",
        roomType: "سوبريور مع بلكونه"
      },
      checkInDate: "2025-07-10",
      checkOutDate: "2025-07-12",
      dayInfo: {
        checkInDay: "اليوم العاشر",
        checkOutDay: "اليوم الثاني عشر"
      }
    }
  ],
  title,
  showTitle = true,
  direction = "rtl",
  language = "ar",
  labels,
  editable = false,
  id,
  sectionId,
  onEditHotel,
  onRemoveHotel,
  onAddHotel,
  onEditSection,
  onDeleteSection,
  className = "",
  style
}) => {
  const sectionIdValue = id || sectionId;

  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<{type: 'section' | 'hotel', hotelIndex?: number} | null>(null);

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'section' && onDeleteSection) {
      onDeleteSection();
    } else if (deleteTarget.type === 'hotel' && deleteTarget.hotelIndex !== undefined && onRemoveHotel) {
      onRemoveHotel(deleteTarget.hotelIndex);
    }
    setDeleteTarget(null);
    setShowDeleteModal(false);
  };

  const defaultTitle = title || (language === 'ar' ? 'حجز الفنادق' : 'Hotel Booking');
  const defaultLabels = labels || (language === 'ar' ? {
    nights: "ليالي",
    includes: "شامل الافطار",
    checkIn: "تاريخ الدخول",
    checkOut: "تاريخ الخروج",
    details: "للتفاصيل",
    count: "عدد"
  } : {
    nights: "Nights",
    includes: "Includes Breakfast",
    checkIn: "Check-in",
    checkOut: "Check-out",
    details: "Details",
    count: "Count"
  });

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  return (
    <div
      className={`hotels-section w-full mb-8 ${className} no-break`}
      style={style}
      dir={direction}
      data-hotels-section-id={sectionIdValue}
    >
      {/* Section Edit/Delete Controls */}
      {editable && (
        <div className={`mb-4 flex ${direction === 'rtl' ? 'justify-start' : 'justify-end'}`}>
          <div className={`flex gap-2 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onEditSection) onEditSection();
              }}
              data-action="edit-section"
              data-hotels-section-id={sectionIdValue}
              className="p-2.5 bg-[#3B5998] text-white rounded-full hover:bg-[#2E4A7A] transition-all duration-200 shadow-md hover:shadow-lg hover:scale-110 cursor-pointer"
              title={language === 'ar' ? 'تعديل القسم' : 'Edit Section'}
              type="button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDeleteTarget({type: 'section'});
                setShowDeleteModal(true);
              }}
              data-action="delete-section"
              data-hotels-section-id={sectionIdValue}
              className="p-2.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-110 cursor-pointer"
              title={language === 'ar' ? 'حذف القسم' : 'Delete Section'}
              type="button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Section Title */}
      {showTitle && (
        <div className="flex items-center justify-center mb-6">
          <div className={`bg-[#3B5998] text-white px-10 py-3.5 rounded-full flex items-center gap-3.5 shadow-lg hover:shadow-xl transition-shadow duration-300 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
            <h2 className="text-xl md:text-2xl font-bold tracking-wide">{defaultTitle}</h2>
            <div className="bg-white rounded-full p-2.5 shadow-inner">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 text-[#3B5998]"
              >
                <path d="M19.006 3.705a.75.75 0 00-.512-1.41L6 6.838V3a.75.75 0 00-.75-.75h-1.5A.75.75 0 003 3v4.93l-1.006.365a.75.75 0 00.512 1.41l16.5-6z" />
                <path fillRule="evenodd" d="M3.019 11.115L18 5.667V9.09l4.006 1.456a.75.75 0 11-.512 1.41l-.494-.18v8.475h.75a.75.75 0 010 1.5H2.25a.75.75 0 010-1.5H3v-9.129l.019-.007zM18 20.25v-9.565l1.5.545v9.02H18zm-9-6a.75.75 0 00-.75.75v4.5c0 .414.336.75.75.75h3a.75.75 0 00.75-.75V15a.75.75 0 00-.75-.75H9z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Hotel Cards */}
      <div className="space-y-5">
        {hotels.map((hotel, index) => (
          <div
            key={index}
            className="rounded-2xl overflow-hidden border border-blue-100 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white"
          >
            {/* Card Header: Day Info | City + Nights | Edit Buttons */}
            <div className={`bg-[#1E88E5] px-4 py-3.5 flex items-center gap-3 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
              {/* Day Info */}
              <div className={`space-y-0.5 min-w-[90px] shrink-0 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                <div className="text-xs font-semibold text-white/80 leading-tight flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60 shrink-0" />
                  {hotel.dayInfo.checkInDay}
                </div>
                <div className="text-xs font-semibold text-white/80 leading-tight flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60 shrink-0" />
                  {hotel.dayInfo.checkOutDay}
                </div>
              </div>

              {/* City + Nights — Center */}
              <div className="flex flex-col items-center gap-1.5 flex-1">
                {hotel.cityBadge && (
                  <span className="bg-[#FF6B35] text-white px-3 py-0.5 rounded-full text-xs md:text-sm font-bold shadow-sm">
                    {hotel.cityBadge}
                  </span>
                )}
                <div className={`flex items-center gap-2 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                  <span className="bg-white/20 text-white px-2.5 py-0.5 rounded-full text-sm font-semibold">
                    {hotel.nights} {defaultLabels.nights}
                  </span>
                  <span className="text-white font-bold text-base md:text-lg">{hotel.city}</span>
                </div>
              </div>

              {/* Edit / Delete Buttons — always rendered to mirror the day-info width and keep city centered */}
              <div className={`min-w-[90px] shrink-0 flex gap-2 ${direction === 'rtl' ? 'flex-row-reverse justify-start' : 'justify-end'}`}>
                {editable && (
                  <>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (onEditHotel) onEditHotel(index);
                      }}
                      data-action="edit-hotel"
                      data-hotels-section-id={sectionIdValue}
                      data-hotel-index={index}
                      className="p-2 bg-white/20 text-white rounded-lg hover:bg-white/35 transition-all duration-200 cursor-pointer"
                      title={language === 'ar' ? 'تعديل' : 'Edit'}
                      type="button"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    {hotels.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDeleteTarget({type: 'hotel', hotelIndex: index});
                          setShowDeleteModal(true);
                        }}
                        data-action="remove-hotel"
                        data-hotels-section-id={sectionIdValue}
                        data-hotel-index={index}
                        className="p-2 bg-white/20 text-white rounded-lg hover:bg-red-400/60 transition-all duration-200 cursor-pointer"
                        title={language === 'ar' ? 'حذف' : 'Delete'}
                        type="button"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Card Body */}
            <div className="p-5 md:p-6">
              {/* Hotel Name Bar */}
              <div className={`bg-[#1E88E5] text-white px-5 py-3 rounded-xl flex items-center justify-center gap-3 shadow-md ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <span className="font-bold text-base md:text-lg leading-relaxed text-center flex-1">{hotel.hotelName}</span>
                {hotel.hasDetailsLink && (
                  hotel.detailsLink ? (
                    <a
                      href={hotel.detailsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`bg-white rounded-full py-1.5 px-3 flex items-center gap-1.5 shadow-sm hover:shadow-md transition-shadow cursor-pointer shrink-0 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4 text-[#4FC3F7] shrink-0"
                      >
                        <path fillRule="evenodd" d="M19.902 4.098a3.75 3.75 0 00-5.304 0l-4.5 4.5a3.75 3.75 0 001.035 6.037.75.75 0 01-.646 1.353 5.25 5.25 0 01-1.449-8.45l4.5-4.5a5.25 5.25 0 117.424 7.424l-1.757 1.757a.75.75 0 11-1.06-1.06l1.757-1.757a3.75 3.75 0 000-5.304zm-7.389 4.267a.75.75 0 011-.353 5.25 5.25 0 011.449 8.45l-4.5 4.5a5.25 5.25 0 11-7.424-7.424l1.757-1.757a.75.75 0 111.06 1.06l1.757 1.757a3.75 3.75 0 105.304 5.304l4.5-4.5a3.75 3.75 0 00-1.035-6.037.75.75 0 01-.354-1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-[#1E88E5] text-xs md:text-sm font-bold">{defaultLabels.details}</span>
                    </a>
                  ) : (
                    <div className={`bg-white rounded-full py-1.5 px-3 flex items-center gap-1.5 shadow-sm shrink-0 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4 text-[#4FC3F7] shrink-0"
                      >
                        <path fillRule="evenodd" d="M19.902 4.098a3.75 3.75 0 00-5.304 0l-4.5 4.5a3.75 3.75 0 001.035 6.037.75.75 0 01-.646 1.353 5.25 5.25 0 01-1.449-8.45l4.5-4.5a5.25 5.25 0 117.424 7.424l-1.757 1.757a.75.75 0 11-1.06-1.06l1.757-1.757a3.75 3.75 0 000-5.304zm-7.389 4.267a.75.75 0 011-.353 5.25 5.25 0 011.449 8.45l-4.5 4.5a5.25 5.25 0 11-7.424-7.424l1.757-1.757a.75.75 0 111.06 1.06l1.757 1.757a3.75 3.75 0 105.304 5.304l4.5-4.5a3.75 3.75 0 00-1.035-6.037.75.75 0 01-.354-1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-[#1E88E5] text-xs md:text-sm font-bold">{defaultLabels.details}</span>
                    </div>
                  )
                )}
              </div>

              {/* Room Details */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-[#1E88E5] text-white px-5 py-3 rounded-xl text-center font-semibold text-sm md:text-base shadow-md">
                  {hotel.roomDescription.includesAll}
                </div>
                {hotel.roomDescription.roomType && (
                  <div className="bg-[#1E88E5] text-white px-5 py-3 rounded-xl text-center font-semibold text-sm md:text-base shadow-md">
                    {hotel.roomDescription.roomType}
                  </div>
                )}
              </div>
              <div className="mt-3">
                <div className="bg-[#1E88E5] text-white px-5 py-3 rounded-xl text-center font-semibold text-sm md:text-base shadow-md">
                  {hotel.roomDescription.bedType}
                </div>
              </div>

              {/* Check-in / Check-out */}
              <div className={`mt-4 bg-[#FF6B35] text-white px-5 py-3.5 rounded-xl flex items-center justify-center gap-3 text-sm md:text-base font-bold shadow-md ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs opacity-90 font-medium">{defaultLabels.checkIn}</span>
                  <span className="font-bold">{formatDate(hotel.checkInDate)}</span>
                </div>
                <div className="flex gap-1 text-xl md:text-2xl opacity-70">
                  {direction === 'rtl' ? (
                    <><span>《</span><span>《</span><span>《</span></>
                  ) : (
                    <><span>》</span><span>》</span><span>》</span></>
                  )}
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs opacity-90 font-medium">{defaultLabels.checkOut}</span>
                  <span className="font-bold">{formatDate(hotel.checkOutDate)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add Hotel Button */}
        {editable && (
          <div className="border-2 border-dashed border-blue-200 rounded-2xl p-8 md:p-10 bg-blue-50/60 text-center hover:bg-blue-50 transition-colors duration-200">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onAddHotel) onAddHotel();
              }}
              data-action="add-hotel"
              data-hotels-section-id={sectionIdValue}
              className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-200 text-sm md:text-base font-medium flex items-center gap-2 mx-auto shadow-md hover:shadow-lg hover:scale-105 cursor-pointer"
              type="button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {language === 'ar' ? 'إضافة فندق جديد' : 'Add New Hotel'}
            </button>
          </div>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        title={deleteTarget?.type === 'section'
          ? (language === 'ar' ? 'حذف القسم' : 'Delete Section')
          : (language === 'ar' ? 'حذف الفندق' : 'Delete Hotel')
        }
        message={deleteTarget?.type === 'section'
          ? (language === 'ar' ? 'هل أنت متأكد من حذف هذا القسم؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this section? This action cannot be undone.')
          : (language === 'ar' ? 'هل أنت متأكد من حذف هذا الفندق؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this hotel? This action cannot be undone.')
        }
      />
    </div>
  );
};

export default HotelsSection;

export const HotelsSectionTemplate = HotelsSection;
