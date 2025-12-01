import React from 'react';
import DynamicTable from './DynamicTable';
import Section from './Section';
import Header from './Header';

/**
 * Example usage of DynamicTable, Section, and Header components
 * This demonstrates how to create a professional travel package document
 */
const ExampleUsage = () => {
  // Example 1: Pricing Table (like the screenshot)
  const pricingTableRows = [
    // Header row with package types and passenger counts
    {
      cells: [
        { content: 'Package option', isHeader: true, rowSpan: 2 },
        { content: 'Options', isHeader: true, rowSpan: 2 },
        { content: 'Hotels', isHeader: true, rowSpan: 2 },
        { content: 'Single person', isHeader: true, rowSpan: 2 },
        { content: '2 pax (PP in DBL)', isHeader: true, rowSpan: 2 },
        { content: '3 pax (PP in Triple)', isHeader: true, rowSpan: 2 },
        { content: '4 pax (PP - 2 DBL)', isHeader: true, rowSpan: 2 },
        { content: '5 pax (PP - DBL+Triple)', isHeader: true, rowSpan: 2 },
        { content: '6 pax (PP - 3 DBL)', isHeader: true, rowSpan: 2 },
        { content: '7 pax (PP - 2 DBL+Triple)', isHeader: true, rowSpan: 2 },
        { content: '8 pax (PP - 4 DBL)', isHeader: true, rowSpan: 2 },
        { content: '9 pax (PP - 3 DBL+Triple)', isHeader: true, rowSpan: 2 },
        { content: '10 pax (PP - 5 DBL)', isHeader: true, rowSpan: 2 },
      ],
    },
    // Car types row
    {
      cells: [
        { content: 'Car types', isHeader: true, colSpan: 3 },
        { content: 'Sedan (Hyindai, Kia, Chevrolet)', isHeader: true, colSpan: 3 },
        { content: 'Minivan (Mercedes Vito/Viano)', isHeader: true, colSpan: 4 },
        { content: 'Sprinter (Mercedes)', isHeader: true, colSpan: 3 },
      ],
    },
    // Economy Class - Option 1
    {
      cells: [
        { content: 'Economy Class', isHeader: true, rowSpan: 2, className: 'bg-green-50' },
        { content: 'Option 1', isHeader: true },
        { content: 'Regal Inn 3*/Gabala City 3*' },
        { content: '808' },
        { content: '444' },
        { content: '383' },
        { content: '372' },
        { content: '366' },
        { content: '364' },
        { content: '355' },
        { content: '342' },
        { content: '335' },
        { content: '319' },
      ],
    },
    // Economy Class - Option 2
    {
      cells: [
        { content: 'Option 2', isHeader: true },
        { content: 'Alba Hotel 3*/Adisson 4*/Gabala City 3*' },
        { content: '870' },
        { content: '475' },
        { content: '414' },
        { content: '393' },
        { content: '390' },
        { content: '389' },
        { content: '379' },
        { content: '373' },
        { content: '361' },
        { content: '350' },
      ],
    },
    // Standard Class - Option 1
    {
      cells: [
        { content: 'Standard Class', isHeader: true, rowSpan: 2, className: 'bg-green-50' },
        { content: 'Option 1', isHeader: true },
        { content: 'Parkside Hotel 4*/Hill Chalet 4*' },
        { content: '1045' },
        { content: '577' },
        { content: '503' },
        { content: '494' },
        { content: '489' },
        { content: '486' },
        { content: '475' },
        { content: '475' },
        { content: '453' },
        { content: '452' },
      ],
    },
    // Standard Class - Option 2
    {
      cells: [
        { content: 'Option 2', isHeader: true },
        { content: 'Qafqaz Baku City 4*/Hill Chalet 4*' },
        { content: '1017' },
        { content: '594' },
        { content: '508' },
        { content: '501' },
        { content: '498' },
        { content: '495' },
        { content: '487' },
        { content: '487' },
        { content: '466' },
        { content: '469' },
      ],
    },
    // Middle Class - Option 1
    {
      cells: [
        { content: 'Middle Class', isHeader: true, rowSpan: 2, className: 'bg-green-50' },
        { content: 'Option 1', isHeader: true },
        { content: 'Midtown Hotel 4*/Hill Chalet 4*' },
        { content: '1104' },
        { content: '628' },
        { content: '541' },
        { content: '540' },
        { content: '539' },
        { content: '537' },
        { content: '525' },
        { content: '526' },
        { content: '494' },
        { content: '503' },
      ],
    },
    // Middle Class - Option 2
    {
      cells: [
        { content: 'Option 2', isHeader: true },
        { content: 'Midway Hotel 4*/Hill Chalet 4*' },
        { content: '1104' },
        { content: '612' },
        { content: '551' },
        { content: '530' },
        { content: '528' },
        { content: '524' },
        { content: '516' },
        { content: '510' },
        { content: '493' },
        { content: '487' },
      ],
    },
    // Premium Class - Option 1
    {
      cells: [
        { content: 'Premium Class', isHeader: true, rowSpan: 2, className: 'bg-green-50' },
        { content: 'Option 1', isHeader: true },
        { content: 'Hyatt Regency 5*/Qafqaz Riverside 5*' },
        { content: '1556' },
        { content: '865' },
        { content: '776' },
        { content: '770' },
        { content: '768' },
        { content: '767' },
        { content: '762' },
        { content: '759' },
        { content: '744' },
        { content: '741' },
      ],
    },
    // Premium Class - Option 2
    {
      cells: [
        { content: 'Option 2', isHeader: true },
        { content: 'Intercontinental Baku 5*/Qafqaz Riverside 5*' },
        { content: '1825' },
        { content: '993' },
        { content: '922' },
        { content: '911' },
        { content: '905' },
        { content: '902' },
        { content: '894' },
        { content: '891' },
        { content: '871' },
        { content: '868' },
      ],
    },
  ];

  // Example 2: Day Itinerary Section
  const dayPoints = [
    'Arrival to Baku city',
    'Meet & Greet at the Airport by representative.',
    'Transfer to the hotel',
    'Check-in at the hotel',
    'Free time to enjoy the windy capital',
  ];

  return (
    <div className="min-h-screen bg-white p-8">
      {/* Page Header */}
      <Header
        title="Travel Package Details"
        subtitle="Complete pricing and itinerary information"
        variant="accent"
        underline={true}
      />

      {/* Pricing Table Section */}
      <div className="mt-8 mb-12">
        <Header
          title="Package Pricing"
          variant="primary"
          className="mb-6"
        />
        <DynamicTable
          rows={pricingTableRows}
          className="mb-8"
        />
      </div>

      {/* Itinerary Section */}
      <div className="mt-12">
        <Header
          title="Itinerary"
          variant="secondary"
          className="mb-6"
        />
        
        <Section
          title="Day - 01 - Arrival day"
          points={dayPoints}
          centered={true}
          className="mb-8"
        />

        <Section
          title="Day - 02 - City Tour"
          points={[
            'Breakfast at the hotel',
            'Full day city tour of Baku',
            'Visit Old City (Icheri Sheher)',
            'Explore Maiden Tower and Shirvanshahs Palace',
            'Walk along Baku Boulevard',
            'Return to hotel',
          ]}
          centered={true}
          className="mb-8"
        />

        <Section
          title="Day - 03 - Gabala Tour"
          points={[
            'Breakfast at the hotel',
            'Departure to Gabala',
            'Visit Tufandag Mountain Resort',
            'Cable car ride (optional)',
            'Check-in at Gabala hotel',
            'Free time',
          ]}
          centered={true}
        />
      </div>

      {/* Custom Section with Children */}
      <div className="mt-12">
        <Header
          title="Important Information"
          variant="secondary"
          className="mb-6"
        />
        
        <Section
          title="Package Includes"
          centered={false}
          className="mb-6"
        >
          <ul className="list-disc pl-6 space-y-2 text-sm text-gray-700">
            <li>Accommodation in selected hotels</li>
            <li>Daily breakfast</li>
            <li>Airport transfers</li>
            <li>Transportation as per itinerary</li>
            <li>English speaking guide</li>
          </ul>
        </Section>

        <Section
          title="Package Excludes"
          centered={false}
        >
          <ul className="list-disc pl-6 space-y-2 text-sm text-gray-700">
            <li>International airfare</li>
            <li>Visa fees</li>
            <li>Travel insurance</li>
            <li>Personal expenses</li>
            <li>Optional activities</li>
          </ul>
        </Section>
      </div>
    </div>
  );
};

export default ExampleUsage;
