import {useState, useEffect} from 'react';
import {calculateFakeTokens} from '@/features/chat/components/ClaudeStatus/ClaudeStatus.logic';

/**
 * Custom hook for ClaudeStatus component logic
 * @param {boolean} isLoading - Loading state
 * @returns {Object} Hook state and functions
 */
export const useClaudeStatus = (isLoading: any) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [fakeTokens, setFakeTokens] = useState(0);
  const [dependencyStatus, setDependencyStatus] = useState(null);
  const [dependencyLoading, setDependencyLoading] = useState(false);

  // Update elapsed time every second
  useEffect(() => {
    if (!isLoading) {
      setElapsedTime(0);
      setFakeTokens(0);
      return;
    }

    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(elapsed);
      setFakeTokens(calculateFakeTokens(elapsed));
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoading]);

  // Animate the status indicator
  useEffect(() => {
    if (!isLoading) return;

    const timer = setInterval(() => {
      setAnimationPhase((prev) => (prev + 1) % 4);
    }, 500);

    return () => clearInterval(timer);
  }, [isLoading]);

  // Fetch dependency status on component mount
  useEffect(() => {
    const fetchDependencyStatus = async () => {
      try {
        setDependencyLoading(true);
        const response = await fetch('/api/dependencies');
        if (response.ok) {
          const data = await response.json();
          setDependencyStatus(data.claudeCli);
        }
      } catch (error) {
        console.error('Error fetching dependency status:', error);
      } finally {
        setDependencyLoading(false);
      }
    };

    fetchDependencyStatus();
  }, []);

  // Function to refresh dependency status
  const refreshDependencyStatus = async () => {
    try {
      setDependencyLoading(true);
      const response = await fetch('/api/dependencies');
      if (response.ok) {
        const data = await response.json();
        setDependencyStatus(data.claudeCli);
      }
    } catch (error) {
      console.error('Error refreshing dependency status:', error);
    } finally {
      setDependencyLoading(false);
    }
  };

  return {
    elapsedTime,
    animationPhase,
    fakeTokens,
    dependencyStatus,
    dependencyLoading,
    refreshDependencyStatus,
  };
};
