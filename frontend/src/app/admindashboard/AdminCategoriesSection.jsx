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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      {/* Modal: dark background matching the login page right panel */}
      <div className="rounded-xl w-full max-w-md shadow-2xl" style={{ background: "#1C1010", border: "1px solid #3a1a1a" }}>
        <div className="flex justify-between items-center px-6 py-4" style={{ borderBottom: "1px solid #3a1a1a" }}>
          <h3 className="font-bold text-white">{isEdit ? "Edit Category" : "Add New Category"}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" style={{ background: "transparent" }}
            onMouseEnter={e => e.currentTarget.style.background = "#2a1a1a"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <X className="w-5 h-5" style={{ color: "#aaa" }} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: "#ccc" }}>Category Name *</label>
            <input type="text" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Photography, Catering..."
              className="w-full px-3 py-2 text-sm rounded-lg outline-none"
              style={{
                background: "#EEF2F7", color: "#1a1a1a", border: "1px solid #3a1a1a",
              }}
              onFocus={e => e.target.style.border = "1px solid #C0392B"}
              onBlur={e => e.target.style.border = "1px solid #3a1a1a"} />
          </div>

          {/* Icon picker */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: "#ccc" }}>Icon (emoji)</label>
            <div className="flex gap-1.5 flex-wrap mb-2">
              {ICONS.map(ic => (
                <button key={ic} type="button"
                  onClick={() => setForm({ ...form, icon: ic })}
                  className="w-8 h-8 text-lg rounded-lg border-2 transition-all"
                  style={{
                    borderColor: form.icon === ic ? "#C0392B" : "#3a1a1a",
                    background:  form.icon === ic ? "#2a0a0a" : "transparent",
                  }}>
                  {ic}
                </button>
              ))}
            </div>
            <input type="text" value={form.icon}
              onChange={e => setForm({ ...form, icon: e.target.value })}
              placeholder="Or type any emoji"
              className="w-full px-3 py-2 text-sm rounded-lg outline-none"
              style={{ background: "#EEF2F7", color: "#1a1a1a", border: "1px solid #3a1a1a" }}
              onFocus={e => e.target.style.border = "1px solid #C0392B"}
              onBlur={e => e.target.style.border = "1px solid #3a1a1a"} />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: "#ccc" }}>Description</label>
            <textarea rows={2} value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description of this service category..."
              className="w-full px-3 py-2 text-sm rounded-lg resize-none outline-none"
              style={{ background: "#EEF2F7", color: "#1a1a1a", border: "1px solid #3a1a1a" }}
              onFocus={e => e.target.style.border = "1px solid #C0392B"}
              onBlur={e => e.target.style.border = "1px solid #3a1a1a"} />
          </div>

          {/* Price + Commission */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: "#ccc" }}>Base Price (₹)</label>
              <input type="number" value={form.base_price}
                onChange={e => setForm({ ...form, base_price: e.target.value })}
                placeholder="e.g. 5000"
                className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                style={{ background: "#EEF2F7", color: "#1a1a1a", border: "1px solid #3a1a1a" }}
                onFocus={e => e.target.style.border = "1px solid #C0392B"}
                onBlur={e => e.target.style.border = "1px solid #3a1a1a"} />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: "#ccc" }}>Default Commission (%)</label>
              <input type="number" value={form.commission_pct} min="0" max="100"
                onChange={e => setForm({ ...form, commission_pct: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                style={{ background: "#EEF2F7", color: "#1a1a1a", border: "1px solid #3a1a1a" }}
                onFocus={e => e.target.style.border = "1px solid #C0392B"}
                onBlur={e => e.target.style.border = "1px solid #3a1a1a"} />
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between rounded-lg p-3" style={{ background: "#2a1212" }}>
            <div>
              <p className="text-xs font-semibold text-white">Active Status</p>
              <p className="text-xs" style={{ color: "#888" }}>Inactive categories won't appear for vendors</p>
            </div>
            <button type="button" onClick={() => setForm({ ...form, is_active: !form.is_active })}>
              {form.is_active
                ? <ToggleRight className="w-8 h-8" style={{ color: "#22c55e" }} />
                : <ToggleLeft  className="w-8 h-8" style={{ color: "#666" }} />}
            </button>
          </div>

          {err && <p className="text-xs font-semibold" style={{ color: "#f87171" }}>{err}</p>}

          <button onClick={handleSave} disabled={saving}
            className="w-full py-2.5 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
            style={{ background: "#C0392B" }}
            onMouseEnter={e => !saving && (e.currentTarget.style.background = "#a93226")}
            onMouseLeave={e => e.currentTarget.style.background = "#C0392B"}>
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
  const [modalTarget, setModalTarget] = useState(null);
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
        {/* Total */}
        <div className="rounded-lg shadow-sm p-3 flex items-center justify-between"
          style={{ background: "#1C1010", borderLeft: "4px solid #C0392B" }}>
          <div>
            <p className="text-xs font-medium" style={{ color: "#aaa" }}>Total Categories</p>
            <p className="text-lg font-bold text-white mt-0.5">{categories.length}</p>
          </div>
          <Tag className="w-5 h-5" style={{ color: "#C0392B" }} />
        </div>
        {/* Active */}
        <div className="rounded-lg shadow-sm p-3 flex items-center justify-between"
          style={{ background: "#1C1010", borderLeft: "4px solid #22c55e" }}>
          <div>
            <p className="text-xs font-medium" style={{ color: "#aaa" }}>Active</p>
            <p className="text-lg font-bold text-white mt-0.5">{active}</p>
          </div>
          <CheckCircle className="w-5 h-5" style={{ color: "#22c55e" }} />
        </div>
        {/* Inactive */}
        <div className="rounded-lg shadow-sm p-3 flex items-center justify-between"
          style={{ background: "#1C1010", borderLeft: "4px solid #555" }}>
          <div>
            <p className="text-xs font-medium" style={{ color: "#aaa" }}>Inactive</p>
            <p className="text-lg font-bold text-white mt-0.5">{inactive}</p>
          </div>
          <ToggleLeft className="w-5 h-5" style={{ color: "#555" }} />
        </div>
      </div>

      {/* Toolbar */}
      <div className="rounded-lg p-4 flex gap-3" style={{ background: "#1C1010", border: "1px solid #3a1a1a" }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#888" }} />
          <input type="text" placeholder="Search categories..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg outline-none text-white"
            style={{ background: "#2a1212", border: "1px solid #3a1a1a" }}
            onFocus={e => e.target.style.border = "1px solid #C0392B"}
            onBlur={e => e.target.style.border = "1px solid #3a1a1a"} />
        </div>
        <button onClick={loadCategories}
          className="p-2 rounded-lg border transition-colors"
          style={{ border: "1px solid #3a1a1a", background: "transparent" }}
          title="Refresh"
          onMouseEnter={e => e.currentTarget.style.background = "#2a1212"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          <RefreshCw className="w-4 h-4" style={{ color: "#aaa" }} />
        </button>
        <button onClick={() => setModalTarget({})}
          className="flex items-center gap-1.5 px-4 py-2 text-white rounded-lg text-sm font-semibold transition-colors"
          style={{ background: "#C0392B" }}
          onMouseEnter={e => e.currentTarget.style.background = "#a93226"}
          onMouseLeave={e => e.currentTarget.style.background = "#C0392B"}>
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Toast */}
      {toast.text && (
        <div className="px-4 py-2.5 rounded-lg text-sm font-semibold text-center"
          style={toast.type === "error"
            ? { background: "#2a0a0a", color: "#f87171", border: "1px solid #7f1d1d" }
            : { background: "#0a2a0a", color: "#4ade80", border: "1px solid #14532d" }}>
          {toast.text}
        </div>
      )}

      {/* Category Cards */}
      {loading ? (
        <div className="py-20 text-center text-sm" style={{ color: "#888" }}>Loading categories...</div>
      ) : visible.length === 0 ? (
        <div className="py-20 text-center rounded-lg" style={{ background: "#1C1010", border: "1px solid #3a1a1a" }}>
          <Tag className="w-10 h-10 mx-auto mb-2" style={{ color: "#3a1a1a" }} />
          <p className="text-sm mb-3" style={{ color: "#888" }}>No categories yet</p>
          <button onClick={() => setModalTarget({})}
            className="px-4 py-2 text-white rounded-lg text-sm font-semibold transition-colors"
            style={{ background: "#C0392B" }}
            onMouseEnter={e => e.currentTarget.style.background = "#a93226"}
            onMouseLeave={e => e.currentTarget.style.background = "#C0392B"}>
            Add First Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {visible.map(cat => (
            <div key={cat.id}
              className="rounded-lg p-4 transition-all"
              style={{
                background: "#1C1010",
                border: cat.is_active ? "2px solid #3a1a1a" : "2px dashed #2a1a1a",
                opacity: cat.is_active ? 1 : 0.6,
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(192,57,43,0.15)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>

              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: "#2a0a0a" }}>
                    {cat.icon || "📦"}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{cat.name}</h3>
                    <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                      style={cat.is_active
                        ? { background: "#0a2a0a", color: "#4ade80" }
                        : { background: "#2a2a2a", color: "#888" }}>
                      {cat.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {cat.description && (
                <p className="text-xs mb-3 line-clamp-2" style={{ color: "#aaa" }}>{cat.description}</p>
              )}

              {/* Price + Commission */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="rounded-md p-2" style={{ background: "#2a1212" }}>
                  <p className="text-xs" style={{ color: "#888" }}>Base Price</p>
                  <p className="text-xs font-bold text-white">
                    {cat.base_price ? fmt(cat.base_price) : "Not set"}
                  </p>
                </div>
                <div className="rounded-md p-2" style={{ background: "#2a1212" }}>
                  <p className="text-xs" style={{ color: "#888" }}>Commission</p>
                  <p className="text-xs font-bold text-white">{cat.commission_pct ?? 15}%</p>
                </div>
              </div>

              {/* Vendor count if available */}
              {cat.vendor_count !== undefined && (
                <div className="flex items-center gap-1.5 text-xs mb-3" style={{ color: "#888" }}>
                  <Briefcase className="w-3 h-3" />
                  {cat.vendor_count} vendor{cat.vendor_count !== 1 ? "s" : ""} in this category
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button onClick={() => setModalTarget(cat)}
                  className="flex-1 py-1.5 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                  style={{ background: "#C0392B" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#a93226"}
                  onMouseLeave={e => e.currentTarget.style.background = "#C0392B"}>
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                <button onClick={() => handleToggle(cat)}
                  className="flex-1 py-1.5 rounded-md text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                  style={cat.is_active
                    ? { background: "#2a1212", color: "#aaa" }
                    : { background: "#0a2a0a", color: "#4ade80" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                  {cat.is_active
                    ? <><ToggleLeft className="w-3 h-3" /> Deactivate</>
                    : <><ToggleRight className="w-3 h-3" /> Activate</>}
                </button>
                <button onClick={() => handleDelete(cat.id, cat.name)}
                  className="py-1.5 px-2.5 rounded-md text-xs transition-colors"
                  style={{ background: "#2a1212", color: "#888" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#3a0a0a"; e.currentTarget.style.color = "#f87171"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#2a1212"; e.currentTarget.style.color = "#888"; }}>
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