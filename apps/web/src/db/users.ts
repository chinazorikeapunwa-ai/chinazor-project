import { getDB } from './index';

export async function saveUser(user: any) {
  const db = await getDB();
  await db.put('users', {
    ...user,
    cachedAt: Date.now(),
  });
}

export async function getUser() {
  const db = await getDB();
  const users = await db.getAll('users');
  return users[0] || null;
}

export async function clearUser() {
  const db = await getDB();
  await db.clear('users');
}
