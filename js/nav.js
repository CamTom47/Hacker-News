"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that.
 * Show favorite list
 * Show user's post list
 * Hide login
 * Show Username and logout
 */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
  $navFavorites.show();
  $navMyStories.show();
  $navSubmit.show();
  $loginForm.hide();
  $signupForm.hide();
  
}

/** When a user clicks on the submit section of the nav bar the story submission section will be unhidden */

$navSubmit.on("click", function(){
  hidePageComponents();
  $submitForm.show();
})


/** Added functionality for clicking on favorite section of nav bar
 * Clears stories and repopulates with favorite stories
 */

$navFavorites.on("click", function(){
  $submitForm.hide();
  putFavoriteStoriesOnPage();
})

/** Added functionality for clicking on user's section of nav bar
 * Clears stories and repopulates with own sotires
 */

$navMyStories.on('click', function(){
  $submitForm.hide();
  putOwnStoriesOnPage();
})