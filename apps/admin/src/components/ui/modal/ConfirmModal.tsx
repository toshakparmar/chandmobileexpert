import React from "react";
import { Modal } from "./index";
import Button from "../button/Button";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[400px] p-6 sm:p-8">
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {message}
        </p>
        <div className="mt-4 flex items-center justify-end gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            size="sm"
            variant="primary"
            className={
              isDestructive
                ? "bg-red-600 border-red-600 hover:bg-red-700 text-white"
                : ""
            }
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
