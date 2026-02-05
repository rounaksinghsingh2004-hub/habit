// ============================================================================
// MANAGE HABITS PAGE
// ============================================================================
// Year-based habit management with edit/delete restrictions
// ============================================================================

import React, { useState, useMemo } from 'react';
import { useData } from '../data-context';
import { Plus, Trash2, Edit2, Calendar, ChevronLeft, ChevronRight, Archive, GripVertical, Check, X, RotateCcw } from 'lucide-react';
import type { Habit, HabitCategory } from '../utils/supabase-schema';

// ============================================================================
// CONSTANTS
// ============================================================================

const CATEGORIES = [
  { value: 'Health' as HabitCategory, label: 'Health', color: '#10B981' },
  { value: 'Study' as HabitCategory, label: 'Study', color: '#3B82F6' },
  { value: 'Mental' as HabitCategory, label: 'Mental', color: '#8B5CF6' },
  { value: 'Lifestyle' as HabitCategory, label: 'Lifestyle', color: '#F59E0B' },
];

const PRIORITIES = [
  { value: 0, label: 'Normal', color: 'gray' },
  { value: 1, label: 'Important', color: 'yellow' },
  { value: 2, label: 'Very Important', color: 'red' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ManageHabitsPage() {
  const {
    habits,
    selectedYear,
    availableYears,
    selectYear,
    addHabit,
    updateHabit,
    deleteHabit,
    isGuest,
  } = useData();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [filterCategory, setFilterCategory] = useState<HabitCategory | 'All'>('All');
  const [showArchived, setShowArchived] = useState(false);

  const filteredHabits = useMemo(() => {
    return habits.filter((habit) => {
      const matchesCategory = filterCategory === 'All' || habit.category === filterCategory;
      const matchesArchived = showArchived || !habit.is_archived;
      return matchesCategory && matchesArchived;
    }).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }, [habits, filterCategory, showArchived]);

  const habitsByCategory = useMemo(() => {
    const grouped: Record<string, typeof filteredHabits> = {
      Health: [],
      Study: [],
      Mental: [],
      Lifestyle: [],
    };
    
    filteredHabits.filter(h => !h.is_archived).forEach((habit) => {
      grouped[habit.category].push(habit);
    });
    
    return grouped;
  }, [filteredHabits]);

  const handleYearChange = (direction: 'prev' | 'next') => {
    const currentIndex = availableYears.indexOf(selectedYear);
    if (direction === 'prev' && currentIndex > 0) {
      selectYear(availableYears[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < availableYears.length - 1) {
      selectYear(availableYears[currentIndex + 1]);
    }
  };

  const canEditHabit = (habit: Habit): boolean => {
    if (isGuest) {
      const habitDate = new Date(habit.created_at).toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];
      return habitDate === today;
    }
    const habitDate = new Date(habit.created_at);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - habitDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 1;
  };

  const canDeleteHabit = (habit: Habit): boolean => {
    if (isGuest) {
      const habitDate = new Date(habit.created_at).toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];
      return habitDate === today;
    }
    const habitDate = new Date(habit.created_at);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - habitDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 1;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Manage Habits</h1>
            <button
              onClick={() => setShowAddDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Add Habit
            </button>
          </div>

          {/* Year Selector */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleYearChange('prev')}
              disabled={availableYears.indexOf(selectedYear) === 0}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
              <Calendar size={20} className="text-gray-600" />
              <span className="font-semibold">{selectedYear}</span>
            </div>
            
            <button
              onClick={() => handleYearChange('next')}
              disabled={availableYears.indexOf(selectedYear) === availableYears.length - 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronRight size={20} />
            </button>

            <div className="flex-1" />

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>

            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`px-3 py-2 rounded-lg border ${showArchived ? 'bg-gray-200' : 'bg-white'}`}
            >
              {showArchived ? 'Hide Archived' : 'Show Archived'}
            </button>
          </div>

          {isGuest && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              Guest Mode: You can only edit habits created today.
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {CATEGORIES.map((category) => {
            const categoryHabits = habitsByCategory[category.value];
            if (categoryHabits.length === 0 && !showArchived) return null;

            return (
              <div key={category.value} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div
                  className="px-4 py-3 flex items-center gap-2"
                  style={{ backgroundColor: `${category.color}15` }}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                  <h2 className="font-semibold text-gray-900">{category.label}</h2>
                  <span className="text-sm text-gray-500">({categoryHabits.length})</span>
                </div>

                <div className="divide-y divide-gray-100">
                  {categoryHabits.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500">
                      No habits in this category
                    </div>
                  ) : (
                    categoryHabits.map((habit) => (
                      <HabitRow
                        key={habit.id}
                        habit={habit}
                        category={category}
                        canEdit={canEditHabit(habit)}
                        canDelete={canDeleteHabit(habit)}
                        onEdit={() => setEditingHabit(habit)}
                        onDelete={() => deleteHabit(habit.id)}
                        onArchive={() => updateHabit(habit.id, { is_archived: !habit.is_archived })}
                      />
                    ))
                  )}

                  {showArchived && habits.filter(h => h.category === category.value && h.is_archived).map((habit) => (
                    <HabitRow
                      key={habit.id}
                      habit={habit}
                      category={category}
                      canEdit={false}
                      canDelete={false}
                      onEdit={() => {}}
                      onDelete={() => {}}
                      onArchive={() => updateHabit(habit.id, { is_archived: false })}
                      archived
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {filteredHabits.length === 0 && !showArchived && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Plus size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No habits yet</h3>
            <p className="text-gray-500 mb-4">Start building better habits by adding your first one.</p>
            <button
              onClick={() => setShowAddDialog(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Your First Habit
            </button>
          </div>
        )}
      </div>

      {(showAddDialog || editingHabit) && (
        <HabitDialog
          habit={editingHabit}
          onClose={() => {
            setShowAddDialog(false);
            setEditingHabit(null);
          }}
          onSave={(habitData) => {
            if (editingHabit) {
              updateHabit(editingHabit.id, habitData);
            } else {
              addHabit({
                ...habitData,
                user_id: '',
                year_id: '',
                created_at: new Date().toISOString(),
              } as any);
            }
            setShowAddDialog(false);
            setEditingHabit(null);
          }}
        />
      )}
    </div>
  );
}

// ============================================================================
// HABIT ROW COMPONENT
// ============================================================================

interface HabitRowProps {
  habit: Habit;
  category: { value: HabitCategory; label: string; color: string };
  canEdit: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onArchive: () => void;
  archived?: boolean;
}

function HabitRow({ habit, category, canEdit, canDelete, onEdit, onDelete, onArchive, archived }: HabitRowProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className={`px-4 py-3 flex items-center gap-4 ${archived ? 'opacity-60' : ''}`}>
      <div className="cursor-grab text-gray-400">
        <GripVertical size={20} />
      </div>

      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
        habit.completed_today ? 'bg-green-500 border-green-500' : 'border-gray-300'
      }`}>
        {habit.completed_today && <Check size={14} className="text-white" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-900 truncate">{habit.name}</h3>
          {habit.priority > 0 && (
            <span className={`w-2 h-2 rounded-full ${habit.priority === 2 ? 'bg-red-500' : 'bg-yellow-500'}`} />
          )}
          {habit.time_hint && <span className="text-xs text-gray-500">{habit.time_hint}</span>}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500">{habit.current_streak} day streak</span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-500">Created {new Date(habit.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      {!archived && (
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            disabled={!canEdit}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
            title={canEdit ? 'Edit' : 'Cannot edit past habits'}
          >
            <Edit2 size={18} className="text-gray-600" />
          </button>
          
          <button onClick={onArchive} className="p-2 rounded-lg hover:bg-gray-100" title="Archive">
            <Archive size={18} className="text-gray-600" />
          </button>

          {showDeleteConfirm ? (
            <div className="flex items-center gap-1">
              <button onClick={onDelete} disabled={!canDelete} className="p-2 rounded-lg bg-red-100 text-red-600 disabled:opacity-50">
                <Check size={18} />
              </button>
              <button onClick={() => setShowDeleteConfirm(false)} className="p-2 rounded-lg bg-gray-100 text-gray-600">
                <X size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={!canDelete}
              className="p-2 rounded-lg hover:bg-red-50 disabled:opacity-50"
              title={canDelete ? 'Delete' : 'Cannot delete past habits'}
            >
              <Trash2 size={18} className="text-red-600" />
            </button>
          )}
        </div>
      )}

      {archived && (
        <button onClick={onArchive} className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900">
          <RotateCcw size={16} />
          Restore
        </button>
      )}
    </div>
  );
}

// ============================================================================
// HABIT DIALOG
// ============================================================================

interface HabitDialogProps {
  habit: Habit | null;
  onClose: () => void;
  onSave: (habit: Partial<Habit>) => void;
}

function HabitDialog({ habit, onClose, onSave }: HabitDialogProps) {
  const [name, setName] = useState(habit?.name || '');
  const [category, setCategory] = useState<HabitCategory>(habit?.category || 'Lifestyle');
  const [priority, setPriority] = useState(habit?.priority || 0);
  const [time_hint, setTimeHint] = useState(habit?.time_hint || '');
  const [color, setColor] = useState(habit?.color || CATEGORIES.find(c => c.value === (habit?.category || 'Lifestyle'))?.color || '#3BB82F6');

  const isEditing = !!habit;
  const canSubmit = name.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    onSave({
      name: name.trim(),
      category,
      priority,
      time_hint: time_hint || undefined,
      color,
      is_archived: false,
    } as Partial<Habit>);
  };

  const handleCategoryChange = (cat: HabitCategory) => {
    setCategory(cat);
    const catColor = CATEGORIES.find(c => c.value === cat)?.color;
    if (catColor) setColor(catColor);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit Habit' : 'Add New Habit'}</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Habit Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Morning Exercise"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => handleCategoryChange(cat.value)}
                  className={`px-4 py-3 rounded-xl border-2 transition-all ${category === cat.value ? 'border-current' : 'border-gray-200'}`}
                  style={{
                    backgroundColor: category === cat.value ? `${cat.color}20` : undefined,
                    borderColor: category === cat.value ? cat.color : undefined,
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span>{cat.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <div className="flex gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${priority === p.value ? 'border-current' : 'border-gray-200'}`}
                  style={{
                    backgroundColor: priority === p.value && p.color !== 'gray' ? `${p.color === 'red' ? '#FEE2E2' : '#FEF3C7'}20` : undefined,
                    borderColor: priority === p.value ? p.color === 'red' ? '#EF4444' : p.color === 'yellow' ? '#EAB308' : '#10B981' : undefined,
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time (optional)</label>
            <input
              type="text"
              value={time_hint}
              onChange={(e) => setTimeHint(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 7:00 AM"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={!canSubmit} className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50">
              {isEditing ? 'Save Changes' : 'Add Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
