'use client';

import React from 'react';

const CATEGORIES = [
  { id: 'all', name: 'All Categories' },
  { id: 'home-services', name: 'Home Services' },
  { id: 'appliance-repair', name: 'Appliance Repair' },
  { id: 'plumbing', name: 'Plumbing' },
  { id: 'electrical', name: 'Electrical' },
  { id: 'painting', name: 'Painting' },
  { id: 'cleaning', name: 'Cleaning' },
  { id: 'ac-repair', name: 'AC Repair' },
  { id: 'beauty', name: 'Beauty & Wellness' },
  { id: 'tuition', name: 'Tuition' },
  { id: 'fitness', name: 'Fitness' },
  { id: 'photography', name: 'Photography' },
];

export default function CategorySelector({ selected, onSelect }) {
  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex gap-2 min-w-min">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelect(category.id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
              selected === category.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
