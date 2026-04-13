'use client';

import { useState, useRef, useEffect } from 'react';
import { useHolidays, useAddHoliday, useDeleteHoliday, useUpdateHoliday } from '@/hooks';
import { Trash2, Plus, Calendar as CalendarIcon, Loader2, Edit2, X } from 'lucide-react';
import { formatAppDate, parseAppDate } from '@/lib/dateUtils';
import { format } from 'date-fns';

export default function HolidayManager() {
  const { data: holidays, isLoading } = useHolidays();
  const addHolidayMutation = useAddHoliday();
  const updateHolidayMutation = useUpdateHoliday();
  const deleteHolidayMutation = useDeleteHoliday();
  const datePickerRef = useRef<HTMLInputElement>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [date, setDate] = useState('');
  const [displayDate, setDisplayDate] = useState('');
  const [name, setName] = useState('');

  // Handle setting up edit mode
  const handleEdit = (holiday: any) => {
    setEditingId(holiday._id);
    setName(holiday.name);
    const d = new Date(holiday.date);
    setDate(format(d, 'yyyy-MM-dd'));
    setDisplayDate(format(d, 'dd/MM/yyyy'));
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setDate('');
    setDisplayDate('');
    setName('');
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !name) return;

    if (editingId) {
      updateHolidayMutation.mutate({ id: editingId, data: { date, name } }, {
        onSuccess: () => resetForm()
      });
    } else {
      addHolidayMutation.mutate({ date, name }, {
        onSuccess: () => resetForm()
      });
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="p-6 bg-gradient-to-r from-brand-50 to-white border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-brand-600" />
            Public Holidays
          </h2>
          <p className="text-sm text-gray-500 mt-1">Manage official office holidays for this year</p>
        </div>

        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="btn-primary py-2 px-4 shadow-md flex items-center gap-2 h-fit"
          >
            <Plus className="w-4 h-4" /> Add New
          </button>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Add/Edit Holiday Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-2xl border border-brand-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-brand-900">
                {editingId ? 'Edit Holiday' : 'Create New Holiday'}
              </h3>
              <button 
                type="button" 
                onClick={resetForm}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative bg-white rounded-xl">
                <input
                  type="text"
                  placeholder="Date (DD/MM/YYYY)"
                  value={displayDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDisplayDate(val);
                    const parsed = parseAppDate(val);
                    if (parsed) {
                      setDate(format(parsed, 'yyyy-MM-dd'));
                    }
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => datePickerRef.current?.showPicker()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-600 transition-colors"
                >
                  <CalendarIcon className="w-4 h-4" />
                </button>
                <input
                  ref={datePickerRef}
                  type="date"
                  className="absolute inset-0 w-0 h-0 opacity-0 pointer-events-none"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) return;
                    const d = new Date(val);
                    setDate(val);
                    setDisplayDate(format(d, 'dd/MM/yyyy'));
                  }}
                />
              </div>
              <div className="flex-[2] bg-white rounded-xl">
                <input
                  type="text"
                  placeholder="Holiday Name (e.g., Independence Day)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={addHolidayMutation.isPending || updateHolidayMutation.isPending}
                className="btn-primary py-2.5 px-6 shrink-0 shadow-lg shadow-brand-100 disabled:opacity-50"
              >
                {(addHolidayMutation.isPending || updateHolidayMutation.isPending) ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  editingId ? 'Update' : 'Save Holiday'
                )}
              </button>
            </div>
          </form>
        )}

        {/* Holiday List */}
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-brand-600" /></div>
          ) : holidays?.length === 0 ? (
            <p className="text-center py-10 text-gray-400 font-medium bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              No holidays added yet
            </p>
          ) : (
            holidays?.map((holiday) => (
              <div 
                key={holiday._id}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  editingId === holiday._id 
                    ? 'bg-brand-50 border-brand-200 ring-1 ring-brand-100 shadow-inner' 
                    : 'bg-gray-50 border-transparent hover:bg-brand-50/50 hover:border-brand-100'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                    <span className="text-xs font-bold text-gray-900 leading-tight">
                      {formatAppDate(holiday.date)}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{holiday.name}</p>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Public Holiday</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(holiday)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                    title="Edit Holiday"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete ${holiday.name}?`)) {
                        deleteHolidayMutation.mutate(holiday._id);
                        if (editingId === holiday._id) resetForm();
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    disabled={deleteHolidayMutation.isPending}
                    title="Delete Holiday"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
