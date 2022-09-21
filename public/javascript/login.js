const loginForm = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");
const number = 1;
function submitLoginForm(e) {
    e.preventDefault();
    number + 1
    loginBtn.disabled = true;
    const formEntries = ObjectifyEntriesAndStringify(e.target)
    const options = setFetchPostOptions(formEntries)
    fetch('/login', options)
        .then(resp => resp.json())
        .then(data => {
            if (data.redirectTo) {
                location.assign(data.redirectTo)
                // loginBtn.disabled = false;
              }
            if (data.err) {
                throw data.err;
            }
        }).catch(err => {
            //console.log(err, "33");
            manageErrorAndAppendToPopupBox(err)
            loginBtn.disabled = false;
        });
}

loginForm.addEventListener("submit", submitLoginForm);
