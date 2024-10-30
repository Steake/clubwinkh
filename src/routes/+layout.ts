import { authStore } from '$lib/stores/authStore';
import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ url }) => {
  // Protected routes that require authentication
  const protectedRoutes = ['/profile', '/games'];
  
  // Admin routes that require admin role
  const adminRoutes = ['/admin'];
  
  // Public routes that should redirect to home if already authenticated
  const authRoutes = ['/auth'];
  
  const path = url.pathname;
  
  let auth: any;
  authStore.subscribe(value => {
    auth = value;
  })();

  // Redirect authenticated users away from auth pages
  if (authRoutes.some(route => path.startsWith(route)) && auth.isAuthenticated) {
    throw redirect(302, '/');
  }

  // Protect routes that require authentication
  if (protectedRoutes.some(route => path.startsWith(route)) && !auth.isAuthenticated) {
    throw redirect(302, '/auth');
  }

  // Protect admin routes
  if (adminRoutes.some(route => path.startsWith(route)) && auth.user?.role !== 'admin') {
    throw redirect(302, '/auth');
  }

  return {};
};