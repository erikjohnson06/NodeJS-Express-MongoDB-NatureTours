export const displayAlert = (type, msg) => {

    hideAlert(); //Hide any existing alert before displaying new message

    const html = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', html);

    window.setTimeout(hideAlert, 5000);
};

export const hideAlert = () => {
    const el = document.querySelector('.alert');

    if (el){
        el.parentElement.removeChild(el);
    }
};