'use client';

import type { ChangeEvent } from 'react';
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Leaf, Upload, Loader2, History, Info, CheckCircle, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { detectDisease, type DiseasePrediction } from '@/services/disease-detection';
import Header from '@/components/header';
import PredictionResult from '@/components/prediction-result';
import ImageUpload from '@/components/image-upload';
import ScanHistory from '@/components/scan-history';
import type { ScanResult } from '@/types';
import { useLocalStorage } from '@/hooks/use-local-storage';

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<DiseasePrediction | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useLocalStorage<ScanResult[]>('scanHistory', []);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Indicate component has mounted client-side
  }, []);

  const handleImageChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setPrediction(null); // Clear previous prediction
      setError(null); // Clear previous error
    }
  }, []);

  const handleAnalyzeClick = useCallback(async () => {
    if (!selectedImage || !previewUrl) return;

    setIsLoading(true);
    setError(null);
    setPrediction(null);

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedImage);
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,") if the backend expects only the base64 part
        const base64Data = base64Image.split(',')[1];

        // Call the mock detection service
        const result = await detectDisease(base64Data);
        setPrediction(result);

        // Add to history
        const newScan: ScanResult = {
          id: new Date().toISOString(), // Simple unique ID
          date: new Date().toLocaleDateString(),
          imageUrl: previewUrl, // Store preview URL for history display
          diseaseName: result.diseaseName,
          confidence: result.confidence,
          prediction: result, // Store full prediction
        };
        setScanHistory(prevHistory => [newScan, ...prevHistory].slice(0, 20)); // Keep latest 20 scans
      };
      reader.onerror = (error) => {
         console.error('Error reading file:', error);
         setError('Failed to read the image file. Please try again.');
         setIsLoading(false);
      }
    } catch (err) {
      console.error('Error detecting disease:', err);
      setError('An error occurred during analysis. Please try again.');
      setPrediction(null);
    } finally {
        // Need to ensure loading stops even if reader fails *before* onloadend
        // A small delay allows reader.onloadend to potentially set isLoading=false first
         setTimeout(() => setIsLoading(false), 100);
    }
  }, [selectedImage, previewUrl, setScanHistory]);

   const handleClearHistory = useCallback(() => {
     setScanHistory([]);
   }, [setScanHistory]);


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Upload and Analysis */}
        <div className="lg:col-span-2 flex flex-col gap-6">
           <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Leaf size={24} />
                Analyze Maize Leaf
              </CardTitle>
              <CardDescription>Upload an image of a maize leaf to detect potential diseases.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-6">
              <ImageUpload
                previewUrl={previewUrl}
                onImageChange={handleImageChange}
                isLoading={isLoading}
              />
              <div className="flex-grow flex flex-col justify-center items-start gap-4">
                <Button
                  onClick={handleAnalyzeClick}
                  disabled={!selectedImage || isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" /> Analyze Leaf
                    </>
                  )}
                </Button>
                {isLoading && <Progress value={(prediction?.confidence ?? 0) * 100} className="w-full h-2" />}
                 {error && (
                  <Alert variant="destructive" className="w-full">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {prediction && <PredictionResult prediction={prediction} />}
        </div>

        {/* Right Column: Scan History */}
        <Card className="shadow-md h-fit sticky top-8">
            <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
                <History size={24} />
                Scan History
            </CardTitle>
            <CardDescription>Review your previous scans.</CardDescription>
            </CardHeader>
            <CardContent>
                {isClient ? ( // Only render ScanHistory client-side
                    <ScanHistory history={scanHistory} onClearHistory={handleClearHistory} />
                ) : (
                   <div className="flex justify-center items-center h-32">
                       <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                   </div>
                )}
            </CardContent>
        </Card>
      </main>

      <footer className="text-center p-4 text-muted-foreground text-sm border-t">
        LeafWise &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
