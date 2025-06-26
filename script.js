const API_BASE_URL = 'http://localhost:3000/posts';
const postListDiv = document.getElementById('post-list');
const postDetailDiv = document.getElementById('post-detail');
const newPostForm = document.getElementById('new-post-form');
const newPostTitleInput = document.getElementById('new-post-title');
const newPostAuthorInput = document.getElementById('new-post-author');
const newPostContentInput = document.getElementById('new-post-content');
const newPostImageInput = document.getElementById('new-post-image');
const editPostFormSection = document.getElementById('edit-post-form');
const editPostTitleInput = document.getElementById('edit-post-title');
const editPostContentInput = document.getElementById('edit-post-content');
const editPostIdInput = document.getElementById('edit-post-id');

function main() {
    console.log("Application started. Loading posts...");

    fetchAndDisplayPosts();

    addEventListeners();
}

async function fetchAndDisplayPosts() {
    try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const posts = await response.json();

        renderPostList(posts);

        if (posts.length > 0) {
            fetchAndDisplayPostDetails(posts[0].id);
        }

    } catch (error) {
        console.error('Error fetching posts:', error);
        postListDiv.innerHTML = '<p>Error loading posts. Please make sure the json-server is running.</p>';
    }
}


function renderPostList(posts) {

    postListDiv.innerHTML = '';
    

    if (posts.length === 0) {
        postListDiv.innerHTML = '<p>No posts available. Add a new one!</p>';
        return;
    }


    posts.forEach(post => {

        const listItem = document.createElement('li');
        listItem.classList.add('post-list-item');

        listItem.dataset.id = post.id;

        listItem.addEventListener('click', () => fetchAndDisplayPostDetails(post.id));


        listItem.innerHTML = `
            <h3>${post.title}</h3>
            <p class="post-meta">By ${post.author}</p>
            <img src="${post.image}" alt="${post.title}">
        `;
        
        postListDiv.appendChild(listItem);
    });
}

async function fetchAndDisplayPostDetails(postId) {
    try {
        const response = await fetch(`${API_BASE_URL}/${postId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const post = await response.json();

        renderPostDetail(post);

    } catch (error) {
        console.error('Error fetching post details:', error);
        postDetailDiv.innerHTML = '<p>Could not load post details. Please try again.</p>';
    }
}


function renderPostDetail(post) {

    postDetailDiv.innerHTML = `
        <h2>${post.title}</h2>
        <p class="post-meta">Author: ${post.author} | Date: ${post.date}</p>
        <img src="${post.image}" alt="${post.title}">
        <div class="post-content">${post.content}</div>

        <div class="post-actions">
            <button id="edit-post-btn" data-id="${post.id}">Edit Post</button>
            <button id="delete-post-btn" data-id="${post.id}" class="delete-button">Delete Post</button>
        </div>
    `;


    document.getElementById('edit-post-btn').addEventListener('click', () => {

        showEditForm(post);
    });

    document.getElementById('delete-post-btn').addEventListener('click', () => {
        deletePost(post.id);
    });
}

async function handleAddNewPost(event) {

    event.preventDefault();


    const title = newPostTitleInput.value.trim();
    const author = newPostAuthorInput.value.trim();
    const content = newPostContentInput.value.trim();
    const image = newPostImageInput.value.trim();

    if (!title || !author || !content) {
        alert('Title, Author, and Content are required!');
        return;
    }


    const newPost = {
        title: title,
        author: author,
        content: content,
        image: image || '[https://via.placeholder.com/600x400](https://via.placeholder.com/600x400)',
        date: new Date().toISOString().slice(0, 10)
    };

    try {

        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(newPost)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        fetchAndDisplayPosts();


        newPostForm.reset();

    } catch (error) {
        console.error('Error adding new post:', error);
        alert('Failed to add post. Please check the console for details.');
    }
}

function showEditForm(post) {

    editPostFormSection.classList.remove('hidden'); 

    editPostTitleInput.value = post.title;
    editPostContentInput.value = post.content;
    editPostIdInput.value = post.id; //

    // Scroll to the edit form for better UX.
    editPostFormSection.scrollIntoView({ behavior: 'smooth' });
}


async function handleUpdatePost(event) {
    event.preventDefault();

    const postId = editPostIdInput.value;
    const updatedTitle = editPostTitleInput.value.trim();
    const updatedContent = editPostContentInput.value.trim();

    if (!updatedTitle || !updatedContent) {
        alert('Title and Content cannot be empty!');
        return;
    }

    const updatedPost = {
        title: updatedTitle,
        content: updatedContent
    };

    try {

        const response = await fetch(`${API_BASE_URL}/${postId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(updatedPost)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }


        editPostFormSection.classList.add('hidden');
        editPostFormSection.reset();

        fetchAndDisplayPostDetails(postId);
        fetchAndDisplayPosts();

    } catch (error) {
        console.error('Error updating post:', error);
        alert('Failed to update post. Please check the console for details.');
    }

async function deletePost(postId) {

    const confirmed = confirm('Are you sure you want to delete this post? This cannot be undone.');
    if (!confirmed) {
        return;
    }

    try {

        const response = await fetch(`${API_BASE_URL}/${postId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }


        postDetailDiv.innerHTML = '<h2>Post Deleted!</h2><p>Select another post from the list.</p>';

        fetchAndDisplayPosts();

    } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post. Please check the console for details.');
    }
}

function addEventListeners() {

    newPostForm.addEventListener('submit', handleAddNewPost);

    editPostFormSection.addEventListener('submit', handleUpdatePost);

    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', (e) => {
            e.preventDefault();
            editPostFormSection.classList.add('hidden');
        });
    }
}

document.addEventListener('DOMContentLoaded', main);