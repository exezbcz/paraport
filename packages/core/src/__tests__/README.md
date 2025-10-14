# Testing Documentation

## Overview
This directory contains the test suite for the ParaPort Core package. The tests are written using Vitest and follow a structured approach to ensure comprehensive coverage of the SDK's functionality.

## Test Structure
- `__tests__/` - Root test directory
  - `sdk/` - Tests for SDK classes and core functionality
  - `bridges/` - Tests for bridge implementations
  - `managers/` - Tests for various managers (Session, Teleport, etc.)
  - `services/` - Tests for utility services

## Running Tests
```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch
```

## Writing Tests
1. Create test files with `.test.ts` extension
2. Group related tests using `describe` blocks
3. Write individual test cases using `it` blocks
4. Use mocks and spies from Vitest when needed

## Test Utilities
- `setup.ts` - Global test setup and mock configurations
- Mock implementations for external dependencies
- Helper functions for common test scenarios

## Coverage Goals
- Unit tests for all public methods
- Integration tests for core workflows
- Edge case and error handling coverage
- Mock external dependencies appropriately
