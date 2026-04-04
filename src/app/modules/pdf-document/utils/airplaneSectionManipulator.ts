/**
 * Airplane Section Code Manipulator
 * 
 * Utilities for manipulating AirplaneSection components in JSX code
 * with safeguards to only modify user-created sections (user_airplane_* IDs)
 */

import { guardGeneratedContent } from './contentGuards';
import { FlightData } from '../components/AddAirplaneModal';

/**
 * Find an AirplaneSection component by ID in the code
 * Returns the full component JSX string and its position
 * 
 * This function is carefully designed to ONLY match AirplaneSection components,
 * not other components like DynamicTable or SectionTemplate
 */
export function findAirplaneSection(code: string, id: string): { component: string; startIndex: number; endIndex: number } | null {
  guardGeneratedContent(id, 'find');
  
  if (!id.startsWith('user_airplane_')) {
    throw new Error(`Invalid airplane section ID: ${id}. Must start with 'user_airplane_'`);
  }
  
  // Escape special regex characters in the ID
  const idPattern = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // More precise regex that:
  // 1. Matches <AirplaneSection (with word boundary to avoid matching other components)
  // 2. Ensures the id attribute contains our specific ID
  // 3. Handles both self-closing and opening tags
  // 4. Uses non-greedy matching to avoid matching across component boundaries
  
  // First, find the opening tag with the specific ID
  // Pattern: <AirplaneSection ... id="user_airplane_xxx" ... />
  // We need to be very specific to avoid matching DynamicTable or other components
  const openingTagRegex = new RegExp(
    `<AirplaneSection\\s+[^>]*id\\s*=\\s*["']${idPattern}["'][^>]*(?:/>|>)`,
    'i'
  );
  
  const openingMatch = code.match(openingTagRegex);
  if (!openingMatch || openingMatch.index === undefined) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`AirplaneSection with id "${id}" not found in code`);
    }
    return null;
  }
  
  const startIndex = openingMatch.index;
  let endIndex = startIndex + openingMatch[0].length;
  
  // Validate that we actually matched an AirplaneSection component
  // Check that the matched string starts with <AirplaneSection (case-insensitive)
  if (!/^<AirplaneSection/i.test(openingMatch[0])) {
    throw new Error(`Regex matched non-AirplaneSection component. This should not happen.`);
  }
  
  // Validate that the ID is actually in the matched component
  if (!openingMatch[0].includes(id)) {
    throw new Error(`Matched component does not contain expected ID "${id}"`);
  }
  
  // If self-closing tag, we're done
  if (openingMatch[0].trim().endsWith('/>')) {
    return {
      component: openingMatch[0],
      startIndex,
      endIndex
    };
  }
  
  // If opening tag, find the corresponding closing tag
  // We need to be careful to match the correct closing tag and not match
  // closing tags from nested components or other AirplaneSection components
  const afterOpening = code.substring(endIndex);
  
  // Find the closing </AirplaneSection> tag
  // We'll search for it, but we need to be careful about nested components
  // For now, we'll use a simple approach: find the first </AirplaneSection> after our opening tag
  const closingTagRegex = /<\/AirplaneSection>/i;
  const closingMatch = afterOpening.match(closingTagRegex);
  
  if (closingMatch && closingMatch.index !== undefined) {
    endIndex = endIndex + closingMatch.index + closingMatch[0].length;
    const fullComponent = code.substring(startIndex, endIndex);
    
    // Final validation: ensure the component contains our ID
    if (!fullComponent.includes(id)) {
      throw new Error(`Full component does not contain expected ID "${id}"`);
    }
    
    // Ensure we didn't accidentally match a different AirplaneSection
    // Count opening and closing tags to ensure balance
    const openingTags = (fullComponent.match(/<AirplaneSection/gi) || []).length;
    const closingTags = (fullComponent.match(/<\/AirplaneSection>/gi) || []).length;
    
    if (openingTags !== closingTags) {
      throw new Error(`Unbalanced AirplaneSection tags in matched component. Opening: ${openingTags}, Closing: ${closingTags}`);
    }
    
    return {
      component: fullComponent,
      startIndex,
      endIndex
    };
  }
  
  // If no closing tag found, it's a self-closing component
  // Return what we have
  return {
    component: openingMatch[0],
    startIndex,
    endIndex
  };
}

/**
 * Extract flights array from an AirplaneSection component string
 */
export function extractFlightsFromComponent(component: string): FlightData[] {
  const flightsMatch = component.match(/flights\s*=\s*\{\[([\s\S]*?)\]\}/);
  if (!flightsMatch) {
    return [];
  }
  
  const flightsString = flightsMatch[1];
  const flights: FlightData[] = [];
  
  // Parse flight objects from the string (handles multiline)
  // Pattern: { date: "...", fromAirport: "...", toAirport: "...", travelers: { ... }, luggage: "..." }
  // Match across multiple lines using [\s\S]*?
  const flightRegex = /\{\s*date\s*:\s*["']([^"']*)["'][\s\S]*?fromAirport\s*:\s*["']((?:[^"']|\\")*)["'][\s\S]*?toAirport\s*:\s*["']((?:[^"']|\\")*)["'][\s\S]*?travelers\s*:\s*\{\s*adults\s*:\s*(\d+)\s*,\s*children\s*:\s*(\d+)\s*,\s*infants\s*:\s*(\d+)\s*\}[\s\S]*?luggage\s*:\s*["']((?:[^"']|\\")*)["'][\s\S]*?\}/g;
  
  let match;
  while ((match = flightRegex.exec(flightsString)) !== null) {
    flights.push({
      date: match[1],
      fromAirport: match[2].replace(/\\"/g, '"'),
      toAirport: match[3].replace(/\\"/g, '"'),
      travelers: {
        adults: parseInt(match[4], 10),
        children: parseInt(match[5], 10),
        infants: parseInt(match[6], 10)
      },
      luggage: match[7].replace(/\\"/g, '"')
    });
  }
  
  return flights;
}

/**
 * Update a flight in an AirplaneSection component
 */
export function updateFlightInComponent(component: string, flightIndex: number, updatedFlight: FlightData): string {
  const flights = extractFlightsFromComponent(component);
  if (flightIndex < 0 || flightIndex >= flights.length) {
    throw new Error(`Invalid flight index: ${flightIndex}. Component has ${flights.length} flights.`);
  }
  
  flights[flightIndex] = updatedFlight;
  return replaceFlightsInComponent(component, flights);
}

/**
 * Add a flight to an AirplaneSection component
 */
export function addFlightToComponent(component: string, newFlight: FlightData): string {
  const flights = extractFlightsFromComponent(component);
  flights.push(newFlight);
  return replaceFlightsInComponent(component, flights);
}

/**
 * Remove a flight from an AirplaneSection component
 */
export function removeFlightFromComponent(component: string, flightIndex: number): string {
  const flights = extractFlightsFromComponent(component);
  if (flightIndex < 0 || flightIndex >= flights.length) {
    throw new Error(`Invalid flight index: ${flightIndex}. Component has ${flights.length} flights.`);
  }
  if (flights.length === 1) {
    throw new Error('Cannot remove the last flight. Delete the entire section instead.');
  }
  
  flights.splice(flightIndex, 1);
  return replaceFlightsInComponent(component, flights);
}

/**
 * Replace the flights array in a component string
 */
function replaceFlightsInComponent(component: string, flights: FlightData[]): string {
  // Format flights for JSX
  const flightsString = flights.map(flight => `{
            date: "${flight.date}",
            fromAirport: "${flight.fromAirport.replace(/"/g, '\\"')}",
            toAirport: "${flight.toAirport.replace(/"/g, '\\"')}",
            travelers: { adults: ${flight.travelers.adults}, children: ${flight.travelers.children}, infants: ${flight.travelers.infants} },
            luggage: "${flight.luggage.replace(/"/g, '\\"')}"
          }`).join(',\n          ');
  
  // Replace the flights array in the component
  const flightsRegex = /(flights\s*=\s*\{\[)([\s\S]*?)(\]\})/;
  return component.replace(flightsRegex, `$1\n          ${flightsString}\n          $3`);
}

/**
 * Update AirplaneSection props (title, notice, etc.)
 */
export function updateAirplaneSectionProps(
  component: string, 
  props: {
    title?: string;
    showTitle?: boolean;
    noticeMessage?: string;
    showNotice?: boolean;
    direction?: "rtl" | "ltr";
    language?: "ar" | "en";
  }
): string {
  let updated = component;
  
  // Update title
  if (props.title !== undefined) {
    if (updated.includes('title=')) {
      updated = updated.replace(/title=["'][^"']*["']/g, `title="${props.title.replace(/"/g, '\\"')}"`);
    } else {
      // Add title prop before id or after editable
      updated = updated.replace(/(id=["'][^"']*["'])/, `title="${props.title.replace(/"/g, '\\"')}" $1`);
    }
  }
  
  // Update showTitle
  if (props.showTitle !== undefined) {
    if (updated.includes('showTitle=')) {
      updated = updated.replace(/showTitle=\{?[^}]*\}?/g, `showTitle={${props.showTitle}}`);
    } else {
      updated = updated.replace(/(showTitle=\{?[^}]*\}?|id=["'][^"']*["'])/, `showTitle={${props.showTitle}} $1`);
    }
  }
  
  // Update noticeMessage
  if (props.noticeMessage !== undefined) {
    if (updated.includes('noticeMessage=')) {
      updated = updated.replace(/noticeMessage=["'][^"']*["']/g, `noticeMessage="${props.noticeMessage.replace(/"/g, '\\"')}"`);
    } else {
      updated = updated.replace(/(showNotice=\{?[^}]*\}?|id=["'][^"']*["'])/, `noticeMessage="${props.noticeMessage.replace(/"/g, '\\"')}" $1`);
    }
  }
  
  // Update showNotice
  if (props.showNotice !== undefined) {
    if (updated.includes('showNotice=')) {
      updated = updated.replace(/showNotice=\{?[^}]*\}?/g, `showNotice={${props.showNotice}}`);
    } else {
      updated = updated.replace(/(showNotice=\{?[^}]*\}?|direction=|language=|id=["'][^"']*["'])/, `showNotice={${props.showNotice}} $1`);
    }
  }
  
  // Update direction
  if (props.direction !== undefined) {
    if (updated.includes('direction=')) {
      updated = updated.replace(/direction=["'][^"']*["']/g, `direction="${props.direction}"`);
    } else {
      updated = updated.replace(/(language=|id=["'][^"']*["'])/, `direction="${props.direction}" $1`);
    }
  }
  
  // Update language
  if (props.language !== undefined) {
    if (updated.includes('language=')) {
      updated = updated.replace(/language=["'][^"']*["']/g, `language="${props.language}"`);
    } else {
      updated = updated.replace(/(\/>|>)/, `language="${props.language}" $1`);
    }
  }
  
  return updated;
}

/**
 * Remove an entire AirplaneSection component from code
 */
export function removeAirplaneSection(code: string, id: string): string {
  guardGeneratedContent(id, 'delete');
  
  const section = findAirplaneSection(code, id);
  if (!section) {
    throw new Error(`AirplaneSection with id "${id}" not found in code`);
  }
  
  // Remove the component and clean up surrounding whitespace
  const before = code.substring(0, section.startIndex);
  const after = code.substring(section.endIndex);
  
  // Remove trailing newlines/whitespace from before
  const cleanedBefore = before.replace(/\s+$/, '');
  // Remove leading newlines/whitespace from after, but keep at least one newline if needed
  const cleanedAfter = after.replace(/^\s+/, after.trimStart().startsWith('\n') ? '' : '');
  
  return cleanedBefore + cleanedAfter;
}

