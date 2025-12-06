import { openDB, IDBPDatabase } from 'idb';
import { Org, MetadataSummary } from '../types';

const DB_NAME = 'docbot_db';
const DB_VERSION = 1;
const METADATA_STORE = 'org_metadata';

// Initialize DB
const initDB = async (): Promise<IDBPDatabase> => {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(METADATA_STORE)) {
                db.createObjectStore(METADATA_STORE);
            }
        },
    });
};

/**
 * Saves organizations to storage.
 * - Lightweight Org data (without metadata) goes to localStorage.
 * - Heavy MetadataSummary goes to IndexedDB.
 */
export const saveOrgs = async (orgs: Org[]) => {
    if (typeof window === 'undefined') return;

    // Separate heavy metadata from lightweight org info
    const lightOrgs = orgs.map(org => {
        const { metadataSummary, ...lightOrg } = org;
        return lightOrg;
    });

    // 1. Save lightweight list to LocalStorage (synchronous, fast for basic UI)
    try {
        localStorage.setItem('docai_orgs', JSON.stringify(lightOrgs));
    } catch (e) {
        console.error("Failed to save orgs to localStorage", e);
    }

    // 2. Save heavy metadata to IndexedDB
    const db = await initDB();
    const tx = db.transaction(METADATA_STORE, 'readwrite');
    const store = tx.objectStore(METADATA_STORE);

    // Save metadata for each org that has it
    for (const org of orgs) {
        if (org.metadataSummary) {
            await store.put(org.metadataSummary, org.id);
        }
    }
    await tx.done;
};

/**
 * Loads organizations from storage.
 * Merges localStorage data with IndexedDB metadata.
 */
export const loadOrgs = async (): Promise<Org[]> => {
    if (typeof window === 'undefined') return [];

    // 1. Load lightweight list
    const stored = localStorage.getItem('docai_orgs');
    if (!stored) return [];

    let lightOrgs: Org[] = [];
    try {
        lightOrgs = JSON.parse(stored);
    } catch (e) {
        console.error("Failed to parse docai_orgs", e);
        return [];
    }

    // 2. Load metadata from IndexedDB
    const db = await initDB();
    const tx = db.transaction(METADATA_STORE, 'readonly');
    const store = tx.objectStore(METADATA_STORE);

    const fullOrgs: Org[] = await Promise.all(lightOrgs.map(async (org) => {
        const metadata = await store.get(org.id) as MetadataSummary | undefined;
        if (metadata) {
            // Restore Date objects if needed (IndexedDB stores structured clone, so Dates are preserved!)
            // But if we serialized to JSON before putting, we might need to restore. 
            // idb stores native JS objects, so Dates are preserved usually.
            return { ...org, metadataSummary: metadata };
        }
        return org;
    }));

    return fullOrgs;
};

/**
 * Clears metadata for a specific org
 */
export const clearOrgMetadata = async (orgId: string) => {
    const db = await initDB();
    await db.delete(METADATA_STORE, orgId);
};
