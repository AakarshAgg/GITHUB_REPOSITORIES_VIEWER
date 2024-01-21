const perPageSelect = document.getElementById("perPage");
const searchInput = document.getElementById("search");
const repositoriesList = document.getElementById("repositoriesList");
const pagination = document.getElementById("pagination");
const loader = document.getElementById("loader");
const container = document.getElementById("detailscontainer");

let currentPage = 1;
let lastPageNumber;

async function fetchRepositories() {
  const username = document.getElementById("username").value;
  const perPage = perPageSelect.value;

  try {
    container.innerHTML="";
    showLoader();
    const avatar = await fetch(`https://api.github.com/users/${username}`);
    const getavatar = await avatar.json();
    console.log("get",getavatar);
    
 
    if(getavatar.message == "Not Found"){
      container.innerHTML=`<h1>No User Found</h1>`
    }else{
      container.innerHTML = `
      <div id="container">
      <div id="inside">
      <div id="image">
      <img src=${getavatar.avatar_url} alt="avatar" id="avatar">
      </div>
      <div id="details">
      <h2 id="name">Name:${getavatar.name}</h2>
      <p id="bio">Bio:${getavatar.bio}</p>
      <p id="location">Location:${getavatar.location}</p>
      <p id="twitter">Twitter:${getavatar.twitter_username}</p>
      </div>
  </div>
  <div id="outside">
  <a href=${getavatar.html_url} id="git">${getavatar.html_url}</a>
  </div>
  </div>`;    
    }

repositoriesList.innerHTML = "";


    const response = await fetch(
      `https://api.github.com/users/${username}/repos?page=${currentPage}&per_page=${perPage}`
    );
    const data = await response.json();
    console.log("response",response)

    if (data.message === "Not Found") {
      repositoriesList.innerHTML =
        "<p>No repositories found for this user.</p>";
    } else {
      data.forEach((repo) => {
        const p = document.createElement("p");
        p.innerHTML = `<strong>${repo.name}</strong><br>
         ${repo.description || "No description available"}
         <p id="language">${repo.language}</p>`;
        repositoriesList.appendChild(p);
      });
    }

    const linkHeader = response.headers.get("Link");

    if (linkHeader === null) {
      pagination.innerHTML=""
    }else{
      renderPagination(linkHeader)
    }
  } catch (error) {
    console.error("Error fetching repositories:", error);
  } finally {
    hideLoader();
  }
}

function renderPagination(linkHeader) {
  const links = linkHeader.split(",");
  const lastPageMatch = links.find((link) => link.includes('rel="last"'));

  if (lastPageMatch) {
    const lastPageUrl = lastPageMatch
      .split(";")[0]
      .replace("<", "")
      .replace(">", "")
      .trim();
    lastPageNumber = parseInt(lastPageUrl.split("page=")[1]);
  }
  pagination.innerHTML = "";
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(lastPageNumber, startPage + 4);

    for (let i = startPage; i <= endPage; i++) {
      const button = document.createElement("button");
      button.innerText = i;
      button.addEventListener('click', () => goToPage(i));
      pagination.appendChild(button);
      if (i === currentPage) {
        button.classList.add('active');
      }
    }
      // Add "Previous" button
      const prevButton = document.createElement('button');
      prevButton.textContent = 'Previous';
      prevButton.addEventListener('click', () => goToPage(currentPage - 1));
      pagination.insertBefore(prevButton, pagination.firstChild);
  
      // Add "Next" button
      const nextButton = document.createElement('button');
      nextButton.textContent = 'Next';
      nextButton.addEventListener('click', () => goToPage(currentPage + 1));
      pagination.appendChild(nextButton);
}

  

function goToPage(page) {
  if (page >= 1 && page <= lastPageNumber) {
    currentPage = page;
    fetchRepositories();
  }
}


function updatePerPage() {
  currentPage = 1;
  fetchRepositories();
}

function showLoader() {
  loader.style.display = "block";
}

function hideLoader() {
  loader.style.display = "none";
}

async function searchRepositories() {
  const username = document.getElementById("username").value;
  const searchTerm = searchInput.value;
  try {
    if(!username || !searchTerm){
      alert("Username and Search term must not be empty")
    }else{
    showLoader();
    const avatar = await fetch(`https://api.github.com/users/${username}`);
    const getavatar = await avatar.json();

  if(getavatar.message == "Not Found"){
    container.innerHTML=`<h1>No User Found</h1>`
  }else{
    container.innerHTML = `
    <div id="container">
    <div id="inside">
    <div id="image">
    <img src=${getavatar.avatar_url} alt="avatar" id="avatar">
    </div>
    <div id="details">
    <h2 id="name">Name:${getavatar.name}</h2>
    <p id="bio">Bio:${getavatar.bio}</p>
    <p id="location">Location:${getavatar.location}</p>
    <p id="twitter">Twitter:${getavatar.twitter_username}</p>
    </div>
</div>
<div id="outside">
<a href=${getavatar.html_url} id="git">${getavatar.html_url}</a>
</div>
</div>`;
  }

    const response = await fetch(
      `https://api.github.com/users/${username}/repos`
    );
    const data = await response.json();


      const filteredResponse = data.filter(
        (repo) =>
          repo.name.includes(searchTerm) ||
          (repo.description && repo.description.includes(searchTerm))
      );
     console.log("Filtered Repositories:", filteredResponse);
     if(filteredResponse.length==0){
    repositoriesList.innerHTML="<p>No reposotories found for this user</p>"
     }else{
      repositoriesList.innerHTML=""
     filteredResponse.forEach((repo)=>{
      const p = document.createElement("p");
      p.innerHTML = `<strong>${repo.name}</strong><br>
       ${repo.description || "No description available"}
       <p id="language">${repo.language}</p>`;
      repositoriesList.appendChild(p);
     })
    }
  }
  } catch (error) {
    console.error("Error fetching repositories:", error);
  } finally {
    hideLoader();
  }
}
