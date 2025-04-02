"use client";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

interface OnboardingData {
  location: {
    id: string | null;
    name: string | null;
  };
  areas: {
    id: string;
    name: string;
  }[];
}

interface OnboardingContextType {
  onboardingData: OnboardingData;
  setLocation: (id: string | null, name: string | null) => void;
  setAreas: (areas: []) => void;
  isOnboardingComplete: boolean;
  setIsOnboardingComplete: (value: boolean) => void;
  resetOnboarding: () => void;
}

const defaultOnboardingData: OnboardingData = {
  location: {
    id: null,
    name: null,
  },
  areas: [],
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const [isOnboardingComplete, setIsOnboardingComplete] =
    useState<boolean>(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(
    defaultOnboardingData
  );

  useEffect(() => {
    setIsClient(true);

    const savedValue = localStorage.getItem("isOnboardingComplete");
    if (savedValue) {
      setIsOnboardingComplete(JSON.parse(savedValue));
    }

    const savedData = localStorage.getItem("onboardingData");
    if (savedData) {
      setOnboardingData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("onboardingData", JSON.stringify(onboardingData));
      localStorage.setItem(
        "isOnboardingComplete",
        JSON.stringify(isOnboardingComplete)
      );
    }
  }, [onboardingData, isOnboardingComplete, isClient]);

  const setLocation = (id: string | null, name: string | null) => {
    setOnboardingData((prevData) => ({
      ...prevData,
      location: { id, name },
    }));
  };

  const setAreas = (areas: { id: string; name: string }[]) => {
    setOnboardingData((prevData) => ({
      ...prevData,
      areas,
    }));
  };

  const resetOnboarding = () => {
    setOnboardingData(defaultOnboardingData);
    setIsOnboardingComplete(false);
  };

  if (!isClient) {
    return null;
  }

  return (
    <OnboardingContext.Provider
      value={{
        onboardingData,
        setLocation,
        setAreas,
        isOnboardingComplete,
        setIsOnboardingComplete,
        resetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}
