import fs from 'node:fs';
import path from 'node:path';

/**
 * Interface representing a Move resource type structure
 */
interface MoveResourceType {
  name: string;
  fields: { name: string; type: string }[];
  moduleName?: string; // Store the module name for full context
  address?: string;    // Store the address if available
}

/**
 * A simple parser for Move language files
 * Extracts struct resource types and converts them to TypeScript types
 */
export class MoveFileParser {
  // Maps Move types to TypeScript types
  private moveToTsTypeMap: Record<string, string> = {
    'u8': 'number',
    'u16': 'number',
    'u32': 'number',
    'u64': 'bigint',
    'u128': 'bigint',
    'u256': 'bigint',
    'bool': 'boolean',
    'address': 'string',
    'vector<u8>': 'Uint8Array',
    'String': 'string',
    'signer': 'string', // Representing signer as a string (address)
  };

  /**
   * Parse a Move file and extract resource type definitions
   * @param filePath Path to the .move file
   * @returns Array of parsed resource types
   */
  public parseFile(filePath: string): MoveResourceType[] {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const moduleName = this.extractModuleName(content);
      const address = this.extractAddress(content);

      const resources = this.extractResourceTypes(content);

      // Add module name and address to all resources
      resources.forEach(resource => {
        resource.moduleName = moduleName;
        resource.address = address;
      });

      return resources;
    } catch (error) {
      console.error(`Error parsing file ${filePath}:`, error);
      return [];
    }
  }

  /**
   * Extract module name from Move file content
   */
  private extractModuleName(content: string): string | undefined {
    const moduleRegex = /module\s+(?:\w+::)?(\w+)\s*\{/;
    const match = content.match(moduleRegex);
    return match ? match[1] : undefined;
  }

  /**
   * Extract address from Move file content
   */
  private extractAddress(content: string): string | undefined {
    const addressRegex = /module\s+(\w+)::(\w+)\s*\{/;
    const match = content.match(addressRegex);
    return match ? match[1] : undefined;
  }

  /**
   * Extract resource types from Move file content
   * @param content String content of a Move file
   * @returns Parsed resource types
   */
  private extractResourceTypes(content: string): MoveResourceType[] {
    const resources: MoveResourceType[] = [];

    // Updated regex to handle different struct definitions in Move
    // This handles visibility modifiers, ability annotations, and whitespace variations
    const structRegex = /(?:public\s+)?struct\s+(\w+)(?:\s+has\s+[\w\s,]+)?\s*\{([^}]*)\}/g;
    let match;

    while ((match = structRegex.exec(content)) !== null) {
      const name = match[1];
      const fieldsText = match[2];

      const fields = this.parseFields(fieldsText);
      resources.push({ name, fields });
    }

    return resources;
  }

  /**
   * Parse fields from a struct definition
   * @param fieldsText Text containing field definitions
   * @returns Parsed fields
   */
  private parseFields(fieldsText: string): { name: string; type: string }[] {
    const fields: { name: string; type: string }[] = [];

    // Split by commas to handle fields that might be on the same line
    const fieldStrings = fieldsText
      .split(',')
      .map(field => field.trim())
      .filter(field => field.length > 0);

    for (const field of fieldStrings) {
      // Remove comments and trim
      const cleanField = field.replace(/\/\/.*$/, '').trim();
      if (!cleanField) continue;

      // Split by colon to separate name and type
      const parts = cleanField.split(':').map(part => part.trim());
      if (parts.length >= 2) {
        const name = parts[0];
        // Join the rest of the parts since type might contain colons (e.g. "0x1::string::String")
        const moveType = parts.slice(1).join(':').trim();
        fields.push({ name, type: moveType });
      }
    }

    return fields;
  }

  /**
   * Convert Move type to TypeScript type
   * @param moveType Move type string
   * @returns Equivalent TypeScript type
   */
  private convertToTsType(moveType: string): string {
    // Check if it's a known type
    if (this.moveToTsTypeMap[moveType]) {
      return this.moveToTsTypeMap[moveType];
    }

    // Fix malformed types - if type ends with semicolon, replace with closing bracket
    if (moveType.includes('<') && !moveType.endsWith('>')) {
      if (moveType.endsWith(';')) {
        moveType = moveType.slice(0, -1) + '>';
      } else {
        moveType = moveType + '>';
      }
    }

    // Handle Table type which can have complex generic params
    if (moveType.startsWith('Table<') && moveType.endsWith('>')) {
      // Extract the content between Table< and >
      const tableContent = moveType.substring(6, moveType.length - 1);

      // Handle comma-separated or semicolon-separated type parameters for Table
      let keyType: string, valueType: string = 'any';

      if (tableContent.includes(',')) {
        const parts = tableContent.split(',').map(p => p.trim());
        keyType = parts[0];
        if (parts.length > 1) {
          valueType = parts[1];
        }
      } else if (tableContent.includes(';')) {
        const parts = tableContent.split(';').map(p => p.trim());
        keyType = parts[0];
        if (parts.length > 1) {
          valueType = parts[1];
        }
      } else {
        keyType = tableContent.trim();
      }

      return `Record<${this.convertToTsType(keyType)}, ${this.convertToTsType(valueType)}>`;
    }

    // Handle vector types
    if (moveType.startsWith('vector<') && moveType.endsWith('>')) {
      const innerType = moveType.substring(7, moveType.length - 1);
      return `${this.convertToTsType(innerType)}[]`;
    }

    // Handle generic types like Option<T>
    if (moveType.includes('<') && moveType.endsWith('>')) {
      const baseType = moveType.substring(0, moveType.indexOf('<'));
      const innerType = moveType.substring(moveType.indexOf('<') + 1, moveType.length - 1);

      if (baseType === 'Option') {
        return `${this.convertToTsType(innerType)} | null`;
      }

      // For other generic types with multiple parameters
      if (innerType.includes(',')) {
        const typeParams = innerType.split(',').map(t => this.convertToTsType(t.trim()));
        return `${baseType}<${typeParams.join(', ')}>`;
      }

      return `${baseType}<${this.convertToTsType(innerType)}>`;
    }

    // Handle common typos and abbreviations
    if (moveType === 'addres') {
      return 'string'; // Fix for address typo
    }

    // Handle complex types with path notation (e.g., std::string::String)
    if (moveType.includes('::')) {
      const parts = moveType.split('::');
      const typeName = parts[parts.length - 1];

      // Try to map known types with module paths
      switch (typeName) {
        case 'String':
          return 'string';
        default:
          return typeName;
      }
    }

    // Default to the type name itself for custom types
    return moveType;
  }

  /**
   * Generate TypeScript interface from a Move resource type
   * @param resource Move resource type
   * @returns TypeScript interface string
   */
  public generateTsInterface(resource: MoveResourceType): string {
    const moduleName = resource.moduleName ? resource.moduleName : '';
    const address = resource.address ? resource.address : '';
    let result = '';

    // Add JSDoc with Move type information
    result += '/**\n';
    if (address && moduleName) {
      result += ` * Move Resource: ${address}::${moduleName}::${resource.name}\n`;
    } else {
      result += ` * Move Resource: ${resource.name}\n`;
    }
    result += ' */\n';

    result += `export interface ${resource.name} {\n`;

    for (const field of resource.fields) {
      const tsType = this.convertToTsType(field.type);
      result += `  ${field.name}: ${tsType};\n`;
    }

    result += '}\n';
    return result;
  }

  /**
   * Process a Move file and generate TypeScript types
   * @param moveFilePath Path to the .move file
   * @param outputPath Path to output the TypeScript file
   */
  public processFile(moveFilePath: string, outputPath: string): void {
    const resources = this.parseFile(moveFilePath);

    if (resources.length === 0) {
      console.warn(`No resource types found in ${moveFilePath}`);
      return;
    }

    let output = `// Generated from ${path.basename(moveFilePath)}\n\n`;

    for (const resource of resources) {
      output += this.generateTsInterface(resource) + '\n';
    }

    fs.writeFileSync(outputPath, output, 'utf8');
    console.log(`Generated TypeScript types in ${outputPath}`);
  }

  /**
   * Process all .move files in a directory
   * @param directoryPath Path to directory with .move files
   * @param outputPath Path to output directory for TypeScript files
   */
  public processDirectory(directoryPath: string, outputPath: string): void {
    // Ensure output directory exists
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    // Get all .move files in the directory
    this.processDirectoryRecursive(directoryPath, outputPath);

    // Generate an index file to export all types
    this.generateIndexFile(outputPath);
  }

  /**
   * Recursively process all .move files in a directory
   */
  private processDirectoryRecursive(directoryPath: string, outputPath: string): void {
    const entries = fs.readdirSync(directoryPath, { withFileTypes: true });

    // Process all types from all files
    const allResources: { [outputFile: string]: MoveResourceType[] } = {};

    for (const entry of entries) {
      const fullPath = path.join(directoryPath, entry.name);

      if (entry.isDirectory()) {
        // Create corresponding subdirectory in output
        const subOutputPath = path.join(outputPath, entry.name);
        if (!fs.existsSync(subOutputPath)) {
          fs.mkdirSync(subOutputPath, { recursive: true });
        }

        // Process recursively
        this.processDirectoryRecursive(fullPath, subOutputPath);
      } else if (entry.name.endsWith('.move')) {
        // Parse the file
        const resources = this.parseFile(fullPath);

        if (resources.length > 0) {
          const moduleName = resources[0].moduleName || 'unnamed';
          const outputFile = path.join(outputPath, `${moduleName}.ts`);

          if (!allResources[outputFile]) {
            allResources[outputFile] = [];
          }

          allResources[outputFile].push(...resources);
        }
      }
    }

    // Write output files for each module
    for (const [outputFile, resources] of Object.entries(allResources)) {
      let output = `// Generated from ${path.relative(process.cwd(), directoryPath)}\n\n`;

      for (const resource of resources) {
        output += this.generateTsInterface(resource) + '\n';
      }

      fs.writeFileSync(outputFile, output, 'utf8');
      console.log(`Generated TypeScript types in ${outputFile}`);
    }
  }

  /**
   * Generate an index file that exports all types
   */
  private generateIndexFile(outputPath: string): void {
    const entries = fs.readdirSync(outputPath, { withFileTypes: true });
    let indexContent = '// Generated index file\n\n';

    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.ts') && entry.name !== 'index.ts') {
        // Get the file name without extension
        const moduleName = path.basename(entry.name, '.ts');
        indexContent += `export * from './${moduleName}';\n`;
      }
    }

    fs.writeFileSync(path.join(outputPath, 'index.ts'), indexContent, 'utf8');
    console.log(`Generated index file in ${outputPath}/index.ts`);
  }
}
