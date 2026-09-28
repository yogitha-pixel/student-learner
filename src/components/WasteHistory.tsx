import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Edit2,
  Download,
  Calendar,
  DollarSign,
  ArrowUpDown,
  X,
  FileSpreadsheet,
  RotateCcw,
  PlusCircle,
  Building2,
  GraduationCap
} from 'lucide-react';
import { FoodWasteRecord, MealType, LoggedByRole } from '../types';

interface WasteHistoryProps {
  records: FoodWasteRecord[];
  onDeleteRecord: (id: string) => void;
  onUpdateRecord: (id: string, updated: Partial<FoodWasteRecord>) => void;
  onResetSample: () => void;
  onNavigateAdd: () => void;
}

export const WasteHistory: React.FC<WasteHistoryProps> = ({
  records,
  onDeleteRecord,
  onUpdateRecord,
  onResetSample,
  onNavigateAdd,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [mealFilter, setMealFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [reasonFilter, setReasonFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'qty_desc' | 'cost_desc'>('date_desc');

  // Edit modal state
  const [editingRecord, setEditingRecord] = useState<FoodWasteRecord | null>(null);
  const [editFoodName, setEditFoodName] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editMealType, setEditMealType] = useState<MealType>('Lunch');
  const [editReason, setEditReason] = useState('');
  const [editCost, setEditCost] = useState('');

  // Filter and sort records
  const filteredRecords = useMemo(() => {
    return records
      .filter((rec) => {
        const matchesSearch =
          rec.foodName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rec.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (rec.notes && rec.notes.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesMeal = mealFilter === 'all' || rec.mealType === mealFilter;
        const matchesRole = roleFilter === 'all' || rec.loggedBy === roleFilter;
        const matchesReason = reasonFilter === 'all' || rec.reason === reasonFilter;

        return matchesSearch && matchesMeal && matchesRole && matchesReason;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') {
          return new Date(b.date + 'T' + (b.time || '00:00')).getTime() - new Date(a.date + 'T' + (a.time || '00:00')).getTime();
        }
        if (sortBy === 'date_asc') {
          return new Date(a.date + 'T' + (a.time || '00:00')).getTime() - new Date(b.date + 'T' + (b.time || '00:00')).getTime();
        }
        if (sortBy === 'qty_desc') {
          return (b.quantityInKg || 0) - (a.quantityInKg || 0);
        }
        if (sortBy === 'cost_desc') {
          return (b.estimatedCost || 0) - (a.estimatedCost || 0);
        }
        return 0;
      });
  }, [records, searchTerm, mealFilter, roleFilter, reasonFilter, sortBy]);

  // Aggregate stats of filtered set
  const filteredTotalKg = Math.round(filteredRecords.reduce((acc, r) => acc + (r.quantityInKg || 0), 0) * 10) / 10;
  const filteredTotalCost = Math.round(filteredRecords.reduce((acc, r) => acc + (r.estimatedCost || 0), 0) * 100) / 100;

  // Open edit modal
  const handleStartEdit = (rec: FoodWasteRecord) => {
    setEditingRecord(rec);
    setEditFoodName(rec.foodName);
    setEditQuantity(String(rec.quantity));
    setEditMealType(rec.mealType);
    setEditReason(rec.reason);
    setEditCost(String(rec.estimatedCost));
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    onUpdateRecord(editingRecord.id, {
      foodName: editFoodName.trim(),
      quantity: parseFloat(editQuantity) || editingRecord.quantity,
      mealType: editMealType,
      reason: editReason,
      estimatedCost: parseFloat(editCost) || editingRecord.estimatedCost,
    });

    setEditingRecord(null);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (records.length === 0) return;

    const headers = ['ID', 'Date', 'Time', 'Food Name', 'Category', 'Quantity', 'Unit', 'Quantity (kg)', 'Estimated Cost ($)', 'Meal Type', 'Reason', 'Logged By', 'Notes'];
    const rows = records.map((r) => [
      r.id,
      r.date,
      r.time,
      `"${r.foodName.replace(/"/g, '""')}"`,
      r.category,
      r.quantity,
      r.unit,
      r.quantityInKg,
      r.estimatedCost,
      r.mealType,
      `"${r.reason.replace(/"/g, '""')}"`,
      r.loggedBy,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `foodwise-waste-records-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Waste Log History
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Browse, filter, edit, and export all recorded food waste events.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="text-xs font-semibold px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors flex items-center gap-1.5"
              title="Download spreadsheet report as CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onNavigateAdd}
              className="text-xs font-bold px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Add Waste Log</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by food name or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
            />
          </div>

          {/* Meal Filter */}
          <div>
            <select
              value={mealFilter}
              onChange={(e) => setMealFilter(e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 font-medium bg-white"
            >
              <option value="all">All Meals</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Snack">Snack</option>
              <option value="Event/Buffet">Event / Buffet</option>
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 font-medium bg-white"
            >
              <option value="all">All Roles</option>
              <option value="College Canteen">College Canteen Only</option>
              <option value="Student">Student Plate Only</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 font-medium bg-white"
            >
              <option value="date_desc">Newest Date First</option>
              <option value="date_asc">Oldest Date First</option>
              <option value="qty_desc">Highest Quantity (kg)</option>
              <option value="cost_desc">Highest Value ($)</option>
            </select>
          </div>
        </div>

        {/* Filter Stats Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
          <div>
            Showing <strong className="text-slate-800">{filteredRecords.length}</strong> of{' '}
            <strong className="text-slate-800">{records.length}</strong> records
          </div>
          <div className="flex items-center gap-3">
            <span>
              Filtered Total Weight: <strong className="text-slate-900">{filteredTotalKg} kg</strong>
            </span>
            <span>•</span>
            <span>
              Filtered Total Cost: <strong className="text-slate-900">${filteredTotalCost.toFixed(2)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">No Matching Records Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search keywords or clearing active filters.
            </p>
            {records.length === 0 && (
              <button
                onClick={onResetSample}
                className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 transition-colors"
              >
                Reload Demo Data
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Food Item</th>
                  <th className="py-3.5 px-3">Quantity</th>
                  <th className="py-3.5 px-3">Est. Value</th>
                  <th className="py-3.5 px-3">Meal</th>
                  <th className="py-3.5 px-3">Reason for Waste</th>
                  <th className="py-3.5 px-3">Logged By</th>
                  <th className="py-3.5 px-3">Date &amp; Time</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="font-bold text-slate-900 text-sm">{rec.foodName}</div>
                      <div className="text-[11px] text-slate-400">{rec.category}</div>
                      {rec.notes && (
                        <div className="text-[11px] text-slate-500 italic mt-0.5 line-clamp-1">
                          &quot;{rec.notes}&quot;
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-bold text-slate-900">
                        {rec.quantity} {rec.unit}
                      </span>
                      {rec.unit !== 'kg' && (
                        <span className="text-[10px] text-slate-400 block">
                          (~{rec.quantityInKg} kg)
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 font-semibold text-slate-900">
                      ${rec.estimatedCost.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 font-medium text-slate-700">
                        {rec.mealType}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 max-w-[180px]">
                      <span className="text-slate-800 line-clamp-2" title={rec.reason}>
                        {rec.reason}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rec.loggedBy === 'College Canteen'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-teal-50 text-teal-700 border border-teal-200'
                        }`}
                      >
                        {rec.loggedBy === 'College Canteen' ? (
                          <Building2 className="w-3 h-3" />
                        ) : (
                          <GraduationCap className="w-3 h-3" />
                        )}
                        <span>{rec.loggedBy}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                      <div>{rec.date}</div>
                      <div className="text-[10px] text-slate-400">{rec.time}</div>
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleStartEdit(rec)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit record"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete record for "${rec.foodName}"?`)) {
                              onDeleteRecord(rec.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Record Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setEditingRecord(null)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Edit Food Waste Record</h3>
            <p className="text-xs text-slate-500 mb-4">Modify entry information</p>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Food Name</label>
                <input
                  type="text"
                  required
                  value={editFoodName}
                  onChange={(e) => setEditFoodName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Quantity ({editingRecord.unit})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estimated Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editCost}
                    onChange={(e) => setEditCost(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Meal Type</label>
                <select
                  value={editMealType}
                  onChange={(e) => setEditMealType(e.target.value as MealType)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium bg-white"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Snack">Snack</option>
                  <option value="Event/Buffet">Event/Buffet</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Waste</label>
                <input
                  type="text"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
