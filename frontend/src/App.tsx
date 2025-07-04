// import { useEffect } from 'react';
// import { RouterProvider } from '@tanstack/react-router';
// import { router } from '@/routes/router';
// import { initAuth } from '@/lib/api/auth';
// import { QueryClientProvider } from '@tanstack/react-query';
// import { queryClient } from '@/lib/api/client';
// import { AuthProvider } from '@/context/auth';
// import { ThemeProvider } from '@/components/theme-provider';

// export function App() {
//   // Initialize Firebase auth listener
//   // useEffect(() => {
//   //   const unsubscribe = initAuth();
//   //   return () => unsubscribe();
//   // }, []);
//   if (localStorage.getItem('isAuth') !== 'true' || !localStorage.getItem('isAuth')) {
//       initAuth();
//   }
   

//   return (
//     <QueryClientProvider client={queryClient}>
//       <AuthProvider>
//         <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
//           <RouterProvider router={router} />
//         </ThemeProvider>
//       </AuthProvider>
//     </QueryClientProvider>
//   );
// }




//my implementation
import { useEffect } from 'react';
import { RouterProvider } from '@tanstack/react-router';
import { router } from '@/routes/router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/api/client';
import { AuthProvider } from '@/context/auth';
import { ThemeProvider } from '@/components/theme-provider';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuthStore } from '@/lib/store/auth-store';

export function App() {
  const { setFirebaseUser } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, [setFirebaseUser]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <RouterProvider router={router} />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}