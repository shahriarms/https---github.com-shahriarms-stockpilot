
import Image from 'next/image';

export const StockPilotLogo = () => (
  <Image 
    src="/logo.png" 
    alt="Stock Pilot Logo" 
    width={80} 
    height={80} 
    className="mx-auto mb-4 rounded-lg"
    data-ai-hint="logo glass cube"
  />
);
