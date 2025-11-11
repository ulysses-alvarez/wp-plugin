/**
 * Bulk Actions Types
 * Defines interfaces and types for bulk operations on properties
 */

/**
 * Result of a bulk operation
 */
export interface BulkResult {
  success: number[];      // IDs of successfully processed properties
  failed: BulkError[];    // IDs of failed properties with reasons
  total: number;          // Total number of properties processed
}

/**
 * Error information for a failed bulk operation on a single property
 */
export interface BulkError {
  id: number;
  reason: string;
  property_title?: string;
}

/**
 * Status options for bulk status update
 */
export type PropertyStatus = 'available' | 'sold' | 'rented' | 'reserved';

/**
 * Bulk status update request
 */
export interface BulkStatusUpdateRequest {
  property_ids: number[];
  status: PropertyStatus;
}

/**
 * Bulk delete request
 */
export interface BulkDeleteRequest {
  property_ids: number[];
}

/**
 * Bulk patent update request (simplified version)
 */
export interface BulkPatentUpdateRequest {
  property_ids: number[];
  patent: string;
}

/**
 * Export format options (for Phase 3)
 */
export type ExportFormat = 'csv' | 'excel' | 'pdf';

/**
 * Bulk export request (for Phase 3)
 */
export interface BulkExportRequest {
  property_ids: number[];
  format: ExportFormat;
}

/**
 * Download attachments response (for Phase 3)
 */
export interface BulkDownloadInfo {
  available: Array<{
    id: number;
    title: string;
    attachment_url: string;
  }>;
  unavailable: Array<{
    id: number;
    title: string;
    reason: string;
  }>;
  total_available: number;
  total_unavailable: number;
}
