import type { DiseasePrediction } from './services/disease-detection';

/**
 * Represents a single scan result entry in the history.
 */
export interface ScanResult {
  /**
   * A unique identifier for the scan (e.g., timestamp).
   */
  id: string;
  /**
   * The date the scan was performed.
   */
  date: string;
  /**
   * The URL of the image that was scanned.
   */
  imageUrl: string;
  /**
   * The name of the predicted disease.
   */
  diseaseName: string;
  /**
   * The confidence score of the prediction (0-1).
   */
  confidence: number;
   /**
   * The full prediction details.
   */
   prediction: DiseasePrediction;
}
