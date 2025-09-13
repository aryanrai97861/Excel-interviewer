import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

export interface ExcelEvaluationResult {
  formulaAccuracy: number;
  structureScore: number;
  bestPracticesScore: number;
  details: {
    formulasFound: string[];
    expectedFormulas: string[];
    sheetStructure: any;
    namedRanges: string[];
    issues: string[];
    recommendations: string[];
  };
}

export interface ExcelTemplateData {
  sheets: {
    [sheetName: string]: any[][];
  };
  metadata: {
    instructions: string;
    expectedOutputs: any;
  };
}

export class ExcelProcessor {
  
  static async evaluateExcelFile(
    filePath: string,
    expectedTemplate: any,
    taskType: string
  ): Promise<ExcelEvaluationResult> {
    try {
      const workbook = XLSX.readFile(filePath);
      const evaluation: ExcelEvaluationResult = {
        formulaAccuracy: 0,
        structureScore: 0,
        bestPracticesScore: 0,
        details: {
          formulasFound: [],
          expectedFormulas: [],
          sheetStructure: {},
          namedRanges: [],
          issues: [],
          recommendations: []
        }
      };

      // Analyze sheet structure
      const sheetNames = workbook.SheetNames;
      evaluation.details.sheetStructure = {
        sheetCount: sheetNames.length,
        sheetNames: sheetNames
      };

      // Check for expected sheets
      const expectedSheets = expectedTemplate.expectedSheets || [];
      const hasRequiredSheets = expectedSheets.every((sheet: string) => 
        sheetNames.includes(sheet)
      );

      if (!hasRequiredSheets) {
        evaluation.details.issues.push("Missing required sheets");
        evaluation.structureScore -= 20;
      }

      // Analyze each sheet
      for (const sheetName of sheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        
        // Extract formulas
        const formulas = ExcelProcessor.extractFormulas(worksheet);
        evaluation.details.formulasFound.push(...formulas);

        // Evaluate specific task requirements
        if (taskType === "sales_analysis") {
          const salesScore = ExcelProcessor.evaluateSalesAnalysis(worksheet, expectedTemplate);
          evaluation.formulaAccuracy += salesScore.formulaScore;
          evaluation.structureScore += salesScore.structureScore;
          evaluation.details.issues.push(...salesScore.issues);
        }
      }

      // Evaluate best practices
      evaluation.bestPracticesScore = ExcelProcessor.evaluateBestPractices(workbook);

      // Calculate final scores (0-100 scale)
      evaluation.formulaAccuracy = Math.max(0, Math.min(100, evaluation.formulaAccuracy));
      evaluation.structureScore = Math.max(0, Math.min(100, evaluation.structureScore));
      evaluation.bestPracticesScore = Math.max(0, Math.min(100, evaluation.bestPracticesScore));

      return evaluation;
    } catch (error) {
      throw new Error(`Failed to evaluate Excel file: ${error}`);
    }
  }

  static extractFormulas(worksheet: XLSX.WorkSheet): string[] {
    const formulas: string[] = [];
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellAddress];
        
        if (cell && cell.f) {
          formulas.push(cell.f);
        }
      }
    }
    
    return formulas;
  }

  static evaluateSalesAnalysis(worksheet: XLSX.WorkSheet, expectedTemplate: any) {
    const result = {
      formulaScore: 60, // Base score
      structureScore: 60,
      issues: [] as string[]
    };

    const formulas = ExcelProcessor.extractFormulas(worksheet);
    
    // Check for required formulas
    const hasXLOOKUP = formulas.some(f => f.toUpperCase().includes('XLOOKUP'));
    const hasSUMIFS = formulas.some(f => f.toUpperCase().includes('SUMIFS'));
    const hasINDEX = formulas.some(f => f.toUpperCase().includes('INDEX'));
    const hasMATCH = formulas.some(f => f.toUpperCase().includes('MATCH'));

    if (hasXLOOKUP || (hasINDEX && hasMATCH)) {
      result.formulaScore += 15;
    } else {
      result.issues.push("Missing advanced lookup formulas (XLOOKUP or INDEX/MATCH)");
    }

    if (hasSUMIFS) {
      result.formulaScore += 15;
    } else {
      result.issues.push("Missing SUMIFS for conditional aggregation");
    }

    // Check for data validation and structure
    const data = XLSX.utils.sheet_to_json(worksheet);
    if (data.length > 0) {
      result.structureScore += 20;
    }

    return result;
  }

  static evaluateBestPractices(workbook: XLSX.Workbook): number {
    let score = 50; // Base score

    // Check for named ranges (if supported by the file format)
    // Note: XLSX.js has limited support for named ranges
    
    // Check sheet naming conventions
    const sheetNames = workbook.SheetNames;
    const hasDescriptiveNames = sheetNames.every(name => 
      name.length > 2 && !name.includes('Sheet')
    );
    
    if (hasDescriptiveNames) {
      score += 20;
    }

    // Check for multiple sheets (indicates organization)
    if (sheetNames.length > 1) {
      score += 15;
    }

    // Check for formula complexity (indicates advanced usage)
    let hasComplexFormulas = false;
    sheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const formulas = ExcelProcessor.extractFormulas(worksheet);
      if (formulas.some(f => f.length > 20 || f.includes('IF('))) {
        hasComplexFormulas = true;
      }
    });

    if (hasComplexFormulas) {
      score += 15;
    }

    return Math.min(100, score);
  }

  static generateSalesAnalysisTemplate(): Buffer {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Raw data sheet
    const rawData = [
      ['Date', 'Region', 'Product', 'Sales Rep', 'Revenue', 'Units Sold'],
      ['2024-01-15', 'North', 'Widget A', 'John Smith', 1500, 10],
      ['2024-01-15', 'South', 'Widget B', 'Jane Doe', 2200, 15],
      ['2024-01-20', 'North', 'Widget C', 'Bob Johnson', 1800, 12],
      ['2024-01-25', 'East', 'Widget A', 'Alice Brown', 1200, 8],
      ['2024-02-05', 'West', 'Widget B', 'Charlie Wilson', 2800, 20],
      ['2024-02-10', 'North', 'Widget A', 'John Smith', 1600, 11],
      ['2024-02-15', 'South', 'Widget C', 'Jane Doe', 2100, 14],
      ['2024-02-20', 'East', 'Widget B', 'Alice Brown', 1900, 13],
      ['2024-03-01', 'West', 'Widget A', 'Charlie Wilson', 1700, 12],
      ['2024-03-05', 'North', 'Widget C', 'Bob Johnson', 2300, 16],
      ['2024-03-10', 'South', 'Widget A', 'Jane Doe', 1400, 9],
      ['2024-03-15', 'East', 'Widget B', 'Alice Brown', 2000, 14],
      ['2024-03-20', 'West', 'Widget C', 'Charlie Wilson', 2500, 18],
      ['2024-03-25', 'North', 'Widget B', 'John Smith', 1800, 12]
    ];

    const rawDataSheet = XLSX.utils.aoa_to_sheet(rawData);
    XLSX.utils.book_append_sheet(workbook, rawDataSheet, 'Raw_Data');

    // Instructions sheet
    const instructions = [
      ['Excel Skills Assessment - Sales Analysis Task'],
      [''],
      ['Instructions:'],
      ['1. Create a monthly revenue summary by region'],
      ['2. Identify top 3 products per region using dynamic formulas'],
      ['3. Build KPI dashboard with month-over-month growth indicators'],
      ['4. Flag months with >10% revenue drops'],
      [''],
      ['Requirements:'],
      ['- Use XLOOKUP or INDEX/MATCH for lookups'],
      ['- Use SUMIFS for conditional aggregation'],
      ['- Create separate sheets for your analysis'],
      ['- Include charts if time permits'],
      [''],
      ['Time Limit: 10 minutes'],
      [''],
      ['When complete, save as yourname_solution.xlsx and upload']
    ];

    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructions);
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

    // Expected structure sheet (for reference)
    const expectedStructure = [
      ['Expected Output Structure:'],
      [''],
      ['Sheet 1: Monthly_Summary'],
      ['Month', 'Region', 'Total Revenue', 'Total Units', 'YoY Growth%'],
      [''],
      ['Sheet 2: Top_Products'],
      ['Region', 'Rank', 'Product', 'Total Revenue'],
      [''],
      ['Sheet 3: KPI_Dashboard'],
      ['Month', 'Total Revenue', 'MoM Growth%', 'Alert Flag']
    ];

    const expectedSheet = XLSX.utils.aoa_to_sheet(expectedStructure);
    XLSX.utils.book_append_sheet(workbook, expectedSheet, 'Expected_Structure');

    // Convert to buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  }

  static generateDataCleanupTemplate(): Buffer {
    const workbook = XLSX.utils.book_new();

    // Messy data that needs cleanup
    const messyData = [
      ['Customer Name', 'Email', 'Phone', 'Order Date', 'Product', 'Quantity', 'Price'],
      ['John Smith', 'john@email.com', '555-1234', '1/15/2024', 'Widget A', '5', '$25.99'],
      ['JANE DOE', 'JANE@EMAIL.COM', '(555) 987-6543', '01/20/2024', 'widget b', '3', '45.50'],
      ['Bob Johnson', 'bob@company.com', '555.867.5309', '2024-01-25', 'Widget C', 'seven', '$35.00'],
      ['Alice Brown', 'alice.brown@domain.org', '555 444 3333', '2/1/24', 'Widget A', '2', '25.99'],
      ['', 'charlie@test.com', '5554567890', '2/5/2024', 'Widget B', '4', '45.5'],
      ['David Wilson', 'david@email', '555-123-4567', '02/10/2024', 'Widget C', '1', '$35'],
      ['Emma Davis', 'emma@company.com', '555-987-6543', '2/15/2024', 'widget a', '8', '25.99'],
    ];

    const messyDataSheet = XLSX.utils.aoa_to_sheet(messyData);
    XLSX.utils.book_append_sheet(workbook, messyDataSheet, 'Messy_Data');

    const cleanupInstructions = [
      ['Data Cleanup Task'],
      [''],
      ['Clean the messy data in the following ways:'],
      ['1. Standardize customer names (proper case)'],
      ['2. Validate and clean email addresses'],
      ['3. Standardize phone number format'],
      ['4. Convert all dates to consistent format'],
      ['5. Standardize product names'],
      ['6. Convert quantity text to numbers'],
      ['7. Clean price formatting'],
      ['8. Handle missing/invalid data'],
      [''],
      ['Create a "Clean_Data" sheet with the results'],
      ['Use Excel functions like PROPER, CLEAN, SUBSTITUTE, etc.']
    ];

    const instructionsSheet = XLSX.utils.aoa_to_sheet(cleanupInstructions);
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  }

  static async saveTemplate(templateType: string, filePath: string): Promise<void> {
    let buffer: Buffer;
    
    switch (templateType) {
      case 'sales_analysis':
        buffer = ExcelProcessor.generateSalesAnalysisTemplate();
        break;
      case 'data_cleanup':
        buffer = ExcelProcessor.generateDataCleanupTemplate();
        break;
      default:
        throw new Error(`Unknown template type: ${templateType}`);
    }

    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, buffer);
  }
}
