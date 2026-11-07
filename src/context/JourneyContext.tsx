import React, { createContext, useContext, useState } from 'react';
import { JourneyDetails } from '../types/journey';
import { JOURNEY_DETAILS } from '../data/marketplaceData';

export interface JourneyContextType {
  journey: JourneyDetails;
  setJourney: (journey: JourneyDetails) => void;
  updateSeat: (coach: string, berth: string, berthType?: string) => void;
  updateStation: (station: string, platform: string, arrivalMins: number, haltMins: number) => void;
  updatePassenger: (passengerName: string, passengerPhone: string) => void;
}

const JourneyContext = createContext<JourneyContextType | undefined>(undefined);

export const JourneyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [journey, setJourney] = useState<JourneyDetails>(JOURNEY_DETAILS);

  const updateSeat = (coach: string, berth: string, berthType?: string) => {
    setJourney((prev) => ({
      ...prev,
      coach,
      berth,
      berthType: berthType || prev.berthType,
    }));
  };

  const updateStation = (
    station: string,
    platform: string,
    arrivalMins: number,
    haltMins: number
  ) => {
    setJourney((prev) => ({
      ...prev,
      station,
      platform,
      scheduledArrivalMins: arrivalMins,
      haltDurationMins: haltMins,
    }));
  };

  const updatePassenger = (passengerName: string, passengerPhone: string) => {
    setJourney((prev) => ({
      ...prev,
      passengerName,
      passengerPhone,
    }));
  };

  return (
    <JourneyContext.Provider value={{ journey, setJourney, updateSeat, updateStation, updatePassenger }}>
      {children}
    </JourneyContext.Provider>
  );
};

export const useJourney = (): JourneyContextType => {
  const context = useContext(JourneyContext);
  if (!context) {
    throw new Error('useJourney must be used within a JourneyProvider');
  }
  return context;
};

export default JourneyContext;
