"use client";

import React, { useMemo, useState, useCallback } from "react";
import CodeEditor from "../components/CodeEditor";
import PreviewRenderer from "../components/PreviewRenderer";
import ToggleSwitch from "../components/ToggleSwitch";

type Mode = "code" | "preview";

const STARTER_TEMPLATE = `export default function Template({ values, setValue }) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto w-[794px] bg-white text-gray-900 shadow-lg print:shadow-none">
        {/* Header with Logo */}
        <div className="bg-linear-to-r from-pink-600 to-red-600 px-10 py-6">
          <div className="flex items-center justify-between">
            <div className="bg-white px-4 py-2 rounded">
              <h1 className="text-2xl font-bold text-pink-600">
                <EditableText id="company.logo" value={values['company.logo'] || 'TRAVEL+'} onChange={(v)=>setValue('company.logo', v)} />
              </h1>
            </div>
          </div>
        </div>

        {/* Main Title */}
        <div className="text-center py-6 px-10">
          <h1 className="text-3xl font-bold text-red-600 underline decoration-2">
            <EditableText id="package.title" value={values['package.title'] || 'Special Package 2025'} onChange={(v)=>setValue('package.title', v)} />
          </h1>
        </div>

        {/* Image Gallery */}
        <div className="px-10 pb-6">
          <div className="flex gap-4 justify-center">
            <div className="w-40 h-32 bg-gray-200 rounded-lg border-4 border-white shadow-md overflow-hidden">
              <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                <EditableText id="image.1" value={values['image.1'] || 'Image 1'} onChange={(v)=>setValue('image.1', v)} />
              </div>
            </div>
            <div className="w-40 h-32 bg-gray-200 rounded-lg border-4 border-white shadow-md overflow-hidden">
              <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                <EditableText id="image.2" value={values['image.2'] || 'Image 2'} onChange={(v)=>setValue('image.2', v)} />
              </div>
            </div>
            <div className="w-40 h-32 bg-gray-200 rounded-lg border-4 border-white shadow-md overflow-hidden">
              <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                <EditableText id="image.3" value={values['image.3'] || 'Image 3'} onChange={(v)=>setValue('image.3', v)} />
              </div>
            </div>
          </div>
        </div>

        {/* Package Details */}
        <div className="px-10 pb-6 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            <EditableText id="package.duration" value={values['package.duration'] || '7 nights/8 days in Azerbaijan'} onChange={(v)=>setValue('package.duration', v)} />
          </h2>
          <p className="text-lg text-gray-700 italic">
            <EditableText id="package.hashtag" value={values['package.hashtag'] || '#Take Another Look'} onChange={(v)=>setValue('package.hashtag', v)} />
          </p>
        </div>

        {/* Brief Program */}
        <div className="px-10 pb-6">
          <h3 className="font-bold text-gray-900 underline mb-3">
            <EditableText id="section.brief" value={values['section.brief'] || 'Brief program:'} onChange={(v)=>setValue('section.brief', v)} />
          </h3>
          <ul className="text-sm space-y-1.5 text-gray-800">
            <li><EditableText id="day.1" value={values['day.1'] || 'Day 1 - airport-hotel transfer'} onChange={(v)=>setValue('day.1', v)} /></li>
            <li><EditableText id="day.2" value={values['day.2'] || 'Day 2 - Baku city tour'} onChange={(v)=>setValue('day.2', v)} /></li>
            <li><EditableText id="day.3" value={values['day.3'] || 'Day 3 - Baku-Gabala transfer, Shamakhi on the way'} onChange={(v)=>setValue('day.3', v)} /></li>
            <li><EditableText id="day.4" value={values['day.4'] || 'Day 4 - Gabala tour'} onChange={(v)=>setValue('day.4', v)} /></li>
            <li><EditableText id="day.5" value={values['day.5'] || 'Day 5 - Gabala-Baku transfer, Gobustan on the way'} onChange={(v)=>setValue('day.5', v)} /></li>
            <li><EditableText id="day.6" value={values['day.6'] || 'Day 6 - Absheron tour and shopping'} onChange={(v)=>setValue('day.6', v)} /></li>
            <li><EditableText id="day.7" value={values['day.7'] || 'Day 7 - One day tour to Shahdag Mountain resort'} onChange={(v)=>setValue('day.7', v)} /></li>
            <li><EditableText id="day.8" value={values['day.8'] || 'Day 8 - hotel-airport transfer'} onChange={(v)=>setValue('day.8', v)} /></li>
          </ul>
        </div>

        {/* Day 01 Details with Image */}
        <div className="px-10 pb-6">
          <div className="flex gap-6">
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 underline mb-3">
                <EditableText id="day01.title" value={values['day01.title'] || 'Day - 01 - Arrival day'} onChange={(v)=>setValue('day01.title', v)} />
              </h3>
              <ul className="text-sm space-y-2 list-disc pl-5 text-gray-800">
                <li><EditableText id="day01.item1" value={values['day01.item1'] || 'Arrival to Baku city'} onChange={(v)=>setValue('day01.item1', v)} /></li>
                <li><EditableText id="day01.item2" value={values['day01.item2'] || 'Meet & Greet at the Airport by representative.'} onChange={(v)=>setValue('day01.item2', v)} /></li>
                <li><EditableText id="day01.item3" value={values['day01.item3'] || 'Transfer to the hotel'} onChange={(v)=>setValue('day01.item3', v)} /></li>
                <li><EditableText id="day01.item4" value={values['day01.item4'] || 'Check-in at the hotel'} onChange={(v)=>setValue('day01.item4', v)} /></li>
                <li><EditableText id="day01.item5" value={values['day01.item5'] || 'Free time to enjoy the windy capital'} onChange={(v)=>setValue('day01.item5', v)} /></li>
              </ul>
              <p className="text-sm text-gray-600 mt-3">
                <EditableText id="day01.note" value={values['day01.note'] || '(Overnight stay in Baku)'} onChange={(v)=>setValue('day01.note', v)} />
              </p>
            </div>
            <div className="w-48 h-40 bg-gray-200 rounded-lg shadow-md overflow-hidden shrink-0">
              <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                <EditableText id="day01.image" value={values['day01.image'] || 'Day 1 Image'} onChange={(v)=>setValue('day01.image', v)} />
              </div>
            </div>
          </div>
        </div>

        {/* Day 02 Details */}
        <div className="px-10 pb-8">
          <h3 className="font-bold text-gray-900 underline mb-3">
            <EditableText id="day02.title" value={values['day02.title'] || 'Day - 02 - Baku city tour'} onChange={(v)=>setValue('day02.title', v)} />
          </h3>
          <ul className="text-sm space-y-2 list-disc pl-5 text-gray-800">
            <li><EditableText id="day02.item1" value={values['day02.item1'] || 'Breakfast at the hotel'} onChange={(v)=>setValue('day02.item1', v)} /></li>
            <li><EditableText id="day02.item2" value={values['day02.item2'] || 'Excursion day (pick-up at 10:00)'} onChange={(v)=>setValue('day02.item2', v)} /></li>
            <li>
              <EditableText id="day02.item3" value={values['day02.item3'] || 'Visiting Highland park - enjoying panoramic view to Baku. From there guests see Milli Majlis, Flame Towers building which become an icon of Baku. Using one way funicular to go down or up.'} onChange={(v)=>setValue('day02.item3', v)} />
              <span className="text-blue-600"> <EditableText id="day02.link" value={values['day02.link'] || '(1 ticket to funicular is included)'} onChange={(v)=>setValue('day02.link', v)} /></span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}`;

export default function CodePage() {
  const [mode, setMode] = useState<Mode>("code");
  const [code, setCode] = useState<string>(STARTER_TEMPLATE);
  const [values, setValues] = useState<Record<string, string>>({});

  const setValue = useCallback((id: string, v: string) => {
    setValues((prev) => ({ ...prev, [id]: v }));
  }, []);

  const header = useMemo(() => (
    <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white shadow-sm px-6 py-4">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold text-gray-900">PDF Template Editor</h1>
        <span className="text-xs text-gray-500">Code ⇄ Live Preview</span>
      </div>
      <ToggleSwitch mode={mode} onChange={setMode} />
    </div>
  ), [mode]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 text-gray-900">
      {header}
      <div className="mx-auto w-full max-w-7xl px-6 py-8">
        {mode === "code" ? (
          <div className="rounded-xl border border-gray-200 shadow-lg overflow-hidden bg-white">
            <div className="bg-linear-to-r from-gray-800 to-gray-900 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="ml-4 text-sm text-gray-300 font-mono">template.jsx</span>
              </div>
              <span className="text-xs text-gray-400">React Template</span>
            </div>
            <CodeEditor code={code} onChange={setCode} />
          </div>
        ) : (
          <div className="min-h-[70vh] bg-white rounded-xl shadow-lg p-8">
            <PreviewRenderer code={code} values={values} setValue={setValue} />
          </div>
        )}
      </div>
    </div>
  );
}


