import './style.css'
import '@alexanderweigelt/icon-library/lib/styles/main.css'
import '@alexanderweigelt/icon-library/lib/IconComponent'
import IconSprite from '@alexanderweigelt/icon-library/lib/icons/icons.sprite.svg'

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
        <p>Get your icons from inline SVG with a &lt;use&gt; element.</p>
        <svg class="icon">
            <use xlink:href="#home"></use>
        </svg>
        <svg class="icon">
            <use xlink:href="#user"></use>
        </svg>
    </div>
    <div class="card">
        <p>Get your icons from web component. &lt;icon-component name="home"&gt;&lt;/icon-component&gt;</p>
        <icon-component name="home"></icon-component>
        <icon-component name="user"></icon-component>
        <!-- Check the fallback icon for an unassigned symbol name -->
        <icon-component name="fallback"></icon-component>
    </div>
</article>
`
document.querySelector<HTMLDivElement>('#sprite')!.innerHTML = IconSprite
