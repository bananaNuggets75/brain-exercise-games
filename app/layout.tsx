import Navbar from "@/components/navbar"; 
import { Toaster } from 'react-hot-toast';
import "./globals.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <Navbar />
        <Toaster />
        <main>{children}</main>
      </body>
    </html>
  );
}
