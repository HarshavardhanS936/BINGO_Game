import { createContext, useContext, useEffect, useState } from "react";
import {
    onAuthStateChanged,
    signInWithPopup,
    signOut,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "firebase/auth";
import { auth, googleProvider, db } from "../firebase";
import { onSnapshot, doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, addDoc, arrayUnion, serverTimestamp, deleteDoc } from "firebase/firestore";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [friendRequests, setFriendRequests] = useState([]);
    const [friendsList, setFriendsList] = useState([]);
    const generateUniqueId = () => `BNG-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    useEffect(() => {
        let unsubDoc, unsubRequests, unsubFriends;
        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            setUser(authUser);
            if (authUser) {
                try {
                    const userRef = doc(db, "users", authUser.uid);

                    // Initial check and creation if needed
                    const userSnap = await getDoc(userRef);
                    if (!userSnap.exists()) {
                        const newData = {
                            uid: authUser.uid,
                            uniqueId: generateUniqueId(),
                            username: (authUser.email ? authUser.email.split('@')[0] : authUser.displayName) || authUser.phoneNumber || "Anonymous",
                            streak: 0,
                            points: 0,
                            lastPlayed: null,
                            friends: [],
                        };
                        await setDoc(userRef, newData);
                        setUserData(newData);
                    } else {
                        const data = userSnap.data();
                        if (!data.uniqueId) {
                            const updatedData = { ...data, uniqueId: generateUniqueId() };
                            if (!data.friends) updatedData.friends = [];
                            await updateDoc(userRef, {
                                uniqueId: updatedData.uniqueId,
                                friends: updatedData.friends || []
                            });
                            setUserData(updatedData);
                        } else {
                            if (!data.friends) {
                                await updateDoc(userRef, { friends: [] });
                                setUserData({ ...data, friends: [] });
                            } else {
                                setUserData(data);
                            }
                        }
                    }

                    // Always set loading false after ID is confirmed and data is at least fetched once
                    setLoading(false);

                    // Listen for real-time updates
                    unsubDoc = onSnapshot(userRef, (snapshot) => {
                        if (snapshot.exists()) {
                            setUserData(snapshot.data());
                        }
                    });

                    // Listen for friend requests
                    const requestsQuery = query(
                        collection(db, "friendRequests"),
                        where("to", "==", authUser.uid),
                        where("status", "==", "pending")
                    );
                    unsubRequests = onSnapshot(requestsQuery, async (snapshot) => {
                        const reqs = [];
                        for (const d of snapshot.docs) {
                            const data = d.data();
                            const fromUserSnap = await getDoc(doc(db, "users", data.from));
                            reqs.push({
                                id: d.id,
                                ...data,
                                fromUser: fromUserSnap.data()
                            });
                        }
                        setFriendRequests(reqs);
                    });

                    // Listen for friends data
                    unsubFriends = onSnapshot(userRef, async (snapshot) => {
                        if (snapshot.exists()) {
                            const data = snapshot.data();
                            const friendsData = [];
                            if (data.friends && data.friends.length > 0) {
                                for (const friendUid of data.friends) {
                                    const fSnap = await getDoc(doc(db, "users", friendUid));
                                    if (fSnap.exists()) friendsData.push(fSnap.data());
                                }
                            }
                            setFriendsList(friendsData);
                        }
                    });

                } catch (error) {
                    console.error("Auth initialization error:", error);
                    setLoading(false);
                }
            } else {
                setUserData(null);
                setLoading(false);
            }
        });

        return () => {
            unsubscribe();
            if (unsubDoc) unsubDoc();
            if (unsubRequests) unsubRequests();
            if (unsubFriends) unsubFriends();
        };
    }, []);

    const googleSignIn = () => signInWithPopup(auth, googleProvider);

    const setupRecaptcha = (containerId) => {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
            'size': 'invisible',
            'callback': (response) => {
                // reCAPTCHA solved, allow signInWithPhoneNumber.
            }
        });
    };

    const phoneSignIn = async (phoneNumber) => {
        const appVerifier = window.recaptchaVerifier;
        return signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    };

    const updateUsername = async (newUsername) => {
        if (!user) return;
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
            username: newUsername
        });
    };

    const registerWithEmail = async (username, email, password) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const authUser = userCredential.user;
        const userRef = doc(db, "users", authUser.uid);
        await setDoc(userRef, {
            uid: authUser.uid,
            uniqueId: generateUniqueId(),
            username: username,
            streak: 0,
            points: 0,
            lastPlayed: null,
            friends: [],
        });
        return userCredential;
    };
    const loginWithEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);

    const updateProfile = async (updates) => {
        if (!user) return;
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, updates);
    };

    const sendFriendRequest = async (targetUniqueId) => {
        console.log("[AuthContext] sendFriendRequest started for:", targetUniqueId);
        if (!user || !userData) {
            console.warn("[AuthContext] sendFriendRequest aborted: No user or userData", { user: !!user, userData: !!userData });
            return;
        }

        if (targetUniqueId === userData.uniqueId) {
            toast.error("SELF_LINK_DENIED: Cannot link with local node.");
            return;
        }

        try {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("uniqueId", "==", targetUniqueId));
            console.log("[AuthContext] Searching for target user...");
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                console.warn("[AuthContext] Target user not found");
                toast.error("TARGET_NOT_FOUND: Unique ID does not exist.");
                return;
            }

            const targetUser = querySnapshot.docs[0].data();
            const targetUid = targetUser.uid;
            console.log("[AuthContext] Target user found:", targetUid);

            // Check if already friends
            if (userData.friends?.includes(targetUid)) {
                toast.error("LINK_ALREADY_ESTABLISHED: Node is already in registry.");
                return;
            }

            // Check for existing pending request
            const requestsRef = collection(db, "friendRequests");
            const q1 = query(requestsRef,
                where("from", "==", user.uid),
                where("to", "==", targetUid),
                where("status", "==", "pending")
            );
            const q2 = query(requestsRef,
                where("from", "==", targetUid),
                where("to", "==", user.uid),
                where("status", "==", "pending")
            );

            console.log("[AuthContext] Checking for existing requests...");
            const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

            if (!snap1.empty || !snap2.empty) {
                toast.error("REQUEST_PENDING: Connection already in buffer.");
                return;
            }

            console.log("[AuthContext] Adding document to friendRequests...");
            await addDoc(requestsRef, {
                from: user.uid,
                to: targetUid,
                status: "pending",
                createdAt: serverTimestamp()
            });

            toast.success("INITIATED: Friend request sent to target node.");
            console.log("[AuthContext] Friend request sent successfully");
        } catch (error) {
            console.error("[AuthContext] Error in sendFriendRequest:", error);
            toast.error(`LINK_ERROR: ${error.message}`);
        }
    };

    const respondToFriendRequest = async (requestId, status) => {
        const requestRef = doc(db, "friendRequests", requestId);
        const requestSnap = await getDoc(requestRef);

        if (!requestSnap.exists()) return;
        const requestData = requestSnap.data();

        if (status === 'accepted') {
            const myRef = doc(db, "users", user.uid);
            const friendRef = doc(db, "users", requestData.from);

            await updateDoc(myRef, {
                friends: arrayUnion(requestData.from)
            });
            await updateDoc(friendRef, {
                friends: arrayUnion(user.uid)
            });
            await updateDoc(requestRef, { status: 'accepted' });
            toast.success("LINK_RESTORED: Connection established.");
        } else {
            await deleteDoc(requestRef);
            toast.error("LINK_TERMINATED: Connection request purged.");
        }
    };

    const logout = () => signOut(auth);

    const value = {
        user,
        userData,
        loading,
        friendRequests,
        friendsList,
        googleSignIn,
        setupRecaptcha,
        phoneSignIn,
        updateUsername,
        updateProfile,
        sendFriendRequest,
        respondToFriendRequest,
        registerWithEmail,
        loginWithEmail,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
