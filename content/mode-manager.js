// Style Scratcher v4.0.0 - Mode Manager (Inspect vs Edit Studio, Multi-Select & DOM Reorder)

class ModeManager {
  constructor(options = {}) {
    this.mode = 'inspect'; // 'inspect' | 'edit'
    this.selectedElements = []; // Array of Elements for multi-select
    this.onModeChange = options.onModeChange || (() => {});
    this.onSelectionChange = options.onSelectionChange || (() => {});
  }

  getMode() {
    return this.mode;
  }

  isInspectMode() {
    return this.mode === 'inspect';
  }

  isEditMode() {
    return this.mode === 'edit';
  }

  setMode(newMode) {
    if (newMode !== 'inspect' && newMode !== 'edit') return;
    this.mode = newMode;
    // When switching modes, adjust state
    if (this.mode === 'inspect') {
      // Keep at most 1 primary selected element
      if (this.selectedElements.length > 1) {
        this.selectedElements = [this.selectedElements[0]];
      }
    }
    this.onModeChange(this.mode);
    this.onSelectionChange(this.selectedElements);
  }

  toggleMode() {
    this.setMode(this.mode === 'inspect' ? 'edit' : 'inspect');
    return this.mode;
  }

  getSelectedElements() {
    return [...this.selectedElements];
  }

  getPrimaryElement() {
    return this.selectedElements.length > 0 ? this.selectedElements[0] : null;
  }

  select(element) {
    this.setSelection(element, false);
  }

  toggleSelect(element) {
    this.setSelection(element, true);
  }

  setSelection(element, isMultiSelect = false) {
    if (!element || (typeof Element !== 'undefined' && !(element instanceof Element))) {
      if (!element) {
        this.clearSelection();
        return;
      }
    }

    if (!isMultiSelect || this.mode === 'inspect') {
      this.selectedElements = [element];
    } else {
      // Toggle element in multi-select list
      const idx = this.selectedElements.indexOf(element);
      if (idx > -1) {
        this.selectedElements.splice(idx, 1);
      } else {
        this.selectedElements.push(element);
      }
    }

    this.onSelectionChange(this.selectedElements);
  }

  clearSelection() {
    this.selectedElements = [];
    this.onSelectionChange(this.selectedElements);
  }

  // --- DOM Element Reordering (Move Up / Move Down among siblings) ---

  /**
   * Move element backward (before previous element sibling)
   * @param {Element} element 
   * @returns {boolean} true if moved
   */
  moveUp(element) {
    const target = element || this.getPrimaryElement();
    if (!target || !target.parentNode) return false;

    const prev = target.previousElementSibling;
    if (prev) {
      target.parentNode.insertBefore(target, prev);
      this.onSelectionChange(this.selectedElements);
      return true;
    }
    return false;
  }

  /**
   * Move element forward (after next element sibling)
   * @param {Element} element 
   * @returns {boolean} true if moved
   */
  moveDown(element) {
    const target = element || this.getPrimaryElement();
    if (!target || !target.parentNode) return false;

    const next = target.nextElementSibling;
    if (next) {
      // Insert after next = insertBefore next.nextSibling
      target.parentNode.insertBefore(target, next.nextSibling);
      this.onSelectionChange(this.selectedElements);
      return true;
    }
    return false;
  }

  /**
   * Duplicate target element
   * @param {Element} element 
   * @returns {Element|null} cloned element
   */
  duplicate(element) {
    const target = element || this.getPrimaryElement();
    if (!target || !target.parentNode) return null;

    const clone = target.cloneNode(true);
    target.parentNode.insertBefore(clone, target.nextSibling);
    this.setSelection(clone, false);
    return clone;
  }

  duplicateElement(element) {
    return this.duplicate(element);
  }

  /**
   * Remove target element from DOM
   * @param {Element} element 
   * @returns {boolean}
   */
  removeElement(element) {
    const target = element || this.getPrimaryElement();
    if (!target || !target.parentNode) return false;

    const parent = target.parentNode;
    parent.removeChild(target);
    this.clearSelection();
    return true;
  }
}

if (typeof window !== 'undefined') {
  window.ModeManager = ModeManager;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ModeManager;
}
