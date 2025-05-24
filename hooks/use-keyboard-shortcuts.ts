import { useEffect, useCallback, useRef } from "react"
import { useMapEditor } from "@/context/map-editor-context"
import type { MapElement } from "@/types"

export function useKeyboardShortcuts() {
  const { selectedElement, removeElement, addElement, setSelectedElement, isEditingFootprint } = useMapEditor()

  // Use a ref to store the copied element
  const copiedElementRef = useRef<MapElement | null>(null)

  // Delete selected element
  const handleDelete = useCallback(() => {
    if (selectedElement && !isEditingFootprint) {
      removeElement(selectedElement.id)
    }
  }, [selectedElement, removeElement, isEditingFootprint])

  // Copy selected element
  const handleCopy = useCallback(() => {
    if (selectedElement && !isEditingFootprint) {
      copiedElementRef.current = { ...selectedElement }
    }
  }, [selectedElement, isEditingFootprint])

  // Duplicate selected element
  const handleDuplicate = useCallback(() => {
    if (selectedElement && !isEditingFootprint) {
      // Create a new element based on the selected one
      const newElement: MapElement = {
        ...selectedElement,
        id: `new_element-${Date.now()}`, // Generate a new unique ID
        x: selectedElement.x + 20, // Offset slightly to make it visible
        y: selectedElement.y + 20,
        name: `${selectedElement.name} (Copy)`,
      }

      addElement(newElement)
      setSelectedElement(newElement) // Select the new element
    }
  }, [selectedElement, addElement, setSelectedElement, isEditingFootprint])

  // Paste copied element
  const handlePaste = useCallback(() => {
    if (copiedElementRef.current && !isEditingFootprint) {
      const newElement: MapElement = {
        ...copiedElementRef.current,
        id: `new_element-${Date.now()}`, // Generate a new unique ID
        x: copiedElementRef.current.x + 20, // Offset slightly
        y: copiedElementRef.current.y + 20,
        name: `${copiedElementRef.current.name} (Copy)`,
      }

      addElement(newElement)
      setSelectedElement(newElement) // Select the new element
    }
  }, [addElement, setSelectedElement, isEditingFootprint])

  // Set up keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if we're in an input field or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return
      }

      // Delete key
      if (e.key === "Delete" || e.key === "Backspace") {
        handleDelete()
      }

      // Ctrl+C (Copy)
      if (e.ctrlKey && e.key === "c") {
        handleCopy()
        e.preventDefault() // Prevent browser's copy behavior
      }

      // Ctrl+V (Paste)
      if (e.ctrlKey && e.key === "v") {
        handlePaste()
        e.preventDefault() // Prevent browser's paste behavior
      }

      // Ctrl+D (Duplicate)
      if (e.ctrlKey && e.key === "d") {
        handleDuplicate()
        e.preventDefault() // Prevent browser's bookmark behavior
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleDelete, handleCopy, handlePaste, handleDuplicate])

  return {
    handleDelete,
    handleCopy,
    handlePaste,
    handleDuplicate,
    hasCopiedElement: !!copiedElementRef.current,
  }
}
