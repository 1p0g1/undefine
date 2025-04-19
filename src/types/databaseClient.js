// Type guard to check if a DatabaseClient has the client property
export function hasClient(db) {
    return 'client' in db;
}
