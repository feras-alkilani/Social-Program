


getUserInfo();






function getUserInfo(){


    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("userId");

    toggleLoader(true);

     axios
      .get(`${baseUrl}/users/${id}`)
      .then(function(response) {
        // handle success

        


        const user = response.data.data
        const userImage = user.profile_image;
        const userUserName = user.username;
        const userName = user.name;
        const userEmail = user.email || "";
        const userCommentsCount = user.comments_count;
        const userPostsCounts = user.posts_count;


        let content = `
        
         <div class="card-body">
   <div class="row" style="background-color: white; height: 200px;">
     <!-- User Image Col.-->
     <div class="col-2" style="padding-left: 69px; padding-top: 33px; margin-right: 100px;">
       <img id="header-img" src="${userImage}" class="rounded-circle border border-2" alt=""
         style="width: 120px; height: 120px" />
     </div>
     <!--// User Image Col. //-->
     <!-- UserName Email Name-->
     <div class="col-4 d-flex flex-column justify-content-evenly" >
       <div class="row user-main-info">
         ${userUserName}
       </div>
       <div class="row user-main-info">
           ${userEmail}
       </div>
       <div class="row user-main-info">
         ${userName}
       </div>
     </div>
     <!--// UserName Email Name //-->
     <!-- Posts And Comments Counts -->
     <div class="col-4 d-flex flex-column justify-content-evenly" >
       <div class="number-info">
         <span>${userCommentsCount}</span> Comments
       </div>
       <div class="number-info">
         <span>${userPostsCounts}</span> Posts
       </div>
     </div>
     <!--// Posts And Comments Counts //-->
     </div>
 </div>
        
        
        `;


        document.getElementById("user-info").innerHTML = '';
        document.getElementById("user-info").innerHTML = content; 


        
        getUserPosts(id);
        
      })
      .catch(function(error) {
        // handle error
        console.log(error);
      }).finally(function() {

        toggleLoader(false);
      });
}


function getUserPosts(id) {


  toggleLoader(true);
  axios
    .get(`${baseUrl}/users/${id}/posts`)
    .then(function(response) {
      

      document.querySelector("#user-posts").innerHTML = "";


      //Show Or Hide (edit) Button
    //   let user = getCurrentUser();
      // let isMyPost = user != null && post.author.id == user.id;
    //   let editButtonContent = ``;

      // }
      let posts = response.data.data;

      posts.forEach(post => {
        const profileImage = post.author.profile_image || "default-profile.png";
        const postImage = post.image || "default-post.png";
        const postTitle = post.title || "No Title";
        const postBody = post.body || "No content available";
        const postDate = post.created_at;
        const authorName = post.author.name || "Unknown author";
        const postComments =
          post.comments_count !== undefined
            ? post.comments_count
            : "No comments available";

        // Show Or Hide (edit) Button
        let user = getCurrentUser();
        let isMyPost = user != null && post.author.id == user.id;
        let editButtonContent = ``;
        let deleteButtonContent = ``;

        if (isMyPost) {
          editButtonContent = ` <button class="btn btn-secondary" style="float:right; margin-right:5px" onclick="editPostBtnClicked('${encodeURIComponent(
            JSON.stringify(post)
          )}')">Edit</button>`;
          deleteButtonContent = ` <button class="btn btn-danger" style="float:right; " onclick="deletePostBtnClicked('${encodeURIComponent(
            JSON.stringify(post)
          )}')">Delete</
button>`;
        }

        let content = `
      <div class="card shadow" data-post-id="${post.id}"  onclick="getPost()" >
        <div class="card-header">
          <img
            src="${profileImage}"
            class="rounded-circle border border-2"
            alt="Author's profile image"
            style="width: 40px; height: 40px"
            onclick="userClicked(${post.author.id})"
          />
          <b onclick="userClicked(${post.author.id})">${authorName}</b>
          ${deleteButtonContent}
          ${editButtonContent}
        </div>
        <div class="card-body" onclick="postClicked(${post.id})">
          <img
            src="${postImage}"
            alt="Post image"
            class="w-100"
          />
          <h6 class="mt-1" style="color: grey">${postDate}</h6>
          <h5>${postTitle}</h5>
          <p>${postBody}</p>
          <hr />
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-pen"
              viewBox="0 0 16 16"
            >
              <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 
0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 
0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z"/>
            </svg>
            <span>
              ${postComments} comments
              <span id="post-tags-${post.id}">
              </span>
            </span>
          </div>
        </div>
      </div>`;

        document.querySelector("#user-posts").innerHTML += content;
        document.querySelector("#userName-span").innerHTML = authorName;



        // Adding tags for each post
        let postTagsDiv = document.getElementById(`post-tags-${post.id}`);
        post.tags.forEach(tag => {
          let tagButton = document.createElement("button");
          tagButton.className = "btn btn-sm rounded-5";
          tagButton.style.backgroundColor = "gray";
          tagButton.style.color = "white";
          tagButton.textContent = tag.name;
          postTagsDiv.appendChild(tagButton);
        });
      });
    })
    .catch(function(error) {
      console.log(error);
    }).finally(function() {

      toggleLoader(false);
    })
}


function editPostBtnClicked(postObject) {
  let post = JSON.parse(decodeURIComponent(postObject));

  document.getElementById("post-modal-submit-btn").innerHTML = "Update";
  document.getElementById("post-id-input").value = post.id;
  document.getElementById("post-modal-title").innerHTML = "Edit Post";
  document.getElementById("post-title-input").value = post.title;
  document.getElementById("post-body-input").value = post.body;
  let postModal = new bootstrap.Modal(
    document.getElementById("create-post-modal"),
    {}
  );

  postModal.toggle();
  
  
}

function deletePostBtnClicked(postObject) {
  let post = JSON.parse(decodeURIComponent(postObject));

  document.getElementById("delete-post-id-input").value = post.id;
  let postModal = new bootstrap.Modal(
    document.getElementById("delete-post-modal"),
    {}
  );
  postModal.toggle();
  
}

function confirmPostDelete() {
  let postId = document.getElementById("delete-post-id-input").value;

  const token = localStorage.getItem("token");

  const headers = { Authorization: `Bearer ${token}` };

  url = `${baseUrl}/posts/${postId}`;


  toggleLoader(true);

  axios
    .delete(url, { headers: headers })
    .then(function(response) {
      const modal = document.querySelector("#delete-post-modal");
      const modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance.hide();

      getPosts();
      showAlert("Your Post Has Been Deleted");
      getUserInfo();
      
    })
    .catch(function(error) {
      console.log(error);
      showAlert(error.response.data.message, "danger");
    }).finally(function() {

      toggleLoader(false);
    })
}
