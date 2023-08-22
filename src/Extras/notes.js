// TASKS


// NEXT 

      //------- 1
      // cross gadient - neu

      // Change Profile displayName 

      // auth context

      //------- 2
      // Session - Always have 3-4 lines space after type, listen, think. 

      // Session - Show Joined Users 

      //------- 3
      // Send Session Invite - popup on click user icon 
        //if user is in currentSession invite otherUser to sessionId
        //if not in currentSession then createSession and invite otherUser

      // Accept Session Invite - popup
        //if invites then show popup - accept button - setCurrentSession(sessionId)



// UPCOMING 

      // make mic icon animate on listening

      // Input Validation    (start w/ signin/up comps)
          //- litte input popup if invalid before submit
          //- redirect w/ popup on firebase error after submit

// FIX

      // filter owned sessions out of public sessions

      // Move Delete & Leave session buttons (put in ... popup?)

      // limit headings on menus - hide overflow with '...' on edge? - limit expanding of elemtns in same row as larger titles with flex

      // Check sign in/out popups 
          //- sequence 
          //- styling - sizing

      // Undo from one user in session 
          // ..deletes other users last speech set. (answer too ?)       
  
      // Allow Re-Signup





// Platform Library Comps ///------------------------->>

  //Popups - wrapper
    //Overlay
    //Message
    //Children (inputs, buttons..)

  //In element Notification 
    // Message
    //Children 

  // Walkthrough

  // Profile

  // Sign UP

  // Sign IN

  // Lateral List / Menu / Tabs - collapses into left right nav arrows

  // Carouselle - <L  xxx  R>
    // 3D circle version? 

      // hmm  
      // Assorted stack of overlapping elements that can be clicked and comes to top
      // Partially hidden elements

  // Accordion 

  // Buttons 1
  // Buttons 2



//////------------------------------------->>





// -----------------
// Future Func Notes  

    
    // Add Security Rules - users & sessions? //https://medium.com/@juliomacr/10-firebase-realtime-database-rule-templates-d4894a118a98

    // Profile - Visability Toggle - User Visibile (default) || User Hidden  

    // Friends List - show Online & Offline - place in lobby & profile 
      // Send friend request
      // Accept friend request
      //Private Messages?

    // Invite to App/Session using link 
    
    // Invite to App/Session using contacts from 3rd party API - IG, FB, LI

    // Add sessions: { sid: {visibiity: public || private  } }


// Q's

      // other/past connected sessions list on user?
      // do sessions start and stop?
      // should they become inactive?
      // is there a need for a session history?


      // Have to be signed in to create session
      // Unregistered Visitors can View (& Join?)


      //logger.ts:115 [2023-08-11T14:34:30.509Z]  
      //@firebase/database: FIREBASE WARNING: 
      //Using an unspecified index. 
      //Your data will be downloaded and filtered on the client. 
      //Consider adding ".indexOn": "online" at /users 
      //to your security rules for better performance.