import './style.css'
import '@alexanderweigelt/icon-library/dist/styles/main.css'
import IconSprite from '@alexanderweigelt/icon-library/dist/icons/icons.sprite.svg'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<header>
    <h1>Icon Library Example</h1>
</header>
<article>
    <p class="read-the-docs">The icon library example.</p>
    <div class="card">
        <p>Get your icons with native CSS: <code>&lt;i class="icon icon-home"&gt;&lt;/i&gt;</code></p>
        <i class="icon icon-home"></i>
        <i class="icon icon-user"></i>
    </div>
    <div class="card">
        <p>Get your icons from inline SVG with and &lt;use&gt; Element.</p>
        <svg class="icon">
            <use xlink:href="#home"></use>
        </svg>
        <svg class="icon">
            <use xlink:href="#user"></use>
        </svg>
    </div>
</article>
`
document.querySelector<HTMLDivElement>('#sprite')!.innerHTML = IconSprite
