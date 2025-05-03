import React from 'react';
import Image from 'next/image';
import { Trash2, Leaf } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ScanResult } from '@/types';

interface ScanHistoryProps {
  history: ScanResult[];
  onClearHistory: () => void;
}

const ScanHistory: React.FC<ScanHistoryProps> = ({ history, onClearHistory }) => {
  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]"> {/* Adjust height as needed */}
      {history.length > 0 && (
          <Button variant="outline" size="sm" onClick={onClearHistory} className="mb-4 self-end text-destructive hover:bg-destructive/10 border-destructive">
            <Trash2 className="mr-2 h-4 w-4" /> Clear History
          </Button>
      )}
      <ScrollArea className="flex-grow pr-4">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
            <Leaf size={48} className="mb-4" />
            <p className="text-lg font-medium">No Scan History Yet</p>
            <p className="text-sm">Upload an image and analyze it to start building your history.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((scan, index) => (
              <React.Fragment key={scan.id}>
                <div className="flex items-start gap-4 p-2 rounded-md hover:bg-secondary/50 transition-colors">
                  <div className="relative w-16 h-16 rounded-md overflow-hidden border">
                    <Image
                      src={scan.imageUrl}
                      alt={`Scan from ${scan.date}`}
                      layout="fill"
                      objectFit="cover"
                      data-ai-hint="maize leaf scan"
                    />
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold text-sm">{scan.diseaseName}</p>
                    <p className="text-xs text-muted-foreground">{scan.date}</p>
                    <Badge variant="secondary" className="mt-1 text-xs">
                       Conf: {(scan.confidence * 100).toFixed(0)}%
                    </Badge>
                  </div>
                   {/* Optional: Add a button/link to view full details */}
                   {/* <Button variant="ghost" size="sm">View</Button> */}
                </div>
                {index < history.length - 1 && <Separator />}
              </React.Fragment>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ScanHistory;
