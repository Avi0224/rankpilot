// Data Ingestion Types for RankPilot

export type CounsellingSystem =
  | 'josaa'
  | 'csab'
  | 'jac-delhi'
  | 'comedk'
  | 'mht-cet'
  | 'uptac'
  | 'wbjee'
  | 'kcet'
  | 'ts-eamcet'
  | 'ap-eapcet';

export type CounsellingType = 'National' | 'State' | 'Institute';

export type ImportStatus = 'pending' | 'validating' | 'processing' | 'completed' | 'failed' | 'rolled_back';

export type ErrorType = 'missing_value' | 'invalid_format' | 'duplicate' | 'normalization_failed' | 'constraint_violation' | 'invalid_rank';

export type ErrorSeverity = 'error' | 'warning';

export type NormalizationType = 'branch' | 'category' | 'quota' | 'gender' | 'college' | 'state' | 'round';

export interface CounsellingSystemInfo {
  id: CounsellingSystem;
  name: string;
  short_name: string;
  type: CounsellingType;
  state: string | null;
  website: string | null;
  active: boolean;
  last_import: string | null;
  total_records: number;
}

export interface NormalizationRule {
  id: string;
  original_value: string;
  normalized_value: string;
  type: NormalizationType;
  is_auto: boolean;
  created_at: string;
  updated_at: string;
}

export interface ImportLog {
  id: string;
  filename: string;
  counselling_system: CounsellingSystem;
  year: number;
  round: number;
  uploaded_by: string | null;
  status: ImportStatus;
  total_rows: number;
  successful_rows: number;
  failed_rows: number;
  warning_count: number;
  duplicate_count: number;
  file_size_kb: number | null;
  parsing_time_ms: number | null;
  processing_time_ms: number | null;
  error_summary: Record<string, number>;
  metadata: Record<string, unknown>;
  rollback_available: boolean;
  created_at: string;
  completed_at: string | null;
}

export interface ImportError {
  id: string;
  import_log_id: string;
  row_number: number;
  column_name: string | null;
  original_value: string | null;
  error_type: ErrorType;
  error_message: string;
  severity: ErrorSeverity;
  suggested_fix: string | null;
  resolved: boolean;
}

export interface RawUpload {
  id: string;
  import_log_id: string;
  row_number: number;
  raw_data: Record<string, unknown>;
  normalized_data: Record<string, unknown> | null;
  is_valid: boolean;
  validation_errors: string[];
}

export interface ParsedCutoffRow {
  institute: string;
  academic_program: string;
  category: string;
  quota: string;
  gender: string;
  opening_rank: number | null;
  closing_rank: number | null;
  year: number;
  round: number;
}

export interface ImportPreview {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  successfulRows: number;
  duplicates: number;
  warnings: number;
  columnMapping: ColumnMapping;
  sampleData: PreviewRow[];
  errors: PreviewError[];
}

export interface ColumnMapping {
  [key: string]: string | null;
}

export interface PreviewRow {
  rowNumber: number;
  original: Record<string, unknown>;
  mapped: Record<string, unknown>;
  isValid: boolean;
  errors: string[];
}

export interface PreviewError {
  rowNumber: number;
  column: string;
  value: unknown;
  error: string;
  severity: ErrorSeverity;
}

export interface UploadProgress {
  stage: 'idle' | 'uploading' | 'parsing' | 'validating' | 'previewing' | 'importing' | 'completed' | 'error';
  progress: number;
  message: string;
  details?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number;
}

export interface ValidationError {
  column: string;
  row: number | null;
  message: string;
  type: ErrorType;
}

export interface ValidationWarning {
  column: string;
  row: number | null;
  message: string;
  suggestion: string | null;
}

// Standard column names expected by the system
export const EXPECTED_COLUMNS = {
  cutoff: [
    'Institute',
    'Institute Name',
    'Academic Program',
    'Program',
    'Branch',
    'Category',
    'Quota',
    'Gender',
    'Opening Rank',
    'Closing Rank',
    'Round',
    'Year',
  ],
  college: [
    'Institute Name',
    'College Name',
    'State',
    'City',
    'Type',
    'NIRF Rank',
    'Average Package',
    'Median Package',
    'Fees',
    'Hostel Fees',
  ],
};

// Column aliases for auto-mapping
export const COLUMN_ALIASES: Record<string, string[]> = {
  institute: ['Institute', 'Institute Name', 'College', 'College Name', 'InstituteID', 'Institute_ID'],
  branch: ['Academic Program', 'Program', 'Branch', 'Course', 'Program Name', 'Academic_Program_Name'],
  category: ['Category', 'Cat', 'Category Name'],
  quota: ['Quota', 'Seat Type', 'Seat Category'],
  gender: ['Gender', 'Gender Pool', 'Seat Pool'],
  opening_rank: ['Opening Rank', 'Opening_Rank', 'OR', 'Opening'],
  closing_rank: ['Closing Rank', 'Closing_Rank', 'CR', 'Closing'],
  round: ['Round', 'Round No', 'Round_No', 'Rnd'],
  year: ['Year', 'Yr', 'Session', 'Academic Year'],
};

export const COUNSELLING_SYSTEM_DETAILS: Record<CounsellingSystem, {
  name: string;
  shortName: string;
  type: CounsellingType;
  expectedFiles: string[];
}> = {
  'josaa': {
    name: 'Joint Seat Allocation Authority',
    shortName: 'JoSAA',
    type: 'National',
    expectedFiles: ['josaa_round_*.csv', 'josaa_*.xlsx'],
  },
  'csab': {
    name: 'Central Seat Allocation Board',
    shortName: 'CSAB',
    type: 'National',
    expectedFiles: ['csab_round_*.csv', 'csab_*.xlsx'],
  },
  'jac-delhi': {
    name: 'Joint Admission Counselling Delhi',
    shortName: 'JAC Delhi',
    type: 'National',
    expectedFiles: ['jac_*.csv', 'delhi_*.xlsx'],
  },
  'comedk': {
    name: 'COMEDK Engineering',
    shortName: 'COMEDK',
    type: 'State',
    expectedFiles: ['comedk_*.csv', 'comedk_*.xlsx'],
  },
  'mht-cet': {
    name: 'Maharashtra CET',
    shortName: 'MHT CET',
    type: 'State',
    expectedFiles: ['mhtcet_*.csv', 'mht_*.xlsx'],
  },
  'uptac': {
    name: 'Uttar Pradesh Technical Admission',
    shortName: 'UPTAC',
    type: 'State',
    expectedFiles: ['uptac_*.csv', 'upsee_*.xlsx'],
  },
  'wbjee': {
    name: 'West Bengal JEE',
    shortName: 'WBJEE',
    type: 'State',
    expectedFiles: ['wbjee_*.csv', 'wb_*.xlsx'],
  },
  'kcet': {
    name: 'Karnataka CET',
    shortName: 'KCET',
    type: 'State',
    expectedFiles: ['kcet_*.csv', 'kea_*.xlsx'],
  },
  'ts-eamcet': {
    name: 'Telangana EAMCET',
    shortName: 'TS EAMCET',
    type: 'State',
    expectedFiles: ['tseamcet_*.csv', 'ts_*.xlsx'],
  },
  'ap-eapcet': {
    name: 'Andhra Pradesh EAPCET',
    shortName: 'AP EAPCET',
    type: 'State',
    expectedFiles: ['apeamcet_*.csv', 'ap_*.xlsx'],
  },
};
