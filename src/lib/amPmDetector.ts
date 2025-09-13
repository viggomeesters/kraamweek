/**
 * Manual test script to detect AM/PM in the UI
 * Run this in browser console to check for AM/PM violations
 */

import { containsAmPm, getAmPmMatches } from './timeFormatValidator';

/**
 * Check the entire DOM for AM/PM violations
 * @returns Object with violation details
 */
export const checkDomForAmPm = () => {
  const violations: { element: Element; content: string; matches: string[] }[] = [];
  
  // Get all text nodes and element content
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
    null
  );
  
  let node;
  while (node = walker.nextNode()) {
    let content = '';
    
    if (node.nodeType === Node.TEXT_NODE) {
      content = node.textContent || '';
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      // Check input values, placeholders, and titles
      content = [
        element.getAttribute('value'),
        element.getAttribute('placeholder'),
        element.getAttribute('title'),
        element.textContent
      ].filter(Boolean).join(' ');
    }
    
    if (content && containsAmPm(content)) {
      const matches = getAmPmMatches(content);
      violations.push({
        element: node.nodeType === Node.TEXT_NODE ? node.parentElement! : node as Element,
        content: content.trim(),
        matches
      });
    }
  }
  
  return {
    found: violations.length > 0,
    count: violations.length,
    violations,
    summary: violations.length > 0 
      ? `Found ${violations.length} AM/PM violations in the UI`
      : 'No AM/PM violations found - all times use 24-hour format!'
  };
};

/**
 * Console-friendly version for browser testing
 */
export const testAmPmInUI = () => {
  const result = checkDomForAmPm();
  console.log(result.summary);
  
  if (result.found) {
    console.warn('AM/PM violations found:');
    result.violations.forEach((violation, index) => {
      console.log(`${index + 1}. Element:`, violation.element);
      console.log(`   Content: "${violation.content}"`);
      console.log(`   Matches:`, violation.matches);
    });
  } else {
    console.log('✅ All time displays use 24-hour format correctly!');
  }
  
  return result;
};