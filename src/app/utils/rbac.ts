// RBAC (Role-Based Access Control) utility functions
import { User, UserRole } from "../services/AuthApi";

/**
 * Check if user is Super Admin
 */
export function isSuperAdmin(user: User | null): boolean {
  return user?.role === "superadmin";
}

/**
 * Check if user is Company Admin
 */
export function isCompanyAdmin(user: User | null): boolean {
  return user?.role === "company_admin" || user?.role === "admin";
}

/**
 * Check if user is a regular user (not admin)
 */
export function isRegularUser(user: User | null): boolean {
  return user?.role === "user";
}

/**
 * Check if user can manage companies (Super Admin only)
 */
export function canManageCompanies(user: User | null): boolean {
  return isSuperAdmin(user);
}

/**
 * Check if user can manage plans (Super Admin only)
 */
export function canManagePlans(user: User | null): boolean {
  return isSuperAdmin(user);
}

/**
 * Check if user can manage users
 * - Super Admin: Can manage all users
 * - Company Admin: Can manage users in their company
 * - User: Cannot manage users
 */
export function canManageUsers(user: User | null): boolean {
  return isSuperAdmin(user) || isCompanyAdmin(user);
}

/**
 * Check if user can view all documents
 * - Super Admin: Can view all documents
 * - Company Admin: Can view all documents in their company
 * - User: Can only view own documents
 */
export function canViewAllDocuments(user: User | null): boolean {
  return isSuperAdmin(user) || isCompanyAdmin(user);
}

/**
 * Check if user can manage company settings
 * - Super Admin: Can manage any company settings
 * - Company Admin: Can manage their own company settings
 * - User: Cannot manage company settings
 */
export function canManageCompanySettings(user: User | null): boolean {
  return isSuperAdmin(user) || isCompanyAdmin(user);
}

/**
 * Check if user can upload without company assignment
 * - Super Admin: Can upload without company (company_id = null)
 * - Company Admin/User: Must have company
 */
export function canUploadWithoutCompany(user: User | null): boolean {
  return isSuperAdmin(user);
}

/**
 * Get user's display role name
 */
export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case "superadmin":
      return "Super Admin";
    case "company_admin":
    case "admin":
      return "Company Admin";
    case "user":
      return "User";
    default:
      return "Unknown";
  }
}

/**
 * Get role badge color
 */
export function getRoleBadgeColor(role: UserRole): string {
  switch (role) {
    case "superadmin":
      return "bg-purple-100 text-purple-700 border-purple-300";
    case "company_admin":
    case "admin":
      return "bg-blue-100 text-blue-700 border-blue-300";
    case "user":
      return "bg-green-100 text-green-700 border-green-300";
    default:
      return "bg-gray-100 text-gray-700 border-gray-300";
  }
}

