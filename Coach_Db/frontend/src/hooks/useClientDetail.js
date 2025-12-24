import { useCallback, useEffect, useState } from "react";
import {
  assignClientMeal,
  assignClientWorkout,
  getClient,
  getClientHealth,
  searchFoodLibrary,
  searchWorkoutLibrary
} from "../services/api.js";

export const useClientDetail = (clientId) => {
  const [client, setClient] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchClient = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [clientRes, healthRes] = await Promise.all([
        getClient(clientId),
        getClientHealth(clientId, { limit: 60 })
      ]);
      setClient(clientRes.data);
      setHealth(healthRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load client");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    if (clientId) {
      fetchClient();
    }
  }, [clientId, fetchClient]);

  const assignWorkout = async (payload) => {
    setAssigning(true);
    try {
      const { data } = await assignClientWorkout(clientId, payload);
      setClient(data);
      return data;
    } finally {
      setAssigning(false);
    }
  };

  const assignMeal = async (payload) => {
    setAssigning(true);
    try {
      const { data } = await assignClientMeal(clientId, payload);
      setClient(data);
      return data;
    } finally {
      setAssigning(false);
    }
  };

  const searchWorkouts = async (params) => {
    setLibraryLoading(true);
    try {
      const { data } = await searchWorkoutLibrary(params);
      return data;
    } finally {
      setLibraryLoading(false);
    }
  };

  const searchFoods = async (params) => {
    setLibraryLoading(true);
    try {
      const { data } = await searchFoodLibrary(params);
      return data;
    } finally {
      setLibraryLoading(false);
    }
  };

  return {
    client,
    health,
    loading,
    error,
    assigning,
    libraryLoading,
    fetchClient,
    assignWorkout,
    assignMeal,
    searchWorkouts,
    searchFoods
  };
};
