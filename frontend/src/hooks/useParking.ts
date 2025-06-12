/*
import { useState, useCallback } from 'react';
import {
  parkingService,
  ParkingSpace,
  ParkingSpaceUpdate,
  ParkingRecord,
  ParkingRecordCreate,
} from '../services/parkingService';

export function useParking() {
  const [spaces, setSpaces] = useState<ParkingSpace[]>([]);
  const [records, setRecords] = useState<ParkingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchParkingSpaces = useCallback(async (skip = 0, limit = 100, isOccupied?: boolean) => {
    try {
      setLoading(true);
      setError(null);
      const data = await parkingService.getParkingSpaces(skip, limit, isOccupied);
      setSpaces(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch parking spaces');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateParkingSpace = useCallback(async (id: number, data: ParkingSpaceUpdate) => {
    try {
      setLoading(true);
      setError(null);
      const updatedSpace = await parkingService.updateParkingSpace(id, data);
      setSpaces(prev => prev.map(space => space.id === id ? updatedSpace : space));
      return updatedSpace;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update parking space');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchParkingRecords = useCallback(async (
    skip = 0,
    limit = 100,
    startDate?: Date,
    endDate?: Date
  ) => {
    try {
      setLoading(true);
      setError(null);
      const data = await parkingService.getParkingRecords(skip, limit, startDate, endDate);
      setRecords(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch parking records');
    } finally {
      setLoading(false);
    }
  }, []);

  const createParkingRecord = useCallback(async (data: ParkingRecordCreate) => {
    try {
      setLoading(true);
      setError(null);
      const newRecord = await parkingService.createParkingRecord(data);
      setRecords(prev => [...prev, newRecord]);
      return newRecord;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create parking record');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const recordVehicleExit = useCallback(async (recordId: number) => {
    try {
      setLoading(true);
      setError(null);
      const updatedRecord = await parkingService.recordVehicleExit(recordId);
      setRecords(prev => prev.map(record => record.id === recordId ? updatedRecord : record));
      return updatedRecord;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record vehicle exit');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    spaces,
    records,
    loading,
    error,
    fetchParkingSpaces,
    updateParkingSpace,
    fetchParkingRecords,
    createParkingRecord,
    recordVehicleExit,
  };
}
*/
import { useState, useCallback } from 'react';
import { parkingService } from '../services/parkingService';

export function useParking() {
  const [spaces, setSpaces] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchParkingSpaces = useCallback(async (page = 1, size = 10) => {
    try {
      setLoading(true);
      setError(null);
      const data = await parkingService.getParkingSpaces(page, size);
      setSpaces(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch parking spaces');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    spaces,
    total,
    loading,
    error,
    fetchParkingSpaces,
  };
}
export {} 