const profile_picture = document.querySelector('.user-image');
const image_input = document.querySelector('#userImage');
image_input.addEventListener('change', (event) => {
    if (event.target.files.length) {
        profile_picture.src = URL.createObjectURL(event.target.files[0]);
    }
});