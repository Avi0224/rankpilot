// Data Normalization Engine for RankPilot
// Handles parsing, validation, and normalization of counselling datasets

import type {
  NormalizationRule,
  NormalizationType,
  ParsedCutoffRow,
  ColumnMapping,
  PreviewRow,
  PreviewError,
  ImportPreview,
  ValidationError,
  ValidationWarning,
  ValidationResult,
  ErrorType,
} from './types';

// In-memory cache for normalization rules
let normalizationCache: Map<string, Map<string, string>> | null = null;

// Initialize normalization cache from database rules
export async function initializeNormalizer(rules: NormalizationRule[]): Promise<void> {
  normalizationCache = new Map();

  const types: NormalizationType[] = ['branch', 'category', 'quota', 'gender', 'college', 'state'];
  types.forEach((t) => normalizationCache!.set(t, new Map()));

  rules.forEach((rule) => {
    const typeMap = normalizationCache!.get(rule.type);
    if (typeMap) {
      typeMap.set(rule.original_value.toLowerCase().trim(), rule.normalized_value);
    }
  });
}

// Normalize a single value using cached rules
export function normalizeValue(
  value: string,
  type: NormalizationType
): { normalized: string; wasNormalized: boolean } {
  if (!value || typeof value !== 'string') {
    return { normalized: value || '', wasNormalized: false };
  }

  const trimmed = value.trim();
  const cache = normalizationCache?.get(type);

  if (cache) {
    const normalized = cache.get(trimmed.toLowerCase());
    if (normalized) {
      return { normalized, wasNormalized: true };
    }
  }

  // Default normalization logic
  let normalized = trimmed;

  switch (type) {
    case 'category':
      normalized = normalizeCategory(trimmed);
      break;
    case 'quota':
      normalized = normalizeQuota(trimmed);
      break;
    case 'gender':
      normalized = normalizeGender(trimmed);
      break;
    case 'branch':
      normalized = normalizeBranch(trimmed);
      break;
    default:
      break;
  }

  return { normalized, wasNormalized: normalized !== trimmed };
}

// Category normalization
function normalizeCategory(value: string): string {
  const v = value.toUpperCase().replace(/[-\s]/g, '');

  if (v.includes('GEN') || v === 'OPEN' || v === 'UR' || v === 'UNRESERVED') return 'OPEN';
  if (v.includes('OBC') && v.includes('PWW')) return 'OBC-NCL-PwD';
  if (v.includes('OBC')) return 'OBC-NCL';
  if (v.includes('EWS') && v.includes('PWW')) return 'EWS-PwD';
  if (v.includes('EWS') || v.includes('GENEREWS')) return 'EWS';
  if (v.includes('SC') && v.includes('PWW')) return 'SC-PwD';
  if (v === 'SC' || v.includes('SCHEDULEDCASTE')) return 'SC';
  if (v.includes('ST') && v.includes('PWW')) return 'ST-PwD';
  if (v === 'ST' || v.includes('SCHEDULEDTRIBE')) return 'ST';
  if (v.includes('PWW') || v.includes('PD') || v.includes('PWD')) return 'OPEN-PwD';

  return value.trim();
}

// Quota normalization
function normalizeQuota(value: string): string {
  const v = value.toUpperCase().replace(/[-\s]/g, '');

  if (v === 'AI' || v === 'ALLINDIA') return 'AI';
  if (v === 'HS' || v === 'HOMESTATE') return 'HS';
  if (v === 'OS' || v === 'OTHERSTATE') return 'OS';
  if (v === 'GO' || v === 'GOVERNMENT') return 'GO';
  if (v === 'OP' || v === 'OPEN') return 'OP';

  return value.trim();
}

// Gender normalization
function normalizeGender(value: string): string {
  const v = value.toUpperCase().replace(/[-\s]/g, '');

  if (v === 'GN' || v === 'NEUTRAL' || v === 'M' || v === 'MALE' || v === 'GENDERNEUTRAL') {
    return 'Gender-Neutral';
  }
  if (v === 'FO' || v === 'F' || v === 'FEMALE' || v === 'FEMALEONLY') {
    return 'Female-only';
  }

  return value.trim();
}

// Branch normalization
function normalizeBranch(value: string): string {
  const v = value.toLowerCase().replace(/[^a-z0-9]/g, '');

  const branchMap: Record<string, string> = {
    cse: 'CSE',
    'computerscience': 'CSE',
    'computerscienceengg': 'CSE',
    'computerscienceandengg': 'CSE',
    'computerscienceenginnering': 'CSE',
    ece: 'ECE',
    'electronicsandcommunication': 'ECE',
    'electronicscommunication': 'ECE',
    ee: 'EE',
    'electricalengg': 'EE',
    'electricalengineering': 'EE',
    me: 'ME',
    'mechanicalengg': 'ME',
    'mechanicalengineering': 'ME',
    ce: 'CE',
    'civilengg': 'CE',
    'civilengineering': 'CE',
    it: 'IT',
    'informationtechnology': 'IT',
    chem: 'ChemE',
    'chemicalengg': 'ChemE',
    'chemicalengineering': 'ChemE',
    ds: 'DS',
    'datascience': 'DS',
    aiml: 'AIML',
    'artificialintelligence': 'AIML',
    'machinelearning': 'AIML',
    eie: 'EIE',
    'electronicsandinstrumentation': 'EIE',
    arch: 'Arch',
    'architectue': 'Arch',
    bt: 'BT',
    'biotechnology': 'BT',
    meta: 'MetaE',
    'metallurgical': 'MetaE',
    ie: 'IE',
    'industrialengineering': 'IE',
    ipe: 'IPE',
    'industrialandproduction': 'IPE',
    mc: 'MC',
    'mathematicsandcomputing': 'MC',
    mining: 'MiningE',
    'miningengineering': 'MiningE',
    textile: 'TextileE',
    aero: 'AE',
    'aerospaceengineering': 'AE',
  };

  return branchMap[v] || value.trim();
}

// Auto-detect column mapping from CSV headers
export function detectColumnMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  const headerLower = headers.map((h) => h.toLowerCase().trim().replace(/[_\s]/g, ''));

  const columnPatterns: Record<string, string[]> = {
    institute: ['institute', 'institutename', 'college', 'name'],
    branch: ['academicprogram', 'program', 'branch', 'course', 'programname'],
    category: ['category', 'cat'],
    quota: ['quota', 'seattype', 'seatcategory'],
    gender: ['gender', 'genderpool', 'seatpool'],
    opening_rank: ['openingrank', 'opening', 'or', 'opening_rank'],
    closing_rank: ['closingrank', 'closing', 'cr', 'closing_rank'],
    round: ['round', 'roundno', 'rnd'],
    year: ['year', 'yr', 'session'],
  };

  Object.entries(columnPatterns).forEach(([target, patterns]) => {
    for (let i = 0; i < headerLower.length; i++) {
      const h = headerLower[i];
      if (patterns.some((p) => h.includes(p))) {
        mapping[target] = headers[i];
        break;
      }
    }
  });

  return mapping;
}

// Validate a single row
export function validateRow(
  row: Record<string, unknown>,
  mapping: ColumnMapping,
  rowNumber: number
): { valid: boolean; errors: PreviewError[]; normalized: Record<string, unknown> } {
  const errors: PreviewError[] = [];
  const normalized: Record<string, unknown> = {};

  // Required fields
  const required = ['institute', 'branch', 'category', 'closing_rank'];
  required.forEach((field) => {
    const sourceCol = mapping[field];
    if (!sourceCol) {
      errors.push({
        rowNumber,
        column: field,
        value: null,
        error: `Missing column mapping for ${field}`,
        severity: 'error',
      });
    }
  });

  // Get and validate values
  const getAndValidate = (
    field: string,
    type: 'string' | 'number',
    normalizer?: NormalizationType
  ): unknown => {
    const sourceCol = mapping[field];
    if (!sourceCol) return null;

    const rawValue = row[sourceCol];
    if (rawValue === undefined || rawValue === null || rawValue === '') {
      if (['institute', 'branch', 'category'].includes(field)) {
        errors.push({
          rowNumber,
          column: sourceCol,
          value: rawValue,
          error: `Missing required value for ${field}`,
          severity: 'error',
        });
      }
      return null;
    }

    if (type === 'number') {
      const num = Number(rawValue);
      if (isNaN(num)) {
        errors.push({
          rowNumber,
          column: sourceCol,
          value: rawValue,
          error: `Invalid number: ${rawValue}`,
          severity: 'error',
        });
        return null;
      }
      return num;
    }

    const strVal = String(rawValue).trim();
    if (normalizer) {
      const { normalized: normVal } = normalizeValue(strVal, normalizer);
      return normVal;
    }
    return strVal;
  };

  normalized.institute = getAndValidate('institute', 'string', 'college');
  normalized.branch = getAndValidate('branch', 'string', 'branch');
  normalized.category = getAndValidate('category', 'string', 'category');
  normalized.quota = getAndValidate('quota', 'string', 'quota') || 'AI';
  normalized.gender = getAndValidate('gender', 'string', 'gender') || 'Gender-Neutral';
  normalized.opening_rank = getAndValidate('opening_rank', 'number');
  normalized.closing_rank = getAndValidate('closing_rank', 'number');
  normalized.round = getAndValidate('round', 'number') || 1;
  normalized.year = getAndValidate('year', 'number') || new Date().getFullYear();

  // Rank validation
  if (normalized.opening_rank && normalized.closing_rank) {
    if ((normalized.opening_rank as number) > (normalized.closing_rank as number)) {
      errors.push({
        rowNumber,
        column: mapping.closing_rank || 'closing_rank',
        value: `${normalized.opening_rank} > ${normalized.closing_rank}`,
        error: 'Opening rank cannot be greater than closing rank',
        severity: 'warning',
      });
    }
  }

  if (normalized.closing_rank && (normalized.closing_rank as number) < 1) {
    errors.push({
      rowNumber,
      column: mapping.closing_rank || 'closing_rank',
      value: normalized.closing_rank,
      error: 'Closing rank must be a positive number',
      severity: 'error',
    });
  }

  return {
    valid: errors.filter((e) => e.severity === 'error').length === 0,
    errors,
    normalized,
  };
}

// Parse CSV content
export function parseCSV(content: string): { headers: string[]; rows: Record<string, unknown>[] } {
  const lines = content.split('\n').filter((l) => l.trim());
  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = parseCSVLine(lines[0]);
  const rows: Record<string, unknown>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length !== headers.length) continue;

    const row: Record<string, unknown> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx];
    });
    rows.push(row);
  }

  return { headers, rows };
}

// Parse a single CSV line handling quotes
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());

  return result;
}

// Generate import preview from parsed data
export function generatePreview(
  rows: Record<string, unknown>[],
  system: string,
  year: number,
  round: number,
  limit = 100
): ImportPreview {
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  const mapping = detectColumnMapping(headers);
  const sampleData: PreviewRow[] = [];
  const allErrors: PreviewError[] = [];
  const seenRows = new Set<string>();

  let validRows = 0;
  let invalidRows = 0;
  let duplicates = 0;

  rows.slice(0, limit).forEach((row, idx) => {
    const rowNumber = idx + 2; // +2 for 1-indexed and header row
    const { valid, errors, normalized } = validateRow(row, mapping, rowNumber);

    // Duplicate detection
    const rowKey = `${normalized.institute}|${normalized.branch}|${normalized.category}|${normalized.quota}`;
    if (seenRows.has(rowKey)) {
      duplicates++;
      errors.push({
        rowNumber,
        column: 'row',
        value: rowKey,
        error: 'Duplicate entry detected',
        severity: 'warning',
      });
    } else {
      seenRows.add(rowKey);
    }

    if (valid) validRows++;
    else invalidRows++;

    sampleData.push({
      rowNumber,
      original: row,
      mapped: normalized,
      isValid: valid,
      errors: errors.map((e) => e.error),
    });

    allErrors.push(...errors);
  });

  return {
    totalRows: rows.length,
    validRows,
    invalidRows,
    successfulRows: validRows,
    duplicates,
    warnings: allErrors.filter((e) => e.severity === 'warning').length,
    columnMapping: mapping,
    sampleData,
    errors: allErrors,
  };
}

// Calculate validation score
export function calculateValidationScore(preview: ImportPreview): number {
  const { totalRows, validRows, invalidRows, duplicates, warnings } = preview;
  if (totalRows === 0) return 0;

  const validWeight = 0.6;
  const errorWeight = 0.25;
  const duplicateWeight = 0.1;
  const warningWeight = 0.05;

  const validScore = (validRows / totalRows) * validWeight * 100;
  const errorPenalty = (invalidRows / totalRows) * errorWeight * 100;
  const duplicatePenalty = (duplicates / totalRows) * duplicateWeight * 100;
  const warningPenalty = (warnings / totalRows) * warningWeight * 50;

  return Math.max(0, Math.min(100, validScore - errorPenalty - duplicatePenalty - warningPenalty));
}

// Format validation result for display
export function formatValidationResult(preview: ImportPreview): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  preview.errors.forEach((e) => {
    if (e.severity === 'error') {
      errors.push({
        column: e.column || 'unknown',
        row: e.rowNumber,
        message: e.error,
        type: 'invalid_format' as ErrorType,
      });
    } else {
      warnings.push({
        column: e.column || 'unknown',
        row: e.rowNumber,
        message: e.error,
        suggestion: null,
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: calculateValidationScore(preview),
  };
}

// Export for use in client components
export {
  normalizationCache,
};
