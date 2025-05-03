import type {Metadata} from 'next';
import { Inter } from 'next/font/google'; // Using Inter font
import './globals.css';
import { Toaster } from "@/components/ui/toaster" // Import Toaster

const inter = Inter({ subsets: ['latin'] }); // Initialize Inter font

export const metadata: Metadata = {
  title: 'ZeaWatch - Maize Disease Detection', // Updated title
  description: 'Detect maize leaf diseases using AI.', // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}> {/* Use Inter font */}
        {children}
        <Toaster /> {/* Add Toaster component here */}
      </body>
    </html>
  );
}
