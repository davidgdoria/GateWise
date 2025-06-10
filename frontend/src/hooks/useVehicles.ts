import { useState, useCallback } from 'react';
import { vehicleService, Vehicle, VehicleCreate, VehicleUpdate, ParkingRecord } from '../services/vehicleService';

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = useCallback(async (skip = 0, limit = 100, plateText?: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await vehicleService.getVehicles(skip, limit, plateText);
      setVehicles(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  }, []);

  const createVehicle = useCallback(async (data: VehicleCreate) => {
    try {
      setLoading(true);
      setError(null);
      const newVehicle = await vehicleService.createVehicle(data);
      setVehicles(prev => [...prev, newVehicle]);
      return newVehicle;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create vehicle');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateVehicle = useCallback(async (id: number, data: VehicleUpdate) => {
    try {
      setLoading(true);
      setError(null);
      const updatedVehicle = await vehicleService.updateVehicle(id, data);
      setVehicles(prev => prev.map(v => v.id === id ? updatedVehicle : v));
      return updatedVehicle;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update vehicle');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteVehicle = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await vehicleService.deleteVehicle(id);
      setVehicles(prev => prev.filter(v => v.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete vehicle');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleVehicleEntry = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      return await vehicleService.handleVehicleEntry();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to handle vehicle entry');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleVehicleExit = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      return await vehicleService.handleVehicleExit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to handle vehicle exit');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    vehicles,
    total,
    loading,
    error,
    fetchVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    handleVehicleEntry,
    handleVehicleExit,
  };
} 