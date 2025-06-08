import { useState, useCallback } from 'react';
import {
  statisticsService,
  ParkingOverview,
  PopularSpace,
  RevenueStatistics,
} from '../services/statisticsService';

export function useStatistics() {
  const [overview, setOverview] = useState<ParkingOverview | null>(null);
  const [hourlyStats, setHourlyStats] = useState<Record<string, number>>({});
  const [dailyStats, setDailyStats] = useState<Record<string, number>>({});
  const [popularSpaces, setPopularSpaces] = useState<PopularSpace[]>([]);
  const [revenueStats, setRevenueStats] = useState<RevenueStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await statisticsService.getParkingOverview();
      setOverview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch overview');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHourlyStats = useCallback(async (date: Date) => {
    try {
      setLoading(true);
      setError(null);
      const data = await statisticsService.getHourlyStatistics(date);
      setHourlyStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch hourly statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDailyStats = useCallback(async (startDate: Date, endDate: Date) => {
    try {
      setLoading(true);
      setError(null);
      const data = await statisticsService.getDailyStatistics(startDate, endDate);
      setDailyStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch daily statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPopularSpaces = useCallback(async (limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      const data = await statisticsService.getPopularSpaces(limit);
      setPopularSpaces(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch popular spaces');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRevenueStats = useCallback(async (startDate: Date, endDate: Date) => {
    try {
      setLoading(true);
      setError(null);
      const data = await statisticsService.getRevenueStatistics(startDate, endDate);
      setRevenueStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch revenue statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    overview,
    hourlyStats,
    dailyStats,
    popularSpaces,
    revenueStats,
    loading,
    error,
    fetchOverview,
    fetchHourlyStats,
    fetchDailyStats,
    fetchPopularSpaces,
    fetchRevenueStats,
  };
} 