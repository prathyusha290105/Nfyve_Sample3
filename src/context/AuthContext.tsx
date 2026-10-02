import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
  User as FirebaseUser,
  Auth
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, Firestore } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured, getFirebaseConfigStatus, FirebaseConfigStatus } from '../lib/firebase';
import { User, Role } from '../types';
import { api, authStorage } from '../api/client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isFirebaseConnected: boolean;
  firebaseStatus: FirebaseConfigStatus;
  login: (email: string, password: string, mode: 'customer' | 'staff_admin') => Promise<User>;
  register: (name: string, email: string, phone: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updateProfileDetails: (payload: { name?: string; phone?: string; bio?: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const firebaseStatus = getFirebaseConfigStatus();

  // Listen for Firebase Auth state if Firebase is configured
  useEffect(() => {
    const fbAuth: Auth | null = auth;
    const fbDb: Firestore | null = db;

    if (isFirebaseConfigured && fbAuth && fbDb) {
      const unsubscribe = onAuthStateChanged(fbAuth, async (fbUser: FirebaseUser | null) => {
        if (!fbUser) {
          // If no Firebase user, check if we have a local session
          checkLocalSession();
          return;
        }

        try {
          const userDocRef = doc(fbDb, 'users', fbUser.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            // Check active status
            if (data.active === false) {
              await signOut(fbAuth);
              setUser(null);
              setIsLoading(false);
              return;
            }

            const appUser: User = {
              id: fbUser.uid,
              uid: fbUser.uid,
              name: data.name || fbUser.displayName || 'NFYVE Member',
              email: fbUser.email || '',
              phone: data.phone || '+91 9000023050',
              role: (data.role as Role) || 'customer',
              designation: data.designation || (data.role === 'staff' ? 'Sanctuary Specialist' : undefined),
              department: data.department || (data.role === 'staff' ? 'Wellness Suite' : undefined),
              active: data.active !== false,
              staffId: data.role === 'staff' ? fbUser.uid : undefined,
              bio: data.bio || '',
              specialties: data.specialties || [],
              createdAt: data.createdAt || new Date().toISOString(),
            };
            setUser(appUser);
          } else {
            // First time login - auto initialize customer profile in Firestore
            const initialRole: Role = fbUser.email === 'admin@nfyve.com' ? 'admin' : 'customer';
            const newUserData = {
              uid: fbUser.uid,
              name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Sanctuary Client',
              email: fbUser.email || '',
              phone: '+91 9000023050',
              role: initialRole,
              active: true,
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newUserData);

            setUser({
              id: fbUser.uid,
              uid: fbUser.uid,
              name: newUserData.name,
              email: newUserData.email,
              phone: newUserData.phone,
              role: initialRole,
              active: true,
              createdAt: newUserData.createdAt,
            });
          }
        } catch (err) {
          console.error('Error fetching Firestore user dossier:', err);
          checkLocalSession();
        } finally {
          setIsLoading(false);
        }
      });

      return () => unsubscribe();
    } else {
      // Firebase not configured; check local token
      checkLocalSession();
    }
  }, []);

  const checkLocalSession = async () => {
    const token = authStorage.getToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.getCurrentUser();
      setUser({
        ...res.user,
        active: res.user.active !== false,
        designation: res.user.designation || (res.user.role === 'staff' ? 'Senior Clinical Specialist' : undefined),
      });
    } catch {
      authStorage.clearToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    const fbAuth: Auth | null = auth;
    const fbDb: Firestore | null = db;

    if (isFirebaseConfigured && fbAuth && fbDb && fbAuth.currentUser) {
      const userDocRef = doc(fbDb, 'users', fbAuth.currentUser.uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setUser({
          id: fbAuth.currentUser.uid,
          uid: fbAuth.currentUser.uid,
          name: data.name || fbAuth.currentUser.displayName || 'NFYVE Member',
          email: fbAuth.currentUser.email || '',
          phone: data.phone || '+91 9000023050',
          role: (data.role as Role) || 'customer',
          designation: data.designation,
          department: data.department,
          active: data.active !== false,
          staffId: data.role === 'staff' ? fbAuth.currentUser.uid : undefined,
          bio: data.bio || '',
          specialties: data.specialties || [],
          createdAt: data.createdAt || new Date().toISOString(),
        });
      }
      return;
    }
    await checkLocalSession();
  };

  const login = async (email: string, password: string, mode: 'customer' | 'staff_admin'): Promise<User> => {
    const fbAuth: Auth | null = auth;
    const fbDb: Firestore | null = db;

    // If Firebase Auth is configured and available:
    if (isFirebaseConfigured && fbAuth && fbDb) {
      try {
        const cred = await signInWithEmailAndPassword(fbAuth, email.trim().toLowerCase(), password);
        const userDocRef = doc(fbDb, 'users', cred.user.uid);
        let userSnap = await getDoc(userDocRef);

        let userData = userSnap.data();
        if (!userSnap.exists()) {
          // If admin@nfyve.com or staff demo:
          const role: Role = email.includes('admin') ? 'admin' : email.includes('staff') || email.includes('dr.') ? 'staff' : 'customer';
          userData = {
            uid: cred.user.uid,
            name: cred.user.displayName || email.split('@')[0],
            email: cred.user.email,
            phone: '+91 9000023050',
            role,
            designation: role === 'staff' ? 'Senior Clinical Practitioner' : role === 'admin' ? 'Sanctuary Director' : undefined,
            department: role === 'staff' ? 'Clinical Aesthetics' : undefined,
            active: true,
            createdAt: new Date().toISOString(),
          };
          await setDoc(userDocRef, userData);
        }

        if (userData?.active === false) {
          await signOut(fbAuth);
          throw new Error('This account has been deactivated. Please contact the administrator.');
        }

        const userRole: Role = userData?.role || 'customer';

        if (mode === 'staff_admin' && userRole === 'customer') {
          await signOut(fbAuth);
          throw new Error('This account does not have staff or administrator privileges. Please use the Customer Login.');
        }

        if (mode === 'customer' && userRole !== 'customer') {
          await signOut(fbAuth);
          throw new Error('Staff and Administrator accounts must sign in using the Staff / Admin Login portal.');
        }

        const appUser: User = {
          id: cred.user.uid,
          uid: cred.user.uid,
          name: userData?.name || email.split('@')[0],
          email: cred.user.email || email,
          phone: userData?.phone || '+91 9000023050',
          role: userRole,
          designation: userData?.designation,
          department: userData?.department,
          active: true,
          staffId: userRole === 'staff' ? cred.user.uid : undefined,
          bio: userData?.bio || '',
          specialties: userData?.specialties || [],
          createdAt: userData?.createdAt || new Date().toISOString(),
        };

        setUser(appUser);
        return appUser;
      } catch (err: any) {
        console.warn('Firebase Auth sign in failed, falling back to local credentials:', err.message);
      }
    }

    // Fallback using server API
    const res = await api.login({ email, password, mode });
    authStorage.setToken(res.token);
    const safeUser: User = {
      ...res.user,
      active: res.user.active !== false,
      designation: res.user.designation || (res.user.role === 'staff' ? 'Senior Clinical Practitioner' : undefined),
    };
    setUser(safeUser);
    return safeUser;
  };

  const register = async (name: string, email: string, phone: string, password: string): Promise<User> => {
    const fbAuth: Auth | null = auth;
    const fbDb: Firestore | null = db;

    if (isFirebaseConfigured && fbAuth && fbDb) {
      try {
        const cred = await createUserWithEmailAndPassword(fbAuth, email.trim().toLowerCase(), password);
        await updateFirebaseProfile(cred.user, { displayName: name.trim() });

        const newUserRecord = {
          uid: cred.user.uid,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          role: 'customer' as Role, // Strictly customer role for public signup
          active: true,
          createdAt: new Date().toISOString(),
        };

        await setDoc(doc(fbDb, 'users', cred.user.uid), newUserRecord);

        const appUser: User = {
          id: cred.user.uid,
          uid: cred.user.uid,
          name: newUserRecord.name,
          email: newUserRecord.email,
          phone: newUserRecord.phone,
          role: 'customer',
          active: true,
          createdAt: newUserRecord.createdAt,
        };

        setUser(appUser);
        return appUser;
      } catch (err: any) {
        console.warn('Firebase Auth registration failed, using local server fallback:', err.message);
      }
    }

    const res = await api.register({ name, email, phone, password });
    authStorage.setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = async () => {
    const fbAuth: Auth | null = auth;
    try {
      if (isFirebaseConfigured && fbAuth) {
        await signOut(fbAuth);
      }
      await api.logout();
    } catch {
      // Ignore
    } finally {
      authStorage.clearToken();
      setUser(null);
    }
  };

  const sendPasswordReset = async (email: string) => {
    const fbAuth: Auth | null = auth;
    if (isFirebaseConfigured && fbAuth) {
      try {
        await sendPasswordResetEmail(fbAuth, email.trim().toLowerCase());
        return;
      } catch (err: any) {
        console.warn('Firebase password reset error, falling back:', err.message);
      }
    }
    await api.forgotPassword(email);
  };

  const updateProfileDetails = async (payload: { name?: string; phone?: string; bio?: string }) => {
    const fbAuth: Auth | null = auth;
    const fbDb: Firestore | null = db;

    if (isFirebaseConfigured && fbAuth && fbDb && fbAuth.currentUser) {
      const userRef = doc(fbDb, 'users', fbAuth.currentUser.uid);
      const updates: any = {
        updatedAt: new Date().toISOString(),
      };
      if (payload.name) {
        updates.name = payload.name.trim();
        await updateFirebaseProfile(fbAuth.currentUser, { displayName: payload.name.trim() });
      }
      if (payload.phone) updates.phone = payload.phone.trim();
      if (payload.bio !== undefined) updates.bio = payload.bio.trim();

      await updateDoc(userRef, updates);
      await refreshUser();
      return;
    }

    if (user?.role === 'staff') {
      await api.updateStaffProfile(payload);
    } else {
      await api.updateProfile({ name: payload.name || user?.name || '', phone: payload.phone || user?.phone || '' });
    }
    await refreshUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isFirebaseConnected: isFirebaseConfigured,
        firebaseStatus,
        login,
        register,
        logout,
        sendPasswordReset,
        updateProfileDetails,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
