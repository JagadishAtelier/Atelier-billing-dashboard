import api from "./Api.js";

export const addressServices = {
    getCountry: async () => {
      try {
        return await api.get("address_ms/country");
      } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to fetch countries");
      }
    },
    getState: async (countryId) => {
      try {
        if (countryId) {
          return await api.get(`address_ms/state?country_id=${countryId}`);
        }
        return await api.get("address_ms/state"); 
      } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to fetch states");
      }
    },
    getCity: async (stateId) => {
      try {
        if (stateId) {
          return await api.get(`address_ms/district?state_id=${stateId}`);
        }
        return await api.get("address_ms/district"); 
      } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to fetch cities");
      }
    },
  };