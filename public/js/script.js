const profile_picture = document.querySelector('.user-image');

document.querySelector('#userImage').addEventListener('change', (event) => {
    if (event.target.files.length) {
        profile_picture.src = URL.createObjectURL(event.target.files[0]);
    }
});

document.querySelector('.reset-profile-picture').addEventListener('click', () => {
    const user_gender = document.querySelector('#gender').value;
    document.querySelector('#userImage').value = 'default-' + user_gender + '.jpg';
    profile_picture.src = '/images/profile pictures/default-' + user_gender + '.jpg';
});