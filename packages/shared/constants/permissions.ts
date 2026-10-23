import { UserRole } from '../types';

export enum Permission {
  // Leads
  READ_LEADS = 'read:leads',
  CREATE_LEADS = 'create:leads',
  UPDATE_LEADS = 'update:leads',
  DELETE_LEADS = 'delete:leads',
  
  // Customers
  READ_CUSTOMERS = 'read:customers',
  CREATE_CUSTOMERS = 'create:customers',
  UPDATE_CUSTOMERS = 'update:customers',
  DELETE_CUSTOMERS = 'delete:customers',
  
  // Bookings
  READ_BOOKINGS = 'read:bookings',
  CREATE_BOOKINGS = 'create:bookings',
  UPDATE_BOOKINGS = 'update:bookings',
  DELETE_BOOKINGS = 'delete:bookings',
  
  // Quotations
  READ_QUOTATIONS = 'read:quotations',
  CREATE_QUOTATIONS = 'create:quotations',
  UPDATE_QUOTATIONS = 'update:quotations',
  DELETE_QUOTATIONS = 'delete:quotations',
  
  // Payments
  READ_PAYMENTS = 'read:payments',
  CREATE_PAYMENTS = 'create:payments',
  UPDATE_PAYMENTS = 'update:payments',
  
  // Users (Agency Staff)
  READ_USERS = 'read:users',
  CREATE_USERS = 'create:users',
  UPDATE_USERS = 'update:users',
  DELETE_USERS = 'delete:users',
  
  // Settings
  MANAGE_SETTINGS = 'manage:settings',
}

export const RolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: Object.values(Permission),
  [UserRole.AGENCY_OWNER]: Object.values(Permission),
  [UserRole.MANAGER]: [
    Permission.READ_LEADS, Permission.CREATE_LEADS, Permission.UPDATE_LEADS,
    Permission.READ_CUSTOMERS, Permission.CREATE_CUSTOMERS, Permission.UPDATE_CUSTOMERS,
    Permission.READ_BOOKINGS, Permission.CREATE_BOOKINGS, Permission.UPDATE_BOOKINGS,
    Permission.READ_QUOTATIONS, Permission.CREATE_QUOTATIONS, Permission.UPDATE_QUOTATIONS,
    Permission.READ_PAYMENTS, Permission.CREATE_PAYMENTS,
    Permission.READ_USERS,
  ],
  [UserRole.SALES]: [
    Permission.READ_LEADS, Permission.CREATE_LEADS, Permission.UPDATE_LEADS,
    Permission.READ_CUSTOMERS, Permission.CREATE_CUSTOMERS, Permission.UPDATE_CUSTOMERS,
    Permission.READ_QUOTATIONS, Permission.CREATE_QUOTATIONS, Permission.UPDATE_QUOTATIONS,
    Permission.READ_BOOKINGS,
  ],
  [UserRole.OPERATIONS]: [
    Permission.READ_BOOKINGS, Permission.UPDATE_BOOKINGS,
    Permission.READ_CUSTOMERS,
    Permission.READ_PAYMENTS,
  ],
  [UserRole.ACCOUNTS]: [
    Permission.READ_PAYMENTS, Permission.CREATE_PAYMENTS, Permission.UPDATE_PAYMENTS,
    Permission.READ_BOOKINGS,
    Permission.READ_CUSTOMERS,
  ],
};
