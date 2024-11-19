import { html, htmlstring } from "@services/elements";
import sidebarTemplate from "@views/sidebar/sidebar.template";

const inv = html`
    <el-inv>
        <div class="content-slate">
            <section>
                <img id="drumstick" src="/storage/images/drumstick.gif" alt="Drumstick" style="width: 100%; max-width: 300px; margin: 0 auto; display: block;">
                <div id="inventory"></div>
            </section>
        </div>
    </el-inv>
`;

export default inv;