import React from "react";
import { Keyboard, X } from "lucide-react";

/**
 * Modal component showing all available keyboard shortcuts
 */
const KeyboardShortcutsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { category: "Code Execution", items: [
      { keys: ["Ctrl", "Enter"], action: "Run Code" },
      { keys: ["Ctrl", "Shift", "Enter"], action: "Submit Code" },
    ]},
    { category: "Editor", items: [
      { keys: ["Ctrl", "Shift", "R"], action: "Reset Code to Default" },
      { keys: ["Ctrl", "S"], action: "Save Code (auto-saved)" },
    ]},
    { category: "Navigation", items: [
      { keys: ["Ctrl", "K"], action: "Open Command Palette" },
      { keys: ["?"], action: "Show Keyboard Shortcuts" },
      { keys: ["Escape"], action: "Close Modal" },
    ]},
  ];

  const renderKey = (key) => (
    <kbd key={key} className="kbd kbd-sm bg-base-200 border-base-300">
      {key === "Ctrl" ? (navigator.platform.includes("Mac") ? "⌘" : "Ctrl") : key}
    </kbd>
  );

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Keyboard className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-bold text-xl">Keyboard Shortcuts</h3>
          </div>
          <button 
            className="btn btn-ghost btn-sm btn-circle"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-6">
          {shortcuts.map((category) => (
            <div key={category.category}>
              <h4 className="text-sm font-bold text-base-content/60 uppercase tracking-wider mb-3">
                {category.category}
              </h4>
              <div className="space-y-2">
                {category.items.map((shortcut, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-base-200/50 rounded-lg"
                  >
                    <span className="text-sm font-medium">{shortcut.action}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, i) => (
                        <React.Fragment key={i}>
                          {renderKey(key)}
                          {i < shortcut.keys.length - 1 && (
                            <span className="text-base-content/40 text-xs mx-0.5">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-base-content/10">
          <p className="text-xs text-base-content/50 text-center">
            Press <kbd className="kbd kbd-xs">?</kbd> anywhere to show this dialog
          </p>
        </div>
      </div>
      <div 
        className="modal-backdrop bg-black/50" 
        onClick={onClose}
      />
    </div>
  );
};

export default KeyboardShortcutsModal;
