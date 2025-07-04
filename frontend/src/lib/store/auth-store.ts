// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';

// export type User = {
//   uid: string;
//   email: string;
//   name?: string;
//   role: 'teacher' | 'student' | 'admin' | null;
//   avatar?: string;
//   // Backend user fields
//   userId?: string;
//   firstName?: string;
//   lastName?: string;
// };

// type AuthStore = {
//   user: User | null;
//   token: string | null;
//   isAuthenticated: boolean;
  
//   // Actions
//   setUser: (user: User) => void;
//   setToken: (token: string) => void;
//   clearUser: () => void;
//   hasRole: (role: string | string[]) => boolean;
// };

// export const useAuthStore = create<AuthStore>()(
//   persist(
//     (set, get) => ({
//       user: null,
//       token: localStorage.getItem('firebase-auth-token'),
//       isAuthenticated: !!localStorage.getItem('firebase-auth-token'),
      
//       setUser: (user) => {
//         // Store backend user info in localStorage
//         if (user.userId) localStorage.setItem('user-id', user.userId);
//         if (user.email) localStorage.setItem('user-email', user.email);
//         if (user.firstName) localStorage.setItem('user-firstName', user.firstName);
//         if (user.lastName) localStorage.setItem('user-lastName', user.lastName);
        
//         set({ user, isAuthenticated: true });
//       },
//       setToken: (token) => {
//         localStorage.setItem('firebase-auth-token', token);
//         set({ token, isAuthenticated: true });
//       },
//       clearUser: () => {
//         localStorage.removeItem('firebase-auth-token');
//         // Clear backend user data from localStorage
//         localStorage.removeItem('user-id');
//         localStorage.removeItem('user-email');
//         localStorage.removeItem('user-firstName');
//         localStorage.removeItem('user-lastName');
//         set({ user: null, token: null, isAuthenticated: false });
//       },
//       hasRole: (role) => {
//         const user = get().user;
//         if (!user || !user.role) return false;
        
//         if (Array.isArray(role)) {
//           return role.includes(user.role);
//         }
//         return user.role === role;
//       }
//     }),
//     {
//       name: 'auth-store',
//     }
//   )
// );

// // Subscribe to store changes to update the auth header in API client
// useAuthStore.subscribe((state) => {
//   if (state.token) {
//     // Set token for API client (if needed beyond localStorage)
//     console.log('Auth token updated in store');
//   }
// });






//my implementation
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User as FirebaseUser } from 'firebase/auth';

export type User = {
  uid: string;
  email: string;
  name?: string;
  role: 'teacher' | 'student' | 'admin' | null;
  avatar?: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
};

type AuthStore = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  firebaseUser: FirebaseUser | null;
  
  // Actions
  setUser: (user: User) => void;
  setFirebaseUser: (user: FirebaseUser | null) => void;
  setToken: (token: string) => void;
  clearUser: () => void;
  hasRole: (role: string | string[]) => boolean;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      firebaseUser: null,
      
      setUser: (user) => {
        set({ user, isAuthenticated: true });
      },
      
      setFirebaseUser: (firebaseUser) => {
        set({ firebaseUser });
        if (firebaseUser) {
          localStorage.setItem('firebase-auth-token', firebaseUser.uid);
        } else {
          localStorage.removeItem('firebase-auth-token');
        }
      },
      
      setToken: (token) => {
        localStorage.setItem('firebase-auth-token', token);
        set({ token, isAuthenticated: true });
      },
      
      clearUser: () => {
        localStorage.removeItem('firebase-auth-token');
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false,
          firebaseUser: null
        });
      },
      
      hasRole: (role) => {
        const user = get().user;
        if (!user || !user.role) return false;
        return Array.isArray(role) ? role.includes(user.role) : user.role === role;
      }
    }),
    {
      name: 'auth-store',
    }
  )
);