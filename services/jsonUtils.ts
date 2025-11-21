/**
 * Attempts to clean and parse JSON using local heuristics.
 * Handles:
 * 1. Standard JSON
 * 2. Python-style dicts (None, True, False, single quotes)
 * 3. Escaped stringified JSON (nested strings)
 */
export const smartLocalParse = (input: string): { success: boolean; data: any; error?: string } => {
  if (!input || input.trim() === '') {
    return { success: false, error: 'Input is empty', data: null };
  }

  let cleaned = input.trim();

  // 1. Attempt direct parse (Best case & Double encoded strings)
  try {
    const data = JSON.parse(cleaned);

    // If the result is a string, it might be a stringified JSON (e.g. "{\"a\": 1}")
    if (typeof data === 'string') {
      // Try parsing one more level
      try {
        const inner = JSON.parse(data);
        // If we got an object/array/primitive from the string, return that.
        // This handles inputs like: "{\"foo\": \"bar\"}" -> {"foo": "bar"}
        return { success: true, data: inner };
      } catch (e) {
        // It was just a regular valid JSON string (e.g. "Hello World")
        return { success: true, data };
      }
    }
    return { success: true, data };
  } catch (e) {
    // Continue to heuristics
  }

  // 2. Heuristics for Python Dicts / Loose JSON
  // Python uses None, True, False. JS/JSON uses null, true, false.
  // Strategy 2: Remove all newlines (fixes broken keys/values split across lines)
  // This is common in log dumps where line wrapping breaks JSON strings
  const singleLine = cleaned.replace(/[\r\n]+/g, '');
  try {
    const data = JSON.parse(singleLine);
    return { success: true, data };
  } catch (e) {
    // Continue to next strategy
  }

  let heuristic = cleaned;

  heuristic = heuristic
    .replace(/\bNone\b/g, 'null')
    .replace(/\bTrue\b/g, 'true')
    .replace(/\bFalse\b/g, 'false');

  // Remove trailing commas (allowed in Python/JS but not JSON)
  // e.g. [1, 2,] -> [1, 2]
  heuristic = heuristic.replace(/,(\s*[\]}])/g, '$1');

  // 3. Handle Single Quotes (Python style)
  // We want to replace single quotes wrapping keys/values with double quotes.
  // BUT we must be careful about single quotes used as apostrophes inside strings.
  // AND we must escape existing double quotes inside the content.

  // Regex explanation: Match single-quoted strings.
  // '       : Start quote
  // (       : Capture group 1 (content)
  //   (?:   : Non-capturing group for alternation
  //     [^'\\] : Any char except ' or \
  //     |      : OR
  //     \\.    : Any escaped char
  //   )*    : Zero or more times
  // )       : End capture group
  // '       : End quote

  // Only apply this if the structure looks like an object/array to avoid messing up plain text.
  if (heuristic.startsWith('{') || heuristic.startsWith('[')) {
    heuristic = heuristic.replace(/'((?:[^'\\]|\\.)*)'/g, (match, content) => {
      // Escape existing double quotes in the content because we are wrapping in double quotes
      const escapedContent = content.replace(/"/g, '\\"');
      return `"${escapedContent}"`;
    });
  }

  try {
    const data = JSON.parse(heuristic);
    return { success: true, data };
  } catch (e) {
    // Final Fallback: The input might be a Python string representation of a dict wrapped in quotes?
    // e.g. "{'a': 1}" (as a string literal) - handled by step 1 usually if standard quotes.
    // But if it was valid Python representation like u'...' or similar, it gets harder.
  }

  return { success: false, error: 'Could not parse locally. Try AI Fix.', data: null };
};

export const formatJson = (data: any): string => {
  return JSON.stringify(data, null, 2);
};

export const minifyJson = (data: any): string => {
  return JSON.stringify(data);
};

export type DiffNode = {
  type: 'unchanged' | 'added' | 'removed' | 'updated';
  value?: any;
  oldValue?: any;
  children?: Record<string, DiffNode>;
};

export const generateDiff = (oldObj: any, newObj: any): DiffNode => {
  if (oldObj === newObj) {
    return { type: 'unchanged', value: oldObj };
  }

  if (typeof oldObj !== typeof newObj || oldObj === null || newObj === null || typeof oldObj !== 'object') {
    return { type: 'updated', value: newObj, oldValue: oldObj };
  }

  if (Array.isArray(oldObj) && Array.isArray(newObj)) {
    const children: Record<string, DiffNode> = {};
    const maxLen = Math.max(oldObj.length, newObj.length);
    let hasChanges = false;

    for (let i = 0; i < maxLen; i++) {
      if (i >= oldObj.length) {
        children[i.toString()] = { type: 'added', value: newObj[i] };
        hasChanges = true;
      } else if (i >= newObj.length) {
        children[i.toString()] = { type: 'removed', value: oldObj[i] };
        hasChanges = true;
      } else {
        const diff = generateDiff(oldObj[i], newObj[i]);
        children[i.toString()] = diff;
        if (diff.type !== 'unchanged') hasChanges = true;
      }
    }
    return { type: hasChanges ? 'updated' : 'unchanged', value: newObj, children };
  }

  if (!Array.isArray(oldObj) && !Array.isArray(newObj)) {
    const children: Record<string, DiffNode> = {};
    const keys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
    let hasChanges = false;

    keys.forEach(key => {
      if (!(key in oldObj)) {
        children[key] = { type: 'added', value: newObj[key] };
        hasChanges = true;
      } else if (!(key in newObj)) {
        children[key] = { type: 'removed', value: oldObj[key] };
        hasChanges = true;
      } else {
        const diff = generateDiff(oldObj[key], newObj[key]);
        children[key] = diff;
        if (diff.type !== 'unchanged') hasChanges = true;
      }
    });

    return { type: hasChanges ? 'updated' : 'unchanged', value: newObj, children };
  }

  return { type: 'updated', value: newObj, oldValue: oldObj };
};
