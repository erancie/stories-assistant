// TASKS


// NEXT 

      //change engine for intelligent responses - review GPT API

      //Landing Page - if logged out
      //If looged in - App

      //Fix: clive is hanging left on signed out
      //fix clive left on walkthrough when logged out


      //BUG: Both users in session. if one leaves via tappng new session thumb 
          // then active session users shows user who left. should show remaining user
      
      //Render Prompt component when user error
          


  
// UPCOMING 


      //move all global data to centralised redux store 
        // session(s) data
        // auth/user(s) data

      // SESSION PRIVELIGES 

      // Send Session Invite - popup on click user icon 
        //if user is in currentSession invite otherUser to sessionId
        //if not in currentSession then createSession and invite otherUser

      // Accept Session Invite - popup
        //if invites then show popup - accept button - setCurrentSession(sessionId)

      // creator can edit by default

      // visitors can/cannot edit

      // func to allow/disallow editing session

      //UI

      // Session - Always have 3-4 lines space after type, listen, think. 

      // make mic icon animate on listening

      // Input Validation    (start w/ signin/up comps)
          //- litte input popup if invalid before submit
          //- redirect w/ popup on firebase error after submit


//OPTIONS:

      //add public/private status to session 
          //Sessions.sessionId.visibility = 'public' || 'private'

      //IF User can have multiple current or joined sessions? (simpler if just 1)
      //Track current joined sessions for logged in user in db
          // User Joins Session - set sessionId 
          // Users.userId.currentSessions = { sessionId : true, sessionId : true,  … }
      
      //Track past joined sessions for user
          // Users.userId.pastSessions = { sessionId : true, sessionId : true,  … }

      //Track all past users for each Session

// FIX

      // filter owned sessions out of public sessions

      // Move Delete & Leave session buttons (put in ... popup?)

      // limit headings on menus - hide overflow with '...' on edge? - limit expanding of elemtns in same row as larger titles with flex

      // Undo from one user in session 
          // ..deletes other users last speech set. (answer too ?)       
  
      // Allow Re-Signup

                  // Check sign in/out popups - sequence?? Still ??




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