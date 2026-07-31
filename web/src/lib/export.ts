import { jsPDF } from 'jspdf';

interface ExportSection {
  title: string;
  content: string;
}

function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,3}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/^> /gm, '')
    .replace(/^[-|]/gm, (m) => (m === '|' ? '' : '•'))
    .replace(/\|/g, ' ')
    .replace(/---/g, '')
    .replace(/`/g, '')
    .trim();
}

function addWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  const pageHeight = doc.internal.pageSize.getHeight();
  let currentY = y;

  for (const line of lines) {
    if (currentY > pageHeight - 20) {
      doc.addPage();
      currentY = 20;
    }
    doc.text(line, x, currentY);
    currentY += lineHeight;
  }

  return currentY;
}

export function exportToPdf(
  title: string,
  subtitle: string,
  sections: ExportSection[],
  filename: string
): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const margin = 20;
  const maxWidth = doc.internal.pageSize.getWidth() - margin * 2;
  let y = 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(title, margin, y);
  y += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(subtitle, margin, y);
  y += 12;
  doc.setTextColor(0);

  for (const section of sections) {
    if (y > doc.internal.pageSize.getHeight() - 30) {
      doc.addPage();
      y = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    y = addWrappedText(doc, section.title, margin, y, maxWidth, 7);
    y += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const plain = stripMarkdown(section.content);
    y = addWrappedText(doc, plain, margin, y, maxWidth, 5);
    y += 8;
  }

  doc.save(filename);
}

export function buildReportSections(
  iterations: { loopNumber: number; name: string; response: string }[],
  finalOutput: string,
  outputLabel: string
): ExportSection[] {
  const sections: ExportSection[] = iterations.map((it) => ({
    title: `Loop ${it.loopNumber}: ${it.name}`,
    content: it.response,
  }));

  if (finalOutput && iterations[iterations.length - 1]?.response !== finalOutput) {
    sections.push({ title: outputLabel, content: finalOutput });
  }

  return sections;
}
