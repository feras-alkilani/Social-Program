const baseUrl = "https://tarmeezacademy.com/api/v1";
let currentPage = 1;
let lastPage = 1;

setupUI(); // Clear the screen for the first



// Start Infinite Scroll // 
window.addEventListener("scroll", function () {

  const endOfPage = window.innerHeight + window.pageYOffset >= document.body.scrollHeight;

  if (endOfPage && currentPage < lastPage) {
    currentPage = currentPage + 1;
    getPosts(false, currentPage);

  }

});
// End Infinite Scroll // 

getPosts();

function getPosts(reload = true, page = 1) {

  toggleLoader(true);
  axios
    .get(`${baseUrl}/posts?limit=6&page=${page}`)
    .then(function (response) {
  toggleLoader(false);
      
      let posts = response.data.data;
      let cardDiv = document.querySelector("#posts");


      lastPage = response.data.meta.last_page

      //Show Or Hide (edit) Button
      let user = getCurrentUser();
      // let isMyPost = user != null && post.author.id == user.id;
      let editButtonContent = ``;
      

          
        
      // }

      

      if (reload) {
        cardDiv.innerHTML = "";
      }

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
            let isMyPost = user!= null && post.author.id == user.id;
            let editButtonContent = ``;
            let deleteButtonContent = ``;
            
            if(isMyPost){
             editButtonContent = ` <button class="btn btn-secondary" style="float:right; margin-right:5px" onclick="editPostBtnClicked('${encodeURIComponent(JSON.stringify(post))}')">Edit</button>`;
             deleteButtonContent = ` <button class="btn btn-danger" style="float:right; " onclick="deletePostBtnClicked('${encodeURIComponent(JSON.stringify(post))}')">Delete</button>`;

              
            }
            
 
        let content = `
      <div class="card shadow" data-post-id="${post.id}"   >
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

        cardDiv.innerHTML += content;

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
    .catch(function (error) {
      console.log(error);
    });
}

function loginBtnClicked() {
  let userName = document.querySelector("#userName-input").value;
  let password = document.querySelector("#password-input").value;

  toggleLoader(true);

  axios
    .post(`${baseUrl}/login`, {
      username: userName,
      password: password
    })
    .then(function (response) {
      

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      const modal = document.querySelector("#loginModal");
      const modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance.hide();
      showAlert("Nice, You logged in!");

      setupUI();
      window.location.reload();
    })
    .catch(function (error) {
      console.log(error);
      showAlert(`Login failed ${error.response.data.message}`, "danger");
    }).finally( ()=> {
      toggleLoader(false);
    })
}

function setupUI() {
  const token = localStorage.getItem("token");

  const logInDiv = document.getElementById("logIn-div");
  const logOutDiv = document.getElementById("logOut-div");
  const addBtnDiv = document.getElementById("add-btn");

  if (token == null) {
    logInDiv.style.setProperty("display", "flex", "important");
    logOutDiv.style.setProperty("display", "none", "important");
    addBtnDiv.style.setProperty("display", "none", "important");
  } else {
    // For Logged In User
    logInDiv.style.setProperty("display", "none", "important");
    logOutDiv.style.setProperty("display", "flex", "important");
    addBtnDiv.style.setProperty("display", "flex", "important");
    const user = getCurrentUser();

    document.getElementById("nav-userImage").src = user.profile_image;
    document.getElementById("nav-userName").innerHTML = user.name;
  }
}

function showAlert(alertMessage, type = "success") {
  const alertPlaceholder = document.getElementById("liveAlertPlaceholder");
  if (!alertPlaceholder) {
    console.error(
      'The element "liveAlertPlaceholder" does not exist in the DOM.'
    );
    return;
  }
  const alert = (message, type) => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = [
      `<div class="alert alert-${type} alert-dismissible" role="alert">`,
      `   <div>${message}</div>`,
      '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
      "</div>"
    ].join("");

    alertPlaceholder.append(wrapper);
  };

  alert(alertMessage, type);

  // todo: hide the alert
  // setTimeout(() => {
  // const alertToHide = bootstrap.Alert.getOrCreateInstance(
  // "#liveAlertPlaceholder"
  // );
  // alertToHide.close();
  // }, 2000);
}

function logOut() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  showAlert("logged out successfully", "success");
  

  setupUI();
  window.location.reload();
}

function registerBtnClicked() {
  let regUserName = document.querySelector("#regUserName-input").value;
  let regPassword = document.querySelector("#regPassword-input").value;
  let regName = document.querySelector("#regName-input").value;
  let regEmail = document.querySelector("#regEmail-input").value;
  let regImage = document.querySelector("#regImage-input").files[0];

  let formData = new FormData();
  formData.append("username", regUserName);
  formData.append("password", regPassword);
  formData.append("name", regName);
  formData.append("email", regEmail);
  formData.append("image", regImage);

  const url = `${baseUrl}/register`;


  toggleLoader(true);

  axios
    .post(url, formData)
    .then(function (response) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      const modal = document.querySelector("#registerModal");
      const modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance.hide();
      showAlert("Register is OK.");
      setupUI();
    })
    .catch(function (error) {
      console.log(error);
      showAlert(`Registration failed ${error.response.data.message}`, "danger");
    }).finally( () => {

      toggleLoader(false);
    })
}

function CreateNewPostClicked() {


  let postId = document.getElementById("post-id-input").value;
  let isCreate = postId == null || postId == "";
  
  
  let title = document.querySelector("#post-title-input").value;
  let body = document.querySelector("#post-body-input").value;
  let image = document.querySelector("#post-image-input").files[0];

  let formData = new FormData();
  formData.append("title", title);
  formData.append("body", body);
  formData.append("image", image);

  let url = ``;
   const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "multipart/form-data",
    Authorization: `Bearer ${token}`
  };

  if(isCreate) {
    url = `${baseUrl}/posts`;

  }else{
    formData.append("_method", "put")
    url = `${baseUrl}/posts/${postId}`;
    
    
  }  

  toggleLoader(true);

  axios
    .post(url, formData, { headers: headers })
    .then(function(response) {
      const modal = document.querySelector("#create-post-modal");
      const modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance.hide();
      getPosts();
      showAlert("New Post Has Been Created");
      window.location.reload();
    })
    .catch(function(error) {
      console.log(error);
      showAlert(error.response.data.message, "danger");
    }).finally(() => {

      toggleLoader(false);
    });
}

function getCurrentUser() {
  let user = null;

  let storageUser = localStorage.getItem("user");

  if (storageUser != null) {
    user = JSON.parse(storageUser);
  }

  return user;
}

function addButtonClicked() {
  document.getElementById("post-modal-submit-btn").innerHTML = "Create";
  document.getElementById("post-id-input").value = "";
  document.getElementById("post-modal-title").innerHTML = "Create A New Post";
  document.getElementById("post-title-input").value = "";
  document.getElementById("post-body-input").value = "";
  let postModal = new bootstrap.Modal(
    document.getElementById("create-post-modal"),
    {}
  );
  postModal.toggle();
}


function editPostBtnClicked(postObject){
    

  
  

let post = JSON.parse(decodeURIComponent(postObject));
  
  document.getElementById("post-modal-submit-btn").innerHTML = "Update";
  document.getElementById("post-id-input").value = post.id;
  document.getElementById("post-modal-title").innerHTML = "Edit Post";
  document.getElementById("post-title-input").value = post.title;
  document.getElementById("post-body-input").value = post.body;
  let postModal = new bootstrap.Modal(document.getElementById("create-post-modal"),{});
  postModal.toggle()
}

function deletePostBtnClicked(postObject){

  let post = JSON.parse(decodeURIComponent(postObject));

  document.getElementById("delete-post-id-input").value = post.id
  let postModal = new bootstrap.Modal(document.getElementById("delete-post-modal"), {});
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
    })
    .catch(function(error) {
      console.log(error);
      showAlert(error.response.data.message, "danger");
    }).finally(() => {
      toggleLoader(false);
    });
}


function profileClicked(){
  let user = getCurrentUser();
 
 const userId = user.id
  window.location = `profile.html?userId=${userId}`;
}

function toggleLoader(show= true){


  if (show){
    document.getElementById("loader").style.visibility = "visible";
  }else{
    document.getElementById("loader").style.visibility = "hidden";
  }

}