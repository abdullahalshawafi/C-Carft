const profile_picture = document.querySelector('.user-image');

document.querySelector('#userImage').addEventListener('change', (event) => {
    if (event.target.files.length) {
        if (document.querySelector('#reset-input').value === 'true') {
            document.querySelector('#reset-input').value = 'false';
        }
        profile_picture.src = URL.createObjectURL(event.target.files[0]);
    }
});

document.querySelector('.reset-profile-picture').addEventListener('click', () => {
    const user_gender = document.querySelector('#gender').value;
    document.querySelector('#reset-input').value = 'true';
    profile_picture.src = '/images/profile pictures/default-' + user_gender + '.jpg';
});