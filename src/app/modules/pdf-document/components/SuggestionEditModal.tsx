"use client";

import React, { useMemo, useState } from "react";
import type {
  AirplaneSectionData,
  ComponentSuggestion,
  ExtraServiceSectionData,
  HotelsSectionData,
  TotalPriceSectionData,
  TransportSectionData,
} from "../types/ExtractTypes";

interface SuggestionEditModalProps {
  isOpen: boolean;
  suggestion: ComponentSuggestion | null;
  onClose: () => void;
  onSave: (suggestion: ComponentSuggestion) => void;
}

function cloneSuggestion<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-700">
        <span>{label}</span>
        {hint ? <span className="text-xs font-medium text-slate-400">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${
        props.className ?? ""
      }`}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${
        props.className ?? ""
      }`}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${
        props.className ?? ""
      }`}
    />
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
      <span>{label}</span>
    </label>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
  onRemove,
  removeLabel,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onRemove?: () => void;
  removeLabel?: string;
}) {
  return (
    <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/80 px-5 py-4">
        <div>
          <h4 className="text-base font-bold text-slate-900">{title}</h4>
          {subtitle ? <p className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</p> : null}
        </div>
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-xl px-3 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50"
          >
            {removeLabel}
          </button>
        ) : null}
      </div>
      <div className="space-y-5 px-5 py-5">{children}</div>
    </section>
  );
}

export default function SuggestionEditModal({
  isOpen,
  suggestion,
  onClose,
  onSave,
}: SuggestionEditModalProps) {
  const [draft, setDraft] = useState<ComponentSuggestion | null>(() =>
    suggestion ? cloneSuggestion(suggestion) : null
  );

  const language = draft?.data?.language ?? "ar";
  const isArabic = language === "ar";
  const dir = (draft?.data?.direction ?? (isArabic ? "rtl" : "ltr")) as "rtl" | "ltr";

  const copy = useMemo(
    () => ({
      editSuggestion: isArabic ? "تعديل الاقتراح" : "Edit suggestion",
      editHint: isArabic ? "حرّر البيانات قبل اعتمادها في المستند" : "Refine the extracted data before approving it into the document",
      save: isArabic ? "حفظ التعديلات" : "Save changes",
      cancel: isArabic ? "إلغاء" : "Cancel",
      title: isArabic ? "العنوان" : "Title",
      showTitle: isArabic ? "إظهار العنوان" : "Show title",
      noticeMessage: isArabic ? "رسالة الملاحظة" : "Notice message",
      showNotice: isArabic ? "إظهار الملاحظة" : "Show notice",
      addFlight: isArabic ? "إضافة رحلة" : "Add flight",
      addHotel: isArabic ? "إضافة فندق" : "Add hotel",
      addRow: isArabic ? "إضافة صف" : "Add row",
      remove: isArabic ? "حذف" : "Remove",
      date: isArabic ? "التاريخ" : "Date",
      arrivalTime: isArabic ? "وقت الوصول" : "Arrival Time",
      departureTime: isArabic ? "وقت الاقلاع" : "Departure Time",
      airline: isArabic ? "شركة الطيران" : "Airline",
      from: isArabic ? "من" : "From",
      to: isArabic ? "إلى" : "To",
      adults: isArabic ? "بالغين" : "Adults",
      children: isArabic ? "أطفال" : "Children",
      infants: isArabic ? "رضع" : "Infants",
      luggage: isArabic ? "الأمتعة" : "Luggage",
      note: isArabic ? "ملاحظة" : "Note",
      city: isArabic ? "المدينة" : "City",
      nights: isArabic ? "الليالي" : "Nights",
      badge: isArabic ? "شارة المدينة" : "City badge",
      hotelName: isArabic ? "اسم الفندق" : "Hotel name",
      roomType: isArabic ? "نوع الغرفة" : "Room type",
      bedType: isArabic ? "نوع السرير" : "Bed type",
      includesAll: isArabic ? "الوجبات / التضمين" : "Includes",
      checkInDate: isArabic ? "تاريخ الدخول" : "Check-in date",
      checkOutDate: isArabic ? "تاريخ الخروج" : "Check-out date",
      checkInDay: isArabic ? "يوم الدخول" : "Check-in day",
      checkOutDay: isArabic ? "يوم الخروج" : "Check-out day",
      tableTitle: isArabic ? "عنوان الجدول" : "Table title",
      tableColor: isArabic ? "لون الجدول" : "Table color",
      darkBlue: isArabic ? "أزرق داكن" : "Dark blue",
      darkRed: isArabic ? "أحمر داكن" : "Dark red",
      pink: isArabic ? "وردي" : "Pink",
      day: isArabic ? "اليوم" : "Day",
      country: isArabic ? "البلد" : "Country",
      serviceName: isArabic ? "اسم الخدمة" : "Service name",
      count: isArabic ? "العدد" : "Count",
      amount: isArabic ? "المبلغ" : "Amount",
      currency: isArabic ? "العملة" : "Currency",
      formattedTotal: isArabic ? "الإجمالي المعروض" : "Formatted total",
      overview: isArabic ? "ملخص" : "Overview",
      items: isArabic ? "العناصر" : "Items",
      type: isArabic ? "النوع" : "Type",
    }),
    [isArabic]
  );

  if (!isOpen || !draft) return null;

  const updateDraftData = (
    updater: (data: ComponentSuggestion["data"]) => ComponentSuggestion["data"]
  ) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return { ...prev, data: updater(prev.data) };
    });
  };

  const renderAirplaneEditor = () => {
    const data = draft.data as AirplaneSectionData;
    const flights = data.flights ?? [];

    return (
      <div className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto]">
          <Field label={copy.title}>
            <Input value={data.title ?? ""} onChange={(e) => updateDraftData((prev) => ({ ...prev, title: e.target.value }))} dir={dir} />
          </Field>
          <Field label={copy.noticeMessage}>
            <Input value={data.noticeMessage ?? ""} onChange={(e) => updateDraftData((prev) => ({ ...prev, noticeMessage: e.target.value }))} dir={dir} />
          </Field>
          <div className="flex items-end">
            <Toggle label={copy.showTitle} checked={data.showTitle !== false} onChange={(checked) => updateDraftData((prev) => ({ ...prev, showTitle: checked }))} />
          </div>
          <div className="flex items-end">
            <Toggle label={copy.showNotice} checked={data.showNotice !== false} onChange={(checked) => updateDraftData((prev) => ({ ...prev, showNotice: checked }))} />
          </div>
        </div>

        {flights.map((flight, index) => (
          <SectionCard
            key={`${flight.date}_${index}`}
            title={`${isArabic ? "رحلة" : "Flight"} ${index + 1}`}
            subtitle={isArabic ? "بيانات الرحلة الأساسية والركاب" : "Core flight details and traveler counts"}
            onRemove={() =>
              updateDraftData((prev) => ({
                ...prev,
                flights: (prev as AirplaneSectionData).flights?.filter((_, i) => i !== index) ?? [],
              }))
            }
            removeLabel={copy.remove}
          >
            <div className="grid gap-4 lg:grid-cols-3">
              <Field label={copy.date}><Input type="date" value={flight.date ?? ""} onChange={(e) => updateDraftData((prev) => { const next = [...(((prev as AirplaneSectionData).flights ?? []))]; next[index] = { ...next[index], date: e.target.value }; return { ...prev, flights: next }; })} /></Field>
              <Field label={copy.arrivalTime}><Input type="time" value={flight.arrivalTime ?? ""} onChange={(e) => updateDraftData((prev) => { const next = [...(((prev as AirplaneSectionData).flights ?? []))]; next[index] = { ...next[index], arrivalTime: e.target.value }; return { ...prev, flights: next }; })} /></Field>
              <Field label={copy.departureTime}><Input type="time" value={flight.departureTime ?? ""} onChange={(e) => updateDraftData((prev) => { const next = [...(((prev as AirplaneSectionData).flights ?? []))]; next[index] = { ...next[index], departureTime: e.target.value }; return { ...prev, flights: next }; })} /></Field>
              <Field label={copy.airline}><Input value={flight.airlineCompany ?? ""} onChange={(e) => updateDraftData((prev) => { const next = [...(((prev as AirplaneSectionData).flights ?? []))]; next[index] = { ...next[index], airlineCompany: e.target.value }; return { ...prev, flights: next }; })} dir={dir} /></Field>
              <Field label={copy.from}><Input value={flight.fromAirport ?? ""} onChange={(e) => updateDraftData((prev) => { const next = [...(((prev as AirplaneSectionData).flights ?? []))]; next[index] = { ...next[index], fromAirport: e.target.value }; return { ...prev, flights: next }; })} dir={dir} /></Field>
              <Field label={copy.to}><Input value={flight.toAirport ?? ""} onChange={(e) => updateDraftData((prev) => { const next = [...(((prev as AirplaneSectionData).flights ?? []))]; next[index] = { ...next[index], toAirport: e.target.value }; return { ...prev, flights: next }; })} dir={dir} /></Field>
              <Field label={copy.luggage}><Input value={flight.luggage ?? ""} onChange={(e) => updateDraftData((prev) => { const next = [...(((prev as AirplaneSectionData).flights ?? []))]; next[index] = { ...next[index], luggage: e.target.value }; return { ...prev, flights: next }; })} dir={dir} /></Field>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label={copy.adults}><Input type="number" min="0" value={flight.travelers?.adults ?? 0} onChange={(e) => updateDraftData((prev) => { const next = [...(((prev as AirplaneSectionData).flights ?? []))]; next[index] = { ...next[index], travelers: { ...(next[index].travelers ?? { adults: 0, children: 0, infants: 0 }), adults: Number(e.target.value) || 0 } }; return { ...prev, flights: next }; })} /></Field>
              <Field label={copy.children}><Input type="number" min="0" value={flight.travelers?.children ?? 0} onChange={(e) => updateDraftData((prev) => { const next = [...(((prev as AirplaneSectionData).flights ?? []))]; next[index] = { ...next[index], travelers: { ...(next[index].travelers ?? { adults: 0, children: 0, infants: 0 }), children: Number(e.target.value) || 0 } }; return { ...prev, flights: next }; })} /></Field>
              <Field label={copy.infants}><Input type="number" min="0" value={flight.travelers?.infants ?? 0} onChange={(e) => updateDraftData((prev) => { const next = [...(((prev as AirplaneSectionData).flights ?? []))]; next[index] = { ...next[index], travelers: { ...(next[index].travelers ?? { adults: 0, children: 0, infants: 0 }), infants: Number(e.target.value) || 0 } }; return { ...prev, flights: next }; })} /></Field>
            </div>
            <Field label={copy.note}>
              <Textarea rows={3} value={flight.note ?? ""} onChange={(e) => updateDraftData((prev) => { const next = [...(((prev as AirplaneSectionData).flights ?? []))]; next[index] = { ...next[index], note: e.target.value }; return { ...prev, flights: next }; })} dir={dir} />
            </Field>
          </SectionCard>
        ))}

        <button
          type="button"
          onClick={() =>
            updateDraftData((prev) => ({
              ...prev,
              flights: [
                ...(((prev as AirplaneSectionData).flights ?? [])),
                { date: "", arrivalTime: "", departureTime: "", airlineCompany: "", fromAirport: "", toAirport: "", travelers: { adults: 1, children: 0, infants: 0 }, luggage: "", note: "" },
              ],
            }))
          }
          className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          + {copy.addFlight}
        </button>
      </div>
    );
  };

  const renderHotelEditor = () => {
    const data = draft.data as HotelsSectionData;
    const hotels = data.hotels ?? [];

    return (
      <div className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
          <Field label={copy.title}><Input value={data.title ?? ""} onChange={(e) => updateDraftData((prev) => ({ ...prev, title: e.target.value }))} dir={dir} /></Field>
          <div className="flex items-end">
            <Toggle label={copy.showTitle} checked={data.showTitle !== false} onChange={(checked) => updateDraftData((prev) => ({ ...prev, showTitle: checked }))} />
          </div>
        </div>

        {hotels.map((hotel, index) => (
          <SectionCard
            key={`${hotel.hotelName}_${index}`}
            title={`${isArabic ? "فندق" : "Hotel"} ${index + 1}`}
            subtitle={isArabic ? "المدينة والفندق والإقامة" : "City, property, and stay details"}
            onRemove={() =>
              updateDraftData((prev) => ({
                ...prev,
                hotels: (prev as HotelsSectionData).hotels?.filter((_, i) => i !== index) ?? [],
              }))
            }
            removeLabel={copy.remove}
          >
            <div className="grid gap-4 lg:grid-cols-3">
              <Field label={copy.city}><Input value={hotel.city ?? ""} onChange={(e) => updateDraftData((prev) => { const next = [...(((prev as HotelsSectionData).hotels ?? []))]; next[index] = { ...next[index], city: e.target.value }; return { ...prev, hotels: next }; })} dir={dir} /></Field>
              <Field label={copy.nights}><Input type="number" min="0" value={hotel.nights ?? 0} onChange={(e) => updateDraftData((prev) => { const next = [...(((prev as HotelsSectionData).hotels ?? []))]; next[index] = { ...next[index], nights: Number(e.target.value) || 0 }; return { ...prev, hotels: next }; })} /></Field>
              <Field label={copy.badge}><Input value={hotel.cityBadge ?? ""} onChange={(e) => updateDraftData((prev) => { const next = [...(((prev as HotelsSectionData).hotels ?? []))]; next[index] = { ...next[index], cityBadge: e.target.value }; return { ...prev, hotels: next }; })} dir={dir} /></Field>
              <Field label={copy.hotelName}><Input value={hotel.hotelName ?? ""} onChange={(e) => updateDraftData((prev) => { const next = [...(((prev as HotelsSectionData).hotels ?? []))]; next[index] = { ...next[index], hotelName: e.target.value }; return { ...prev, hotels: next }; })} dir={dir} /></Field>
              <Field label={copy.includesAll}><Input value={hotel.roomDescription?.includesAll ?? ""} onChange={(e) => updateDraftData((prev) => { const next = [...(((prev as HotelsSectionData).hotels ?? []))]; next[index] = { ...next[index], roomDescription: { ...next[index].roomDescription, includesAll: e.target.value } }; return { ...prev, hotels: next }; })} dir={dir} /></Field>
              <Field label={copy.bedType}><Input value={hotel.roomDescription?.bedType ?? ""} onChange={(e) => updateDraftData((prev) => { const next = [...(((prev as HotelsSectionData).hotels ?? []))]; next[index] = { ...next[index], roomDescription: { ...next[index].roomDescription, bedType: e.target.value } }; return { ...prev, hotels: next }; })} dir={dir} /></Field>
              <Field label={copy.roomType}><Input value={hotel.roomDescription?.roomType ?? ""} onChange={(e) => updateDraftData((prev) => { const next = [...(((prev as HotelsSectionData).hotels ?? []))]; next[index] = { ...next[index], roomDescription: { ...next[index].roomDescription, roomType: e.target.value } }; return { ...prev, hotels: next }; })} dir={dir} /></Field>
              <Field label={copy.checkInDate}><Input type="date" value={hotel.checkInDate ?? ""} onChange={(e) => updateDraftData((prev) => { const next = [...(((prev as HotelsSectionData).hotels ?? []))]; next[index] = { ...next[index], checkInDate: e.target.value }; return { ...prev, hotels: next }; })} /></Field>
              <Field label={copy.checkOutDate}><Input type="date" value={hotel.checkOutDate ?? ""} onChange={(e) => updateDraftData((prev) => { const next = [...(((prev as HotelsSectionData).hotels ?? []))]; next[index] = { ...next[index], checkOutDate: e.target.value }; return { ...prev, hotels: next }; })} /></Field>
              <Field label={copy.checkInDay}><Input value={hotel.dayInfo?.checkInDay ?? ""} onChange={(e) => updateDraftData((prev) => { const next = [...(((prev as HotelsSectionData).hotels ?? []))]; next[index] = { ...next[index], dayInfo: { ...next[index].dayInfo, checkInDay: e.target.value } }; return { ...prev, hotels: next }; })} dir={dir} /></Field>
              <Field label={copy.checkOutDay}><Input value={hotel.dayInfo?.checkOutDay ?? ""} onChange={(e) => updateDraftData((prev) => { const next = [...(((prev as HotelsSectionData).hotels ?? []))]; next[index] = { ...next[index], dayInfo: { ...next[index].dayInfo, checkOutDay: e.target.value } }; return { ...prev, hotels: next }; })} dir={dir} /></Field>
            </div>
          </SectionCard>
        ))}

        <button
          type="button"
          onClick={() =>
            updateDraftData((prev) => ({
              ...prev,
              hotels: [
                ...(((prev as HotelsSectionData).hotels ?? [])),
                {
                  city: "",
                  nights: 1,
                  cityBadge: "",
                  hotelName: "",
                  roomDescription: { includesAll: "", bedType: "", roomType: "" },
                  checkInDate: "",
                  checkOutDate: "",
                  dayInfo: { checkInDay: "", checkOutDay: "" },
                },
              ],
            }))
          }
          className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          + {copy.addHotel}
        </button>
      </div>
    );
  };

  const renderTransportEditor = () => {
    const data = draft.data as TransportSectionData;
    const tables = data.tables ?? [];

    return (
      <div className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
          <Field label={copy.title}><Input value={data.title ?? ""} onChange={(e) => updateDraftData((prev) => ({ ...prev, title: e.target.value }))} dir={dir} /></Field>
          <div className="flex items-end">
            <Toggle label={copy.showTitle} checked={data.showTitle !== false} onChange={(checked) => updateDraftData((prev) => ({ ...prev, showTitle: checked }))} />
          </div>
        </div>

        {tables.map((table, tableIndex) => (
          <SectionCard
            key={table.id ?? tableIndex}
            title={`${isArabic ? "جدول" : "Table"} ${tableIndex + 1}`}
            subtitle={isArabic ? "إعدادات الجدول وصفوف النقل" : "Table settings and transport rows"}
            onRemove={() =>
              updateDraftData((prev) => ({
                ...prev,
                tables: (prev as TransportSectionData).tables?.filter((_, i) => i !== tableIndex) ?? [],
              }))
            }
            removeLabel={copy.remove}
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <Field label={copy.tableTitle}><Input value={table.title ?? ""} onChange={(e) => updateDraftData((prev) => { const next = [...(((prev as TransportSectionData).tables ?? []))]; next[tableIndex] = { ...next[tableIndex], title: e.target.value }; return { ...prev, tables: next }; })} dir={dir} /></Field>
              <Field label={copy.tableColor}>
                <Select value={table.backgroundColor ?? "dark-blue"} onChange={(e) => updateDraftData((prev) => { const next = [...(((prev as TransportSectionData).tables ?? []))]; next[tableIndex] = { ...next[tableIndex], backgroundColor: e.target.value as "dark-blue" | "dark-red" | "pink" }; return { ...prev, tables: next }; })}>
                  <option value="dark-blue">{copy.darkBlue}</option>
                  <option value="dark-red">{copy.darkRed}</option>
                  <option value="pink">{copy.pink}</option>
                </Select>
              </Field>
            </div>

            <div className="space-y-4">
              {table.rows.map((row, rowIndex) => (
                <div key={`${row.day}_${rowIndex}`} className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <h5 className="text-sm font-bold text-slate-900">{isArabic ? `صف ${rowIndex + 1}` : `Row ${rowIndex + 1}`}</h5>
                      <p className="mt-1 text-xs text-slate-500">{isArabic ? "مواعيد الحركة ونقاط الانتقال" : "Movement timing and pickup/dropoff points"}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateDraftData((prev) => { const next = [...(((prev as TransportSectionData).tables ?? []))]; next[tableIndex] = { ...next[tableIndex], rows: next[tableIndex].rows.filter((_, i) => i !== rowIndex) }; return { ...prev, tables: next }; })}
                      className="rounded-xl px-3 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50"
                    >
                      {copy.remove}
                    </button>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-3">
                    {table.columns.map((column) => (
                      <Field key={column.key} label={column.label}>
                        <Input
                          type={column.key === "date" ? "date" : "text"}
                          value={String(row[column.key] ?? "")}
                          onChange={(e) => updateDraftData((prev) => { const next = [...(((prev as TransportSectionData).tables ?? []))]; const nextRows = [...next[tableIndex].rows]; nextRows[rowIndex] = { ...nextRows[rowIndex], [column.key]: e.target.value }; next[tableIndex] = { ...next[tableIndex], rows: nextRows }; return { ...prev, tables: next }; })}
                          dir={column.key === "date" ? "ltr" : dir}
                        />
                      </Field>
                    ))}
                    <Field label={`${copy.from} link`}><Input value={row.fromLink ?? ""} onChange={(e) => updateDraftData((prev) => { const next = [...(((prev as TransportSectionData).tables ?? []))]; const nextRows = [...next[tableIndex].rows]; nextRows[rowIndex] = { ...nextRows[rowIndex], fromLink: e.target.value }; next[tableIndex] = { ...next[tableIndex], rows: nextRows }; return { ...prev, tables: next }; })} dir="ltr" /></Field>
                    <Field label={`${copy.to} link`}><Input value={row.toLink ?? ""} onChange={(e) => updateDraftData((prev) => { const next = [...(((prev as TransportSectionData).tables ?? []))]; const nextRows = [...next[tableIndex].rows]; nextRows[rowIndex] = { ...nextRows[rowIndex], toLink: e.target.value }; next[tableIndex] = { ...next[tableIndex], rows: nextRows }; return { ...prev, tables: next }; })} dir="ltr" /></Field>
                    <Field label={copy.note}><Input value={row.note ?? ""} onChange={(e) => updateDraftData((prev) => { const next = [...(((prev as TransportSectionData).tables ?? []))]; const nextRows = [...next[tableIndex].rows]; nextRows[rowIndex] = { ...nextRows[rowIndex], note: e.target.value }; next[tableIndex] = { ...next[tableIndex], rows: nextRows }; return { ...prev, tables: next }; })} dir={dir} /></Field>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => updateDraftData((prev) => { const next = [...(((prev as TransportSectionData).tables ?? []))]; next[tableIndex] = { ...next[tableIndex], rows: [...next[tableIndex].rows, { day: "", date: "", from: "", to: "", description: "", carType: "" }] }; return { ...prev, tables: next }; })}
              className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              + {copy.addRow}
            </button>
          </SectionCard>
        ))}
      </div>
    );
  };

  const renderExtraServiceEditor = () => {
    const data = draft.data as ExtraServiceSectionData;
    const rows = data.rows ?? [];

    return (
      <div className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
          <Field label={copy.title}><Input value={data.title ?? ""} onChange={(e) => updateDraftData((prev) => ({ ...prev, title: e.target.value }))} dir={dir} /></Field>
          <div className="flex items-end">
            <Toggle label={copy.showTitle} checked={data.showTitle !== false} onChange={(checked) => updateDraftData((prev) => ({ ...prev, showTitle: checked }))} />
          </div>
        </div>
        {rows.map((row, index) => (
          <SectionCard
            key={`${row.service_name}_${index}`}
            title={`${isArabic ? "خدمة" : "Service"} ${index + 1}`}
            subtitle={isArabic ? "تفاصيل الخدمة اليومية" : "Daily service details"}
            onRemove={() =>
              updateDraftData((prev) => ({
                ...prev,
                rows: (prev as ExtraServiceSectionData).rows?.filter((_, i) => i !== index) ?? [],
              }))
            }
            removeLabel={copy.remove}
          >
            <div className="grid gap-4 lg:grid-cols-3">
              <Field label={copy.day}><Input value={row.day ?? ""} onChange={(e) => updateDraftData((prev) => { const next = [...(((prev as ExtraServiceSectionData).rows ?? []))]; next[index] = { ...next[index], day: e.target.value }; return { ...prev, rows: next }; })} dir={dir} /></Field>
              <Field label={copy.date}><Input type="date" value={row.date ?? ""} onChange={(e) => updateDraftData((prev) => { const next = [...(((prev as ExtraServiceSectionData).rows ?? []))]; next[index] = { ...next[index], date: e.target.value }; return { ...prev, rows: next }; })} /></Field>
              <Field label={copy.country}><Input value={row.country ?? ""} onChange={(e) => updateDraftData((prev) => { const next = [...(((prev as ExtraServiceSectionData).rows ?? []))]; next[index] = { ...next[index], country: e.target.value }; return { ...prev, rows: next }; })} dir={dir} /></Field>
              <Field label={copy.serviceName}><Input value={row.service_name ?? ""} onChange={(e) => updateDraftData((prev) => { const next = [...(((prev as ExtraServiceSectionData).rows ?? []))]; next[index] = { ...next[index], service_name: e.target.value }; return { ...prev, rows: next }; })} dir={dir} /></Field>
              <Field label={copy.count}><Input type="number" min="0" value={row.count ?? 0} onChange={(e) => updateDraftData((prev) => { const next = [...(((prev as ExtraServiceSectionData).rows ?? []))]; next[index] = { ...next[index], count: Number(e.target.value) || 0 }; return { ...prev, rows: next }; })} /></Field>
            </div>
          </SectionCard>
        ))}
      </div>
    );
  };

  const renderTotalEditor = () => {
    const data = draft.data as TotalPriceSectionData;
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <Field label={copy.title}><Input value={data.title ?? ""} onChange={(e) => updateDraftData((prev) => ({ ...prev, title: e.target.value }))} dir={dir} /></Field>
        <Field label={copy.amount}><Input value={data.amount ?? ""} onChange={(e) => updateDraftData((prev) => ({ ...prev, amount: e.target.value }))} dir={dir} /></Field>
        <Field label={copy.currency}><Input value={data.currency ?? ""} onChange={(e) => updateDraftData((prev) => ({ ...prev, currency: e.target.value }))} dir={dir} /></Field>
        <Field label={copy.formattedTotal}><Input value={data.formattedTotal ?? ""} onChange={(e) => updateDraftData((prev) => ({ ...prev, formattedTotal: e.target.value }))} dir={dir} /></Field>
      </div>
    );
  };

  const itemsCount =
    draft.type === "airplane"
      ? (draft.data as AirplaneSectionData).flights?.length ?? 0
      : draft.type === "hotel"
        ? (draft.data as HotelsSectionData).hotels?.length ?? 0
        : draft.type === "transport"
          ? (draft.data as TransportSectionData).tables?.reduce((count, table) => count + table.rows.length, 0) ?? 0
          : draft.type === "extra_service"
            ? (draft.data as ExtraServiceSectionData).rows?.length ?? 0
            : 1;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm" dir={dir} onClick={onClose}>
      <div className="flex h-[94vh] w-[min(98vw,104rem)] flex-col overflow-hidden rounded-[32px] border border-white/60 bg-white shadow-[0_32px_100px_rgba(15,23,42,0.26)]" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-slate-200 bg-white/95 px-8 py-6 backdrop-blur">
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-3">
              <div>
                <h3 className="text-[32px] font-bold leading-tight text-slate-950">{copy.editSuggestion}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">{copy.editHint}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{copy.type}: {isArabic ? draft.type : draft.type.replace("_", " ")}</span>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{copy.items}: {itemsCount}</span>
              </div>
            </div>
            <button type="button" onClick={onClose} className="rounded-2xl p-3 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700" aria-label={copy.cancel}>
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid flex-1 min-h-0 grid-cols-1 gap-0 bg-slate-50/50 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="border-b border-slate-200 bg-white px-6 py-6 xl:border-b-0 xl:border-e">
            <div className="rounded-[26px] border border-slate-200 bg-slate-50/80 p-5">
              <h4 className="text-sm font-bold uppercase tracking-[0.08em] text-slate-500">{copy.overview}</h4>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="text-xs font-semibold text-slate-400">{copy.type}</div>
                  <div className="mt-1 text-lg font-bold text-slate-900">{isArabic ? draft.type : draft.type.replace("_", " ")}</div>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="text-xs font-semibold text-slate-400">{copy.items}</div>
                  <div className="mt-1 text-lg font-bold text-slate-900">{itemsCount}</div>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="text-xs font-semibold text-slate-400">{copy.title}</div>
                  <div className="mt-1 text-base font-semibold text-slate-900 break-words">
                    {String((draft.data as { title?: string }).title ?? "—")}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="min-h-0 overflow-y-auto px-6 py-6 xl:px-8">
            {draft.type === "airplane" && renderAirplaneEditor()}
            {draft.type === "hotel" && renderHotelEditor()}
            {draft.type === "transport" && renderTransportEditor()}
            {draft.type === "extra_service" && renderExtraServiceEditor()}
            {draft.type === "total_price" && renderTotalEditor()}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 bg-white/95 px-8 py-5 backdrop-blur">
          <div className="text-sm text-slate-500">{copy.editHint}</div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
              {copy.cancel}
            </button>
            <button type="button" onClick={() => draft && onSave(draft)} className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700">
              {copy.save}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
