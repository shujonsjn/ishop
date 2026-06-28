import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://10.0.2.2:3001/api';

async function getToken() {
  return await AsyncStorage.getItem('token');
}

export async function api(method, path, body) {
  const token = await getToken();
  const url = path.startsWith('http') ? path : BASE_URL + path;
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
    },
  };
  if (body && method !== 'GET') {
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(url, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export function setToken(t) {
  return AsyncStorage.setItem('token', t);
}
export function clearToken() {
  return AsyncStorage.removeItem('token');
}
export function setUser(u) {
  return AsyncStorage.setItem('user', JSON.stringify(u));
}
export function getUser() {
  return AsyncStorage.getItem('user').then((s) => (s ? JSON.parse(s) : null));
}
export function clearUser() {
  return AsyncStorage.multiRemove(['token', 'user']);
}
