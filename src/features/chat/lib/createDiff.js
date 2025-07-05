import { useMemo } from 'react';

/**
 * Simple diff algorithm - find common lines and differences
 * @param {string} oldStr - Original string
 * @param {string} newStr - New string
 * @returns {Array} Array of diff objects with type, content, and lineNum
 */
const calculateDiff = (oldStr, newStr) => {
  const oldLines = oldStr.split('\n');
  const newLines = newStr.split('\n');
  
  // Simple diff algorithm - find common lines and differences
  const diffLines = [];
  let oldIndex = 0;
  let newIndex = 0;
  
  while (oldIndex < oldLines.length || newIndex < newLines.length) {
    const oldLine = oldLines[oldIndex];
    const newLine = newLines[newIndex];
    
    if (oldIndex >= oldLines.length) {
      // Only new lines remaining
      diffLines.push({ type: 'added', content: newLine, lineNum: newIndex + 1 });
      newIndex++;
    } else if (newIndex >= newLines.length) {
      // Only old lines remaining
      diffLines.push({ type: 'removed', content: oldLine, lineNum: oldIndex + 1 });
      oldIndex++;
    } else if (oldLine === newLine) {
      // Lines are the same - skip in diff view (or show as context)
      oldIndex++;
      newIndex++;
    } else {
      // Lines are different
      diffLines.push({ type: 'removed', content: oldLine, lineNum: oldIndex + 1 });
      diffLines.push({ type: 'added', content: newLine, lineNum: newIndex + 1 });
      oldIndex++;
      newIndex++;
    }
  }
  
  return diffLines;
};

/**
 * Memoized diff calculation hook to prevent recalculating on every render
 * @returns {Function} createDiff function with caching
 */
const useCreateDiff = () => {
  return useMemo(() => {
    const cache = new Map();
    return (oldStr, newStr) => {
      const key = `${oldStr.length}-${newStr.length}-${oldStr.slice(0, 50)}`;
      if (cache.has(key)) {
        return cache.get(key);
      }
      
      const result = calculateDiff(oldStr, newStr);
      cache.set(key, result);
      if (cache.size > 100) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      return result;
    };
  }, []);
};

export default useCreateDiff;