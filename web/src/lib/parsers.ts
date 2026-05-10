export interface MindsetShift {
  id: string;
  from: string;
  to: string;
  firstChunk: string;
  statuses: Record<string, string>; // e.g. "Вадима" -> "seeded"
}

/**
 * Parses the mindset-map.md file to extract the shifts table
 */
export function parseMindsetMap(content: string): MindsetShift[] {
  const lines = content.split('\n');
  const shifts: MindsetShift[] = [];
  
  let inTable = false;
  let studentNames: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('|') && trimmed.includes('От') && trimmed.includes('К')) {
      inTable = true;
      // Parse headers
      const parts = trimmed.split('|');
      if (parts[0].trim() === '') parts.shift();
      if (parts[parts.length - 1].trim() === '') parts.pop();
      const headers = parts.map(s => s.trim());
      
      // Headers starting from index 4 are "Статус [Имя]"
      for (let i = 4; i < headers.length; i++) {
        const match = headers[i].match(/Статус (.*)/);
        studentNames.push(match ? match[1] : headers[i]);
      }
      continue;
    }
    
    if (inTable && trimmed.startsWith('|---')) {
      continue;
    }
    
    if (inTable && trimmed.startsWith('|')) {
      const parts = trimmed.split('|');
      if (parts[0].trim() === '') parts.shift();
      if (parts[parts.length - 1].trim() === '') parts.pop();
      const cells = parts.map(s => s.trim());
      
      if (cells.length >= 4 + studentNames.length) {
        const shift: MindsetShift = {
          id: cells[0],
          from: cells[1],
          to: cells[2],
          firstChunk: cells[3],
          statuses: {}
        };
        
        for (let i = 0; i < studentNames.length; i++) {
          shift.statuses[studentNames[i]] = cells[4 + i];
        }
        shifts.push(shift);
      }
    } else if (inTable && trimmed === '') {
      inTable = false;
    }
  }
  
  return shifts;
}

export interface SequenceNode {
  id: string;
  title: string;
  date: string;
  type: string;
  prerequisites: string[];
  leads_to: string[];
  related: string[];
}

import yaml from 'js-yaml';

export function parseSequence(content: string): SequenceNode[] {
  const nodes: SequenceNode[] = [];
  const regex = /```yaml\n([\s\S]*?)\n```/g;

  let match;
  while ((match = regex.exec(content)) !== null) {
    try {
      const parsed = yaml.load(match[1]) as Partial<SequenceNode>;
      if (parsed && parsed.id) {
        nodes.push({
          id: parsed.id,
          title: parsed.title || '',
          date: parsed.date || '',
          type: parsed.type || 'unknown',
          prerequisites: parsed.prerequisites || [],
          leads_to: parsed.leads_to || [],
          related: parsed.related || []
        });
      }
    } catch (e) {
      console.error('Failed to parse YAML block in sequence.md:', e);
    }
  }

  return nodes;
}

/**
 * Parses my-path.md and returns chunkIds with status ✅ пройден
 * (the authoritative source for current student progress against new chunks).
 */
export function parsePassedFromMyPath(content: string): string[] {
  const passed: string[] = [];
  const lines = content.split('\n');
  let inStatusTable = false;
  for (const line of lines) {
    if (/^##\s+Текущий\s+статус/i.test(line)) { inStatusTable = true; continue; }
    if (inStatusTable && /^##\s/.test(line)) break;
    if (!inStatusTable || !line.startsWith('|')) continue;
    const cells = line.split('|').map(c => c.trim());
    // cells: ["", chunkId, type, status, bloom, dod, ""]
    if (cells.length < 6) continue;
    const chunkId = cells[1];
    const status = cells[3];
    if (!chunkId || chunkId === 'Чанк' || chunkId.startsWith('---')) continue;
    if (status && status.includes('✅')) passed.push(chunkId);
  }
  return passed;
}
