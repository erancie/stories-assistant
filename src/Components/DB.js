import React from 'react'
import { set, on, query, remove, once, getDatabase, ref, push, onDisconnect, update, child, onValue, off, orderByChild, equalTo } from 'firebase/database';
import { getAuth } from "firebase/auth";

export default function DB() {

    //How to delete sessions per title w/ modular sdk ??????????????

  // useEffect(() => {

    // const db = dbRef.current;

    // remove(ref(db, 'sessions')) //CAREFUL W/ REMOVE!!

    // const sessions = query(ref(db, 'sessions'), orderByChild('title'), equalTo('The Comedian'));

    // console.log(sessions)

  // }, []);

    // const db = dbRef.current;

    // const sessionsRef = ref(db, 'sessions');

    // on(ref(db, 'sessions'), deleteSessions )
    // function deleteSessions (snapshot) {
    //   snapshot.forEach(sessionSnapshot => {
    //     const session = sessionSnapshot.val();
    //     console.log('session')
    //     console.log(session)
    //     if (
    //       session.title === 'Stoytelling Assistant' ||
    //       session.title === 'The Comedian' ||
    //       session.title === 'Casual Chat'
    //     ) {
    //       const sessionRef = ref(db, 'sessions/' + sessionSnapshot.key);
    //       sessionRef.remove();
    //     }
    //   });
    // }

    // orderByChild('')

    // const sessionTitles = query(ref(db, 'sessions'), orderByChild('title'))

    // console.log('sessionTitles')
    // console.log(sessionTitles)

    // .once('value', (snapshot) => {
    //     snapshot.forEach((childSnapshot) => {
    //       childSnapshot.ref.remove();
    //     });
    //   });

    // sessionTitles.once('value', (snapshot) => {
    //   snapshot.forEach((childSnapshot) => {
    //     childSnapshot.ref.remove();
    //   });
    // });

    // const query = sessionsRef.orderByChild('name').equalTo('Stoytelling Assistant');
    // query.once('value', (snapshot) => {
    //   snapshot.forEach((childSnapshot) => {
    //     childSnapshot.ref.remove();
    //   });
    // });

    // const sessionsRef = firebase.database().ref('sessions');

    // sessionsRef.on('value', (snapshot) => {
    // sessionsRef.orderByChild('title').on('value', (snapshot) => {    
    //   snapshot.forEach((sessionSnapshot) => {
    //     const session = sessionSnapshot.val();
    //     if (
    //       session.title === 'Stoytelling Assistant' ||
    //       session.title === 'The Comedian' ||
    //       session.title === 'Casual Chat'
    //     ) {
    //       const sessionRef = ref(db, 'sessions/' + sessionSnapshot.key);
    //       sessionRef.remove();
    //     }
    //   });
    // });

  // }, []);
  return (
    <div>DB</div>
  )
}
