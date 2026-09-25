import * as React from "react";
import { UploadCloud, X, CheckCircle2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const FileUploadCard = React.forwardRef(function FileUploadCard(
  {
    className,
    files = [],
    onFilesChange,
    onFileRemove,
    onSubmit,          // ✅ NEW
    onClose,
    ...props
  },
  ref
) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false); // ✅ NEW
  const fileInputRef = React.useRef(null);

  /* ---------------- Drag & Drop ---------------- */
  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length) onFilesChange?.(droppedFiles);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length) {
      onFilesChange?.(selectedFiles);
    }
    // Clear the input value so the same file can be selected again
    e.target.value = null;
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  /* ---------------- Submit Logic ---------------- */
  const handleSubmit = async () => {
    if (!files.length || !onSubmit) return;

    try {
      setIsSubmitting(true);
      // ✅ Send ALL files → parent decides single vs multiple
      await onSubmit(files);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------- Helpers ---------------- */
  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const getProgressColor = (status) => {
    if (status === "uploaded") return "bg-green-500";
    if (status === "error") return "bg-red-500";
    return "bg-blue-500";
  };

  /* ---------------- Animations ---------------- */
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };
  const fileItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <motion.div
      ref={ref}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3 }}
      className={cn(
        "w-full max-w-lg bg-white rounded-xl shadow-gray-500 shadow-2xl",
        className
      )}
      {...props}
    >
      {/* ---------------- Header ---------------- */}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-muted">
              <UploadCloud className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Upload files</h3>
              <p className="text-sm text-muted-foreground">
                Select one or multiple files
              </p>
            </div>
          </div>

          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-8 h-8"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* ---------------- Drop Zone ---------------- */}
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={triggerFileSelect}
          className={cn(
            "mt-6 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragging
              ? "border-primary bg-primary/10"
              : "border-muted-foreground/30 hover:border-primary/50"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          <UploadCloud className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="font-semibold">Click or drag files here</p>
          <p className="text-xs text-muted-foreground mt-1">
            Supports single & multiple files
          </p>
        </div>
      </div>

      {/* ---------------- File List ---------------- */}
      {files.length > 0 && (
        <div className="p-6 border-t">
          <ul className="space-y-4">
            <AnimatePresence>
              {files.map((file) => (
                <motion.li
                  key={file.id}
                  variants={fileItemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  layout
                  className="flex items-center justify-between gap-3"
                >
                  {/* File Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="min-w-[40px] w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 shadow-md overflow-hidden">
                      <span className="truncate px-1">
                        {file.file.name.split('.').pop()?.substring(0, 4).toUpperCase() || "FILE"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate pr-4">
                        {file.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {file.status === "uploading"
                          ? `${Math.round(file.progress)}% • Uploading...`
                          : file.status === "error"
                            ? "Upload failed"
                            : formatFileSize(file.file.size)}
                      </p>
                      <div className="h-1.5 bg-gray-200 rounded-full mt-1.5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          className={cn(
                            "h-full transition-colors",
                            getProgressColor(file.status)
                          )}
                          animate={{
                            width:
                              file.status === "uploaded"
                                ? "100%"
                                : `${file.progress}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {file.status === "uploaded" && (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onFileRemove?.(file.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          {/* ---------------- Submit Button --------------- */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                files.some((f) => f.status === "uploading")
              }
              className={`
      flex items-center gap-2
      rounded-md px-5 py-2.5
      text-sm font-semibold text-white
      shadow-md transition
      ${isSubmitting || files.some((f) => f.status === "uploading")
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gray-900 hover:bg-gray-800"
                }
    `}
            >
              {isSubmitting
                ? "Uploading..."
                : files.length === 1
                  ? "Submit"
                  : `Upload ${files.length} Files`}
            </button>
          </div>

        </div>
      )}
    </motion.div>
  );
});
