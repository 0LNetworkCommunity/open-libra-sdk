import path from 'node:path';
import { test, expect, describe } from "bun:test";
import { MoveFileParser } from '../typesGenerator';



describe('MoveFileParser', () => {

  // Use the correct path to the fixtures directory at the project root
  const fixturePath = path.join(__dirname, 'test-fixtures/account.move');
  console.log('Fixture Path:', fixturePath);
  const parser = new MoveFileParser();

  test('should parse a Move file and extract resource types', () => {
    // Parse the account.move fixture file
    const resources = parser.parseFile(fixturePath);

    // Verify we got resources
    expect(resources).toBeDefined();
    expect(resources.length).toBeGreaterThan(0);

    // Verify we got the Account resource type
    const accountResource = resources.find(r => r.name === 'Account');
    expect(accountResource).toBeDefined();

    // Verify the Account resource has the expected fields
    expect(accountResource?.fields).toContainEqual({
      name: 'authentication_key',
      type: 'vector<u8>'
    });
    expect(accountResource?.fields).toContainEqual({
      name: 'sequence_number',
      type: 'u64'
    });
    expect(accountResource?.fields).toContainEqual({
      name: 'guid_creation_num',
      type: 'u64'
    });

    // Verify the module name and address
    expect(accountResource?.moduleName).toBe('account');
    expect(accountResource?.address).toBe('diem_framework');
  });

  test('should generate TypeScript interfaces from resource types', () => {
    // Parse the account.move fixture file
    const resources = parser.parseFile(fixturePath);

    // Generate TS interfaces for each resource
    const interfaces = resources.map(resource => parser.generateTsInterface(resource));

    // Verify we got interfaces
    expect(interfaces.length).toBeGreaterThan(0);

    // Check the generated Account interface
    const accountInterface = interfaces.find(i => i.includes('export interface Account'));
    expect(accountInterface).toBeDefined();

    // Check if interface has typical fields
    expect(accountInterface).toContain('authentication_key: Uint8Array');
    expect(accountInterface).toContain('sequence_number: bigint');
    expect(accountInterface).toContain('guid_creation_num: bigint');
  });

  test('should handle nested types correctly', () => {
    // Parse the account.move fixture file
    const resources = parser.parseFile(fixturePath);

    // Find any resource with nested types
    const capabilityOfferResource = resources.find(r => r.name === 'CapabilityOffer');
    expect(capabilityOfferResource).toBeDefined();

    if (capabilityOfferResource) {
      // Generate a TS interface for the resource
      const tsInterface = parser.generateTsInterface(capabilityOfferResource);

      // Verify the interface includes generics
      expect(tsInterface).toContain('export interface CapabilityOffer');
      expect(tsInterface).toMatch(/for:.*\|.*null/); // Option<address> should be mapped to T | null
    }
  });

  test('should process multiple resource types in a file', () => {
    // Parse the account.move fixture file
    const resources = parser.parseFile(fixturePath);

    // Check if we have multiple resources
    expect(resources.length).toBeGreaterThan(3);

    // Get resource names
    const resourceNames = resources.map(r => r.name);

    // Check for specific expected resources
    expect(resourceNames).toContain('Account');
    expect(resourceNames).toContain('KeyRotationEvent');
    expect(resourceNames).toContain('CoinRegisterEvent');
    expect(resourceNames).toContain('CapabilityOffer');
  });

  test('should convert Move types to TypeScript types correctly', () => {
    // Parse the account.move fixture file
    const resources = parser.parseFile(fixturePath);
    const interfaces = resources.map(resource => parser.generateTsInterface(resource));

    // Join all interfaces to easily search
    const allInterfaces = interfaces.join('\n');

    // Check type conversions
    expect(allInterfaces).toContain('authentication_key: Uint8Array'); // vector<u8> -> Uint8Array
    expect(allInterfaces).toContain('sequence_number: bigint'); // u64 -> bigint
    expect(allInterfaces).toContain('old_authentication_key: Uint8Array'); // vector<u8> -> Uint8Array
    expect(allInterfaces).toContain('type_info: TypeInfo'); // Custom type
  });
});
