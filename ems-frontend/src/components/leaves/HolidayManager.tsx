'use client';

import { useState, useRef } from 'react';
import { useHolidays, useAddHoliday, useDeleteHoliday } from '@/hooks';
import { Trash2, Plus, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { formatAppDate, parseAppDate } from '@/lib/dateUtils';
import { format } from 'date-fns';

export default function HolidayManager() {
  const { data: holidays, isLoading } = useHolidays();
  const addHolidayMutation = useAddHoliday();
  const deleteHolidayMutation = useDeleteHoliday();
  const datePickerRef = useRef<HTMLInputElement>(null);

  const [date, setDate] = useState('');
  const [displayDate, setDisplayDate] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !name) return;

    addHolidayMutation.mutate({ date, name }, {
      onSuccess: () => {
        setDate('');
        setDisplayDate('');
        setName('');
      }
    });
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="p-6 bg-gradient-to-r from-brand-50 to-white border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-brand-600" />
          Public Holidays
        </h2>
        <p className="text-sm text-gray-500 mt-1">Manage official office holidays for this year</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Add Holiday Form */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative border border-blue-500 rounded-xl">
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
              className="w-full px-4 py-2.5 rounded-xl border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none pr-10"
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
          <div className="flex-[2] border border-blue-500 rounded-xl">
            <input
              type="text"
              placeholder="Holiday Name (e.g., Independence Day)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none"
              required
            />
          </div>
          <button
            type="submit"
            disabled={addHolidayMutation.isPending}
            className="btn-primary py-2.5 px-6 shrink-0 shadow-lg shadow-brand-100 disabled:opacity-50"
          >
            {addHolidayMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <><Plus className="w-5 h-5 mr-2" /> Add</>
            )}
          </button>
        </form>

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
                className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 group hover:bg-brand-50/50 hover:border-brand-100 border border-transparent transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                    <span className="text-xs font-bold text-gray-900 leading-tight">
                      {formatAppDate(holiday.date)}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{holiday.name}</p>
                    <p className="text-xs text-gray-500">Public Holiday</p>
                  </div>
                </div>
                
                <button
                  onClick={() => deleteHolidayMutation.mutate(holiday._id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  disabled={deleteHolidayMutation.isPending}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
