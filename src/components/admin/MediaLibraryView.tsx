import React, { useState, useEffect, useRef, useMemo } from "react";
import { api } from "../../services/api";
import { uploadOriginalImage, uploadFile } from "../../services/uploadService";
import { useClinicData } from "../../context/ClinicDataContext";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Copy,
  Check,
  Upload,
  RefreshCw,
  X,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  ArrowLeftRight,
  Video,
  Search,
  RotateCcw,
  Eye,
  Edit2,
  Info,
  CheckCircle2,
  HardDrive,
  FileCheck,
  Save,
  AlertCircle,
  XCircle,
  Filter,
  CheckSquare,
  Square,
  Layers,
  Sparkles,
  Link2,
  FolderOpen,
} from "lucide-react";

interface MediaLibraryViewProps {
  showToast: (type: "success" | "error" | "info", text: string) => void;
}

const FALLBACK_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23F4F9FD'/%3E%3Crect x='20' y='20' width='560' height='360' rx='16' fill='%23FFFFFF' stroke='%23BED8EA' stroke-width='2'/%3E%3Ccircle cx='300' cy='170' r='48' fill='%23E2EAF0'/%3E%3Cpath d='M285 170h30M300 155v30' stroke='%23064B82' stroke-width='5' stroke-linecap='round'/%3E%3Ctext x='300' y='250' text-anchor='middle' font-family='sans-serif' font-size='16' font-weight='bold' fill='%23064B82'%3E%D8%B9%D9%8A%D8%A7%D8%AF%D8%A9 %D8%AF. %D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D8%A8%D8%A7%D8%B3%D8%B7 %D9%85%D9%82%D8%A8%D9%84%3C/text%3E%3Ctext x='300' y='275' text-anchor='middle' font-family='sans-serif' font-size='12' fill='%23667788'%3E%D8%B5%D9%88%D8%B1%D8%A9 %D8%B7%D8%A8%D9%8A%D8%A9 %D9%85%D8%B9%D8%AA%D9%85%D8%AF%D8%A9%3C/text%3E%3C/svg%3E";

const ALL_CATEGORIES = [
  { id: "all", label: "الكل" },
  { id: "طبيب", label: "الطبيب" },
  { id: "شعار", label: "الشعار" },
  { id: "الواجهة", label: "الواجهة" },
  { id: "السلايدر", label: "السلايدر" },
  { id: "الباطنة", label: "الباطنة" },
  { id: "الكبد", label: "الكبد" },
  { id: "الجهاز الهضمي", label: "الجهاز الهضمي" },
  { id: "المناظير", label: "المناظير" },
  { id: "الخدمات", label: "الخدمات" },
  { id: "المقالات", label: "المقالات" },
  { id: "أخرى", label: "أخرى" },
];

export const MediaLibraryView: React.FC<MediaLibraryViewProps> = ({ showToast }) => {
  const { refreshContent } = useClinicData();
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBatchSaving, setIsBatchSaving] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkCategory, setBulkCategory] = useState<string>("عيادة");
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Filters & Search
  const [activeTab, setActiveTab] = useState<"all" | "image" | "video" | "trash">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Preview Modal
  const [previewItem, setPreviewItem] = useState<any | null>(null);

  // Usages Modal
  const [usageItem, setUsageItem] = useState<any | null>(null);

  // Edit Metadata Modal
  const [editItem, setEditItem] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ title: "", category: "", altText: "" });

  // In-use delete warning modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    item: any | null;
    usages: string[];
  }>({
    isOpen: false,
    item: null,
    usages: [],
  });

  // Dedicated Change / Replace Modal State
  const [replaceModalItem, setReplaceModalItem] = useState<any | null>(null);
  const [replaceMode, setReplaceMode] = useState<"upload" | "library">("upload");
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [replacePreviewUrl, setReplacePreviewUrl] = useState<string | null>(null);
  const [replaceSelectedLibraryItem, setReplaceSelectedLibraryItem] = useState<any | null>(null);
  const [replaceScope, setReplaceScope] = useState<"all" | "single">("all");
  const [isSavingReplacement, setIsSavingReplacement] = useState(false);
  const modalReplaceInputRef = useRef<HTMLInputElement | null>(null);

  // Upload modal state
  const [newImage, setNewImage] = useState({
    title: "",
    url: "",
    category: "عيادة",
    isVideo: false,
    youtubeUrl: "",
    duration: "",
  });

  // Calculate unsaved count
  const unsavedCount = mediaList.filter((m) => m._saveStatus === "unsaved").length;

  // Navigation Guard (Unsaved Changes Warning)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsavedCount > 0) {
        e.preventDefault();
        e.returnValue = "لديك تغييرات غير محفوظة. هل تريد المتابعة دون حفظ؟";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [unsavedCount]);

  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const list = await api.getMedia({
        status: activeTab === "trash" ? "trash" : "active",
        type: activeTab === "image" ? "image" : activeTab === "video" ? "video" : "all",
        category: categoryFilter,
        search: searchQuery,
      });
      const tagged = (list || []).map((m: any) => ({
        ...m,
        _saveStatus: m._saveStatus || "saved",
      }));
      setMediaList(tagged);
    } catch (err: any) {
      showToast("error", err.message || "فشل تحميل مكتبة الوسائط");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [activeTab, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMedia();
  };

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast("info", "تم نسخ رابط الصورة الدائم إلى الحافظة");
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Multi-Select Handlers
  const toggleSelectItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllVisible = () => {
    if (selectedIds.length === mediaList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(mediaList.map((m) => m.id));
    }
  };

  const handleBulkTrash = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`هل أنت متأكد من نقل ${selectedIds.length} عنصر إلى سلة المحذوفات؟`))
      return;

    setIsBulkProcessing(true);
    try {
      await api.bulkMediaAction("trash", selectedIds);
      showToast("success", `تم نقل ${selectedIds.length} عنصر إلى سلة المحذوفات بنجاح.`);
      setSelectedIds([]);
      await fetchMedia();
      await refreshContent();
    } catch (err: any) {
      showToast("error", err.message || "فشل تنفيذ الإجراء الجماعي");
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkCategoryChange = async () => {
    if (selectedIds.length === 0 || !bulkCategory) return;
    setIsBulkProcessing(true);
    try {
      await api.bulkMediaAction("set_category", selectedIds, bulkCategory);
      showToast(
        "success",
        `تم تحديث تصنيف ${selectedIds.length} عنصر إلى "${bulkCategory}" بنجاح.`
      );
      setSelectedIds([]);
      await fetchMedia();
      await refreshContent();
    } catch (err: any) {
      showToast("error", err.message || "فشل تحديث التصنيف الجماعي");
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Explicit Save Changes Handler
  const handleBatchSave = async () => {
    const pendingItems = mediaList.filter(
      (m) => m._saveStatus === "unsaved" || m._saveStatus === "failed"
    );

    if (pendingItems.length === 0) {
      showToast("info", "جميع الملفات والتعديلات محفوظة بالفعل في التخزين الدائم وقاعدة البيانات.");
      return;
    }

    setIsBatchSaving(true);
    setMediaList((prev) =>
      prev.map((item) =>
        item._saveStatus === "unsaved" || item._saveStatus === "failed"
          ? { ...item, _saveStatus: "saving" }
          : item
      )
    );

    try {
      const res = await api.batchSaveMedia(pendingItems);
      if (res && res.success !== false) {
        setMediaList((prev) =>
          prev.map((item) => ({
            ...item,
            _saveStatus: "saved",
          }))
        );
        showToast("success", "تم حفظ جميع الصور والوسائط بنجاح.");
        await refreshContent();
      } else {
        const failedNames = res.failedItems || [];
        setMediaList((prev) =>
          prev.map((item) =>
            failedNames.includes(item.title || item.name || item.id)
              ? { ...item, _saveStatus: "failed" }
              : { ...item, _saveStatus: "saved" }
          )
        );
        showToast("error", res.message || `فشل حفظ بعض العناصر: ${failedNames.join("، ")}`);
      }
    } catch (err: any) {
      setMediaList((prev) =>
        prev.map((item) =>
          item._saveStatus === "saving" ? { ...item, _saveStatus: "failed" } : item
        )
      );
      showToast("error", err.message || "حدث خطأ أثناء حفظ التعديلات في قاعدة البيانات.");
    } finally {
      setIsBatchSaving(false);
    }
  };

  // Single Item Direct Save
  const handleSingleItemSave = async (item: any) => {
    setMediaList((prev) =>
      prev.map((m) => (m.id === item.id ? { ...m, _saveStatus: "saving" } : m))
    );

    try {
      await api.updateMedia(item.id, {
        title: item.title || item.name,
        category: item.category,
        altText: item.altText,
      });
      setMediaList((prev) =>
        prev.map((m) => (m.id === item.id ? { ...m, _saveStatus: "saved" } : m))
      );
      showToast("success", `تم حفظ التعديلات على "${item.title || item.name}" بنجاح.`);
      await refreshContent();
    } catch (err: any) {
      setMediaList((prev) =>
        prev.map((m) => (m.id === item.id ? { ...m, _saveStatus: "failed" } : m))
      );
      showToast("error", err.message || "فشل حفظ التعديل في قاعدة البيانات.");
    }
  };

  // Open Replace Modal
  const openReplaceModal = (item: any) => {
    setReplaceModalItem(item);
    setReplaceMode("upload");
    setReplaceFile(null);
    setReplacePreviewUrl(null);
    setReplaceSelectedLibraryItem(null);
    setReplaceScope("all");
  };

  const handleModalFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("error", "يرجى اختيار ملف صورة صالح (JPG, PNG, WebP, SVG)");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      showToast("error", "حجم الصورة كبير جداً، يرجى اختيار ملف بحجم أقل من 25 ميغابايت");
      return;
    }

    setReplaceFile(file);
    const preview = URL.createObjectURL(file);
    setReplacePreviewUrl(preview);
  };

  // Execute Replace
  const handleConfirmReplace = async () => {
    if (!replaceModalItem) return;

    if (replaceMode === "upload" && !replaceFile) {
      showToast("error", "يرجى اختيار ملف صورة جديد من جهازك أولاً");
      return;
    }
    if (replaceMode === "library" && !replaceSelectedLibraryItem) {
      showToast("error", "يرجى اختيار صورة بديلة من المكتبة أولاً");
      return;
    }

    setIsSavingReplacement(true);

    try {
      showToast("info", "جاري رفع وحفظ الصورة الجديدة في التخزين الدائم وتحديث الموقع...");

      let payload: FormData | { newUrl: string; scope: string; targetEntityType?: string; targetEntityId?: string };

      if (replaceMode === "upload" && replaceFile) {
        const formData = new FormData();
        formData.append("file", replaceFile);
        formData.append("scope", replaceScope);
        if (replaceScope === "single" && replaceModalItem.entityType && replaceModalItem.entityId) {
          formData.append("targetEntityType", replaceModalItem.entityType);
          formData.append("targetEntityId", replaceModalItem.entityId);
        }
        payload = formData;
      } else {
        payload = {
          newUrl: replaceSelectedLibraryItem.url || replaceSelectedLibraryItem.public_url,
          scope: replaceScope,
          targetEntityType: replaceScope === "single" ? replaceModalItem.entityType : undefined,
          targetEntityId: replaceScope === "single" ? replaceModalItem.entityId : undefined,
        };
      }

      const res = await api.replaceMedia(replaceModalItem.id, payload);

      if (res && res.success !== false) {
        showToast(
          "success",
          `تم استبدال الصورة بنجاح وتحديث ${res.updatedCount || 1} مواضع في الموقع وتثبيتها في Supabase!`
        );
        setReplaceModalItem(null);
        await fetchMedia();
        await refreshContent();
      } else {
        throw new Error(res?.error || "فشل تحديث سجل الصورة في قاعدة البيانات");
      }
    } catch (err: any) {
      showToast(
        "error",
        err.message || "فشلت عملية استبدال الصورة. تم الاحتفاظ بالصورة القديمة دون أي حذف."
      );
    } finally {
      setIsSavingReplacement(false);
    }
  };

  // Upload New Media File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("error", "يرجى اختيار ملف صورة صالح (JPG, PNG, WebP, SVG)");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      showToast("error", "حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 25 ميغابايت");
      return;
    }

    setSelectedFile(file);
    const localUrl = URL.createObjectURL(file);
    setNewImage((prev) => ({
      ...prev,
      title: prev.title || file.name.replace(/\.[^/.]+$/, ""),
      url: localUrl,
    }));
  };

  const handleSaveImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImage.isVideo && !newImage.url && !selectedFile) {
      showToast("error", "يرجى اختيار صورة من جهازك أولاً");
      return;
    }
    if (newImage.isVideo && !newImage.youtubeUrl) {
      showToast("error", "يرجى إدخال رابط الفيديو");
      return;
    }
    if (!newImage.title.trim()) {
      showToast("error", "يرجى إدخال اسم أو وصف للملف");
      return;
    }

    try {
      setIsSubmitting(true);
      let targetUrl = newImage.url;

      if (selectedFile) {
        targetUrl = await uploadOriginalImage(selectedFile, newImage.category);
      } else if (newImage.isVideo) {
        targetUrl = newImage.youtubeUrl;
      }

      await api.uploadMedia({
        title: newImage.title.trim(),
        name: newImage.title.trim(),
        url: targetUrl,
        category: newImage.category,
        isVideo: newImage.isVideo,
        youtubeUrl: newImage.isVideo ? newImage.youtubeUrl : undefined,
        duration: newImage.duration || undefined,
      });

      showToast("success", "تم حفظ جميع الصور والوسائط بنجاح.");
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      setNewImage({ title: "", url: "", category: "عيادة", isVideo: false, youtubeUrl: "", duration: "" });

      await fetchMedia();
      await refreshContent();
    } catch (err: any) {
      showToast("error", err.message || "تعذر رفع وتحفيظ الملف في Supabase. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit Metadata Modal Handlers
  const openEditModal = (item: any) => {
    setEditItem(item);
    setEditForm({
      title: item.title || item.name || "",
      category: item.category || "عيادة",
      altText: item.altText || "",
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;

    setMediaList((prev) =>
      prev.map((m) => (m.id === editItem.id ? { ...m, _saveStatus: "saving" } : m))
    );

    try {
      await api.updateMedia(editItem.id, editForm);
      showToast("success", "تم تحديث بيانات الملف وتثبيتها في قاعدة البيانات بنجاح.");

      setMediaList((prev) =>
        prev.map((m) =>
          m.id === editItem.id
            ? { ...m, ...editForm, name: editForm.title, title: editForm.title, _saveStatus: "saved" }
            : m
        )
      );

      setEditItem(null);
      await refreshContent();
    } catch (err: any) {
      setMediaList((prev) =>
        prev.map((m) => (m.id === editItem.id ? { ...m, _saveStatus: "failed" } : m))
      );
      showToast("error", err.message || "فشل تحديث البيانات في قاعدة البيانات.");
    }
  };

  // Trash & Delete Handlers
  const handleTrashRequest = async (item: any) => {
    if (item.usages && item.usages.length > 0) {
      setDeleteModal({
        isOpen: true,
        item,
        usages: item.usages,
      });
      return;
    }

    try {
      await api.trashMedia(item.id);
      showToast("info", "تم نقل الملف إلى سلة المحذوفات (يمكن استعادته في أي وقت)");
      fetchMedia();
    } catch (err: any) {
      showToast("error", err.message || "فشل نقل الملف إلى سلة المحذوفات");
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await api.restoreMedia(id);
      showToast("success", "تم استرجاع الملف بنجاح إلى مكتبة الوسائط");
      fetchMedia();
    } catch (err: any) {
      showToast("error", err.message || "فشل استرجاع الملف");
    }
  };

  const handlePermanentDelete = async (id: string, force: boolean) => {
    try {
      await api.deleteMedia(id, force, true);
      showToast("info", "تم حذف الملف نهائياً من المكتبة والتخزين الدائم");
      setDeleteModal({ isOpen: false, item: null, usages: [] });
      fetchMedia();
    } catch (err: any) {
      showToast("error", err.message || "فشل حذف الملف نهائياً");
    }
  };

  const handleEmptyTrash = async () => {
    if (
      !window.confirm(
        "هل أنت متأكد من تفريغ سلة المحذوفات بالكامل؟ سيتم حذف جميع الملفات الموجودة فيها نهائياً."
      )
    )
      return;
    try {
      const res = await api.emptyMediaTrash();
      showToast("info", res.message || "تم إفراغ سلة المحذوفات بنجاح");
      fetchMedia();
    } catch (err: any) {
      showToast("error", err.message || "فشل تفريغ سلة المحذوفات");
    }
  };

  return (
    <div className="space-y-5" dir="rtl">
      {/* Top Header & Main Action Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E2EAF0] shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-[#064B82]">
              مكتبة الصور والوسائط المركزية (Persistent Media)
            </h2>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Supabase Storage & Database
            </span>
          </div>
          <p className="text-xs text-[#667788] mt-1">
            إدارة وتغيير واستبدال جميع صور الموقع (الطبيب، الشعار، الأمراض، المناظير، الخدمات، المقالات، السلايدر)
          </p>
        </div>

        {/* Action Buttons: Save All Changes & Upload New Media */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Main "Save All Changes" Button */}
          <button
            type="button"
            onClick={handleBatchSave}
            disabled={isBatchSaving}
            className="inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#2fa84f] hover:bg-[#258a43] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            title="حفظ جميع التغييرات وتثبيتها في Supabase"
          >
            {isBatchSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Save className="w-4 h-4 text-white" />
            )}
            <span>حفظ جميع التغييرات</span>
            {unsavedCount > 0 && (
              <span className="bg-white/25 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                {unsavedCount}
              </span>
            )}
          </button>

          {/* Main "Upload New Media" Button */}
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#064B82] hover:bg-[#0B70B7] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-white" />
            <span>رفع وسائط جديدة</span>
          </button>

          {activeTab === "trash" && mediaList.length > 0 && (
            <button
              type="button"
              onClick={handleEmptyTrash}
              className="inline-flex items-center gap-1.5 py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>إفراغ سلة المحذوفات</span>
            </button>
          )}
        </div>
      </div>

      {/* Multi-Select Action Bar (Shows when items are selected) */}
      {selectedIds.length > 0 && (
        <div className="bg-[#064B82] text-white p-3 rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="bg-white/20 text-white font-bold text-xs px-3 py-1 rounded-lg">
              تم تحديد {selectedIds.length} عنصر
            </span>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-xs text-white/80 hover:text-white underline cursor-pointer"
            >
              إلغاء التحديد
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl">
              <select
                value={bulkCategory}
                onChange={(e) => setBulkCategory(e.target.value)}
                className="bg-transparent text-white text-xs font-bold py-1 px-2 focus:outline-hidden"
              >
                {ALL_CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                  <option key={cat.id} value={cat.id} className="text-slate-800">
                    {cat.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleBulkCategoryChange}
                disabled={isBulkProcessing}
                className="bg-white text-[#064B82] text-xs font-bold px-3 py-1 rounded-lg hover:bg-slate-100 cursor-pointer disabled:opacity-50"
              >
                تطبيق القسم
              </button>
            </div>

            <button
              type="button"
              onClick={handleBulkTrash}
              disabled={isBulkProcessing}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>نقل لسلة المحذوفات</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs, Categories & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2EAF0] shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Main Status Tabs */}
          <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-xl text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-white text-[#064B82] font-bold shadow-xs"
                  : "text-[#667788] hover:text-[#17354F]"
              }`}
            >
              جميع الوسائط
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("image")}
              className={`py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                activeTab === "image"
                  ? "bg-white text-[#064B82] font-bold shadow-xs"
                  : "text-[#667788] hover:text-[#17354F]"
              }`}
            >
              الصور فقط
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("video")}
              className={`py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                activeTab === "video"
                  ? "bg-white text-emerald-700 font-bold shadow-xs"
                  : "text-[#667788] hover:text-[#17354F]"
              }`}
            >
              الفيديوهات الطبية
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("trash")}
              className={`py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                activeTab === "trash"
                  ? "bg-white text-rose-700 font-bold shadow-xs"
                  : "text-[#667788] hover:text-[#17354F]"
              }`}
            >
              سلة المحذوفات
            </button>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث باسم الصورة، المرض، الخدمة، أو الصفحة..."
                className="w-full py-1.5 pl-8 pr-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs focus:ring-2 focus:ring-[#0B70B7]"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            </div>
            <button
              type="button"
              onClick={selectAllVisible}
              className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-[#0c3653] text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1 cursor-pointer"
              title="تحديد الكل"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>{selectedIds.length === mediaList.length ? "إلغاء الكل" : "تحديد الكل"}</span>
            </button>
          </form>
        </div>

        {/* Detailed Category Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-xs pt-2 border-t border-slate-100">
          <span className="text-[#667788] font-bold text-[11px] shrink-0 ml-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> الأقسام:
          </span>
          {ALL_CATEGORIES.map((cat) => {
            const isSelected = categoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id)}
                className={`py-1 px-3 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#064B82] text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-[#667788]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#064B82] mb-2" />
          جاري تحميل الوسائط من التخزين السحابي الدائم...
        </div>
      ) : mediaList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2EAF0] p-12 text-center text-[#667788]">
          <ImageIcon className="w-8 h-8 mx-auto text-[#064B82] mb-3 opacity-60" />
          <p className="font-bold text-sm text-[#17354F]">لا توجد وسائط في هذا القسم</p>
          <p className="text-xs mt-1">يمكنك رفع صور أو فيديوهات جديدة للعيادة في أي وقت</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {mediaList.map((m) => {
            const displayTitle = m.title || m.name || (m.isVideo ? "فيديو طبي" : "صورة طبية");
            const displayDate = m.createdAt || m.uploadedAt || new Date().toISOString();
            const usages = m.usages || [];
            const hasUsages = usages.length > 0;
            const isSelected = selectedIds.includes(m.id);
            const saveStatus = m._saveStatus || "saved";
            const isProtected =
              m.id === "med_1" ||
              m.id === "med_2" ||
              (typeof m.url === "string" &&
                (m.url.includes("dr-abdulbasit") || m.url.includes("clinic-logo")));

            return (
              <div
                key={m.id}
                className={`bg-white rounded-2xl border transition-all shadow-sm overflow-hidden flex flex-col justify-between group relative ${
                  isSelected
                    ? "ring-2 ring-[#0872B9] border-[#0872B9]"
                    : m.status === "trash"
                    ? "border-rose-200 bg-rose-50/10"
                    : "border-[#E2EAF0] hover:border-[#0B70B7]/60 hover:shadow-md"
                }`}
              >
                {/* Checkbox Selector (Top-Right Absolute) */}
                <div className="absolute top-2 right-2 z-20">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelectItem(m.id);
                    }}
                    className="p-1 rounded-lg bg-white/90 shadow-sm hover:bg-white text-[#064B82] cursor-pointer"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-[#0872B9]" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </div>

                {/* Media Thumbnail */}
                <div
                  onClick={() => setPreviewItem(m)}
                  className="aspect-video bg-slate-100 relative overflow-hidden flex items-center justify-center cursor-pointer"
                >
                  {m.isVideo ? (
                    <div className="w-full h-full bg-slate-800 flex flex-col items-center justify-center text-white relative">
                      <Video className="w-8 h-8 text-emerald-400 mb-1" />
                      <span className="text-[10px] bg-black/60 px-2 py-0.5 rounded-full font-mono">
                        {m.videoDuration || "فيديو"}
                      </span>
                    </div>
                  ) : (
                    <img
                      src={m.url || m.public_url || m.publicUrl}
                      alt={displayTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = FALLBACK_SVG;
                      }}
                    />
                  )}

                  {/* Per-Item Save Status Badge (Top-Left) */}
                  <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
                    {saveStatus === "unsaved" && (
                      <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                        <AlertCircle className="w-3 h-3" /> غير محفوظ
                      </span>
                    )}
                    {saveStatus === "saving" && (
                      <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                        <RefreshCw className="w-3 h-3 animate-spin" /> جاري الحفظ...
                      </span>
                    )}
                    {saveStatus === "failed" && (
                      <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                        <XCircle className="w-3 h-3" /> فشل الحفظ
                      </span>
                    )}
                    {saveStatus === "saved" && (
                      <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                        <Check className="w-3 h-3 text-white" /> ✓ محفوظ
                      </span>
                    )}

                    {isProtected && (
                      <span className="bg-purple-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
                        أصل محمي
                      </span>
                    )}
                  </div>

                  {/* Category Pill (Bottom-Right) */}
                  <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                    {m.category || "عام"}
                  </span>
                </div>

                {/* Media Info & Action Buttons */}
                <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h4
                      className="text-xs font-bold text-[#0c3653] line-clamp-1 group-hover:text-[#0872B9] transition-colors"
                      title={displayTitle}
                    >
                      {displayTitle}
                    </h4>

                    {/* Usages Button: "أين تُستخدم هذه الصورة؟" */}
                    <div className="mt-1 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setUsageItem(m)}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors cursor-pointer ${
                          hasUsages
                            ? "bg-blue-50 text-[#0872B9] hover:bg-blue-100 border border-blue-200"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                        title="عرض الأماكن والصفحات التي تستخدم هذه الصورة"
                      >
                        <Link2 className="w-3 h-3" />
                        <span>{hasUsages ? `أين تُستخدم؟ (${usages.length})` : "غير مستخدمة حالياً"}</span>
                      </button>

                      <span className="text-[10px] text-slate-400 font-mono">
                        {m.fileSize || m.file_size || "250 KB"}
                      </span>
                    </div>
                  </div>

                  {/* Primary Change/Replace Button */}
                  {!m.isVideo && m.status !== "trash" && (
                    <button
                      type="button"
                      onClick={() => openReplaceModal(m)}
                      className="w-full py-1.5 px-2.5 bg-[#064B82] hover:bg-[#0872B9] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                      title="تغيير أو استبدال هذه الصورة بملف جديد أو صورة من المكتبة"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                      <span>تغيير / استبدال</span>
                    </button>
                  )}

                  {/* Card Bottom Toolbar */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-xs">
                    {m.status === "trash" ? (
                      <div className="flex items-center justify-between w-full">
                        <button
                          type="button"
                          onClick={() => handleRestore(m.id)}
                          className="py-1 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>استرجاع</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePermanentDelete(m.id, true)}
                          className="py-1 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                          title="حذف نهائي من التخزين وقاعدة البيانات"
                        >
                          حذف نهائي
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-1">
                          {/* Individual Save Button (If Unsaved) */}
                          {saveStatus === "unsaved" && (
                            <button
                              type="button"
                              onClick={() => handleSingleItemSave(m)}
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors cursor-pointer font-bold flex items-center gap-1 text-[11px]"
                              title="حفظ تعديل هذه الصورة فقط"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>حفظ</span>
                            </button>
                          )}

                          {/* Copy URL */}
                          <button
                            type="button"
                            onClick={() => handleCopy(m.id, m.url || m.public_url)}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors cursor-pointer"
                            title="نسخ رابط التخزين الدائم"
                          >
                            {copiedId === m.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Edit Metadata */}
                          <button
                            type="button"
                            onClick={() => openEditModal(m)}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors cursor-pointer"
                            title="تعديل اسم أو قسم الملف"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Move to Trash */}
                        <button
                          type="button"
                          onClick={() => handleTrashRequest(m)}
                          className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="نقل إلى سلة المحذوفات"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DEDICATED CHANGE / REPLACE MODAL (تغيير واستبدال الصورة مع المعاينة) */}
      {/* ========================================================================= */}
      {replaceModalItem && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-100 text-right max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0872B9] flex items-center justify-center">
                  <ArrowLeftRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#064B82] text-base">
                    تغيير واستبدال الصورة في الموقع
                  </h3>
                  <p className="text-xs text-slate-500">
                    العنصر: {replaceModalItem.title || replaceModalItem.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReplaceModalItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher: Upload from Device VS Select from Library */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setReplaceMode("upload")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  replaceMode === "upload"
                    ? "bg-white text-[#064B82] shadow-sm"
                    : "text-slate-600 hover:text-[#064B82]"
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>رفع صورة جديدة من جهازك</span>
              </button>
              <button
                type="button"
                onClick={() => setReplaceMode("library")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  replaceMode === "library"
                    ? "bg-white text-[#064B82] shadow-sm"
                    : "text-slate-600 hover:text-[#064B82]"
                }`}
              >
                <FolderOpen className="w-4 h-4" />
                <span>اختيار صورة أخرى من المكتبة</span>
              </button>
            </div>

            {/* Mode 1: Upload from device */}
            {replaceMode === "upload" && (
              <div className="space-y-3">
                <input
                  type="file"
                  ref={modalReplaceInputRef}
                  accept="image/*"
                  onChange={handleModalFileSelect}
                  className="hidden"
                />
                <div
                  onClick={() => modalReplaceInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-[#0872B9] bg-slate-50 hover:bg-blue-50/40 rounded-2xl p-6 text-center cursor-pointer transition-all"
                >
                  <Upload className="w-8 h-8 text-[#0872B9] mx-auto mb-2" />
                  <p className="text-xs font-bold text-[#0c3653]">
                    اضغط لاختيار صورة جديدة من جهازك (كمبيوتر أو هاتف)
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    يدعم JPG, PNG, WebP بجودتها الكاملة 100% مع توليد اسم فريد للتخزين الدائم
                  </p>
                  {replaceFile && (
                    <div className="mt-2 inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-lg">
                      <Check className="w-3.5 h-3.5" />
                      <span>تم تحديد الملف: {replaceFile.name}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mode 2: Select from Library */}
            {replaceMode === "library" && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#0c3653]">
                  اختر صورة بديلة من وسائط العيادة:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200 custom-scrollbar">
                  {mediaList
                    .filter((m) => !m.isVideo && m.status !== "trash" && m.id !== replaceModalItem.id)
                    .map((item) => {
                      const isItemChosen = replaceSelectedLibraryItem?.id === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            setReplaceSelectedLibraryItem(item);
                            setReplacePreviewUrl(item.url || item.public_url);
                          }}
                          className={`aspect-video rounded-xl overflow-hidden border-2 cursor-pointer transition-all relative ${
                            isItemChosen
                              ? "border-[#2fa84f] ring-2 ring-[#2fa84f]/40 scale-95"
                              : "border-transparent hover:border-[#0872B9]"
                          }`}
                        >
                          <img
                            src={item.url || item.public_url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          {isItemChosen && (
                            <div className="absolute inset-0 bg-[#2fa84f]/30 flex items-center justify-center text-white">
                              <Check className="w-5 h-5 drop-shadow-md" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Before-and-After Live Preview */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {/* Current Image */}
              <div className="space-y-1 text-center">
                <span className="text-[11px] font-bold text-slate-500">الصورة الحالية</span>
                <div className="h-32 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                  <img
                    src={replaceModalItem.url || replaceModalItem.public_url}
                    alt="Current"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Proposed New Image */}
              <div className="space-y-1 text-center">
                <span className="text-[11px] font-bold text-[#0872B9]">الصورة الجديدة المقترحة</span>
                <div className="h-32 rounded-2xl bg-slate-100 border-2 border-dashed border-[#0872B9] overflow-hidden flex items-center justify-center">
                  {replacePreviewUrl ? (
                    <img
                      src={replacePreviewUrl}
                      alt="New Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-slate-400 text-xs flex flex-col items-center">
                      <ImageIcon className="w-6 h-6 mb-1 text-slate-300" />
                      <span>اختر صورة للمعاينة</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Scope Selection (Global Replace VS Single Slot Replace) */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-[#0c3653]">
                نطاق تطبيق الاستبدال في الموقع:
              </label>
              <div className="space-y-2">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="replaceScope"
                    value="all"
                    checked={replaceScope === "all"}
                    onChange={() => setReplaceScope("all")}
                    className="mt-1 text-[#0872B9] focus:ring-[#0872B9]"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-[#0c3653] block">
                      استبدال في جميع الأماكن التي تستخدم هذه الصورة (تحديث شامل)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      سيتم تحديث كافة صفحات ومكونات الموقع التي تحتوي على هذا الملف تلقائياً
                    </span>
                  </div>
                </label>

                {replaceModalItem.entityType && (
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="replaceScope"
                      value="single"
                      checked={replaceScope === "single"}
                      onChange={() => setReplaceScope("single")}
                      className="mt-1 text-[#0872B9] focus:ring-[#0872B9]"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-[#0c3653] block">
                        استبدال في هذا الموضع فقط ({replaceModalItem.title})
                      </span>
                      <span className="text-[11px] text-slate-500">
                        سيتم تحديث هذا العنصر الفردي فقط دون المساس بالمواضع الأخرى
                      </span>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReplaceModalItem(null)}
                disabled={isSavingReplacement}
                className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmReplace}
                disabled={isSavingReplacement || (!replaceFile && !replaceSelectedLibraryItem)}
                className="py-2 px-5 bg-[#2fa84f] hover:bg-[#258a43] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isSavingReplacement ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Save className="w-4 h-4 text-white" />
                )}
                <span>حفظ التغيير والتحديث في الموقع</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. USAGE INSPECTOR MODAL ("أين تُستخدم هذه الصورة؟") */}
      {/* ========================================================================= */}
      {usageItem && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-[#064B82] text-sm flex items-center gap-2">
                <Link2 className="w-4 h-4 text-[#0872B9]" />
                <span>مواضع استخدام الصورة في الموقع</span>
              </h3>
              <button
                onClick={() => setUsageItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                <img
                  src={usageItem.url || usageItem.public_url}
                  alt={usageItem.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-xs">
                <h4 className="font-bold text-[#0c3653]">{usageItem.title || usageItem.name}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">القسم: {usageItem.category || "عام"}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#0c3653]">الصفحات والمكونات المرتبطة بها:</h4>
              {usageItem.usages && usageItem.usages.length > 0 ? (
                <ul className="space-y-2">
                  {usageItem.usages.map((use: string, i: number) => (
                    <li
                      key={i}
                      className="p-2.5 bg-blue-50/70 text-[#0c3653] text-xs font-bold rounded-xl border border-blue-100 flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#0872B9] shrink-0" />
                      <span>{use}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center bg-slate-50 rounded-xl text-xs text-slate-500">
                  هذه الصورة مخزنة في مكتبة الوسائط ولكنها غير مرتبطة بأي صفحة حالياً.
                </div>
              )}
            </div>

            <div className="pt-3 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setUsageItem(null)}
                className="py-1.5 px-4 bg-[#064B82] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. UPLOAD NEW MEDIA MODAL */}
      {/* ========================================================================= */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-[#064B82] text-base flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#0872B9]" />
                <span>رفع وإضافة وسائط جديدة للتخزين الدائم</span>
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveImage} className="space-y-4">
              {/* Type Switcher */}
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setNewImage((prev) => ({ ...prev, isVideo: false }))}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    !newImage.isVideo ? "bg-white text-[#064B82] shadow-xs" : "text-slate-500"
                  }`}
                >
                  صورة طبية
                </button>
                <button
                  type="button"
                  onClick={() => setNewImage((prev) => ({ ...prev, isVideo: true }))}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    newImage.isVideo ? "bg-white text-emerald-700 shadow-xs" : "text-slate-500"
                  }`}
                >
                  فيديو يوتيوب
                </button>
              </div>

              {!newImage.isVideo ? (
                /* Image File Picker */
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#0c3653]">
                    اختر صورة من جهازك
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="w-full text-xs text-slate-500 file:mr-0 file:ml-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-[#0872B9] hover:file:bg-blue-100 cursor-pointer"
                  />
                  {newImage.url && (
                    <div className="w-full h-32 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 mt-2">
                      <img
                        src={newImage.url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              ) : (
                /* Video Youtube Link */
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#0c3653]">
                    رابط فيديو يوتيوب الطبي
                  </label>
                  <input
                    type="url"
                    value={newImage.youtubeUrl}
                    onChange={(e) =>
                      setNewImage((prev) => ({ ...prev, youtubeUrl: e.target.value }))
                    }
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs focus:ring-2 focus:ring-[#0B70B7]"
                  />
                </div>
              )}

              {/* Title Input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0c3653]">اسم أو عنوان الملف</label>
                <input
                  type="text"
                  value={newImage.title}
                  onChange={(e) => setNewImage((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="مثال: فحص جدار المعدة بالمنظار"
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs focus:ring-2 focus:ring-[#0B70B7]"
                  required
                />
              </div>

              {/* Category Select */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0c3653]">قسم الوسائط</label>
                <select
                  value={newImage.category}
                  onChange={(e) => setNewImage((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs focus:ring-2 focus:ring-[#0B70B7]"
                >
                  {ALL_CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Form Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2 px-5 bg-[#064B82] hover:bg-[#0B70B7] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>حفظ وإضافة للتخزين الدائم</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. EDIT METADATA MODAL */}
      {/* ========================================================================= */}
      {editItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-[#064B82] text-sm flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#0872B9]" />
                <span>تعديل بيانات ملف الوسائط</span>
              </h3>
              <button
                onClick={() => setEditItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#0c3653] mb-1">اسم أو عنوان الملف</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs focus:ring-2 focus:ring-[#0B70B7]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0c3653] mb-1">القسم</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs focus:ring-2 focus:ring-[#0B70B7]"
                >
                  {ALL_CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0c3653] mb-1">النص البديل (Alt Text)</label>
                <input
                  type="text"
                  value={editForm.altText}
                  onChange={(e) => setEditForm({ ...editForm, altText: e.target.value })}
                  className="w-full py-2 px-3 bg-[#F8FAFC] border border-[#E2EAF0] rounded-xl text-xs focus:ring-2 focus:ring-[#0B70B7]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditItem(null)}
                  className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="py-1.5 px-4 bg-[#064B82] hover:bg-[#0B70B7] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  حفظ البيانات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. PREVIEW MODAL */}
      {/* ========================================================================= */}
      {previewItem && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 space-y-4 shadow-2xl border border-slate-100 text-right overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-[#064B82] text-sm line-clamp-1">
                {previewItem.title || previewItem.name}
              </h3>
              <button
                onClick={() => setPreviewItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-96 bg-slate-100 rounded-2xl overflow-hidden flex items-center justify-center">
              {previewItem.isVideo ? (
                <iframe
                  src={previewItem.youtubeUrl?.replace("watch?v=", "embed/")}
                  className="w-full h-80 rounded-2xl"
                  allowFullScreen
                />
              ) : (
                <img
                  src={previewItem.url || previewItem.public_url}
                  alt={previewItem.title}
                  className="w-full h-full object-contain max-h-80"
                />
              )}
            </div>

            <div className="text-xs space-y-1 text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <p>
                <span className="font-bold text-[#0c3653]">الرابط الدائم:</span>{" "}
                <span className="font-mono text-[11px] break-all">{previewItem.url || previewItem.public_url}</span>
              </p>
              <p>
                <span className="font-bold text-[#0c3653]">مسار التخزين:</span>{" "}
                <span className="font-mono text-[11px]">{previewItem.storage_path || previewItem.storagePath}</span>
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="py-1.5 px-4 bg-[#064B82] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
