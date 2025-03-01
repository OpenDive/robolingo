/**
 * Model adapter for SQLite in test environment
 * This file provides utilities to adapt PostgreSQL models to work with SQLite
 */

import { Model, DataTypes, ModelAttributes } from 'sequelize';

/**
 * Converts PostgreSQL-specific data types to SQLite-compatible types
 * @param attributes - Model attributes to convert
 * @returns SQLite-compatible model attributes
 */
export function adaptModelForSQLite(attributes: ModelAttributes): ModelAttributes {
  const adaptedAttributes: ModelAttributes = {};
  
  for (const [key, attribute] of Object.entries(attributes)) {
    // Deep clone the attribute to avoid modifying the original
    const adapted = JSON.parse(JSON.stringify(attribute));
    
    // Convert PostgreSQL UUID type to SQLite TEXT
    if (adapted.type === 'UUID' || adapted.type?.key === 'UUID') {
      adapted.type = DataTypes.STRING;
    }
    
    // Convert array types to TEXT (stored as JSON strings)
    if (adapted.type?.toString().includes('ARRAY')) {
      adapted.type = DataTypes.TEXT;
      
      // Add getter/setter for array conversion
      adapted.get = function() {
        const value = this.getDataValue(key);
        return value ? JSON.parse(value) : [];
      };
      
      adapted.set = function(value: any[]) {
        this.setDataValue(key, JSON.stringify(value || []));
      };
    }
    
    // Convert JSONB to TEXT
    if (adapted.type === 'JSONB' || adapted.type?.key === 'JSONB') {
      adapted.type = DataTypes.TEXT;
      
      // Add getter/setter for JSON conversion
      adapted.get = function() {
        const value = this.getDataValue(key);
        return value ? JSON.parse(value) : {};
      };
      
      adapted.set = function(value: object) {
        this.setDataValue(key, JSON.stringify(value || {}));
      };
    }
    
    adaptedAttributes[key] = adapted;
  }
  
  return adaptedAttributes;
} 