export const displayAlert = (type, msg, time) => {

    hideAlert(); //Hide any existing alert before displaying new message

    const html = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', html);

    if (!time || typeof time === "undefined") {
        time = 5; //Default to 5 seconds
    }

    window.setTimeout(hideAlert, time * 1000);
};

export const hideAlert = () => {
    const el = document.querySelector('.alert');

    if (el) {
        el.parentElement.removeChild(el);
    }
};