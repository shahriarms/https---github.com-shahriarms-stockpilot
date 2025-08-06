
'use client';

import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import app from '@/lib/firebase/firebase';
import { Scale, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function LiveWeightDisplay() {
  const [weight, setWeight] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const db = getDatabase(app);
    const weightRef = ref(db, 'live-scale/weight');

    const listener = onValue(weightRef, (snapshot) => {
      const data = snapshot.val();
      if (data !== null) {
        setWeight(data);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching live weight:", error);
      setIsLoading(false);
    });

    // Cleanup function to remove the listener when the component unmounts
    return () => {
      off(weightRef, 'value', listener);
    };
  }, []);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Live Weight</CardTitle>
        <Scale className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">Connecting...</span>
          </div>
        ) : (
          <div className="text-2xl font-bold">
            {weight !== null ? `${weight.toFixed(3)} kg` : '0.000 kg'}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Real-time reading from your connected scale.
        </p>
      </CardContent>
    </Card>
  );
}
