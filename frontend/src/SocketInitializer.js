// import React, { useEffect, useContext } from 'react';
// import socket from '../socket';
// import AuthContext from '../context/AuthContext';

// export default function SocketInitializer() {
//   const { profile } = useContext(AuthContext);

//   useEffect(() => {
//     if (profile?.phoneNo) {
//       console.log("📡 Connecting socket...");
//       socket.connect();

//       socket.on("connect", () => {
//         console.log("✅ Socket connected with id:", socket.id);
//         console.log(`📞 Registering user phone number: ${profile.phoneNo}`);
//         socket.emit("register", profile.phoneNo);
//       });
//     }

//     return () => {
//       socket.off("connect");
//     };
//   }, [profile]);

//   return null;
// };
