import { html, htmlstring } from '@services/elements';
import sidebarTemplate from '@views/sidebar/sidebar.template';

const homeTemplate = (
    heading: string,
    welcome: string | null = null
) => {
    welcome = !welcome ? '' : htmlstring`<p>${welcome}</p>`;

    return html`
    <el-home>
    ${sidebarTemplate({
        '/':'Home',
        '/about':'About',
        '/docs':'Docs'
    }).outerHTML}
        <div class="content-slate">
            <section>
                <h1>${heading}</h1>
                ${welcome}
                <div id="recipes"></div>
            </section>
        </div>
    </el-home>
    `;
}

export default homeTemplate;