export interface FileItem {
  id: string;
  file: File;
  order: number;
}

// Natural sorting function that handles numbers in filenames correctly
function naturalSort(a: string, b: string): number {
  return a.localeCompare(b, undefined, { 
    numeric: true, 
    sensitivity: 'base' 
  });
}

// Extract number from filename for sorting
function extractPageNumber(filename: string): number | null {
  // Common patterns: page01, p1, 001, chapter1_page2, etc.
  const patterns = [
    /page\s*(\d+)/i,
    /p\s*(\d+)/i,
    /(\d+)/,
    /chapter\s*\d+\s*page\s*(\d+)/i,
    /ch\s*\d+\s*p\s*(\d+)/i
  ];
  
  for (const pattern of patterns) {
    const match = filename.match(pattern);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
  }
  
  return null;
}

// Check if filenames suggest a meaningful order
function hasOrderPattern(files: File[]): boolean {
  const numbersFound = files
    .map(f => extractPageNumber(f.name))
    .filter(n => n !== null);
  
  // If we found numbers in at least 70% of files, assume it's ordered
  return numbersFound.length >= Math.ceil(files.length * 0.7);
}

// Smart sorting: tries filename-based sorting first, falls back to selection order
export function smartSortFiles(files: File[]): FileItem[] {
  // Create file items with unique IDs
  const fileItems: FileItem[] = files.map((file, index) => ({
    id: `${Date.now()}-${index}`,
    file,
    order: index + 1 // Initial order based on selection
  }));
  
  // If only one file, return as-is
  if (files.length === 1) {
    return fileItems;
  }
  
  // Check if filenames suggest an order
  if (hasOrderPattern(files)) {
    console.log('Using filename-based sorting');
    
    // Sort by extracted page numbers, then by natural filename sort
    const sorted = [...fileItems].sort((a, b) => {
      const numA = extractPageNumber(a.file.name);
      const numB = extractPageNumber(b.file.name);
      
      // If both have numbers, sort by number
      if (numA !== null && numB !== null) {
        return numA - numB;
      }
      
      // If only one has a number, prioritize it
      if (numA !== null) return -1;
      if (numB !== null) return 1;
      
      // If neither has a number, use natural string sorting
      return naturalSort(a.file.name, b.file.name);
    });
    
    // Update order numbers
    return sorted.map((item, index) => ({
      ...item,
      order: index + 1
    }));
  } else {
    console.log('Using selection order (no clear filename pattern)');
    // Keep selection order
    return fileItems;
  }
}

// Utility to reorder files manually
export function reorderFiles(files: FileItem[], fromIndex: number, toIndex: number): FileItem[] {
  const newFiles = [...files];
  const [movedFile] = newFiles.splice(fromIndex, 1);
  newFiles.splice(toIndex, 0, movedFile);
  
  // Update order numbers
  return newFiles.map((file, index) => ({
    ...file,
    order: index + 1
  }));
}

// Convert FileItem back to File for processing
export function fileItemsToFiles(fileItems: FileItem[]): File[] {
  return fileItems
    .sort((a, b) => a.order - b.order)
    .map(item => item.file);
}