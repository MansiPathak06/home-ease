"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import {
  Plus, Edit2, Trash2, Search, RefreshCw,
  X, CheckCircle, Tag, IndianRupee, ToggleLeft, ToggleRight,
  Briefcase, TrendingUp
} from "lucide-react";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n ?? 0);

// ─── Category Form Modal ───────────────────────────────────────────────────────
function CategoryModal({ category, onClose, onSave }) {
  const isEdit = !!category?.id;
  const [form, setForm] = useState({
    name:         category?.name         ?? "",
    description:  category?.description  ?? "",
    base_price:   category?.base_price   ?? "",
    commission_pct: category?.commission_pct ?? 15,
    icon:         category?.icon         ?? "",
    is_active:    category?.is_active    ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState("");

  const handleSave = async () => {
    if (!form.name.trim()) { setErr("Category name is required"); return; }
    setSaving(true);
    setErr("");
    try {
      const res = isEdit
        ? await api.admin.updateCategory(category.id, form)
        : await api.admin.createCategory(form);
      if (res.success) onSave();
      else setErr(res.message ?? "Error saving");
    } catch { setErr("Network error"); }
    finally { setSaving(false); }
  };

  const ICONS = ["🎉","📸","🎬","🌸","🎵","🏛","🚗","💍","💐","💄","🎧","🍽","🎪","✈","🎨"];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h3 className="font-bold text-gray-900">{isEdit ? "Edit Category" : "Add New Category"}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Category Name *</label>
            <input type="text" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Photography, Catering..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500" />
          </div>

          {/* Icon picker */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Icon (emoji)</label>
            <div className="flex gap-1.5 flex-wrap mb-2">
              {ICONS.map(ic => (
                <button key={ic} type="button"
                  onClick={() => setForm({ ...form, icon: ic })}
                  className={`w-8 h-8 text-lg rounded-lg border-2 transition-all ${
                    form.icon === ic ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"
                  }`}>
                  {ic}
                </button>
              ))}
            </div>
            <input type="text" value={form.icon}
              onChange={e => setForm({ ...form, icon: e.target.value })}
              placeholder="Or type any emoji"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500" />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Description</label>
            <textarea rows={2} value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description of this service category..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 resize-none" />
          </div>

          {/* Price + Commission */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Base Price (₹)</label>
              <input type="number" value={form.base_price}
                onChange={e => setForm({ ...form, base_price: e.target.value })}
                placeholder="e.g. 5000"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Default Commission (%)</label>
              <input type="number" value={form.commission_pct} min="0" max="100"
                onChange={e => setForm({ ...form, commission_pct: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500" />
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
            <div>
              <p className="text-xs font-semibold text-gray-700">Active Status</p>
              <p className="text-xs text-gray-400">Inactive categories won't appear for vendors</p>
            </div>
            <button type="button" onClick={() => setForm({ ...form, is_active: !form.is_active })}>
              {form.is_active
                ? <ToggleRight className="w-8 h-8 text-green-500" />
                : <ToggleLeft  className="w-8 h-8 text-gray-400" />}
            </button>
          </div>

          {err && <p className="text-xs text-red-600 font-semibold">{err}</p>}

          <button onClick={handleSave} disabled={saving}
            className="w-full py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 disabled:opacity-50">
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Category"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function AdminCategoriesSection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modalTarget, setModalTarget] = useState(null); // null=closed, {}=new, {id,...}=edit
  const [search, setSearch]         = useState("");
  const [toast, setToast]           = useState({ text: "", type: "" });

  const showToast = (text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast({ text: "", type: "" }), 3000);
  };

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.admin.getCategories();
      if (res.success) setCategories(res.categories);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete category "${name}"? Vendors using it won't be affected.`)) return;
    const res = await api.admin.deleteCategory(id);
    if (res.success) { showToast("Category deleted"); loadCategories(); }
    else showToast(res.message ?? "Error", "error");
  };

  const handleToggle = async (cat) => {
    const res = await api.admin.updateCategory(cat.id, { ...cat, is_active: !cat.is_active });
    if (res.success) { showToast(`Category ${cat.is_active ? "deactivated" : "activated"} ✓`); loadCategories(); }
    else showToast("Error", "error");
  };

  const visible = categories.filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase())
  );

  const active   = categories.filter(c => c.is_active).length;
  const inactive = categories.filter(c => !c.is_active).length;

  return (
    <div className="space-y-5">

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border-l-4 border-blue-500 rounded-lg shadow-sm p-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Categories</p>
            <p className="text-lg font-bold text-gray-900 mt-0.5">{categories.length}</p>
          </div>
          <Tag className="w-5 h-5 text-gray-300" />
        </div>
        <div className="bg-white border-l-4 border-green-500 rounded-lg shadow-sm p-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Active</p>
            <p className="text-lg font-bold text-gray-900 mt-0.5">{active}</p>
          </div>
          <CheckCircle className="w-5 h-5 text-gray-300" />
        </div>
        <div className="bg-white border-l-4 border-gray-400 rounded-lg shadow-sm p-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Inactive</p>
            <p className="text-lg font-bold text-gray-900 mt-0.5">{inactive}</p>
          </div>
          <ToggleLeft className="w-5 h-5 text-gray-300" />
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search categories..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500" />
        </div>
        <button onClick={loadCategories}
          className="p-2 hover:bg-gray-100 rounded-lg border border-gray-300" title="Refresh">
          <RefreshCw className="w-4 h-4 text-gray-500" />
        </button>
        <button onClick={() => setModalTarget({})}
          className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Toast */}
      {toast.text && (
        <div className={`px-4 py-2.5 rounded-lg text-sm font-semibold text-center ${
          toast.type === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"
        }`}>{toast.text}</div>
      )}

      {/* Category Cards */}
      {loading ? (
        <div className="py-20 text-center text-gray-400 text-sm">Loading categories...</div>
      ) : visible.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-lg border border-gray-200">
          <Tag className="w-10 h-10 text-gray-200 mx-auto mb-2" />
          <p className="text-gray-400 text-sm mb-3">No categories yet</p>
          <button onClick={() => setModalTarget({})}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700">
            Add First Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {visible.map(cat => (
            <div key={cat.id}
              className={`bg-white rounded-lg border-2 p-4 transition-all hover:shadow-md ${
                cat.is_active ? "border-gray-200" : "border-dashed border-gray-200 opacity-60"
              }`}>

              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                    {cat.icon || "📦"}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{cat.name}</h3>
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                      cat.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {cat.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {cat.description && (
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{cat.description}</p>
              )}

              {/* Price + Commission */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-gray-50 rounded-md p-2">
                  <p className="text-xs text-gray-400">Base Price</p>
                  <p className="text-xs font-bold text-gray-800">
                    {cat.base_price ? fmt(cat.base_price) : "Not set"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-md p-2">
                  <p className="text-xs text-gray-400">Commission</p>
                  <p className="text-xs font-bold text-gray-800">{cat.commission_pct ?? 15}%</p>
                </div>
              </div>

              {/* Vendor count if available */}
              {cat.vendor_count !== undefined && (
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                  <Briefcase className="w-3 h-3" />
                  {cat.vendor_count} vendor{cat.vendor_count !== 1 ? "s" : ""} in this category
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button onClick={() => setModalTarget(cat)}
                  className="flex-1 py-1.5 bg-red-600 text-white rounded-md text-xs font-semibold hover:bg-red-700 flex items-center justify-center gap-1">
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                <button onClick={() => handleToggle(cat)}
                  className={`flex-1 py-1.5 rounded-md text-xs font-semibold flex items-center justify-center gap-1 ${
                    cat.is_active
                      ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}>
                  {cat.is_active
                    ? <><ToggleLeft className="w-3 h-3" /> Deactivate</>
                    : <><ToggleRight className="w-3 h-3" /> Activate</>}
                </button>
                <button onClick={() => handleDelete(cat.id, cat.name)}
                  className="py-1.5 px-2.5 bg-gray-100 text-gray-500 rounded-md text-xs hover:bg-red-50 hover:text-red-600 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalTarget !== null && (
        <CategoryModal
          category={modalTarget?.id ? modalTarget : null}
          onClose={() => setModalTarget(null)}
          onSave={() => { setModalTarget(null); loadCategories(); showToast("Category saved ✓"); }}
        />
      )}
    </div>
  );
}