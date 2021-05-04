import fetch from 'node-fetch'

fetch("http://localhost:3000/status").then((response) => {
  if (!response.ok){
    process.exit(1)
  }
  process.exit(0)
}).catch(() => {
  process.exit(1)
})
