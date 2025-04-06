import * as pdfjs from 'pdfjs-dist';

// Configure PDF.js worker - Setting a CDN URL for the worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

// Function to load and render a PDF
export async function renderPdfPage(
  canvas: HTMLCanvasElement,
  pdfData: string | ArrayBuffer,
  pageNumber: number,
  zoom: number,
  brightness: number
): Promise<number> {
  try {
    // Load PDF document
    const loadingTask = pdfjs.getDocument({ data: pdfData });
    const pdf = await loadingTask.promise;
    
    // Get total number of pages
    const totalPages = pdf.numPages;
    
    // Validate page number
    const validPageNumber = Math.max(1, Math.min(pageNumber, totalPages));
    
    // Get the requested page
    const page = await pdf.getPage(validPageNumber);
    
    // Calculate viewport with zoom
    const viewport = page.getViewport({ scale: zoom / 100 });
    
    // Set canvas dimensions
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    // Get rendering context
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas context not available');
    }
    
    // Apply brightness filter
    context.filter = `brightness(${brightness}%)`;
    
    // Render PDF page
    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;
    
    return totalPages;
  } catch (error) {
    console.error('Error rendering PDF:', error);
    throw error;
  }
}

// Cache PDF documents in memory
const pdfCache = new Map<string, pdfjs.PDFDocumentProxy>();

// Function to preload a PDF into memory
export async function preloadPdf(pdfData: string | ArrayBuffer): Promise<void> {
  try {
    const cacheKey = typeof pdfData === 'string' ? pdfData : '';
    
    if (!pdfCache.has(cacheKey) && cacheKey) {
      const loadingTask = pdfjs.getDocument({ data: pdfData });
      const pdf = await loadingTask.promise;
      pdfCache.set(cacheKey, pdf);
    }
  } catch (error) {
    console.error('Error preloading PDF:', error);
  }
}

// Function to get a cached PDF document
export async function getPdfFromCache(
  pdfData: string | ArrayBuffer
): Promise<pdfjs.PDFDocumentProxy | null> {
  const cacheKey = typeof pdfData === 'string' ? pdfData : '';
  
  if (cacheKey && pdfCache.has(cacheKey)) {
    return pdfCache.get(cacheKey) || null;
  }
  
  return null;
}

// Function to clear the PDF cache
export function clearPdfCache(): void {
  pdfCache.forEach((pdf) => {
    pdf.destroy();
  });
  
  pdfCache.clear();
}
