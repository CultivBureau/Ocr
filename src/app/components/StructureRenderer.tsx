"use client";

import React from "react";
import type { Structure, Section, Table, SeparatedStructure, UserElement } from "../types/ExtractTypes";
import SectionBlock from "./SectionBlock";
import DynamicTable from "./DynamicTable";
import AirplaneSection from "../Templates/airplaneSection";
import HotelsSection from "../Templates/HotelsSection";
import { sortSectionsByOrder, getSectionHierarchy } from "../utils/formatSections";
import { sortTablesByOrder, groupTablesBySection } from "../utils/formatTables";
import { isSeparatedStructure, isLegacyStructure, migrateToSeparatedStructure } from "../utils/structureMigration";
import { isGeneratedId } from "../utils/contentGuards";

interface StructureRendererProps {
  structure: Structure | SeparatedStructure;
  showStats?: boolean;
  editable?: boolean;
  onSectionEdit?: (section: Section) => void;
  onTableEdit?: (table: Table) => void;
  onUserElementEdit?: (element: UserElement) => void;
  onUserElementDelete?: (id: string) => void;
  className?: string;
}

/**
 * Structure Renderer Component
 * Phase 3: Receiving Extracted Data
 * 
 * Renders complete structure with sections and tables
 * Supports both legacy (Structure) and new (SeparatedStructure) formats
 */
export default function StructureRenderer({
  structure,
  showStats = false,
  editable = false,
  onSectionEdit,
  onTableEdit,
  onUserElementEdit,
  onUserElementDelete,
  className = "",
}: StructureRendererProps) {
  // Normalize structure to SeparatedStructure format
  let separatedStructure: SeparatedStructure;
  if (isSeparatedStructure(structure)) {
    separatedStructure = structure;
  } else if (isLegacyStructure(structure)) {
    separatedStructure = migrateToSeparatedStructure(structure);
  } else {
    // Fallback: empty structure
    separatedStructure = {
      generated: { sections: [], tables: [] },
      user: { elements: [] },
      layout: [],
      meta: {}
    };
  }

  // Build element map for quick lookup by ID
  const elementMap = new Map<string, { type: 'section' | 'table' | 'user'; data: any }>();
  
  separatedStructure.generated.sections.forEach(section => {
    elementMap.set(section.id, { type: 'section', data: section });
  });
  
  separatedStructure.generated.tables.forEach(table => {
    elementMap.set(table.id, { type: 'table', data: table });
  });
  
  separatedStructure.user.elements.forEach(element => {
    elementMap.set(element.id, { type: 'user', data: element });
  });

  // Sort sections and tables for legacy rendering (when not using layout order)
  const sortedSections = sortSectionsByOrder(separatedStructure.generated.sections);
  const sortedTables = sortTablesByOrder(separatedStructure.generated.tables);
  
  // Group tables by section for better organization
  const tablesBySection = groupTablesBySection(sortedTables);
  
  // Get section hierarchy
  const sectionHierarchy = getSectionHierarchy(sortedSections);

  // Render element by ID
  const renderElement = (id: string) => {
    const element = elementMap.get(id);
    if (!element) return null;

    switch (element.type) {
      case 'section': {
        const section = element.data as Section;
        return (
          <SectionBlock
            key={section.id}
            section={section}
            level={0}
            showStats={showStats}
            editable={editable && false} // Generated content is read-only
            onEdit={onSectionEdit}
          />
        );
      }
      case 'table': {
        const table = element.data as Table;
        return (
          <DynamicTable
            key={table.id}
            table={table}
            showStats={showStats}
            editable={editable && false} // Generated content is read-only
            onEdit={onTableEdit}
          />
        );
      }
      case 'user': {
        const userElement = element.data as UserElement;
        const handleEdit = () => {
          if (onUserElementEdit) {
            onUserElementEdit(userElement);
          }
        };
        const handleDelete = () => {
          if (onUserElementDelete) {
            onUserElementDelete(userElement.id);
          }
        };

        if (userElement.type === 'airplane') {
          return (
            <AirplaneSection
              key={userElement.id}
              id={userElement.id}
              {...userElement.data}
              editable={editable}
              onEditSection={handleEdit}
            />
          );
        } else if (userElement.type === 'hotel') {
          return (
            <HotelsSection
              key={userElement.id}
              id={userElement.id}
              {...userElement.data}
              editable={editable}
              onEditSection={handleEdit}
            />
          );
        }
        return null;
      }
      default:
        return null;
    }
  };

  // Use layout order if available, otherwise fall back to legacy rendering
  const useLayoutOrder = separatedStructure.layout && separatedStructure.layout.length > 0;

  return (
    <div className={`structure-renderer ${className}`}>
      {useLayoutOrder ? (
        // New layout order rendering
        <>
          {separatedStructure.layout.map((id) => {
            const element = elementMap.get(id);
            if (!element) return null;

            // For sections, render with hierarchy if they have children
            if (element.type === 'section') {
              const section = element.data as Section;
              // Check if this section has children
              const children = separatedStructure.generated.sections.filter(s => s.parent_id === section.id);
              if (children.length > 0) {
                return (
                  <div key={section.id} className="mb-8">
                    <SectionBlock
                      section={section}
                      level={0}
                      showStats={showStats}
                      editable={false}
                      onEdit={onSectionEdit}
                    />
                    {children.map((child) => (
                      <div key={child.id} className="ml-8 mt-4">
                        <SectionBlock
                          section={child}
                          level={1}
                          showStats={showStats}
                          editable={false}
                          onEdit={onSectionEdit}
                        />
                      </div>
                    ))}
                  </div>
                );
              }
            }
            
            return (
              <div key={id} className="mb-8">
                {renderElement(id)}
              </div>
            );
          })}
        </>
      ) : (
        // Legacy rendering (sections hierarchy + tables)
        <>
          {/* Sections */}
          {sectionHierarchy.length > 0 && (
            <div className="sections-container mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">الأقسام</h2>
              {sectionHierarchy.map((section) => (
                <div key={section.id}>
                  <SectionBlock
                    section={section}
                    level={0}
                    showStats={showStats}
                    editable={false}
                    onEdit={onSectionEdit}
                  />
                  
                  {/* Render child sections */}
                  {section.children && section.children.length > 0 && (
                    <div className="ml-8 mt-4">
                      {section.children.map((child) => (
                        <SectionBlock
                          key={child.id}
                          section={child}
                          level={1}
                          showStats={showStats}
                          editable={false}
                          onEdit={onSectionEdit}
                        />
                      ))}
                    </div>
                  )}
                  
                  {/* Render tables for this section */}
                  {tablesBySection.has(section.id) && (
                    <div className="ml-4 mt-4">
                      {tablesBySection.get(section.id)!.map((table) => (
                        <DynamicTable
                          key={table.id}
                          table={table}
                          showStats={showStats}
                          editable={false}
                          onEdit={onTableEdit}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Tables without section (orphan tables) */}
          {tablesBySection.has(null) && tablesBySection.get(null)!.length > 0 && (
            <div className="tables-container mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">الجداول</h2>
              {tablesBySection.get(null)!.map((table) => (
                <DynamicTable
                  key={table.id}
                  table={table}
                  showStats={showStats}
                  editable={false}
                  onEdit={onTableEdit}
                />
              ))}
            </div>
          )}

          {/* User elements (rendered after generated content) */}
          {separatedStructure.user.elements.map((element) => (
            <div key={element.id} className="mb-8">
              {renderElement(element.id)}
            </div>
          ))}
        </>
      )}

      {/* Empty State */}
      {separatedStructure.layout.length === 0 && 
       separatedStructure.generated.sections.length === 0 && 
       separatedStructure.generated.tables.length === 0 &&
       separatedStructure.user.elements.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">لا توجد أقسام أو جداول للعرض</p>
        </div>
      )}

      {/* Statistics Summary */}
      {showStats && separatedStructure.meta && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">إحصائيات</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">الأقسام:</span>
              <span className="font-bold ml-2">{separatedStructure.generated.sections.length}</span>
            </div>
            <div>
              <span className="text-gray-600">الجداول:</span>
              <span className="font-bold ml-2">{separatedStructure.generated.tables.length}</span>
            </div>
            <div>
              <span className="text-gray-600">عناصر المستخدم:</span>
              <span className="font-bold ml-2">{separatedStructure.user.elements.length}</span>
            </div>
            <div>
              <span className="text-gray-600">تاريخ الإنشاء:</span>
              <span className="font-bold ml-2">
                {separatedStructure.meta.generated_at
                  ? new Date(separatedStructure.meta.generated_at).toLocaleDateString("ar")
                  : "غير محدد"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

