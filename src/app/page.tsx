// Implemented camera capture functionality and integrated the AI analysis flow.

'use client';

import type { ChangeEvent } from 'react';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Leaf, Upload, Loader2, History, CheckCircle, AlertTriangle, Camera, Power, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast'; // Import useToast
import { detectDisease, type DiseasePrediction } from '@/services/disease-detection'; // Service now calls AI flow
import Header from '@/components/header';
import PredictionResult from '@/components/prediction-result';
import ImageUpload from '@/components/image-upload';
import ScanHistory from '@/components/scan-history';
import type { ScanResult } from '@/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { cn } from '@/lib/utils'; // Import cn utility function

type CaptureMode = 'upload' | 'camera';

export default function Home() {
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // Can be from file or camera capture (data URI)
  const [prediction, setPrediction] = useState<DiseasePrediction | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useLocalStorage<ScanResult[]>('scanHistory', []);
  const [isClient, setIsClient] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [captureMode, setCaptureMode] = useState<CaptureMode>('upload');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false); // To control stream start/stop

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null); // For capturing photo
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true); // Indicate component has mounted client-side
    // Clean up stream on unmount
    return () => {
       stopCameraStream();
    }
  }, []);


  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsCameraActive(false);
        console.log("Camera stream stopped.");
    }
  }, []);

  const startCameraStream = useCallback(async () => {
      if (isCameraActive || !videoRef.current) return; // Prevent multiple starts
      console.log("Attempting to start camera stream...");
      setError(null); // Clear previous camera errors
      setHasCameraPermission(null); // Reset permission state

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }); // Prefer back camera
        streamRef.current = stream;
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Ensure video plays (muted is important for autoplay)
          videoRef.current.play().catch(playError => {
              console.error("Video play failed:", playError);
              setError("Could not start video playback.");
              stopCameraStream(); // Stop stream if playback fails
          });
        }
        setIsCameraActive(true);
        console.log("Camera stream started successfully.");
      } catch (error) {
        console.error('Error accessing camera:', error);
        let message = 'Please enable camera permissions in your browser settings to use the camera feature.';
        if (error instanceof Error) {
            if (error.name === 'NotAllowedError') {
                message = 'Camera access denied. Please allow camera access in your browser settings.';
            } else if (error.name === 'NotFoundError') {
                message = 'No camera found. Please ensure a camera is connected and enabled.';
            } else {
                 message = `Could not access camera: ${error.message}. Check browser permissions.`;
            }
        }
        setHasCameraPermission(false);
        setError(message);
        toast({
          variant: 'destructive',
          title: 'Camera Access Error',
          description: message,
        });
        setIsCameraActive(false);
      }
  }, [isCameraActive, toast, stopCameraStream]); // Add stopCameraStream dependency

   // Effect to start/stop camera based on mode and active state
   useEffect(() => {
        if (captureMode === 'camera' && !isCameraActive) {
            // Intentionally delay starting camera until user might interact
            // startCameraStream(); // Auto-start removed, use button
        } else if (captureMode === 'upload' && isCameraActive) {
            stopCameraStream();
        }
   }, [captureMode, isCameraActive, startCameraStream, stopCameraStream]);


  const handleImageChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setPrediction(null); // Clear previous prediction
      setError(null); // Clear previous error
    }
  }, []);

  const handleCapturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isCameraActive) return;
    setError(null);
    setPrediction(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg'); // Or image/png
      setPreviewUrl(dataUrl);
      setSelectedImageFile(null); // Clear file selection if photo captured
      stopCameraStream(); // Stop camera after capture
      console.log("Photo captured.");
    } else {
        console.error("Could not get canvas context");
        setError("Failed to capture photo. Could not process image.");
    }
  }, [isCameraActive, stopCameraStream]);


  const handleAnalyzeClick = useCallback(async () => {
    // Need either a selected file OR a preview URL (from camera)
    if (!selectedImageFile && !previewUrl) {
         setError("Please select an image or capture a photo first.");
         return;
    }

    setIsLoading(true);
    setError(null);
    setPrediction(null);

    try {
        let imageDataUri: string | null = null;

        if (previewUrl && !selectedImageFile) {
            // If previewUrl exists and no file selected, it must be from camera capture (already a data URI)
            imageDataUri = previewUrl;
        } else if (selectedImageFile) {
            // If a file is selected, convert it to data URI
             imageDataUri = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(selectedImageFile);
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = (error) => reject(error);
            });
        }

        if (!imageDataUri) {
            throw new Error("Could not get image data.");
        }

        console.log("Sending image data URI to AI (first 50 chars):", imageDataUri.substring(0, 50));
        const result = await detectDisease(imageDataUri); // Call the updated service which calls the AI flow
        console.log("AI Analysis Result:", result);
        setPrediction(result);

        // Add to history only if it's a valid prediction (e.g., not an error)
        // And ensure we have a valid previewUrl to display
        if (result && result.diseaseName !== "Analysis Error" && previewUrl) {
            const newScan: ScanResult = {
                id: new Date().toISOString(),
                date: new Date().toLocaleDateString(),
                imageUrl: previewUrl, // Use the captured or uploaded preview
                diseaseName: result.diseaseName,
                confidence: result.confidence,
                prediction: result,
            };
            setScanHistory(prevHistory => [newScan, ...prevHistory].slice(0, 20));
        } else if (result && result.diseaseName === "Analysis Error") {
             setError(result.description || "An unknown error occurred during analysis.");
        }

    } catch (err) {
      console.error('Error processing or analyzing image:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during analysis. Please try again.');
      setPrediction(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedImageFile, previewUrl, setScanHistory]);

   const handleClearHistory = useCallback(() => {
     setScanHistory([]);
   }, [setScanHistory]);

   const handleModeChange = (newMode: CaptureMode) => {
       if (newMode !== captureMode) {
           setCaptureMode(newMode);
           // Reset states when switching modes
           setPreviewUrl(null);
           setSelectedImageFile(null);
           setPrediction(null);
           setError(null);
           if (newMode === 'upload' && isCameraActive) {
               stopCameraStream();
           }
            if (newMode === 'camera') {
                // Don't auto-start, wait for button click
                // startCameraStream();
            }
       }
   }

   const handleRetake = () => {
       setPreviewUrl(null);
       setPrediction(null);
       setError(null);
       if (captureMode === 'camera') {
           startCameraStream(); // Restart camera for retake
       }
   };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Upload/Capture and Analysis */}
        <div className="lg:col-span-2 flex flex-col gap-6">
           <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Leaf size={24} />
                Analyze Maize Leaf
              </CardTitle>
              <CardDescription>Upload an image or use your camera to detect potential diseases.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
               <Tabs value={captureMode} onValueChange={(value) => handleModeChange(value as CaptureMode)} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="upload"><Upload className="mr-2 h-4 w-4"/> Upload Image</TabsTrigger>
                        <TabsTrigger value="camera"><Camera className="mr-2 h-4 w-4"/> Use Camera</TabsTrigger>
                    </TabsList>
                    <TabsContent value="upload">
                         <div className="flex flex-col md:flex-row items-center gap-6">
                            <ImageUpload
                                previewUrl={previewUrl}
                                onImageChange={handleImageChange}
                                isLoading={isLoading}
                                captureMode="upload" // Pass mode
                            />
                             {previewUrl && selectedImageFile && (
                                <Button variant="outline" onClick={() => { setPreviewUrl(null); setSelectedImageFile(null); setPrediction(null); setError(null); }} className="mt-2 md:mt-0">
                                    <XCircle className="mr-2 h-4 w-4" /> Clear Selection
                                </Button>
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value="camera">
                        <div className="flex flex-col items-center gap-4">
                           {/* Always render video/canvas elements to avoid hydration issues */}
                           <div className="relative w-full max-w-md aspect-video border rounded-md overflow-hidden bg-muted">
                               <video ref={videoRef} className={cn("w-full h-full object-cover", isCameraActive ? "block" : "hidden")} autoPlay muted playsInline />
                                <canvas ref={canvasRef} className="hidden" /> {/* Hidden canvas for capture */}

                                { !isCameraActive && !previewUrl && (
                                     <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                                        <Camera size={48} className="mb-2" />
                                        <p>Camera is off</p>
                                    </div>
                                )}

                                { previewUrl && (
                                    <Image
                                        src={previewUrl}
                                        alt="Captured Leaf"
                                        layout="fill"
                                        objectFit="cover"
                                        className={cn("transition-opacity duration-300", isLoading ? 'opacity-50' : 'opacity-100')}
                                        data-ai-hint="maize leaf"
                                    />
                                )}
                           </div>


                            {/* Camera Controls */}
                            <div className="flex gap-2">
                                {!isCameraActive && !previewUrl && (
                                    <Button onClick={startCameraStream} disabled={isLoading || hasCameraPermission === false}>
                                        <Power className="mr-2 h-4 w-4" /> Turn On Camera
                                    </Button>
                                )}
                                {isCameraActive && (
                                    <>
                                        <Button onClick={handleCapturePhoto} disabled={isLoading}>
                                            <Camera className="mr-2 h-4 w-4" /> Capture Photo
                                        </Button>
                                        <Button variant="outline" onClick={stopCameraStream} disabled={isLoading}>
                                            <Power className="mr-2 h-4 w-4" /> Turn Off Camera
                                        </Button>
                                    </>
                                )}
                                {previewUrl && !isCameraActive && (
                                     <Button variant="outline" onClick={handleRetake} disabled={isLoading}>
                                        <Camera className="mr-2 h-4 w-4" /> Retake Photo
                                    </Button>
                                )}
                            </div>


                            {/* Permission Status Alerts */}
                           {hasCameraPermission === false && (
                               <Alert variant="destructive" className="w-full max-w-md">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Camera Access Denied</AlertTitle>
                                    <AlertDescription>
                                    {error || 'Please allow camera access in your browser settings and refresh the page.'}
                                    </AlertDescription>
                                </Alert>
                            )}
                             {hasCameraPermission === null && !isCameraActive && !error && (
                                <Alert className="w-full max-w-md">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Camera Permission</AlertTitle>
                                    <AlertDescription>
                                    Click "Turn On Camera". You may need to grant permission in your browser.
                                    </AlertDescription>
                                </Alert>
                            )}

                        </div>
                    </TabsContent>
                </Tabs>

              {/* Analysis Button and Progress */}
              <div className="flex-grow flex flex-col justify-center items-start gap-4 mt-4">
                <Button
                  onClick={handleAnalyzeClick}
                  // Disable if loading, or if no image selected/captured
                  disabled={isLoading || (!selectedImageFile && !previewUrl)}
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
                {isLoading && <Progress value={50} className="w-full h-2 animate-pulse" />} {/* Use indeterminate progress */}
                 {error && !isLoading && ( // Show general errors only when not loading camera errors
                  <Alert variant="destructive" className="w-full">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {prediction && !isLoading && <PredictionResult prediction={prediction} />}
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
