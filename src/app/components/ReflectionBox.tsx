import { useState, useEffect } from 'react';

interface ReflectionBoxProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ReflectionBox({ value, onChange }: ReflectionBoxProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleBlur = () => {
    onChange(localValue);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100">
      <h2 className="text-lg font-medium mb-4">Daily Reflection</h2>
      
      <textarea
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        placeholder="One line about today..."
        className="w-full h-24 px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        maxLength={200}
      />
      
      <div className="flex justify-between items-center mt-2">
        <p className="text-xs text-gray-500">
          What made today special?
        </p>
        <p className="text-xs text-gray-400">
          {localValue.length}/200
        </p>
      </div>
    </div>
  );
}
