import { db } from '@chat/database';
import { organizations } from '@chat/database';
import { eq } from 'drizzle-orm';

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;

export async function createOrganization(data: NewOrganization) {
  const [organization] = await db
    .insert(organizations)
    .values(data)
    .returning();
  
  return organization;
}

export async function getOrganizations(userId?: string, userRole?: string) {
  // For now, return all organizations regardless of user
  // In the future, this could filter based on user access
  const results = await db
    .select()
    .from(organizations)
    .orderBy(organizations.name);
  
  return results;
}

export async function getOrganizationById(id: string) {
  const [organization] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, id));
  
  return organization;
}

export async function updateOrganization(id: string, data: Partial<NewOrganization>) {
  const [organization] = await db
    .update(organizations)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, id))
    .returning();
  
  return organization;
}

export async function deleteOrganization(id: string) {
  await db
    .delete(organizations)
    .where(eq(organizations.id, id));
}

export async function getOrganizationsByType(type: 'agency' | 'client') {
  const results = await db
    .select()
    .from(organizations)
    .where(eq(organizations.type, type))
    .orderBy(organizations.name);
  
  return results;
}

export async function getClientOrganizations() {
  return getOrganizationsByType('client');
}

export async function searchOrganizations(query: string) {
  // For now, we'll implement a simple search
  // In production, you'd want to use PostgreSQL's full-text search
  const allOrgs = await getOrganizations();
  const lowercaseQuery = query.toLowerCase();
  
  return allOrgs.filter(org => 
    org.name.toLowerCase().includes(lowercaseQuery) ||
    (org.contactEmail?.toLowerCase().includes(lowercaseQuery) ?? false)
  );
}