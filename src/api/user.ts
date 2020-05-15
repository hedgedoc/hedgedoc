export const getMe = async () => {
     return fetch('/me');
}

export const postEmailLogin = async (email: string, password: string) => {
     return fetch("/login", {
          method: 'POST',
          mode: 'cors',
          cache: 'no-cache',
          credentials: 'same-origin',
          headers: {
               'Content-Type': 'application/json'
          },
          redirect: 'follow',
          referrerPolicy: 'no-referrer',
          body: JSON.stringify({
               email: email,
               password: password,
          })
     }).then(response => {
          if (response.status !== 200) {
               return Promise.reject("Response code not 200");
          } else {
               return response.json();
          }
     })
}
