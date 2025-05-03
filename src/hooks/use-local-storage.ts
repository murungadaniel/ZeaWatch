import { useState, useEffect, Dispatch, SetStateAction } from 'react';

type SetValue<T> = Dispatch<SetStateAction<T>>;

function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>] {
  // Check if localStorage is available
  const isLocalStorageAvailable = typeof window !== 'undefined' && window.localStorage;

  // Get from local storage then
  // parse stored json or return initialValue
  const readValue = (): T => {
    // Prevent build error "window is undefined" but keep keep working
    if (!isLocalStorageAvailable) {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  };

  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue: SetValue<T> = (value) => {
     // Prevent build error "window is undefined" but keep keep working
    if (!isLocalStorageAvailable) {
      console.warn(`Tried setting localStorage key “${key}” even though environment is not a client`);
      // Still update the state in memory
       setStoredValue(value);
      return;
    }

    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key “${key}”:`, error);
    }
  };

  // Read localStorage value on mount/hydration
  useEffect(() => {
    setStoredValue(readValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array means this effect runs only once on mount


  // Optional: Listen to storage events to sync across tabs/windows
  useEffect(() => {
     if (!isLocalStorageAvailable) return;

     const handleStorageChange = (event: StorageEvent) => {
       if (event.key === key && event.storageArea === window.localStorage) {
         try {
             setStoredValue(event.newValue ? JSON.parse(event.newValue) : initialValue);
         } catch (error) {
           console.warn(`Error parsing storage event for key “${key}”:`, error);
         }
       }
     };

     window.addEventListener('storage', handleStorageChange);
     return () => window.removeEventListener('storage', handleStorageChange);

   }, [key, initialValue, isLocalStorageAvailable]);


  return [storedValue, setValue];
}

export { useLocalStorage };
