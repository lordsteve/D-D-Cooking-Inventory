import 'module-alias/register';

import fs from 'fs';
import http from 'http';
import path from 'path';
import 'reflect-metadata';
import routes from './routes';

if (!process.env.PORT) require('dotenv').config();

const server = http.createServer(async (req: http.IncomingMessage, res: http.ServerResponse) => {
    const { method, headers } = req;
    let { url } = req;
    
    if (method !== 'GET') {
        let valid = true;
        if (!valid) {
            res.statusCode = 403;
            res.setHeader('Content-Type', 'text/plain');
            res.end('403 Forbidden');
        }
    }

    switch (url) {
        case '/favicon.ico':
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end('404 Not Found');
            break;
        case '/csrf-token':
            const token = '1234567890';
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end(token);
            break;
        default:
            if (url?.startsWith('/views/') && headers['x-requested-with'] !== 'Elemental') {
                res.statusCode = 403;
                res.setHeader('Content-Type', 'text/plain');
                res.end('403 Forbidden');
            } else if (url?.startsWith('/storage/')) {
                const storage = path.join(__dirname, '..', '..', 'www');
                const file = fs.readFileSync(path.join(storage, url));
                res.statusCode = 200;
                res.setHeader('Content-Type', findContentType(findExtension(url)));
                res.end(file);
            } else if (url?.startsWith('/data/')) {
                const { response, header, status } = await routes(req, res);
                res.statusCode = status;
                res.setHeader('Content-Type', header ?? 'application/json');
                res.end(response);
            } else {
                const www = path.join(__dirname, '..', '..', 'www');

                if (url?.endsWith('/')) {
                    url = url + 'index.html';
                } else if (url !== undefined && findExtension(url) === url) {
                    url = url + '/index.html';
                }

                if (url === undefined) {
                    res.statusCode = 404;
                    res.setHeader('Content-Type', 'text/plain');
                    res.end('404 Not Found');
                } else {
                    let mainPage: string;
                    switch (findExtension(url)) {
                        case 'html':
                            mainPage = '/index.html';
                            break;
                        case 'css':
                            mainPage = '/main.css';
                            break;
                        case 'js':
                            mainPage = '/main.js';
                            break;
                        default:
                            mainPage = '/index.html';
                            break;
                    }
                    try {
                        const file = fs.readFileSync(path.join(www, url.startsWith('/views') ? url : mainPage));
                        res.statusCode = 200;
                        res.setHeader('Content-Type', findContentType(findExtension(url)));
                        res.end(file);
                    } catch {
                        res.statusCode = 404;
                        res.setHeader('Content-Type', 'text/plain');
                        res.end('404 Not Found');
                    }
                }

            }
            break;
    }

});
const port = parseInt(process.env.PORT || '8080');
const host = process.env.HOST || '0.0.0.0';
const reloadPort = process.env.RELOAD_PORT;
server.listen(port, host, () => {
    console.log(`Static server started on http://${host}:${port}.`);
    if (process.env.ENV === 'development' && reloadPort !== undefined)
        console.log(`Live reload server started on http://${host}:${reloadPort}.`);
});

function findExtension(filename: string): string {
    return filename.substring(filename.lastIndexOf('.')+1, filename.length) || filename;
}

function findContentType(extension: string): string {
    switch (extension) {
        case 'html':
            return 'text/html';
        case 'css':
            return 'text/css';
        case 'js':
            return 'text/javascript';
        case 'json':
            return 'application/json';
        case 'png':
            return 'image/png';
        case 'jpg':
            return 'image/jpg';
        case 'txt':
            return 'text/plain';
        default:
            return 'application/octet-stream';
    }
}

export function readBody<T = any>(req: http.IncomingMessage): Promise<T> {
    let body: any = [];
    return new Promise((resolve, reject) => {
        req.on('readable', () => {
            let i;
            while (null !== (i = req.read())) {
                body.push(i);
            }
        });
        req.on('end', () => {
            body = Buffer.concat(body).toString();
            try {
                body = JSON.parse(body);
            } catch {
                reject('Invalid JSON');
            }
            resolve(body as T);
        });
    });
}