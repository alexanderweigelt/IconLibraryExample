import './style.css'
import '@alexanderweigelt/icon-library/dist/styles/main.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>Icon Library Example</h1>
    <p class="read-the-docs">
      An icon library example coming soon.
    </p>
    <i class="icon icon-home"></i>
    <i class="icon icon-user"></i>
  </div>
`
