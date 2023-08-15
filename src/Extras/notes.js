

// NOTES









  // -------------------------------------------------------------------------------------

      // >---- Next Merp Derp Func Lerp --->


      // DEV

      //PROBLEM: If users logs out in one window, logs out in other 
          // BUT connection Ref from other window is not remove and still shows in connected

          //Q: How to remove all connection References only for all windows in same browser at logout

            //SOLUTION:
                // Find a reference that is common for every tab opened in a specific browser: 
                // -store in connections
                // -Or store seperate onlineUsers list in rtdb with each user having connection and common browser refs. (Is this 'fanning' the data?)

                //FINALLY: Filter for connected refs with common browser ref and remove them all on logout




      // FIX

      // Undo from one user in session deletes other users last speech set
          // (answer too ?)       

      // Profile  
        // Change displayName
        // Expand
    
      // Session 
        // Show Joined Users
        // Change session name - owner only
        // Always have 3-4 lines after type listen, think

      //       --------------------------------

      // Invite to session - click user icon popup
        //if user is in currentSession invite otherUser to sessionId
        //if not in currentSession then createSession and invite otherUser

      // Accept Invite to Session - popup
        //if invites then show popup - accept button - setCurrentSession(sessionId)

      //       --------------------------------

      // Input Validation    (start w/ signin/up comps)
          //- litte input popup if invalid before submit
          //- redirect w/ popup on firebase error after submit


  //// --------------------------------------------------------------------------------













    ////        Future Func        ////
    ////////                  /////////

    // Allow Re-Signup
    
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