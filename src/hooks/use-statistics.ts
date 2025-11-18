import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface Statistics {
  activeCitizens: number;
  eventsCompleted: number;
  issuesResolved: number;
  ngosPartnered: number;
}

export function useStatistics() {
  const [statistics, setStatistics] = useState<Statistics>({
    activeCitizens: 342,
    eventsCompleted: 342,
    issuesResolved: 1289,
    ngosPartnered: 23
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStatistics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Add user ID to query params if user is logged in
        const queryParams = user?.id ? `?userId=${user.id}` : '';
        const response = await fetch(`http://localhost:5000/api/stats${queryParams}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }
        
        const data = await response.json();
        setStatistics({
          activeCitizens: data.activeCitizens,
          eventsCompleted: data.eventsCompleted,
          issuesResolved: data.issuesResolved,
          ngosPartnered: data.ngosPartnered
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching statistics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatistics();
    
    // Refresh statistics every 30 seconds
    const intervalId = setInterval(fetchStatistics, 30000);
    
    return () => clearInterval(intervalId);
  }, [user?.id]);

  return { statistics, isLoading, error };
}