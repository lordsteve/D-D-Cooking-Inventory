import el from '@const/elements';
import { get } from '@services/request';

export default function main() {
    const button = el.buttons.id('btn');

    button.onclick = () => {
        console.log('Hello, World!');
        get('https://jsonplaceholder.typicode.com/posts')
    };
    el.title.textContent = 'Hello, World!';
}