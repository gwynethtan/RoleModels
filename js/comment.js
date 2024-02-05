document.addEventListener("DOMContentLoaded", function () {

    // getting required variables for left side of post
    const urlParams = new URLSearchParams(window.location.search);
    const modelID = decodeURIComponent(urlParams.get("?modelID"));
    const embeddedModel = decodeURIComponent(urlParams.get("embeddedModel"));
    const profilePicture = decodeURIComponent(urlParams.get("profilePicture"));
    const modelQn = decodeURIComponent(urlParams.get("modelQn"));
    const caption = decodeURIComponent(urlParams.get("caption"));

    console.log("model ID:", modelID);
    console.log("Embedded model :", embeddedModel);
    console.log("Profile Picture:", profilePicture);
    console.log("Title:", modelQn);
    console.log("Caption:", caption);

    // display content on screen
    fetchModelDetails(modelID,embeddedModel,profilePicture,modelQn,caption);
});

//validate whether it is code or actual ID
function isCode(modelID) {
    const codeRegex = /[\{\}\[\]\(\);,=+\-*\/%<>\&\|\^!~]/;
    return codeRegex.test(modelID);
  }
  
function fetchModelDetails(modelID,embeddedModel,profilePicture,modelQn,caption) {
    // test whether input is code from uploadQNA form
    if (isCode(modelID)) {
        console.log("The modelID contains code.");

        //insert html for left side content from gallery page 
        document.getElementById("commentPicture").innerHTML += `                
        <div class="commentPictureProfile">
            <span class="commentPictureProfilePadding"><img src="${profilePicture}"></span>
            <h1>${modelQn}</h1>
        </div>
        
        <!-- SketchFeb -->
        <div class="commentPictureImage">
            <div class="sketchfab-embed-wrapper">
            <div id="commentModel"> </div>
            </div>
        </div>

        <div class="commentPictureComment">
            <h1>${caption}</h1>
        </div>
        `
        document.getElementById("commentModel").innerHTML = modelID;

        // special deco for right side of page as user cannot comment on their own post 
        document.getElementById("allComments").innerHTML = `
        <div class=nullCommentProperty>
            <script src="https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs" type="module"></script> 

            <dotlottie-player src="https://lottie.host/6ce8a0f7-ab03-4f34-a7c6-cef3a0d46938/YZWdSI1qWu.json" background="transparent" speed="1" style="width: 300px; height: 300px;" loop autoplay></dotlottie-player>  
        </div>
        <p class=nullCommentProperty> No comments available. You cannot comment on your post.<p>
        `;
      } 
    else {
        //insert html for left side content from gallery page 
        console.log("The modelID does not appear to contain code.");
        document.getElementById("commentPicture").innerHTML += `                
        <div class="commentPictureProfile">
            <span class="commentPictureProfilePadding"><img src="${profilePicture}"></span>
            <h1>${modelQn}</h1>
        </div>
        
        <!-- SketchFeb -->
        <div class="commentPictureImage">
            <div class="sketchfab-embed-wrapper">
            <iframe src="${embeddedModel}" allow="autoplay; fullscreen; vr" frameborder="0"></iframe>
            </div>
        </div>

        <div class="commentPictureComment">
            <h1>${caption}</h1>
        </div>
        `

        //insert html for right  side content from gallery page 
        document.getElementById("comment").innerHTML=
            `
            <div class="commentImage">
                <img src="Pictures/Home - Profile Pic.png">
            </div>
    
            <div class="commentDetails">
                <h1>Mr A B C Q</h1>
                <textarea placeholder="Type your comment..."></textarea>
            </div>
            `

        //calling api for comments from post 
        const apiBaseUrl = "https://api.sketchfab.com/v3/comments";
        const apiKey = "4351796cf6b8414498e5db4f437be245"; 

        const apiUrl = `${apiBaseUrl}?model=${modelID}`;
        const headers = {
            Authorization: `Bearer ${apiKey}`
        };

        fetch(apiUrl, { headers })
        .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
                })

                .then(modelData => {
                const commentList=modelData.results;
                console.log("list:", commentList);

                let eachCommentHTML='';

                for (const eachComment of commentList) {
                    const commenter=eachComment.user.username; 
                    const commenterProfilePicture=eachComment.user.avatar.images[0].url;
                    const commentItem=eachComment.body;
                  
                    console.log(`Commenter: ${commenter}`);
                    console.log(`Commenter Profile Picture: ${commenterProfilePicture}`);
                    console.log(`Comment item: ${commentItem}`);

                    // insert comments in html 
                    eachCommentHTML+=
                    `<div class="commentArea">
                    <div class="areaProfile">
                        <div class="areaProfilePicPadding">
                            <img src=${commenterProfilePicture}>
                        </div>

                        <div class="areaProfileName">
                            <h1>${commenter}</h1>
                        </div>
                        <div class="areaProfileIcons" onclick="upvotePoints(this)">
                            <img src="Pictures/Comment - Upvote Icon.png">
                            <h3 class="upvoteCount">0</h3>
                        </div>
                    </div>
                    <div class="areaDetails">
                        <h1>
                            <div class="commentMessage">
                                ${commentItem}
                            </div>
                        </h1>
                    </div>
                </div>`
                }

                document.getElementById("allComments").innerHTML = eachCommentHTML;
            
                })
                .catch(error => {
                console.error(`Fetch error for model ID ${modelID}:`, error);
            });
    }
}

//function for upvote count when upvote button is clicked
function upvotePoints(button){
    var upvoteCountElement = button.querySelector(".upvoteCount");
    var upvoteCount = 1;
    upvoteCountElement.innerText = upvoteCount;
}
