import { html, htmlstring } from '@services/elements';
import sidebarTemplate from '@views/sidebar/sidebar.template';

const homeTemplate = (
    heading: string,
    welcome: string | null = null
) => {
    const params = new URLSearchParams(window.location.search);
    const isAdmin = params.get('admin') === 'true';

    welcome = !welcome ? '' : htmlstring`<p>${welcome}</p>`;

    return html`
    <el-home>
        <div class="content-slate">
            <section>
                <h1>${heading}</h1>
                ${welcome}
                <div id="recipes"></div>

                ${isAdmin ? `<form id="new-recipe" style="display:flex;flex-direction:column;">
                    <input required type="text" placeholder="New Recipe Name" name="recipe-name">
                    <input required type="text" placeholder="Description" name="recipe-description">
                    <button type="submit">Add Recipe</button>
                </form>` : ''}
            </section>
        </div>
    </el-home>
    `;
}

export default homeTemplate;