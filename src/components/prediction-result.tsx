import React from 'react';
import { CheckCircle, AlertTriangle, Info, Leaf } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { DiseasePrediction } from '@/services/disease-detection';

interface PredictionResultProps {
  prediction: DiseasePrediction;
}

const PredictionResult: React.FC<PredictionResultProps> = ({ prediction }) => {
  const confidencePercentage = (prediction.confidence * 100).toFixed(0);
  const isConfident = prediction.confidence >= 0.7; // Example threshold

  return (
    <Card className="shadow-md w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          {isConfident ? <CheckCircle className="text-green-600" /> : <AlertTriangle className="text-amber-500" />}
          Prediction Result
        </CardTitle>
        <CardDescription>Analysis complete. Here are the findings:</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">{prediction.diseaseName}</h3>
          <Badge variant={isConfident ? 'default' : 'secondary'} className={isConfident ? 'bg-green-100 text-green-800 border-green-300' : 'bg-amber-100 text-amber-800 border-amber-300'}>
            Confidence: {confidencePercentage}%
          </Badge>
        </div>

        <Accordion type="single" collapsible defaultValue="description" className="w-full">
          <AccordionItem value="description">
            <AccordionTrigger className="text-lg font-medium">
              <Info className="mr-2 h-5 w-5 text-accent" /> Description
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {prediction.description}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="solutions">
            <AccordionTrigger className="text-lg font-medium">
              <Leaf className="mr-2 h-5 w-5 text-primary" /> Recommended Solutions
            </AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                {prediction.solutions.map((solution, index) => (
                  <li key={index}>{solution}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="prevention">
            <AccordionTrigger className="text-lg font-medium">
              <CheckCircle className="mr-2 h-5 w-5 text-blue-500" /> Preventive Measures
            </AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                {prediction.preventiveMeasures.map((measure, index) => (
                  <li key={index}>{measure}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default PredictionResult;
