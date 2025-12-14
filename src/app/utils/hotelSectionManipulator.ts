/**
 * Hotel Section Code Manipulator
 * 
 * Utilities for manipulating HotelsSection components in JSX code
 * with safeguards to only modify user-created sections (user_hotel_* IDs)
 */

import { guardGeneratedContent } from './contentGuards';
import { Hotel } from '../Templates/HotelsSection';

/**
 * Find a HotelsSection component by ID in the code
 * Returns the full component JSX string and its position
 * 
 * This function is carefully designed to ONLY match HotelsSection components,
 * not other components like DynamicTable or SectionTemplate
 */
export function findHotelSection(code: string, id: string): { component: string; startIndex: number; endIndex: number } | null {
  guardGeneratedContent(id, 'find');
  
  if (!id.startsWith('user_hotel_')) {
    throw new Error(`Invalid hotel section ID: ${id}. Must start with 'user_hotel_'`);
  }
  
  // Escape special regex characters in the ID
  const idPattern = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // More precise regex that:
  // 1. Matches <HotelsSection (with word boundary to avoid matching other components)
  // 2. Ensures the id attribute contains our specific ID
  // 3. Handles both self-closing and opening tags
  // 4. Uses non-greedy matching to avoid matching across component boundaries
  
  // First, find the opening tag with the specific ID
  // Pattern: <HotelsSection ... id="user_hotel_xxx" ... />
  // We need to be very specific to avoid matching DynamicTable or other components
  const openingTagRegex = new RegExp(
    `<HotelsSection\\s+[^>]*id\\s*=\\s*["']${idPattern}["'][^>]*(?:/>|>)`,
    'i'
  );
  
  const openingMatch = code.match(openingTagRegex);
  if (!openingMatch || openingMatch.index === undefined) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`HotelsSection with id "${id}" not found in code`);
    }
    return null;
  }
  
  const startIndex = openingMatch.index;
  let endIndex = startIndex + openingMatch[0].length;
  
  // Validate that we actually matched a HotelsSection component
  // Check that the matched string starts with <HotelsSection (case-insensitive)
  if (!/^<HotelsSection/i.test(openingMatch[0])) {
    throw new Error(`Regex matched non-HotelsSection component. This should not happen.`);
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
  // closing tags from nested components or other HotelsSection components
  const afterOpening = code.substring(endIndex);
  
  // Find the closing </HotelsSection> tag
  // We'll search for it, but we need to be careful about nested components
  // For now, we'll use a simple approach: find the first </HotelsSection> after our opening tag
  const closingTagRegex = /<\/HotelsSection>/i;
  const closingMatch = afterOpening.match(closingTagRegex);
  
  if (closingMatch && closingMatch.index !== undefined) {
    endIndex = endIndex + closingMatch.index + closingMatch[0].length;
    const fullComponent = code.substring(startIndex, endIndex);
    
    // Final validation: ensure the component contains our ID
    if (!fullComponent.includes(id)) {
      throw new Error(`Full component does not contain expected ID "${id}"`);
    }
    
    // Ensure we didn't accidentally match a different HotelsSection
    // Count opening and closing tags to ensure balance
    const openingTags = (fullComponent.match(/<HotelsSection/gi) || []).length;
    const closingTags = (fullComponent.match(/<\/HotelsSection>/gi) || []).length;
    
    if (openingTags !== closingTags) {
      throw new Error(`Unbalanced HotelsSection tags in matched component. Opening: ${openingTags}, Closing: ${closingTags}`);
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
 * Extract hotels array from a HotelsSection component string
 */
export function extractHotelsFromComponent(component: string): Hotel[] {
  const hotelsMatch = component.match(/hotels\s*=\s*\{\[([\s\S]*?)\]\}/);
  if (!hotelsMatch) {
    return [];
  }
  
  const hotelsString = hotelsMatch[1].trim();
  if (!hotelsString) {
    return [];
  }
  
  const hotels: Hotel[] = [];
  
  // Split by hotel object boundaries - look for complete hotel objects
  // Each hotel object starts with { and ends with }
  // We need to handle nested objects (roomDescription, dayInfo)
  let depth = 0;
  let start = -1;
  const hotelObjects: string[] = [];
  
  for (let i = 0; i < hotelsString.length; i++) {
    const char = hotelsString[i];
    const prevChar = i > 0 ? hotelsString[i - 1] : '';
    
    if (char === '{' && prevChar !== '\\') {
      if (depth === 0) {
        start = i;
      }
      depth++;
    } else if (char === '}' && prevChar !== '\\') {
      depth--;
      if (depth === 0 && start !== -1) {
        hotelObjects.push(hotelsString.substring(start, i + 1));
        start = -1;
      }
    }
  }
  
  // Parse each hotel object
  for (const hotelStr of hotelObjects) {
    try {
      const hotel: Hotel = {
        city: '',
        nights: 1,
        hotelName: '',
        hasDetailsLink: false,
        roomDescription: {
          includesAll: '',
          bedType: ''
        },
        checkInDate: '',
        checkOutDate: '',
        dayInfo: {
          checkInDay: '',
          checkOutDay: ''
        }
      };
      
      // Extract city
      const cityMatch = hotelStr.match(/city\s*:\s*["']((?:[^"']|\\")*)["']/);
      if (cityMatch) hotel.city = cityMatch[1].replace(/\\"/g, '"');
      
      // Extract nights
      const nightsMatch = hotelStr.match(/nights\s*:\s*(\d+)/);
      if (nightsMatch) hotel.nights = parseInt(nightsMatch[1], 10);
      
      // Extract cityBadge
      const cityBadgeMatch = hotelStr.match(/cityBadge\s*:\s*["']((?:[^"']|\\")*)["']/);
      if (cityBadgeMatch) hotel.cityBadge = cityBadgeMatch[1].replace(/\\"/g, '"');
      
      // Extract hotelName
      const hotelNameMatch = hotelStr.match(/hotelName\s*:\s*["']((?:[^"']|\\")*)["']/);
      if (hotelNameMatch) hotel.hotelName = hotelNameMatch[1].replace(/\\"/g, '"');
      
      // Extract hasDetailsLink
      const hasDetailsLinkMatch = hotelStr.match(/hasDetailsLink\s*:\s*(true|false)/);
      if (hasDetailsLinkMatch) hotel.hasDetailsLink = hasDetailsLinkMatch[1] === 'true';
      
      // Extract detailsLink
      const detailsLinkMatch = hotelStr.match(/detailsLink\s*:\s*["']((?:[^"']|\\")*)["']/);
      if (detailsLinkMatch) hotel.detailsLink = detailsLinkMatch[1].replace(/\\"/g, '"');
      
      // Extract roomDescription
      const roomDescMatch = hotelStr.match(/roomDescription\s*:\s*\{([\s\S]*?)\}/);
      if (roomDescMatch) {
        const roomDescStr = roomDescMatch[1];
        const includesAllMatch = roomDescStr.match(/includesAll\s*:\s*["']((?:[^"']|\\")*)["']/);
        if (includesAllMatch) hotel.roomDescription.includesAll = includesAllMatch[1].replace(/\\"/g, '"');
        
        const bedTypeMatch = roomDescStr.match(/bedType\s*:\s*["']((?:[^"']|\\")*)["']/);
        if (bedTypeMatch) hotel.roomDescription.bedType = bedTypeMatch[1].replace(/\\"/g, '"');
        
        const roomTypeMatch = roomDescStr.match(/roomType\s*:\s*["']((?:[^"']|\\")*)["']/);
        if (roomTypeMatch) hotel.roomDescription.roomType = roomTypeMatch[1].replace(/\\"/g, '"');
      }
      
      // Extract checkInDate
      const checkInMatch = hotelStr.match(/checkInDate\s*:\s*["']([^"']*)["']/);
      if (checkInMatch) hotel.checkInDate = checkInMatch[1];
      
      // Extract checkOutDate
      const checkOutMatch = hotelStr.match(/checkOutDate\s*:\s*["']([^"']*)["']/);
      if (checkOutMatch) hotel.checkOutDate = checkOutMatch[1];
      
      // Extract dayInfo
      const dayInfoMatch = hotelStr.match(/dayInfo\s*:\s*\{([\s\S]*?)\}/);
      if (dayInfoMatch) {
        const dayInfoStr = dayInfoMatch[1];
        const checkInDayMatch = dayInfoStr.match(/checkInDay\s*:\s*["']((?:[^"']|\\")*)["']/);
        if (checkInDayMatch) hotel.dayInfo.checkInDay = checkInDayMatch[1].replace(/\\"/g, '"');
        
        const checkOutDayMatch = dayInfoStr.match(/checkOutDay\s*:\s*["']((?:[^"']|\\")*)["']/);
        if (checkOutDayMatch) hotel.dayInfo.checkOutDay = checkOutDayMatch[1].replace(/\\"/g, '"');
      }
      
      hotels.push(hotel);
    } catch (error) {
      console.error('Error parsing hotel object:', error, hotelStr);
    }
  }
  
  return hotels;
}

/**
 * Update a hotel in a HotelsSection component
 */
export function updateHotelInComponent(component: string, hotelIndex: number, updatedHotel: Hotel): string {
  const hotels = extractHotelsFromComponent(component);
  if (hotelIndex < 0 || hotelIndex >= hotels.length) {
    throw new Error(`Invalid hotel index: ${hotelIndex}. Component has ${hotels.length} hotels.`);
  }
  
  hotels[hotelIndex] = updatedHotel;
  return replaceHotelsInComponent(component, hotels);
}

/**
 * Add a hotel to a HotelsSection component
 */
export function addHotelToComponent(component: string, newHotel: Hotel): string {
  const hotels = extractHotelsFromComponent(component);
  hotels.push(newHotel);
  return replaceHotelsInComponent(component, hotels);
}

/**
 * Remove a hotel from a HotelsSection component
 */
export function removeHotelFromComponent(component: string, hotelIndex: number): string {
  const hotels = extractHotelsFromComponent(component);
  if (hotelIndex < 0 || hotelIndex >= hotels.length) {
    throw new Error(`Invalid hotel index: ${hotelIndex}. Component has ${hotels.length} hotels.`);
  }
  if (hotels.length === 1) {
    throw new Error('Cannot remove the last hotel. Delete the entire section instead.');
  }
  
  hotels.splice(hotelIndex, 1);
  return replaceHotelsInComponent(component, hotels);
}

/**
 * Replace the hotels array in a component string
 */
function replaceHotelsInComponent(component: string, hotels: Hotel[]): string {
  // Format hotels for JSX
  const hotelsString = hotels.map(hotel => {
    const hotelObj: string[] = [];
    hotelObj.push(`city: "${hotel.city.replace(/"/g, '\\"')}"`);
    hotelObj.push(`nights: ${hotel.nights}`);
    if (hotel.cityBadge) {
      hotelObj.push(`cityBadge: "${hotel.cityBadge.replace(/"/g, '\\"')}"`);
    }
    hotelObj.push(`hotelName: "${hotel.hotelName.replace(/"/g, '\\"')}"`);
    if (hotel.hasDetailsLink !== undefined) {
      hotelObj.push(`hasDetailsLink: ${hotel.hasDetailsLink}`);
    }
    if (hotel.detailsLink) {
      hotelObj.push(`detailsLink: "${hotel.detailsLink.replace(/"/g, '\\"')}"`);
    }
    hotelObj.push(`roomDescription: {
              includesAll: "${hotel.roomDescription.includesAll.replace(/"/g, '\\"')}",
              bedType: "${hotel.roomDescription.bedType.replace(/"/g, '\\"')}"${hotel.roomDescription.roomType ? `,
              roomType: "${hotel.roomDescription.roomType.replace(/"/g, '\\"')}"` : ''}
            }`);
    hotelObj.push(`checkInDate: "${hotel.checkInDate}"`);
    hotelObj.push(`checkOutDate: "${hotel.checkOutDate}"`);
    hotelObj.push(`dayInfo: {
              checkInDay: "${hotel.dayInfo.checkInDay.replace(/"/g, '\\"')}",
              checkOutDay: "${hotel.dayInfo.checkOutDay.replace(/"/g, '\\"')}"
            }`);
    
    return `{\n            ${hotelObj.join(',\n            ')}\n          }`;
  }).join(',\n          ');
  
  // Replace the hotels array in the component
  const hotelsRegex = /(hotels\s*=\s*\{\[)([\s\S]*?)(\]\})/;
  return component.replace(hotelsRegex, `$1\n          ${hotelsString}\n          $3`);
}

/**
 * Update HotelsSection props (title, labels, etc.)
 */
export function updateHotelSectionProps(
  component: string, 
  props: {
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
  
  // Update labels
  if (props.labels !== undefined) {
    const labelsString = `{
            nights: "${props.labels.nights.replace(/"/g, '\\"')}",
            includes: "${props.labels.includes.replace(/"/g, '\\"')}",
            checkIn: "${props.labels.checkIn.replace(/"/g, '\\"')}",
            checkOut: "${props.labels.checkOut.replace(/"/g, '\\"')}",
            details: "${props.labels.details.replace(/"/g, '\\"')}",
            count: "${props.labels.count.replace(/"/g, '\\"')}"
          }`;
    
    if (updated.includes('labels=')) {
      // Replace existing labels
      const labelsRegex = /labels\s*=\s*\{[\s\S]*?\}/;
      updated = updated.replace(labelsRegex, `labels={${labelsString}}`);
    } else {
      // Add labels prop
      updated = updated.replace(/(language=["'][^"']*["']|id=["'][^"']*["'])/, `labels={${labelsString}} $1`);
    }
  }
  
  return updated;
}

/**
 * Remove an entire HotelsSection component from code
 */
export function removeHotelSection(code: string, id: string): string {
  guardGeneratedContent(id, 'delete');
  
  const section = findHotelSection(code, id);
  if (!section) {
    throw new Error(`HotelsSection with id "${id}" not found in code`);
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

