"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  // if a user logs in show favorite star
  const showStar = Boolean(currentUser);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
      <div>
      ${showStar ? createStarHTML(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
        </div>
      </li>
    `);
}

/*******************************************
 * generates markups so that only own stories have a remove symbol
 * 
*/

function generateOwnStoryMarkup(story, showDeleteButton = true) {
  // console.debug("generateStoryMarkup", story);

  // if a user logs in show favorite star
  const showStar = Boolean(currentUser);
  const showPencil = Boolean(currentUser);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
      <div id="story">
      ${showDeleteButton ? createDeleteButtonHTML() : ""}
      ${showStar ? createStarHTML(story, currentUser) : ""}
      ${showPencil ? createEditHTML() : ""};
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
        </div>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();
  $favoriteStoriesList.empty();
  $ownStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/****************FUNCTIONALITY FOR ADDING CONTENT TO PAGES*************************************/
/** Handle showing user's favorite stories when the favorite nav link is clicked */

function putFavoriteStoriesOnPage() {
  console.debug("putFavoriteStoriesOnPage");

  $allStoriesList.empty();
  $favoriteStoriesList.empty();
  $ownStoriesList.empty();

  // loop through user's favorite stories and generate HTML for them
  for (let story of currentUser.favorites) {
    const $story = generateStoryMarkup(story);
    $favoriteStoriesList.append($story);
  }

  $favoriteStoriesList.show();
}

// Clear stories and show user's own stories
function putOwnStoriesOnPage(){
  console.debug('putOwnStoriesOnPage');
 
  $allStoriesList.empty();
  $favoriteStoriesList.empty();
  $ownStoriesList.empty();

  for(let story of currentUser.ownStories){
    const $story = generateOwnStoryMarkup(story);
    $ownStoriesList.append($story);
  }
  $ownStoriesList.show();
}

/** Handle submitting new story */
async function submitNewStory(e){
  console.debug('submitNewStory');
  e.preventDefault();

  //collect all of the form information
  const title = $('#story-title').val();
  const author = $('#story-author').val();
  const url = $('#story-url').val();

  const username = currentUser.username;
  const storyData = {title, author, url, username};
  
  const story = await storyList.addStory(currentUser, storyData);

  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);

  $submitForm.slideUp("slow");
  $submitForm.trigger("reset");
}

$submitForm.on('submit', submitNewStory)

/** Handle favorite/unfavorite on story */

async function toggleFavorites(e) {
  console.debug('toggleFavorites');
  const $target = $(e.target);
  const $closestLi = $target.closest('li');
  const storyId = $closestLi.attr('id');
  const story = storyList.stories.find( s => s.storyId === storyId)
  console.log($target)
  /** Check for favorite status */
  if($target.hasClass('fas')){
    // Story is currently favorited: remove from the user's favorite list and uncheck star
    await currentUser.removeFavorite(story);
    $closestLi.closest('i').toggleClass('fas far');
  }  else{
    // Story is not currently favorite: add the story to the user's favorite list and check star
    await currentUser.addFavorite(story);
    $closestLi.closest('i').toggleClass('far fas');
  }  
}

$storiesList.on('click', '.star', toggleFavorites);

$ownStoriesList.on('click', '.trash-can', deleteStory);

async function deleteStory(e){
  console.debug('deleteStory');

  const $target = $(e.target);
  const $closestLi = $target.closest('li');
  const storyId = $closestLi.attr('id');

  await storyList.removeStory(currentUser, storyId);

  //reload list of stories
  await putOwnStoriesOnPage();
}


/******************CREATING STAR AND TRASH HTML*************************/
/** Create favorite/unfavorite start for stories */

function createStarHTML(story, user){
  const isFavorite = user.isFavorite(story);
  const starType = isFavorite ? 'fas' : 'far';
  return `
    <span class="star">
      <i class="${starType} fa-star"></i>
    </span>`;
}

function createDeleteButtonHTML(){
  return `
    <span class="trash-can">
    <i class="fas fa-trash-alt"></i>
    </span>
  `
}

/****************************************
 * Functionality to update an existing story
 */


function createEditHTML(){
  return `
  <span class="pencil">
  <i class="fas fa-pencil-alt"></i>
  </span>
  `
}

$ownStoriesList.on('click', '.pencil', showUpdateForm)

function showUpdateForm(e){
  hidePageComponents();
  $updateForm.show();
  const $target = $(e.target);
  const $closestLi = $target.closest('li');
  const storyId = $closestLi.attr('id');
  fillUpdateForm(storyId);
}

function fillUpdateForm(storyId){
  const story = storyList.stories.find( s => s.storyId === storyId);
  console.log(story);
  $('#update-title').val(story.title);
  $('#update-author').val(story.author);
  $('#update-url').val(story.url);
}

$('#update-button').on('click', editUIStory)


async function editUIStory(e){
  const $target = $(e.target);
  const $closestLi = $target.closest('li');
  const storyId = $closestLi.attr('id');
  await storyList.stories.editStory(storyId)

  await putOwnStoriesOnPage();
}