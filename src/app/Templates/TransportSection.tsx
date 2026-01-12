"use client";

import React, { useState } from 'react';
import { Link as LinkIcon } from 'lucide-react';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import type { TransportSectionProps, TransportTable, TransportRow } from '../types/TransportTypes';

/**
 * Transport Section Template Component
 * 
 * A template for transportation information with:
 * - Header with car icon
 * - Multiple tables with customizable background colors (dark blue, dark red, pink)
 * - Dynamic columns with FROM → TO route display
 * - Default columns: day, date, from, to, description, car type
 * - Notes with icon after rows
 * - Inline add/edit forms with better UX
 * - RTL/LTR support for Arabic and English
 * - Enhanced UI with perfect layout and responsive design
 */

const TransportSection: React.FC<TransportSectionProps> = ({
  tables = [],
  title,
  showTitle = true,
  direction = "rtl",
  language = "ar",
  editable = false,
  id,
  onEditRow,
  onRemoveRow,
  onAddRow,
  onEditTable,
  onDeleteTable,
  onEditSection,
  onDeleteSection,
  className = "",
  style
}) => {
  // Ensure sectionIdValue is always a string
  const sectionIdValue = id ? String(id) : undefined;
  
  // State for delete modal
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<{
    type: 'section' | 'table' | 'row',
    tableIndex?: number,
    rowIndex?: number
  } | null>(null);
  
  // State for add/edit row form
  const [editingRow, setEditingRow] = useState<{
    tableIndex: number;
    rowIndex: number;
  } | null>(null);
  
  const [addingRow, setAddingRow] = useState<{
    tableIndex: number;
  } | null>(null);
  
  const [formData, setFormData] = useState<Partial<TransportRow>>({
    day: '',
    date: '',
    from: '',
    to: '',
    fromLink: '',
    toLink: '',
    description: '',
    carType: '',
    note: ''
  });
  
  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    
    if (deleteTarget.type === 'section' && onDeleteSection) {
      onDeleteSection();
    } else if (deleteTarget.type === 'table' && deleteTarget.tableIndex !== undefined && onDeleteTable) {
      onDeleteTable(deleteTarget.tableIndex);
    } else if (deleteTarget.type === 'row' && deleteTarget.tableIndex !== undefined && deleteTarget.rowIndex !== undefined && onRemoveRow) {
      onRemoveRow(deleteTarget.tableIndex, deleteTarget.rowIndex);
    }
    
    setDeleteTarget(null);
    setShowDeleteModal(false);
  };
  
  // Set default values based on language
  const defaultTitle = title || (language === 'ar' ? 'المواصلات' : 'Transportation');
  
  // Default column labels
  const getDefaultColumnLabels = () => {
    if (language === 'ar') {
      return {
        day: "يوم",
        date: "التاريخ",
        from: "من",
        to: "إلى",
        description: "الوصف",
        carType: "نوع السياره"
      };
    } else {
      return {
        day: "Day",
        date: "Date",
        from: "From",
        to: "To",
        description: "Description",
        carType: "Car Type"
      };
    }
  };

  const defaultColumnLabels = getDefaultColumnLabels();

  // Get background color classes
  const getBackgroundColorClass = (color: 'dark-blue' | 'dark-red' | 'pink') => {
    switch (color) {
      case 'dark-blue':
        return 'bg-[#1E3A8A]';
      case 'dark-red':
        return 'bg-[#991B1B]';
      case 'pink':
        return 'bg-[#EC4899]';
      default:
        return 'bg-[#1E3A8A]';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      // Format as dd/mm/yyyy (Gregorian/Melady calendar)
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  // Get column label - use custom label if available, otherwise use default
  const getColumnLabel = (columnKey: string, customLabel?: string) => {
    if (customLabel) return customLabel;
    return defaultColumnLabels[columnKey as keyof typeof defaultColumnLabels] || columnKey;
  };
  
  // Handle start editing a row
  const handleStartEditRow = (tableIndex: number, rowIndex: number) => {
    const row = tables[tableIndex].rows[rowIndex];
    setFormData({
      day: row.day || '',
      date: row.date || '',
      from: row.from || '',
      to: row.to || '',
      fromLink: row.fromLink || '',
      toLink: row.toLink || '',
      description: row.description || '',
      carType: row.carType || '',
      note: row.note || ''
    });
    setEditingRow({ tableIndex, rowIndex });
    setAddingRow(null);
  };
  
  // Handle start adding a row
  const handleStartAddRow = (tableIndex: number) => {
    setFormData({
      day: '',
      date: '',
      from: '',
      to: '',
      fromLink: '',
      toLink: '',
      description: '',
      carType: '',
      note: ''
    });
    setAddingRow({ tableIndex });
    setEditingRow(null);
  };
  
  // Handle form input change
  const handleFormChange = (field: keyof TransportRow, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // Handle save row (edit or add)
  const handleSaveRow = () => {
    if (editingRow) {
      // Edit existing row
      if (onEditRow) {
        onEditRow(editingRow.tableIndex, editingRow.rowIndex);
      }
      setEditingRow(null);
    } else if (addingRow) {
      // Add new row
      if (onAddRow) {
        onAddRow(addingRow.tableIndex);
      }
      setAddingRow(null);
    }
    setFormData({
      day: '',
      date: '',
      from: '',
      to: '',
      description: '',
      carType: '',
      note: ''
    });
  };
  
  // Handle cancel form
  const handleCancelForm = () => {
    setEditingRow(null);
    setAddingRow(null);
    setFormData({
      day: '',
      date: '',
      from: '',
      to: '',
      fromLink: '',
      toLink: '',
      description: '',
      carType: '',
      note: ''
    });
  };
  
  // Render form row
  const renderFormRow = (tableIndex: number, bgColorClass: string, columnsCount: number) => {
    const isEditing = editingRow !== null;
    const title = isEditing 
      ? (language === 'ar' ? 'تعديل الصف' : 'Edit Row')
      : (language === 'ar' ? 'إضافة صف جديد' : 'Add New Row');
    
    return (
      <tr className="bg-blue-50 border-2 border-blue-300">
        <td colSpan={(editable ? 1 : 0) + columnsCount} className="px-4 py-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {title}
              </h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Day */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {getColumnLabel('day')}
                </label>
                <input
                  type="text"
                  value={formData.day || ''}
                  onChange={(e) => handleFormChange('day', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder={language === 'ar' ? 'مثال: اليوم الأول' : 'e.g., Day 1'}
                />
              </div>
              
              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {getColumnLabel('date')}
                </label>
                <input
                  type="date"
                  value={formData.date || ''}
                  onChange={(e) => handleFormChange('date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              
              {/* From */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {getColumnLabel('from')} 📍
                </label>
                <input
                  type="text"
                  value={formData.from || ''}
                  onChange={(e) => handleFormChange('from', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder={language === 'ar' ? 'مثال: المطار' : 'e.g., Airport'}
                />
              </div>
              
              {/* To */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {getColumnLabel('to')} 🎯
                </label>
                <input
                  type="text"
                  value={formData.to || ''}
                  onChange={(e) => handleFormChange('to', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder={language === 'ar' ? 'مثال: الفندق' : 'e.g., Hotel'}
                />
              </div>
              
              {/* From Link (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {language === 'ar' ? 'رابط من' : 'From Link'} 🔗 (Optional)
                </label>
                <input
                  type="url"
                  value={formData.fromLink || ''}
                  onChange={(e) => handleFormChange('fromLink', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder={language === 'ar' ? 'رابط الموقع' : 'Location link'}
                />
              </div>
              
              {/* To Link (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {language === 'ar' ? 'رابط إلى' : 'To Link'} 🔗 (Optional)
                </label>
                <input
                  type="url"
                  value={formData.toLink || ''}
                  onChange={(e) => handleFormChange('toLink', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder={language === 'ar' ? 'رابط الموقع' : 'Location link'}
                />
              </div>
              
              {/* Car Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {getColumnLabel('carType')} 🚗
                </label>
                <input
                  type="text"
                  value={formData.carType || ''}
                  onChange={(e) => handleFormChange('carType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder={language === 'ar' ? 'مثال: فان' : 'e.g., Van'}
                />
              </div>
              
              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {getColumnLabel('description')} (Optional)
                </label>
                <input
                  type="text"
                  value={formData.description || ''}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder={language === 'ar' ? 'وصف إضافي' : 'Additional description'}
                />
              </div>
              
              {/* Note */}
              <div className="lg:col-span-1">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {language === 'ar' ? 'ملاحظة' : 'Note'} (Optional)
                </label>
                <input
                  type="text"
                  value={formData.note || ''}
                  onChange={(e) => handleFormChange('note', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder={language === 'ar' ? 'ملاحظة خاصة' : 'Special note'}
                />
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={handleCancelForm}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 text-sm font-medium flex items-center gap-2"
                type="button"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleSaveRow}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 text-sm font-medium flex items-center gap-2 shadow-md hover:shadow-lg"
                type="button"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {language === 'ar' ? 'حفظ' : 'Save'}
              </button>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div 
      className={`w-full mb-8 ${className} no-break`} 
      style={style} 
      dir={direction} 
      data-transport-section-id={sectionIdValue}
    >
      {/* Edit/Delete Buttons - Always visible when editable, regardless of showTitle */}
      {editable && (
        <div className={`mb-4 flex ${direction === 'rtl' ? 'justify-start' : 'justify-end'} relative`}>
          <div className={`flex gap-2 z-0 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onEditSection) {
                  onEditSection();
                }
              }}
              data-action="edit-section"
              data-transport-section-id={sectionIdValue}
              className="p-2.5 bg-[#1E3A8A] text-white rounded-full hover:bg-[#1E40AF] transition-all duration-200 shadow-md hover:shadow-lg hover:scale-110 cursor-pointer"
              title={language === 'ar' ? 'تعديل القسم' : 'Edit Section'}
              type="button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDeleteTarget({type: 'section'});
                setShowDeleteModal(true);
              }}
              data-action="delete-section"
              data-transport-section-id={sectionIdValue}
              className="p-2.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-110 cursor-pointer"
              title={language === 'ar' ? 'حذف القسم' : 'Delete Section'}
              type="button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header with Title and Icon */}
      {showTitle && (
        <div className="flex items-center justify-center mb-6">
          <div className={`bg-[#991B1B] text-white px-10 py-3.5 rounded-full flex items-center gap-3.5 shadow-lg hover:shadow-xl transition-shadow duration-300 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
            <h2 className="text-xl md:text-2xl font-bold tracking-wide">{defaultTitle}</h2>
            <div className="bg-white rounded-full p-2.5 shadow-inner">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-6 h-6 text-[#991B1B]"
              >
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Transport Tables */}
      <div className="space-y-6">
        {tables.map((table, tableIndex) => {
          const bgColorClass = getBackgroundColorClass(table.backgroundColor);
          
          return (
            <div key={table.id || tableIndex} className="overflow-hidden rounded-2xl shadow-xl border border-gray-200 bg-white">
              {/* Table Title Header */}
              {table.title && (
                <div className={`${bgColorClass} text-white px-6 py-3 relative ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                  <h3 className="text-lg md:text-xl font-bold text-center">{table.title}</h3>
                  {editable && (
                    <div className={`absolute top-1/2 -translate-y-1/2 flex gap-2 ${direction === 'rtl' ? 'left-3' : 'right-3'}`}>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (onEditTable) {
                            onEditTable(tableIndex);
                          }
                        }}
                        data-action="edit-table"
                        data-transport-section-id={sectionIdValue}
                        data-table-index={tableIndex}
                        className="p-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-200"
                        title={language === 'ar' ? 'تعديل الجدول' : 'Edit Table'}
                        type="button"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      {tables.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDeleteTarget({type: 'table', tableIndex});
                            setShowDeleteModal(true);
                          }}
                          data-action="delete-table"
                          data-transport-section-id={sectionIdValue}
                          data-table-index={tableIndex}
                          className="p-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-200"
                          title={language === 'ar' ? 'حذف الجدول' : 'Delete Table'}
                          type="button"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Table Container */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[600px]">
                  {/* Column Headers */}
                  <thead>
                    <tr className={bgColorClass}>
                      {editable && (
                        <th className="px-3 py-4 text-center text-white font-bold text-xs md:text-sm border-r-2 border-white/30 min-w-[80px]">
                          <div className="flex items-center justify-center">
                            <span>{language === 'ar' ? 'إجراءات' : 'Actions'}</span>
                          </div>
                        </th>
                      )}
                      {table.columns.map((column, colIndex) => (
                        <th 
                          key={column.key || colIndex}
                          className="px-4 py-4 text-center text-white font-bold text-sm md:text-base border-r-2 border-white/30 whitespace-nowrap"
                        >
                          {getColumnLabel(column.key, column.label)}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  {/* Data Rows */}
                  <tbody>
                    {/* Show add form if adding to this table */}
                    {addingRow && addingRow.tableIndex === tableIndex && renderFormRow(tableIndex, bgColorClass, table.columns.length)}
                    
                    {table.rows.map((row, rowIndex) => (
                      <React.Fragment key={rowIndex}>
                        {/* Show edit form if editing this row */}
                        {editingRow && editingRow.tableIndex === tableIndex && editingRow.rowIndex === rowIndex ? (
                          renderFormRow(tableIndex, bgColorClass, table.columns.length)
                        ) : (
                          <>
                            <tr 
                              className="bg-[#E8E8E8] hover:bg-[#D8D8D8] transition-colors duration-200 border-b-2 border-white group"
                            >
                              {editable && (
                                <td className="px-3 py-4 border-r-2 border-white/50">
                                  <div className="flex flex-col gap-2 items-center">
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleStartEditRow(tableIndex, rowIndex);
                                      }}
                                      data-action="edit-row"
                                      data-transport-section-id={sectionIdValue}
                                      data-table-index={tableIndex}
                                      data-row-index={rowIndex}
                                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-110"
                                      title={language === 'ar' ? 'تعديل' : 'Edit'}
                                      type="button"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </button>
                                    {table.rows.length > 1 && (
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          setDeleteTarget({type: 'row', tableIndex, rowIndex});
                                          setShowDeleteModal(true);
                                        }}
                                        data-action="remove-row"
                                        data-transport-section-id={sectionIdValue}
                                        data-table-index={tableIndex}
                                        data-row-index={rowIndex}
                                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-110"
                                        title={language === 'ar' ? 'حذف' : 'Delete'}
                                        type="button"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </button>
                                    )}
                                  </div>
                                </td>
                              )}
                          {table.columns.map((column, colIndex) => {
                            const cellValue = row[column.key] || '';
                            const isDateColumn = column.key === 'date';
                            const isFromColumn = column.key === 'from';
                            const isToColumn = column.key === 'to';
                            const isLastColumn = colIndex === table.columns.length - 1;
                            
                            return (
                              <td 
                                key={column.key || colIndex}
                                className={`px-4 py-4 text-center text-gray-800 font-semibold text-sm md:text-base ${!isLastColumn ? 'border-r-2 border-white/50' : ''}`}
                              >
                                <div className={`flex items-center justify-center gap-2 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                                  {isDateColumn ? (
                                    <span className="text-[#4A5568] font-bold">{formatDate(cellValue)}</span>
                                  ) : isFromColumn ? (
                                    <div className="flex items-center gap-2">
                                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                      </svg>
                                      <span className="text-gray-800 font-bold">{cellValue}</span>
                                      {row.fromLink && row.fromLink.trim() && (
                                        <a 
                                          href={row.fromLink.trim()} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center justify-center w-8 h-8 bg-white rounded-full border border-blue-300 hover:bg-blue-50 hover:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
                                          title="Open location link"
                                        >
                                          <LinkIcon className="w-4 h-4 text-blue-600" />
                                        </a>
                                      )}
                                    </div>
                                  ) : isToColumn ? (
                                    <div className="flex items-center gap-2">
                                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                      </svg>
                                      <span className="text-gray-800 font-bold">{cellValue}</span>
                                      {row.toLink && row.toLink.trim() && (
                                        <a 
                                          href={row.toLink.trim()} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center justify-center w-8 h-8 bg-white rounded-full border border-blue-300 hover:bg-blue-50 hover:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
                                          title="Open location link"
                                        >
                                          <LinkIcon className="w-4 h-4 text-blue-600" />
                                        </a>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="whitespace-pre-line leading-relaxed text-[#2D3748]">{cellValue}</span>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                        {/* Note row - appears as separate row below data row */}
                        {row.note && (
                          <tr className="bg-red-50 border-b-2 border-white">
                            <td 
                              colSpan={(editable ? 1 : 0) + table.columns.length}
                              className="px-4 py-3 text-center"
                            >
                              <div className={`flex items-center justify-center gap-2 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span className="text-red-600 text-sm md:text-base font-semibold">{row.note}</span>
                              </div>
                            </td>
                          </tr>
                        )}
                          </>
                        )}
                      </React.Fragment>
                    ))}
                    {editable && (
                      <tr className="bg-gray-50 hover:bg-gray-100 transition-colors">
                        <td colSpan={(editable ? 1 : 0) + table.columns.length} className="px-4 py-5 text-center border-t-2 border-gray-200">
                          {/* Only show button if not currently adding */}
                          {!(addingRow && addingRow.tableIndex === tableIndex) && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleStartAddRow(tableIndex);
                              }}
                              data-action="add-row"
                              data-transport-section-id={sectionIdValue}
                              data-table-index={tableIndex}
                              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 text-sm md:text-base font-medium flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl hover:scale-105"
                              type="button"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              {language === 'ar' ? 'إضافة صف جديد' : 'Add New Row'}
                            </button>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        title={
          deleteTarget?.type === 'section' 
            ? (language === 'ar' ? 'حذف القسم' : 'Delete Section')
            : deleteTarget?.type === 'table'
            ? (language === 'ar' ? 'حذف الجدول' : 'Delete Table')
            : (language === 'ar' ? 'حذف الصف' : 'Delete Row')
        }
        message={
          deleteTarget?.type === 'section'
            ? (language === 'ar' ? 'هل أنت متأكد من حذف هذا القسم؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this section? This action cannot be undone.')
            : deleteTarget?.type === 'table'
            ? (language === 'ar' ? 'هل أنت متأكد من حذف هذا الجدول؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this table? This action cannot be undone.')
            : (language === 'ar' ? 'هل أنت متأكد من حذف هذا الصف؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this row? This action cannot be undone.')
        }
      />
    </div>
  );
};

export default TransportSection;

export const TransportSectionTemplate = TransportSection;
