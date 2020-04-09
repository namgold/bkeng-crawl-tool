const fetch = require("node-fetch");
var jsdom = require("jsdom").JSDOM;

let nfUrls = [];
for (let i = 1; i <= 15; i++) {
    nfUrls.push(`http://bkenglish.edu.vn/tin-tuc.html/p-${i}`);
}
const nfPromises = nfUrls.map(nfUrl => new Promise((resolve, reject) => {
    fetch(nfUrl).then(i => i.text()).then(html => {
        let dom = new jsdom(html).window.document;
        const newsList = [...dom.querySelectorAll('.news')].map(news => new Promise((resolve, reject) => {
            fetch('http://bkenglish.edu.vn'+news.querySelector("h3 a").href).then(i => i.text()).then(html => {
                let dom = new jsdom(html).window.document;
                const createdDate = new Date(dom.querySelector(".date").innerHTML.slice(-23, -6)).getTime();
                let content = dom.querySelector(".news-content");
                content.removeChild(dom.querySelector('.date'));
                content = content.innerHTML.replace(/\"\//g, '"http://bkenglish.edu.vn/');
                resolve ({
                    title: news.querySelector("h3 a").textContent,
                    description: news.querySelector(".tomtat").textContent,
                    image: news.querySelector("img").src,
                    createdDate,
                    content,
                    view: parseInt(news.querySelector(".clock").textContent.trim().slice(13,-9).replace(',', ''))
                })
            })
        }));
        Promise.all(newsList).then(newsList => resolve(newsList));
    });
}))
Promise.all(nfPromises).then(data => {
    const fs = require("fs");
    const temp = [];
    for (let i = 0; i < data.length; i++)
        for (let j = 0; j < data[i].length; j++)
            temp.push(data[i][j])
    fs.writeFile('./output.json', JSON.stringify(temp, null, 4), 'utf8', () => console.log("Done"));

})