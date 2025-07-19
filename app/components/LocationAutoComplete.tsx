'use client';

import React from 'react';
import usePlacesAutocomplete from 'use-places-autocomplete';
import { Input } from '@/components/ui/input';

export default function LocationAutocomplete({ onSelect }: { onSelect: (address: string) => void }) {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete();

  const handleSelect = (address: string) => {
    setValue(address, false);
    clearSuggestions();
    onSelect(address);
  };

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter your location"
        disabled={!ready}
      />
      {status === 'OK' && (
        <ul className="absolute z-10 bg-white border mt-1 rounded shadow max-h-48 overflow-auto w-full">
          {data.map(({ place_id, description }) => (
            <li
              key={place_id}
              onClick={() => handleSelect(description)}
              className="p-2 hover:bg-gray-100 cursor-pointer"
            >
              {description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
